

const console = require('electron-log');
const userHome = require('os').homedir();
const shortcut = require('windows-shortcuts');
const path = require('path'), fs = require('fs');
const desktopPath = path.join(require('os').homedir(), 'Desktop');
const { openFile, openFolder } = require('../utils/fileExplorer');
const { executeScriptWithNoExit, runPowerShellFile } = require('../utils/childProcess');
const { getAllFileRecursively, filterScriptFiles, getAllDirectories, getFolderAndFiles } = require('../utils/fileExplorer');



const initializePanels = () => {

    const container = document.querySelector('.container');
    const panels = ['Scripts', 'Programs', 'Folders'];

    panels.forEach(title => {
        const panel = document.createElement('div');
        panel.classList.add('panel');
        panel.style.width = '275px';
        panel.style.height = '120px';

        const panelTitleDiv = document.createElement('div');
        panelTitleDiv.classList.add('panel-title');
        panelTitleDiv.textContent = title;

        const itemsDiv = document.createElement('div');
        itemsDiv.classList.add('items');

        panel.appendChild(panelTitleDiv);
        panel.appendChild(itemsDiv);
        container.appendChild(panel);
    });
};

const handleItemClick = (panelTitle, type, fullPath) => {

    if (panelTitle === 'Scripts') executeScriptWithNoExit(type, fullPath);

    if (panelTitle === 'Programs') openFile(fullPath);

    if (panelTitle === 'Folders') openFolder(fullPath);

};

const addItemToPanel = (panelTitle, itemText, type, fullPath, imgSrc) => {

    const panel = Array.from(document.querySelectorAll('.panel')).find(panel => {
        return panel.querySelector('.panel-title').textContent === panelTitle;
    });

    const br = document.createElement('br');
    const newImg = document.createElement('img');
    const newText = document.createElement('div');
    const newItem = document.createElement('div');
    const itemsContainer = panel.querySelector('.items');

    newItem.classList.add('item');
    newItem.title = type;
    newItem.addEventListener('click', () => handleItemClick(panelTitle, type, fullPath))


    newImg.id = 'imgExe'
    newImg.src = imgSrc;
    newImg.onerror = () => {
        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
        newImg.src = fallbackImages[randomIndex];
    };

    newImg.alt = itemText;
    newText.textContent = itemText;
    newItem.appendChild(newImg);
    newItem.appendChild(newText);
    newItem.appendChild(br);
    itemsContainer.appendChild(newItem);
}


const addFolderIfNeeded = (desktopFolders) => {

    const originalDesktopFolders = [...desktopFolders];

    if (originalDesktopFolders.length < 8) {
        const foldersToAdd = 8 - originalDesktopFolders.length;
        for (let i = 0; i < foldersToAdd && i < additionalFolders.length; i++) {
            originalDesktopFolders.push(additionalFolders[i]);
        }
    }

    else if (originalDesktopFolders.length > 8 && originalDesktopFolders.length % 4 !== 0) {

        const nearestMultipleOfFour = Math.ceil(originalDesktopFolders.length / 4) * 4;
        const foldersToAdd = nearestMultipleOfFour - originalDesktopFolders.length;
        for (let i = 0; i < foldersToAdd && i < additionalFolders.length; i++) {
            originalDesktopFolders.push(additionalFolders[i]);
        }
    }

    return originalDesktopFolders;
}







const { spawn } = require("child_process");

/**
 * @param {string} executable
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions} opts
 * @return {Promise<number>} return code
 * */
async function run(executable, args, opts = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(executable, args, {
            shell: true,
            stdio: ["pipe", process.stdout, process.stderr],
            ...opts,
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                const e = new Error('Process exited with error code ' + code);
                e.code = code;
                reject(e);
            }
        });
    });
}



document.addEventListener('DOMContentLoaded', async () => {

    // try {
        const code = await run('powershell', ["-executionpolicy", "unrestricted", "-file", 'script.ps1']);
        // process.exit(code);
    // } catch (e) {
    //     console.error(e);
    //     process.exit(e.code || 1);
    // }
    initializePanels();
    const { files, folders } = await getFolderAndFiles(desktopPath);
    // console.info('Files and Folders :', files, folders);
    const shortcutFiles = files.filter(file => file.name.endsWith('.lnk'));
    // console.log('Shortcut Files :', shortcutFiles);
    const desktopFolders = addFolderIfNeeded(folders);
    // console.info('Desktop Folders :', desktopFolders);


    desktopFolders.forEach(({ name, fullPath, lastModified }, index) => {

        const imgSrc = icons[index % icons.length];
        const title = `${name}\nLastModified : ${lastModified || 'unknown'}`;
        addItemToPanel('Folders', name.toLowerCase(), title, fullPath, imgSrc);
    });

    // console.log('Shortcut Path :', shortcutPath);

    shortcutFiles.splice(0, 2).forEach(async ({ fullPath: shortcutPath, name }) => {
        shortcut.query(shortcutPath, (async (err, { target }) => {

            // console.log('Shortcut Info :', shortcutInfo);
            // console.log('Shortcut Info :', shortcutInfo.desc);

            if (err) {
                console.error(`Error reading shortcut : ${err.message}`);
                return;
            }

            const imgPathDefault = path.join(userHome, 'organizeYourDesktop', 'img', name + '.png');
            // console.log('Img Exists :', imgPathDefault);


            // const exeFile = { location: shortcutInfo.target, name: path.basename(shortcutPath).split('.')[0] };


            // try {
            if (!fs.existsSync(imgPathDefault)) {
                fs.mkdirSync(path.join(userHome, 'organizeYourDesktop', 'img'), { recursive: true });
                const Path = { '-Path': target };
                const Destination = { '-Destination': path.join(userHome, 'organizeYourDesktop', 'img', name + '.png') };
                // await runPowerShellFile('extractIconFromExe.ps1', [Path, Destination]);

            }
            // } catch (error) {
            //     console.log('Error :', error);

            // }

            // addItemToPanel('Programs', exeFile.name, exeFile.name.split(' ')[0], shortcutPath, "imgPathDefault");

        }));

    });


    // const desktopFiles = getAllFileRecursively(desktopPath);
    // const scriptFiles = filterScriptFiles(desktopFiles);



    // scriptFiles.forEach(({ name, type, fullPath, imgSrc }) => {
    //     addItemToPanel('Scripts', name, type, fullPath, imgSrc);
    // });
});



const icons = [
    'https://img.icons8.com/?size=100&id=c2AXPLZ3iVEU&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=77253&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=65LJ4a8H0RQo&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=8DXp0OBYddF8&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=8DXp0OBYddF8&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=67363&format=png&color=000000',
];


const fallbackImages = [
    'https://media.istockphoto.com/id/1904304716/vector/exe-file-line-icon-with-editable-stroke-the-icon-is-suitable-for-web-design-mobile-apps-ui.jpg?b=1&s=612x612&w=0&k=20&c=FDsL-braudhxO56BRaL5fWjFH6OAsaloPzrSGFB1rjA=',
    'https://i.sstatic.net/vY5dQ.png',
    'https://winaero.com/blog/wp-content/uploads/2015/09/hard-drive-disk-icon.png',
    'https://cdn.icon-icons.com/icons2/17/PNG/256/windows_win_2248.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnBGxPBur-Kv2a_jdt_tbzhHJ8yAyKG_PN0A&s', 'https://winaero.com/blog/wp-content/uploads/2019/08/Save-icon-big-256.png'
];


const additionalFolders = [
    {
        fullPath: path.join(require('os').homedir(), 'Documents'),
        name: 'doc'
    },
    {
        fullPath: path.join(require('os').homedir(), 'Pictures'),
        name: 'images'
    },
    {
        fullPath: path.join(require('os').homedir(), 'Videos'),
        name: 'vid'
    },
    {
        fullPath: path.join(require('os').homedir(), 'Downloads'),
        name: 'downloads'
    },
];