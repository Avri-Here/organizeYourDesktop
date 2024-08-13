const sudo = require("sudo-prompt");


const runCommandAdmin = (cmd) => {
  return new Promise((resolve, reject) => {
    const options = {
      name: "Electron App",
    };
    sudo.exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}


module.exports = runCommandAdmin;

// const { exec } = require("child_process");

// const runCommandAdmin = (cmd) => {
//   return new Promise((resolve, reject) => {
//     const options = {
//       name: "Electron App",
//     };

//     const child = exec(`echo 'password' | sudo -S ${cmd}`, options, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(stdout.trim());
//       }
//     });

//     // To forcefully terminate the process
//     setTimeout(() => {
//       child.kill('SIGKILL');
//     }, 5000);  // Force kill after 5 seconds
//   });
// };

// module.exports = runCommandAdmin;
