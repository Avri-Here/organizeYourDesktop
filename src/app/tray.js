




const path = require('path');
const { Tray, Menu, app } = require('electron');
const { clearAllStore } = require('../utils/electronStore'); // Adjust the path based on your project structure

const createTray = (mainWindow) => {

    const tray = new Tray(path.join(__dirname, '../assets/img/appLogo.png'));
    const contextMenu = Menu.buildFromTemplate(
        [
            {
                label: 'clearAllStore',
                click: () => { clearAllStore(); },
            },
            {
                label: 'DevTools',
                click: () => { mainWindow.webContents.openDevTools() },
            },
            {
                label: 'Relaunch',
                click: () => { app.relaunch(); app.exit(); },
            },
            {
                label: 'Reset',
                click: () => { clearAllStore(); app.relaunch(); app.exit(); },
            },
            {
                label: 'Exit',
                click: () => { app.quit() },
            },
        ]);

    tray.setToolTip('organizeYourDesktop');
    tray.setContextMenu(contextMenu);
};

module.exports = createTray;
