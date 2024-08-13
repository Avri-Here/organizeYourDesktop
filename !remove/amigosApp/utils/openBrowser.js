const { shell } = require("electron");

function openBrowser(url = "https://photos.google.com") {
  shell.openExternal(url);
}

module.exports = openBrowser;
