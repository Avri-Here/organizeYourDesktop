const { clipboard } = require("electron");
const notification = require("./showNotification");

function copyToClipboard(text, type = "selection") {
  clipboard.writeText(text, type);
  notification("Copied to Clipboard !", text);
}

module.exports = copyToClipboard;

