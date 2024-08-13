
const { exec } = require("child_process");
const openFile = require('./utils/openFile');
const openDialog = require('./utils/openDialog');
const openFolder = require("./utils/openFolder");
const openBrowser = require('./utils/openBrowser');
const runShellCommand = require("./utils/runShellCommand");
const runCommandAdmin = require("./utils/runCommandAdmin");
const copyToClipboard = require('./utils/copyToClipboard');
const popUpProgressBar = require("./utils/popUpProgressBar");
const showGenericDialog = require('./utils/showGenericDialog');
const userHome = require('os').homedir(), path = require('path')
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const { setValue, getValue, clearAllStore } = require('./utils/electronStore');

const devUser = process.env.MODE = 1;
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 750,
    height: 650,
    title: "App Link",
    center: true,
    icon: "./img/AppLogo.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: false,
  });

  const menuBarApp = [
    {
      label: "Start",
      submenu: [
        {
          label: "Run Credentials script .. ( PS ) ",
          click: () => {
            const folderLocation = getValue('credentialsPath');
            exec(`start powershell.exe -NoExit -File "${folderLocation}"`, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error executing PS script: ${error}`);
                return;
              }
              console.log(`STDOUT: ${stdout}`);
              console.error(`STDERR: ${stderr}`);
            });
          },
        },
        {
          label: "Open Git Repos .. ( Browser ) ",
          click: () => openBrowser("https://github.com/nice-cxone"),
        },
        {
          label: "Book A Desk .. ( OfficeSpace )",
          click: () => { openBrowser("https://nice.officespacesoftware.com/visual-directory/floors/78") },
        },
        ...(devUser ? [{
          label: "Copy to the clipboard  .. ( Js .. ) ",
          click: (() => { copyToClipboard(`process.env.MODE && require('C:/Intel/accessories/setAWSCredentials.js');`) })
        }] : []),
      ],
    },
    {
      label: "Developer",
      submenu: [
        {
          label: "Open Terminal - Work Space .. ",
          click: () => {
            const command = "cmd /k echo Type A Command and press Enter to Run it ..."
            runShellCommand(undefined, command)
          }
        },
        {
          label: "Open Environment Variables .. ",
          click: async () => {
            const openEnv = "rundll32 sysdm.cpl,EditEnvironmentVariables";
            await runCommandAdmin(openEnv);
          },
        },
        {
          label: "Open User Folder - Explorer ..",
          click: (() => {
            popUpProgressBar(3, `Opening Your folder !`, true);
            openFolder(userHome);
          }),
        },
      ],
    },
    {
      label: "Application",
      submenu: [
        {
          label: "Settings ..",
          click: () => {
            mainWindow.loadFile("./html/settingsPage.html");
          },
        },
        {
          label: "Console ..",
          click: () => {
            mainWindow.webContents.openDevTools();
          },
        },
        {
          label: "Refresh ..",
          click: () => {
            mainWindow.reload();
          },
        },
        {
          label: "About ..",
          click: () => {
            mainWindow.loadFile("./html/aboutThisApp.html");
          },
        },
        {
          label: "Reset ..",
          click: () => {
            clearAndReset();
          },
        },
      ],
    },
  ];

  const mainMenu = Menu.buildFromTemplate(menuBarApp);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.loadFile("./html/indexPage.html");

  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => { mainWindow = null });
}



ipcMain.on('navigate-to-main', () => { mainWindow.loadFile('./html/indexPage.html') });

ipcMain.on('navigate-to-settings', () => { mainWindow.loadFile("./html/settingsPage.html") });

ipcMain.on('close-windows', () => { app.quit() });

ipcMain.on('pop-up-progress-bar', (event, time, message) => { popUpProgressBar(time, message) });

ipcMain.on('set-value-in-store', (event, key, value) => { setValue(key, value) });

ipcMain.on('show-init-dialog', async (event, title, message, detail, buttons) => {

  mainWindow.setEnabled(false);
  const onYes = () => { mainWindow.loadFile("./html/settingsPage.html") };
  const onNo = () => { app.quit() };
  await showGenericDialog(title, message, detail, buttons, onYes, onNo);
  mainWindow.setEnabled(true);


});

ipcMain.on('show-config-dialog', async (event, title, message, detail, buttons) => {
  const onYes = () => {
    const isFileExists = openFile(path.join(userHome, 'amigosApp'), 'amigosData.json');
    if (!isFileExists) {
      dialog.showErrorBox('Major Error !', 'amigosData.json not exists !');
      return;
    }
    popUpProgressBar(2, `Try To Open : amigosData.json ..`, true);
  };

  const onNo = () => { return };
  await showGenericDialog(title, message, detail, buttons, onYes, onNo);
});


ipcMain.on('open-directory-dialog', async () => {
  const repoPath = await openDialog(mainWindow, ['openDirectory']);
  setValue('repoPath', repoPath);
});

ipcMain.on('open-file-dialog', async (event, { name, extensions }) => {
  const credentialsPath = await openDialog(mainWindow, ['openFile'], [{ name, extensions }]);
  setValue(name, credentialsPath);
});

ipcMain.on('open-file-dialog', async (event, { name, extensions }) => {
  const credentialsPath = await openDialog(mainWindow, ['openFile'], [{ name, extensions }]);
  setValue(name, credentialsPath);
});

const clearAndReset = () => {
  clearAllStore();
  popUpProgressBar(4, `Cleaning and Restarting ...`, true);
  setTimeout(() => { app.relaunch(); app.quit(); }, 1000);
}


app.on("ready", () => { createWindow(); app.setAppUserModelId('App Link App') });










