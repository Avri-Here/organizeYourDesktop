

const path = require('path');
const console = require('electron-log');
const PowerShell = require("powershell");
const Shell = require('node-powershell');
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
            return `"${fullPath}"`;
    }
}

// no async here !!
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


// const runPowerShellFile = async (scriptName, params = [], asAdmin) => {

//     const ps = new Shell({ executionPolicy: 'Bypass', noProfile: true });
//     const ps1FilePath = path.join(__dirname, '../assets/scripts/ps1', `${scriptName}`);



//     const paramString = params.map(param => { return Object.entries(param).map(([key, value]) => `${key} "${value}"`).join(' ') }).join(' ');

//     console.log(`paramString : `, paramString);
//     const command = asAdmin
//         ? `Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File "${ps1FilePath}" ${paramString}' -Verb RunAs`
//         : `& "${ps1FilePath}" ${paramString}`;


//     try {
//         await ps.invoke(command);
//         console.log(`powerShell.invoke(${scriptName}) ..`);
//     } catch (err) {
//         console.error(`powerShell.Error(${scriptName}) ..`, err);
//     }
// };


const runPowerShellFile = (scriptName) => {

    
    const ps1FilePath = path.join(__dirname, '../assets/scripts/ps1', `${scriptName}`);
    return new Promise((resolve, reject) => {

        const ps = new PowerShell(`& "${ps1FilePath}"`);

        let output = '';
        ps.on("output", data => {
            output += data;
        });

        ps.on("error-output", err => {
            reject(err);
        });

        ps.on("error", err => {
            reject(err);
        });

        ps.on("end", code => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`PowerShell script finished with exit code ${code}`));
            }
        });
    });
};


module.exports = { executeScriptWithNoExit, runPowerShellFile };
















// const userHome = require('os').homedir();
// const exePath = { '-exePath': path.join("C:", "Program Files", "notepad", "app", "notepad.exe") };
// const savePath = { savePath: path.join(userHome, 'organizeYourDesktop', 'img', 'notepad.lnk' + '.png') };

// runPowerShellFile('extractIconFromExe.ps1', [exePath, savePath]);

// runPsScript('exampleScript.ps1', ['param1Value', 'param2Value']);

// runPsScript('exampleScript.ps1', ['param1Value', 'param2Value'], true);