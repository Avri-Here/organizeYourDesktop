let HMC = require("hmc-win32");
console.log("App:Admin=>", HMC.isAdmin())
//App:Admin=> true

console.log("SystemIdleTime=>", HMC.getProcessList())
//SystemIdleTime=> 25

// console.log("escapeEnvVariable=>", HMC.escapeEnvVariable("%AppData%\hmc-win32"))
//escapeEnvVariable=> C:\Users\...\AppData\Roaming\hmc-win32

// console.log("Clipboard=>", setClipboardFilePaths(["D:/1.jpg"]), HMC.getClipboardFilePaths())
//Clipboard=> true , ["D:/1.jpg"]
