


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




const { getForegroundWindow, getWindowTitle, getAllWindows, getWindowRect } = require('hmc-win32');


async function isOnDesktop() {
    // Wait a moment to ensure the correct active window is retrieved
    await new Promise(resolve => setTimeout(resolve, 100));
    const activeWindowHandle = getForegroundWindow();

    const title = getWindowTitle(activeWindowHandle);
    console.log("Active Window Title:", title);
    if (!title) {
        // console.log("No title detected, assuming desktop.");
        return true; // Likely the desktop
    }
}

const addEventListener = () => {

    keyListener.addListener(async e => {


        const activeWindowHandle = getForegroundWindow();

        const title = getWindowTitle(activeWindowHandle);

        // if (e.name === 'MOUSE RIGHT' && e.state === "DOWN") {

        //     await isOnDesktop()
        // }

        const resetCounter = () => { setTimeout(() => { rightClickCount = 0 }, 500); };
        // const isFocused = mainWindow.isFocused();
        // const isVisible = mainWindow.isVisible();

        // if (!isFocused || !isVisible) {
        //     return;
        // }
        if (e.name === 'MOUSE LEFT' && e.state === "DOWN" && await isOnDesktop()) {

            rightClickCount++;

            if (rightClickCount === 2) {
                console.log("Detected two right-clicks in a row!");
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






// main.js

app.whenReady().then(() => {



})




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