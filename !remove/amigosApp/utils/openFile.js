


const fs = require("fs");
const path = require("path");

const openFile = (folderLocation, fileName) => {


  const filePath = path.join(folderLocation, fileName);
  if (fs.existsSync(filePath)) {
    require("child_process").exec(filePath);
    return true;
  };
  return false;
}

module.exports = openFile;
