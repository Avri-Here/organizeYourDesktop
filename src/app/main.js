



const path = require('path');
const log = require('electron-log');
require('electron-reload')(path.join(__dirname, '../..'));
const { app, BrowserWindow, screen, Tray, Menu } = require('electron');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const { executePsScriptOnBackground } = require('../utils/childProcess');
const toggleDesktopIcons = path.join(__dirname, '../assets/scripts/toggleDesktopIcons.ps1');
const { getValue, setValue, deleteValue, clearAllStore } = require('../utils/electronStore');

const keyListener = new GlobalKeyboardListener();

let mainWindow = null;
const createTray = (mainWindow) => {

    const tray = new Tray(path.join(__dirname, '../assets/img/appLogo.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'DevTools',
            click: () => { mainWindow.webContents.openDevTools() },
        },
        {
            label: 'Relaunch',
            click: () => {
                app.relaunch();
                app.exit();
            },
        },
        {
            label: 'Reset',
            click: () => { clearAllStore() },
        },
        {
            label: 'Exit',
            click: () => { app.quit() },
        },

    ]);

    tray.setToolTip('organizeYourDesktop');
    tray.setContextMenu(contextMenu);
}


const createDesktopWidget = () => {

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow = new BrowserWindow({
        x: width - width / 4, y: 0,
        width: width / 4, height: height,
        transparent: true, frame: false,
        resizable: false, skipTaskbar: true,
        webPreferences: { preload: path.join(__dirname, 'preload.js'), sandbox: false, },
    });


    mainWindow.webContents.openDevTools();
    mainWindow.loadFile(path.join(__dirname, '../pages/index/index.html'));
    // mainWindow.setIgnoreMouseEvents(true);
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

    mainWindow.on('restore', restoreOnShowDesktop);
    mainWindow.on('show', restoreOnShowDesktop);
    createTray(mainWindow);
    mainWindow.on('focus', () => {
        console.log('The mainWindow is now focused');
    });

    mainWindow.on('blur', () => {
        console.log('The mainWindow lost focus');
    });


    mainWindow.on('blur', () => {
        if (!mainWindow.isFocused()) {
            console.log('The mainWindow is blurred, possibly under other windows.');
        }
        else {
            console.log('The mainWindow is showen !');
        }
    });

    mainWindow.on('show', () => {
        console.log('The mainWindow is now visible');
    });

    mainWindow.on('hide', () => {
        console.log('The mainWindow is hidden');
    });

    mainWindow.on('minimize', () => {
        console.log('The mainWindow is minimized');
    });

    mainWindow.on('restore', () => {
        console.log('The mainWindow is restored from minimized state');
    });


}



app.on('will-quit', () => {
    keyListener.stop();
});
let rightClickCount = 0;

app.whenReady().then(async () => {


    console.log('Listening for MOUSE LEFT ...');

    keyListener.addListener((e, down) => {


        function isMainWindowDisplayed() {
            // Check if the window is visible and not minimized
            return mainWindow.isVisible() && !mainWindow.isMinimized();
        }

        // if (isMainWindowDisplayed()) {
        //     console.log("The mainWindow is displayed and not hidden or minimized.");
        // } else {
        //     console.log("The mainWindow is either hidden, minimized, or obscured by other windows.");
        // }



        console.log(mainWindow);
        
        // if (mainWindow.isblurred()) {
        //     console.log("The mainWindow is currently in focus.");
        // } else {
        //     console.log("The mainWindow is not in focus.");
        // }
        // console.log(e, down);




        const resetCounter = () => {
            setTimeout(() => { rightClickCount = 0 }, 500);
        };
        // const isOnDesktop = true

        // if (isOnDesktop) {
        //     console.log(`Click on desktop detected at (${x}, ${y})`);

        // }
        if (e.name === 'MOUSE LEFT' && e.state === "DOWN") {
            rightClickCount++;
            console.log(rightClickCount);

            if (rightClickCount === 2) {
                console.log("Detected two right-clicks in a row!");
                rightClickCount = 0;
            } else {
                resetCounter();
            }
        }
    });

    log.info('App is ready !');

    if (!getValue('desktopIconsDisplay')) {
        await executePsScriptOnBackground(toggleDesktopIcons);
        createDesktopWidget();
        setValue('desktopIconsDisplay', true);
        log.info(getValue('desktopIconsDisplay'));
        return;
    }

    createDesktopWidget();
    log.info(getValue('desktopIconsDisplay'));
});



app.on('will-quit', () => {
    console.log('beforeShutdown Event !');
    executePsScriptOnBackground(toggleDesktopIcons);
    deleteValue('desktopIconsDisplay');
    log.info(getValue('desktopIconsDisplay'));
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
