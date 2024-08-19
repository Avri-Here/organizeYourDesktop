

const hmcWin32 = require('hmc-win32');
const console = require('electron-log');
const userHome = require('os').homedir();
const { ipcRenderer } = require('electron');
const path = require('path'), fs = require('fs');
const { openFile, openFolder } = require('../utils/fileExplorer');
const desktopPath = path.join(require('os').homedir(), 'Desktop');
const { getFolderAndFiles, isThisScriptFile } = require('../utils/fileExplorer');
const { executeScriptWithNoExit, runPowerShellFile } = require('../utils/childProcess');
// const { getAllFileRecursively, filterScriptFiles, getAllDirectories, isThisScriptFile } = require('../utils/fileExplorer');



// const initializePanels = () => {

//     const container = document.querySelector('.container');
//     const panels = ['Files', 'Programs', 'Folders'];
//     // const panels = ['Scripts', 'Programs', 'Folders'];

//     panels.forEach(title => {

//         const panel = document.createElement('div');
//         panel.classList.add('panel');

//         const panelTitleDiv = document.createElement('div');
//         panelTitleDiv.classList.add('panel-title');
//         panelTitleDiv.textContent = title;

//         const itemsDiv = document.createElement('div');
//         itemsDiv.classList.add('items');

//         panel.appendChild(panelTitleDiv);
//         panel.appendChild(itemsDiv);
//         container.appendChild(panel);
//     });
// };


const initializePanels = () => {
    const container = document.querySelector('.container');
    const panels = ['Files', 'Programs', 'Folders'];

    panels.forEach((title, index) => {
        const panel = document.createElement('div');
        panel.classList.add('panel');
        panel.draggable = true;
        panel.dataset.index = index; // Store the initial index

        panel.addEventListener('dragstart', handleDragStart);
        panel.addEventListener('dragover', handleDragOver);
        panel.addEventListener('drop', handleDrop);

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

const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
};

const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow drop
    const draggingPanel = document.querySelector('.dragging');
    const container = draggingPanel.parentNode;
    const panels = Array.from(container.children);
    const currentPanel = e.currentTarget;

    const draggingIndex = panels.indexOf(draggingPanel);
    const currentIndex = panels.indexOf(currentPanel);

    if (draggingIndex < currentIndex) {
        container.insertBefore(draggingPanel, currentPanel.nextSibling);
    } else {
        container.insertBefore(draggingPanel, currentPanel);
    }
};


const handleDrop = (e) => {
    e.preventDefault(); // Prevent default drop behavior
    const draggingPanel = document.querySelector('.dragging');
    draggingPanel.classList.remove('dragging');

    // Optional: Update dataset indices or any other state if necessary
};


const handleItemClick = async (panelTitle, fullPath) => {

    // if (panelTitle === 'Scripts') executeScriptWithNoExit(type, fullPath);

    if (panelTitle === 'Programs') openFile(fullPath);

    if (panelTitle === 'Folders') openFolder(fullPath);


    if (panelTitle === 'Files') {

        const fileName = path.basename(fullPath);
        const scriptFile = isThisScriptFile(fullPath);

        console.log('isThisScriptFile(fullPath)' + scriptFile);

        if (scriptFile) {
            const result = await ipcRenderer.invoke('open-dialog', {
                type: 'question',
                title: 'Script File Detected !',
                message: `What would you like to do with ${fileName} ? `,
                detail: 'Run it or Open it to view its content ?',
                buttons: ['Open', 'Run'],
                // icon: 'path/to/your/icon.png'
                // checkboxLabel: 'Remember My Choice !'
            })

            if (result.response === 0) {
                openFile(fullPath);

            }
            else if (result.response === 1) {
                executeScriptWithNoExit(fullPath);
            }

            return;
        }
        openFile(fullPath);
    };
}






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
    newItem.style.cursor = 'pointer';

    newItem.addEventListener('click', () => handleItemClick(panelTitle, fullPath));

    // Style the image
    newImg.id = 'imgExe';
    newImg.src = imgSrc;
    newImg.className = "icon";
    newImg.onerror = () => {
        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
        newImg.src = fallbackImages[randomIndex];
    };
    newImg.alt = itemText;
    newImg.style.objectFit = 'cover';
    newImg.style.borderRadius = panelTitle !== 'Files' ? '8px' : '0px';

    newText.textContent = itemText;
    newItem.appendChild(newImg);
    newItem.appendChild(newText);
    newItem.appendChild(br);
    itemsContainer.appendChild(newItem);
};


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



document.addEventListener('DOMContentLoaded', async () => {

    initializePanels();
    const { files, folders } = await getFolderAndFiles(desktopPath);
    const shortcutFiles = files.filter(file => file.name.endsWith('.lnk'));
    const restFiles = files.filter(file => !file.name.endsWith('.lnk') && !file.name.endsWith('.ini'));
    console.log(restFiles);

    const desktopFolders = addFolderIfNeeded(folders);


    restFiles.forEach(({ name, fullPath, lastModified }) => {
        const iconName = name.split('.').pop().toLowerCase();
        const imgSrc = path.join(userHome, 'organizeYourDesktop', 'img', 'fileIcons', iconName + '.svg');
        const title = `${name}\nLastModified : ${lastModified || 'unknown'}`;
        addItemToPanel('Files', name.toLowerCase(), title, fullPath, imgSrc);
    });


    desktopFolders.forEach(({ name, fullPath, lastModified }, index) => {

        const imgSrc = icons[index % icons.length];
        const title = `${name}\nLastModified : ${lastModified || 'unknown'}`;
        addItemToPanel('Folders', name.toLowerCase(), title, fullPath, imgSrc);
    });



    for (let i = 0; i < shortcutFiles.length; i++) {

        const { fullPath: shortcutPath } = shortcutFiles[i];
        const shortcutLink = hmcWin32.getShortcutLink(shortcutPath);
        const exePath = shortcutLink.icon || shortcutLink.path || shortcutLink.cwd;
        const iconName = path.basename(exePath, path.extname(exePath));
        const imgPathDefault = path.join(userHome, 'organizeYourDesktop', 'img', 'exe', iconName + '.png');


        if (!fs.existsSync(exePath)) {
            console.warn(`Not existsSync : ` + exePath);
            continue;
        }

        if (fs.existsSync(imgPathDefault)) {
            addItemToPanel('Programs', '', iconName, shortcutPath, imgPathDefault);
            continue;
        }

        const defaultImg = 'https://cdn.icon-icons.com/icons2/17/PNG/256/windows_win_2248.png';
        await runPowerShellFile('extractIconFromExe.ps1');
        addItemToPanel('Programs', '', iconName, shortcutPath, defaultImg);
    }






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