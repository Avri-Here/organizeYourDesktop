

const { dialog } = require('electron');


const openDialog = async (mainWindow, properties, filters) => {
    try {
        const options = { properties };
        if (filters) {
            options.filters = filters;
        }
        const result = await dialog.showOpenDialog(mainWindow, options);
        if (!result.canceled) {
            return result.filePaths[0]
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}
module.exports = openDialog;