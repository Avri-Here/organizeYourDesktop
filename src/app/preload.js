

const console = require('electron-log');
const userHome = require('os').homedir();
const shortcut = require('windows-shortcuts');
const path = require('path'), fs = require('fs');
const { extractorAndSaveIcon } = require('../utils/allTheRest');
const desktopPath = path.join(require('os').homedir(), 'Desktop');
const { executeScriptWithNoExit, openFile, openFolder } = require('../utils/childProcess');
const { getAllFileRecursively, filterScriptFiles, getAllDirectories } = require('../utils/fileExplorer');


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
    newItem.addEventListener('click', () => {

        if (panelTitle === 'Scripts') {
            console.info(`Running script : ${fullPath}`);
            executeScriptWithNoExit(type, fullPath);
            return;
        }

        if (panelTitle === 'Programs') {
            newImg.id = 'imgExe';
            openFile(fullPath);
            return;

        }

        if (panelTitle === 'Folders') {
            newImg.id = 'imgExe';
            openFolder(fullPath);
            return;

        }

    })

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




document.addEventListener('DOMContentLoaded', async () => {

    const desktopFolders = await getAllDirectories(desktopPath);


    if (desktopFolders.length < 8) {
        const foldersToAdd = 8 - desktopFolders.length;
        for (let i = 0; i < foldersToAdd && i < additionalFolders.length; i++) {
            desktopFolders.push(additionalFolders[i]);
        }
    }
    else if (desktopFolders.length > 8 && desktopFolders.length % 4 !== 0) {

        const nearestMultipleOfFour = Math.ceil(desktopFolders.length / 4) * 4;
        const foldersToAdd = nearestMultipleOfFour - desktopFolders.length;
        for (let i = 0; i < foldersToAdd && i < additionalFolders.length; i++) {
            desktopFolders.push(additionalFolders[i]);
        }
    }
    const icons = [
        'https://img.icons8.com/?size=100&id=c2AXPLZ3iVEU&format=png&color=000000',
        'https://img.icons8.com/?size=100&id=77253&format=png&color=000000',
        'https://img.icons8.com/?size=100&id=65LJ4a8H0RQo&format=png&color=000000',
        'https://img.icons8.com/?size=100&id=8DXp0OBYddF8&format=png&color=000000',
        'https://img.icons8.com/?size=100&id=8DXp0OBYddF8&format=png&color=000000',
        'https://img.icons8.com/?size=100&id=67363&format=png&color=000000',
    ];
    
    desktopFolders.forEach(({ folderName, fullPath, lastModified }, index) => {
        const imgSrc = icons[index % icons.length];
        const title = `${folderName}\nLastModified : ${lastModified || 'unknown'}`;

        addItemToPanel('Folders', folderName.toLowerCase(), title, fullPath, imgSrc);
    });

    const desktopFiles = getAllFileRecursively(desktopPath);
    const scriptFiles = filterScriptFiles(desktopFiles);
    const shortcutFiles = desktopFiles.filter(file => file.endsWith('.lnk'));



    scriptFiles.forEach(({ name, type, fullPath, imgSrc }) => {
        addItemToPanel('Scripts', name, type, fullPath, imgSrc);
    });


    shortcutFiles.forEach(async (shortcutPath) => {

        shortcut.query(shortcutPath, (async (err, shortcutInfo) => {

            const exeFile = {
                location: shortcutInfo.target,
                name: path.basename(shortcutPath).split('.')[0],
            };

            const imgPathDefault = path.join(userHome, 'organizeYourDesktop',
                'img', exeFile.name + '.png');

            if (!fs.existsSync(imgPathDefault)) {
                await extractorAndSaveIcon(exeFile.location, exeFile.name);
            }

            addItemToPanel('Programs', exeFile.name.split(' ')[0], exeFile.name, shortcutPath, imgPathDefault);

        }));

    });
});






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
        folderName: 'doc'
    },
    {
        fullPath: path.join(require('os').homedir(), 'Pictures'),
        folderName: 'images'
    },
    {
        fullPath: path.join(require('os').homedir(), 'Videos'),
        folderName: 'vid'
    },
    {
        fullPath: path.join(require('os').homedir(), 'Downloads'),
        folderName: 'downloads'
    },
];