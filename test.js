const PowerShell = require("powershell");

const runPowerShellScript = (scriptPath) => {
    return new Promise((resolve, reject) => {

        const ps = new PowerShell(`& "${scriptPath}"`);

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

// Example usage:
const scriptPath = "./toggleDesktopIcons.ps1";
process.env.MY_ENV_VAR = "HelloWorld";
process.env.ANOTHER_VAR = "12345";
process.env.EXE_PATH = require('path').join("C:", "Program Files", "nodejs", "node.exe");
runPowerShellScript(scriptPath)
    .then(output => {
        console.log("Script output:", output);
    })
    .catch(err => {
        console.error("Error:", err);
    });
``