


const path = require('path');
const HMC = require('hmc-win32');
const log = require('electron-log');
let mainWindow, rightClickCount = 0;
const createTray = require('./tray');
require('electron-reload')(path.join(__dirname, '../..'));
const { runPowerShellFile } = require('../utils/childProcess');
const { getValue, setValue } = require('../utils/electronStore');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const { desktopCapturer, session } = require('electron')


const keyListener = new GlobalKeyboardListener();

const createDesktopWidget = () => {

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
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
    addEventListener();
    log.info('desktopIconsDisplay', getValue('desktopIconsDisplay'))

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
    keyListener.stop();
    if (getValue('desktopIconsDisplay') === 'off' || getValue('desktopIconsDisplay') == null) {
        await runPowerShellFile('toggleDesktopIcons.ps1');
        setValue('desktopIconsDisplay', 'on');
        app.exit();
        return;
    }
});


ipcMain.handle('open-dialog', async (_, options) => {
    const result = await dialog.showMessageBox(options);
    return result;
});

const { getForegroundWindow, getWindowTitle } = require('hmc-win32');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const isOnDesktop = async () => {
    await delay(100);
    const activeWindowHandle = getForegroundWindow();
    const title = getWindowTitle(activeWindowHandle);
    // console.log("Active Window Title:", title);
    return !title;
}

const addEventListener = () => {
    let rightClickCount = 0;
    const resetCounter = () => setTimeout(() => { rightClickCount = 0 }, 1000);

    keyListener.addListener(async e => {
        if (e.name === 'MOUSE LEFT' && e.state === "DOWN") {
        
        
            const isDesktop = await isOnDesktop();
            if (!isDesktop) return;

            rightClickCount++;
            if (rightClickCount === 2) {
                console.log("Detected two right-clicks on Desktop !!");
                rightClickCount = 0;

                if (mainWindow.isVisible()) {
                    await runPowerShellFile('toggleDesktopIcons.ps1');
                    setValue('desktopIconsDisplay', 'on');
                    mainWindow.hide();
                } else {
                    await runPowerShellFile('toggleDesktopIcons.ps1');
                    setValue('desktopIconsDisplay', 'off');
                    mainWindow.show();
                }
            } else {
                resetCounter();
            }
        }
    });
}



// app.on('will-quit', () => {
//     keyListener.stop();
// });

// let rightClickCount = 0;

// app.whenReady().then(async () => {


//     console.log('Listening for MOUSE LEFT ...');



//         console.log(mainWindow);

//         // if (mainWindow.isblurred()) {
//         //     console.log("The mainWindow is currently in focus.");
//         // } else {
//         //     console.log("The mainWindow is not in focus.");
//         // }
//         // console.log(e, down);







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











//    const prompt = require('electron-prompt');

//     prompt({
//         title: 'Prompt example',
//         label: 'URL:',
//         value: 'http://example.org',
//         // inputAttrs: {
//         //     type: 'url'
//         // },
//         // type: 'input'
//     })
//         .then((r) => {
//             if (r === null) {
//                 console.log('user cancelled');
//             } else {
//                 console.log('result', r);
//             }
//         })
//         .catch(console.error);