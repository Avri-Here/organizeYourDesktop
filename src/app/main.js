



const path = require('path');
const log = require('electron-log');
require('electron-reload')(path.join(__dirname, '../..'));
const { app, BrowserWindow, screen, Tray, Menu } = require('electron');
const { executePsScriptOnBackground } = require('../utils/childProcess');
const toggleDesktopIcons = path.join(__dirname, '../assets/scripts/toggleDesktopIcons.ps1');
const { getValue, setValue, deleteValue, clearAllStore } = require('../utils/electronStore');



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

    const mainWindow = new BrowserWindow({
        x: width - width / 4, y: 0,
        width: width / 4, height: height / 1.5,
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


}

app.whenReady().then(async () => {

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
