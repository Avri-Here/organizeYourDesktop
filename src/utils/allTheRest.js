const path = require('path');
const userHome = require('os').homedir();
const { execFile } = require('child_process');

const savePathDefault = path.join(userHome, 'organizeYourDesktop', 'img');

const extractorAndSaveIcon = (filePath, fileName, saveOn = savePathDefault) => {

    return new Promise((resolve, reject) => {
        try {
            // const fileName = path.basename(filePath).split('.')[0];
            const savePath = path.join(saveOn, `${fileName}.png`);

            console.log(savePath);


            const scriptPath = path.join(__dirname, '../assets/scripts/extractIcon.ps1');
            execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, filePath, savePath], (error, stdout, stderr) => {
                if (error) {
                    reject(new Error("Failed to extract and save icon: " + error.message));
                } else {
                    resolve(`${fileName}.png saved successfully`);
                }
            });
        } catch (error) {
            console.error("Unexpected error:", error.message);
            reject(new Error("Unexpected error: " + error.message));
        }
    });
};

module.exports = { extractorAndSaveIcon };
