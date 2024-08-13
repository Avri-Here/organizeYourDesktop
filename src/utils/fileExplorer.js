const fs = require('fs');
const path = require('path');


const ignoreList = [
    'node_modules', 'dist', '.git', 'coverage', 'logs',
    'temp', 'tmp', 'out', 'build', '.idea', '.vscode',
    '.cache', 'env',
];


const getAllFileRecursively = (dirPath, ignoreDirs = ignoreList) => {
    const files = fs.readdirSync(dirPath);
    const arrayOfFiles = [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                arrayOfFiles.push(...getAllFileRecursively(fullPath, ignoreDirs));
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
};

const filterScriptFiles = (files) => {

    const baseUrl = 'https://img.icons8.com/';
    const scriptCommands = {
        '.py': { type: 'python', imgSrc: `${baseUrl}?size=36&id=12584&format=png&color=22C3E6` },
        '.js': { type: 'node', imgSrc: `${baseUrl}?size=48&id=FQlr_bFSqEdG&format=png&color=22C3E6` },
        '.bat': { type: 'cmd', imgSrc: `${baseUrl}?size=48&id=av89ZFRgol47&format=png&color=22C3E6` },
        '.ps1': { type: 'powershell', imgSrc: `${baseUrl}?size=48&id=59499&format=png&color=22C3E6` }
    };

    return files.filter(file => {
        const extension = file.slice(file.lastIndexOf('.')).toLowerCase();
        return scriptCommands.hasOwnProperty(extension);
    }).map(file => {
        const extension = file.slice(file.lastIndexOf('.')).toLowerCase();
        return {
            fullPath: file,
            name: path.basename(file, extension),
            type: scriptCommands[extension].type,
            imgSrc: scriptCommands[extension].imgSrc
        };
    });
};






module.exports = { getAllFileRecursively, filterScriptFiles };

