const fs = require('fs').promises;

const readFile = async (fullPath, parseJson) => {
  try {
    const data = await fs.readFile(fullPath, 'utf8');
    return parseJson ? JSON.parse(data) : data;
  } catch (err) {
    console.error('An error occurred:', err);
    throw err;
  }
}



module.exports = readFile;
