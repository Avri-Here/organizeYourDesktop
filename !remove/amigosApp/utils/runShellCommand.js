

const runShellCommand = (location, script, closeAfterCompletion) => {
  location = location || "C:\\Works\\amigos-team";
  const runAt = `start cmd /${closeAfterCompletion ? "c" : "k"} "cd /d ${location.replace(/\//g, '\\')} && `;
  const totalCommand = `${runAt}${script}"`;
  console.log({ totalCommand });
  const childProcess = require("child_process").spawn(totalCommand, [], { shell: true });
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
};

module.exports = runShellCommand;



