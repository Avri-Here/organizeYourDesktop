// const fs = require('fs');
// const path = require('path');

// function organizeDesktop() {
//     const desktopPath = path.join(require('os').homedir(), 'Desktop');
//     const files = fs.readdirSync(desktopPath);

//     files.forEach(file => {
//         const ext = path.extname(file).toLowerCase();
//         if (ext === '.lnk') {
//             // Add to Shortcuts widget
//             document.getElementById('shortcuts-widget').innerHTML += `<div>${file}</div>`;
//         } else {
//             // Add to Files & Documents widget
//             document.getElementById('files-widget').innerHTML += `<div>${file}</div>`;
//         }
//     });
// }

// document.addEventListener('DOMContentLoaded', () => {
//     organizeDesktop();
// });
