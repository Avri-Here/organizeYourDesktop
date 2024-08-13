

const path = require('path');
const console = require('electron-log');
const shortcut = require('windows-shortcuts');
const iconExtractor = require('icon-extractor');
const { getValue, setValue } = require('../utils/electronStore');
const { executeScriptWithNoExit, openFile } = require('../utils/childProcess');
const { getAllFileRecursively, filterScriptFiles } = require('../utils/fileExplorer');

iconExtractor.emitter.on('icon', (data) => {
    const key = path.basename(data.Context).split('.')[0]
    setValue(key, data.Base64ImageData)
});


const addItemToPanel = (panelTitle, itemText, type, fullPath, imgSrc) => {

    const panel = Array.from(document.querySelectorAll('.panel')).find(panel => {
        return panel.querySelector('.panel-title').textContent === panelTitle;
    });

    const itemsContainer = panel.querySelector('.items');
    const newItem = document.createElement('div');
    newItem.classList.add('item');
    newItem.title = type;
    newItem.addEventListener('click', () => {

        if (panelTitle === 'Scripts') {
            console.info(`Running script : ${fullPath}`);
            executeScriptWithNoExit(type, fullPath);
            return;
        }
        openFile(fullPath);
    })

    const newImg = document.createElement('img');
    newImg.id = 'imgExe'
    newImg.src = imgSrc;
    newImg.alt = itemText;

    const newText = document.createElement('div');
    const br = document.createElement('br');
    newText.textContent = itemText;

    newItem.appendChild(newImg);
    newItem.appendChild(newText);
    newItem.appendChild(br);

    itemsContainer.appendChild(newItem);
}

document.addEventListener('DOMContentLoaded', () => {

    const desktopPath = path.join(require('os').homedir(), 'Desktop');

    const ignoreDirs = [
        'node_modules', 'dist', '.git', 'coverage', 'logs',
        'temp', 'tmp', 'out', 'build', '.idea', '.vscode',
        '.cache', 'env',
    ];

    const desktopFiles = getAllFileRecursively(desktopPath, ignoreDirs);

    const scriptFiles = filterScriptFiles(desktopFiles);
    const shortcutFiles = desktopFiles.filter(file => file.endsWith('.lnk'));

    scriptFiles.forEach(({ name, type, fullPath, imgSrc }) => {
        const panelTitle = 'Scripts';
        addItemToPanel(panelTitle, name, type, fullPath, imgSrc);
    });

    const exeFiles = [];

    shortcutFiles.forEach(async (fullPath) => {
        shortcut.query(fullPath, (async (err, shortcutInfo) => {
            const exeFile = {
                target: shortcutInfo.target,
                basename: path.basename(fullPath),
                iconBase64: null
            };

            exeFiles.push(exeFile);

            iconExtractor.getIcon(exeFile.basename, fullPath);
            const panelTitle = 'Programs';
            const name = path.basename(exeFile.basename).split('.')[0];

            const imgSrc = "data:image/png;base64," + getValue(name);
            addItemToPanel(panelTitle, name.split(' ')[0], name, fullPath, imgSrc);

        }));

    });
});


