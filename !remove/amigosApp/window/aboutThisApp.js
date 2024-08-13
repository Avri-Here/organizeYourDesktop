const { ipcRenderer } = require('electron');
const openBrowser = require("../utils/openBrowser")


const backButton = document.getElementById("backButton");
const sourceCode = document.getElementById("sourceCode");

backButton.addEventListener("click", () => {
    ipcRenderer.send("navigate-to-main");
});

sourceCode.addEventListener("click", () => {
    openBrowser("https://github.com/Avri-Yom-Tov/Amigos-App");
});