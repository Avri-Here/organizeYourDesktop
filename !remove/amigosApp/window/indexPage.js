


const Swal = require('sweetalert2');
const { ipcRenderer } = require('electron');
const { exec } = require('child_process');
const readFile = require('../utils/readFile');
const openFolder = require('../utils/openFolder');
const openBrowser = require('../utils/openBrowser');
const { getValue } = require('../utils/electronStore');
const runShellCommand = require("../utils/runShellCommand");
const listFolderInDirectory = require("../utils/listFolderInDirectory");



const USER_HOME = require('os').homedir();
const REPO_FOLDER_PATH = getValue('repoPath');
const VSCODE_COMMAND = 'code .';


const isIntelliJSelected = () => getValue('ideSelect') === 'intellij';

const createButton = (src, title) => {
  const button = document.createElement("img");
  button.src = src;
  button.title = title;
  button.classList.add("icon-size");
  return button;
}


const openIDE = (idePath, folderToOpen, message) => {
  ipcRenderer.send('pop-up-progress-bar', 2, message);
  runShellCommand(`${REPO_FOLDER_PATH}\\${folderToOpen}`, idePath, true);

};

const openWithCode = (folderToOpen) => {
  try {
    if (isIntelliJSelected()) {
      const intelliJPath = getValue('intelliJPath');
      openIDE(`"${intelliJPath}"`, folderToOpen, 'Opening Intellij IDE..');
      return;
    }
    openIDE(VSCODE_COMMAND, folderToOpen, 'Opening VsCode IDE..');

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: error.message,
    });
  }
};

const openOnGithub = (element) => {
  ipcRenderer.send('pop-up-progress-bar', 1, 'Opening browser ..');
  openBrowser(`https://github.com/nice-cxone/${element}`);
}

const openOnFolder = (element) => {
  ipcRenderer.send('pop-up-progress-bar', 2, 'Opening Folder ..');
  openFolder(REPO_FOLDER_PATH + "\\" + element);
}

const isConfigurationMissing = () => {
  console.log(getValue());
  const requiredKeys = ['ideSelect', 'repoPath', 'credentialsPath'];
  return requiredKeys.some(key => !getValue(key));
}


const isMissingIntelliJPath = () => {
  return isIntelliJSelected() && !getValue('intelliJPath');
}

const openResource = async (element, resourceType) => {
  try {
    const pipesUrls = await readFile(`${USER_HOME}\\amigosApp\\amigosData.json`, true);
    if (pipesUrls[element] && pipesUrls[element]?.[resourceType]) {
      ipcRenderer.send('pop-up-progress-bar', 2, `Open on ${resourceType}..`);
      setTimeout(() => { openBrowser(pipesUrls[element][resourceType]) }, 1500);
      return;
    }

    const title = `I'm sorry, Missing details to continue ..`;
    const msg = 'One or more the Urls in the configuration file are missing, To solve this problem you need to edit the configuration file and then try again ..';
    const buttons = ['Yes, Set It Now !', 'Not now .'];

    ipcRenderer.send('show-config-dialog', 'info', title, msg, buttons);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: error.message,
    });
  }
}



window.onload = async () => {

  if (!sessionStorage.getItem('appOpened')) {

    const splash = document.getElementById('splash');
    splash.style.display = 'flex';

    const audio = new Audio('../sound/xpStartupSound.mp3');
    audio.play().catch(error => {
      console.error('Error playing sound :', error);
    });

    sessionStorage.setItem('appOpened', 'true');

    setTimeout(() => {
      splash.style.display = 'none';
    }, 4000);
  }




  if (isConfigurationMissing()) {
    const title = 'Hey user, Pay attention !';
    const msg = 'Probably this is your first time running this software, you must configure some important settings before you start ..'
    const buttons = ['Yes, Set It Now !', 'No, Exit ..'];

    ipcRenderer.send('show-init-dialog', 'info', title, msg, buttons);
    return;
  }

  if (isMissingIntelliJPath()) {
    const title = 'Hey user, Pay attention !';
    const msg = `It looks like you set your preferred IDE to be IntelliJ -  But you didn't set its install location..`
    const buttons = ['Set It On Settings !', 'No, Exit ..'];

    ipcRenderer.send('show-init-dialog', 'info', title, msg, buttons);
    return;
  }


  const searchBox = document.getElementById("searchBox");
  const searchType = document.getElementById("searchType");
  const scriptsList = document.getElementById("scripts");
  const workFolderRepositories = await listFolderInDirectory(REPO_FOLDER_PATH);
  workFolderRepositories.sort((a, b) => a - b);


  let listItems = [];

  workFolderRepositories.forEach(element => {

    const btnContainer = document.createElement("div");
    const card = document.createElement("li");
    const title = document.createElement("h4");
    const body = document.createElement("p");
    card.classList.add("collection-item");

    const repoName = element.startsWith("cloud-formation-") && element !== 'cloud-formation-cxhist-storage' ? element.substring("cloud-formation-".length) : element;
    const removeCxone = repoName.replace('cxone-', '');
    title.innerHTML = removeCxone.charAt(0).toUpperCase() + removeCxone.slice(1).toLowerCase();
    title.classList.add("card-title");


    btnContainer.classList.add("cardAss");


    const buttons = [
      { img: "../img/programming.png", label: "Open On IDE", action: (() => openWithCode(element)) },
      { img: "../img/social.png", label: "Open On Github", action: (() => { openOnGithub(element) }) },
      { img: "../img/open-folder.png", label: "Open On Folder", action: (() => { openOnFolder(element) }) },
      { img: "../img/jenkins.png", label: "Open On Jenkins", action: (() => { openResource(element, 'job') }) },
      { img: "../img/amazon.png", label: "Open On Aws", action: (() => { openResource(element, 'aws') }) },
    ];


    const lambdaName = "dev-" + element;

    const scriptPath = `${USER_HOME}\\amigosApp\\awsLogs.ps1`

    // Button action
    const buttonAction = () => {
      exec(`start powershell.exe -NoExit -File "${scriptPath}" -LambdaName ${lambdaName}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing PowerShell script: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`PowerShell script stderr: ${stderr}`);
          return;
        }
        console.log(`PowerShell script output: ${stdout}`);
      });
    };
    if (element.includes('lambda') && !element.includes('cxhist')) {
      const type = element.includes('lambda') ? 'lambda' : 'state-machine';
      buttons.push({
        img: "../img/awsCloudwatchLogo.png",
        label: "Get Logs - AwsCloudwatch ",
        action: buttonAction
        // action: (() => { ipcRenderer.send("navigate-to-aws-logs", { name: element, type }) })
        // label: "Get Logs - AwsCloudwatch ", action: (() => { ipcRenderer.send("navigate-to-aws-logs", { name: element, type }) })
      }
      );
    }
    else {
      buttons.push({
        img: "../img/x.png",
        label: "AwsCloudwatch Not available .. ",
        // action: buttonAction
      }
      );
    }


    [...buttons].forEach(({ img, label, action }) => {
      const button = createButton(img, label);
      button.addEventListener('click', action);
      btnContainer.appendChild(button);
    });


    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(btnContainer);

    scriptsList.appendChild(card);
    listItems.push({ element, card });
  });





  const filterRepositories = () => {

    const searchValue = searchBox.value.toLowerCase();
    const filterType = searchType.value;

    listItems.forEach(item => {
      const repoName = item.element.toLowerCase();
      const listItem = item.card;

      const isAppLink = repoName.includes('applink') || repoName.includes('hybrid-recording');
      const isHistorical = repoName.includes('cxhist');
      const isStoreAndForward = repoName.includes('-snf');
      let shouldDisplay = false;

      if (filterType === 'All') {
        shouldDisplay = repoName.includes(searchValue);
      }
      else if (filterType === 'AppLink') {
        shouldDisplay = isAppLink && repoName.includes(searchValue);
      }
      else if (filterType === 'Historical') {
        shouldDisplay = isHistorical && repoName.includes(searchValue);
      }
      else if (filterType === 'S&F') {
        shouldDisplay = isStoreAndForward && repoName.includes(searchValue);
      }


      listItem.style.display = shouldDisplay ? "" : "none";



    });
  };

  searchBox.addEventListener('keyup', filterRepositories);
  searchType.addEventListener('change', filterRepositories);
};





