const { ipcRenderer } = require('electron');
const { getValue, setValue } = require('../utils/electronStore');

const backButton = document.getElementById("backButton");
const ideSelect = document.getElementById('ideSelect');
const repoPath = document.getElementById('repoPath');
const credentialsPath = document.getElementById('credentialsPath');
const intelliJPath = document.getElementById('intelliJPath');

ideSelect.value = getValue('ideSelect') || '';


backButton.addEventListener("click", () => {
    ipcRenderer.send("navigate-to-main");
});

ideSelect.addEventListener('change', () => {
    const selectedIDE = ideSelect.value;
    setValue('ideSelect', selectedIDE);
});

repoPath.addEventListener('click', () => {
    ipcRenderer.send('open-directory-dialog');
});

credentialsPath.addEventListener('click', () => {
    const windowsType = { name: 'credentialsPath', extensions: ['ps1'] };
    ipcRenderer.send('open-file-dialog', windowsType);
});

intelliJPath.addEventListener('click', () => {
    const windowsType = { name: 'intelliJPath', extensions: ['exe'] };
    ipcRenderer.send('open-file-dialog', windowsType);
});

