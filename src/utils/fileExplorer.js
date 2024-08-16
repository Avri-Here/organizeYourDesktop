


const { join } = require('path');
const { exec } = require('child_process');
const fsPromises = require('fs').promises;
const { readdir, stat } = require('fs/promises');
const fs = require('fs'), path = require('path');



const ignoreList = [
    'node_modules', 'dist', '.git', 'coverage', 'logs',
    'temp', 'tmp', 'out', 'build', '.idea', '.vscode',
    '.cache', 'env',
];


const isThisScriptFile = (fileName) => {
    const scriptExtensions = ['.js', '.py', '.bat', '.ps1'];
    return scriptExtensions.some(ext => fileName.endsWith(ext));
};

const getAllDirectories = async (dirPath) => {

    const directories = [];

    try {
        const files = await readdir(dirPath);
        for (const file of files) {
            const fullPath = join(dirPath, file);
            const fileStat = await stat(fullPath);

            if (fileStat.isDirectory()) {
                const formattedDate = fileStat.mtime.toLocaleDateString('en-GB');
                directories.push({
                    fullPath,
                    folderName: file,
                    lastModified: formattedDate
                });

            }
        }
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
    }

    return directories;
}



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


const getFolderAndFiles = async (folderPath) => {

    const entries = await fsPromises.readdir(folderPath, { withFileTypes: true });

    const files = [];
    const folders = [];

    for (const entry of entries) {

        const fullPath = join(folderPath, entry.name);
        const fileStat = await stat(fullPath);
        const lastModified = fileStat.mtime.toLocaleDateString('en-GB');
        if (entry.isDirectory()) {
            folders.push({ fullPath, name: entry.name, lastModified });
        } else if (entry.isFile()) {
            files.push({ fullPath, name: entry.name, lastModified });
        }
    }

    return { files, folders };
};
const filterScriptFiles = (files) => {

    const baseUrl = 'https://img.icons8.com/';
    const scriptCommands = {
        '.py': { type: 'python', imgSrc: `${baseUrl}?size=64&id=12584&format=png&color=22C3E6` },
        '.js': { type: 'node', imgSrc: `${baseUrl}?size=64&id=FQlr_bFSqEdG&format=png&color=22C3E6` },
        '.bat': { type: 'cmd', imgSrc: `${baseUrl}?size=64&id=av89ZFRgol47&format=png&color=22C3E6` },
        '.ps1': { type: 'powershell', imgSrc: `${baseUrl}?size=64&id=59499&format=png&color=22C3E6` }
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


const openFile = (filePath) => {

    exec(`"${filePath}"`, (error) => {
        if (error) {
            console.error('Failed to open the file:', error);
            return;
        }
        console.log('File opened successfully!');
    });
}



const openFolder = (folderLocation) => {

    try {
        exec("explorer " + folderLocation);
    } catch (error) {
        console.log(error);
    }

};


module.exports = {
    getAllFileRecursively, filterScriptFiles,
    getAllDirectories, openFile, openFolder,
    getFolderAndFiles, isThisScriptFile
};

