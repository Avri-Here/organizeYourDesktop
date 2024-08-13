

const console = require('electron-log');
const { exec } = require('child_process');

const getCommandBaseType = (type, fullPath) => {

    switch (type) {
        case 'python':
            return `python "${fullPath}"`;
        case 'powershell':
            return `powershell.exe -NoExit -ExecutionPolicy Bypass -File "${fullPath}"`;
        case 'cmd':
            return `"${fullPath}"`;
        case 'node':
            return `node "${fullPath}"`;
        default:
            console.warn('Unknown script type :', type);
            return `"${fullPath}"`;
    }
}


const executeScriptWithNoExit = (type, fullPath) => {

    const scriptName = fullPath.split('\\').pop();
    const command = getCommandBaseType(type, fullPath);
    const cmdCommand = `start cmd /k "title ${scriptName} && color 2 && ${command}"`;

    exec(cmdCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Script error : ${stderr}`);
            return;
        }
        console.log(`Script ${scriptName} Run !`);
    });
};


const executePsScriptOnBackground = (scriptPath) => {
    return new Promise((resolve, reject) => {
        const command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing PowerShell script: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`PowerShell script stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            console.log(`PowerShell script ran successfully!`);
            resolve(stdout);
        });
    });
};



const openFile = (filePath) => {
    console.log(filePath);
    exec(`"${filePath}"`, (error) => {
        if (error) {
            console.error('Failed to open the file:', error);
            return;
        }
        console.log('File opened successfully!');
    });
}

module.exports = { executeScriptWithNoExit, executePsScriptOnBackground, openFile };