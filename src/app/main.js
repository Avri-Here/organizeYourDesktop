



const path = require('path');
const log = require('electron-log');
const createTray = require('./tray');
const { runPowerShellFile } = require('../utils/childProcess');
require('electron-reload')(path.join(__dirname, '../..'));
const { app, BrowserWindow, screen } = require('electron');
const { getValue, setValue } = require('../utils/electronStore');


const createDesktopWidget = () => {

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        x: width - width / 4, y: 0,
        transparent: true, frame: false,
        width: width / 4, height: height,
        resizable: false, skipTaskbar: true,
        webPreferences: { preload: path.join(__dirname, 'preload.js'), sandbox: false, },
    });


    mainWindow.webContents.openDevTools();
    mainWindow.loadFile(path.join(__dirname, '../pages/index/index.html'));
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.showInactive();
    mainWindow.minimize();
    mainWindow.showInactive();


    const restoreOnShowDesktop = () => {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
            mainWindow.showInactive();
        }
    };
    createTray(mainWindow);

    mainWindow.on('show', restoreOnShowDesktop);
    mainWindow.on('restore', restoreOnShowDesktop);

}


app.whenReady().then(async () => {

    log.info('whenReady - Event !');

    if (getValue('desktopIconsDisplay') === 'on' || getValue('desktopIconsDisplay') == null) {
        await runPowerShellFile('toggleDesktopIcons.ps1');
        setValue('desktopIconsDisplay', 'off');
        createDesktopWidget();
        return;
    }

    createDesktopWidget();
});


app.on('before-quit', async (event) => {

    event.preventDefault();
    log.info('before-quit - Event!');

    if (getValue('desktopIconsDisplay') === 'off' || getValue('desktopIconsDisplay') == null) {
        await runPowerShellFile('toggleDesktopIcons.ps1');
        setValue('desktopIconsDisplay', 'on');
        app.exit();
        return;
    }
});















// const keyListener = new GlobalKeyboardListener();
// const { GlobalKeyboardListener } = require('node-global-key-listener');

// let rightClickCount = 0;
// app.on('will-quit', () => {
//     keyListener.stop();
// });


// app.whenReady().then(async () => {


//     console.log('Listening for MOUSE LEFT ...');

//     keyListener.addListener((e, down) => {


//         function isMainWindowDisplayed() {
//             // Check if the window is visible and not minimized
//             return mainWindow.isVisible() && !mainWindow.isMinimized();
//         }

//         // if (isMainWindowDisplayed()) {
//         //     console.log("The mainWindow is displayed and not hidden or minimized.");
//         // } else {
//         //     console.log("The mainWindow is either hidden, minimized, or obscured by other windows.");
//         // }



//         console.log(mainWindow);

//         // if (mainWindow.isblurred()) {
//         //     console.log("The mainWindow is currently in focus.");
//         // } else {
//         //     console.log("The mainWindow is not in focus.");
//         // }
//         // console.log(e, down);




//         const resetCounter = () => {
//             setTimeout(() => { rightClickCount = 0 }, 500);
//         };
//         // const isOnDesktop = true

//         // if (isOnDesktop) {
//         //     console.log(`Click on desktop detected at (${x}, ${y})`);

//         // }
//         if (e.name === 'MOUSE LEFT' && e.state === "DOWN") {
//             rightClickCount++;
//             console.log(rightClickCount);

//             if (rightClickCount === 2) {
//                 console.log("Detected two right-clicks in a row!");
//                 rightClickCount = 0;
//             } else {
//                 resetCounter();
//             }
//         }
//     });


// });





// mainWindow.on('focus', () => {
//     console.log('The mainWindow is now focused');
// });

// mainWindow.on('blur', () => {
//     console.log('The mainWindow lost focus');
// });


// mainWindow.on('blur', () => {
//     if (!mainWindow.isFocused()) {
//         console.log('The mainWindow is blurred, possibly under other windows.');
//     }
//     else {
//         console.log('The mainWindow ON !');
//     }
// });

// mainWindow.on('show', () => {
//     console.log('The mainWindow is now visible');
// });

// mainWindow.on('hide', () => {
//     console.log('The mainWindow is hidden');
// });

// mainWindow.on('minimize', () => {
//     console.log('The mainWindow is minimized');
// });

// mainWindow.on('restore', () => {
//     console.log('The mainWindow is restored from minimized state');
// });