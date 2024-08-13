

const fs = require('fs').promises;

const listFolderInDirectory = async (directoryPath) => {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const folderNames = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    return folderNames;
  } catch (error) {
    throw error;
  }
};

module.exports = listFolderInDirectory;
