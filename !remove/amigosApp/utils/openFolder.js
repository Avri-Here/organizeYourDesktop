

const openFolder = (folderLocation) => {

   try {
      require("child_process").exec("explorer " + folderLocation);
   } catch (error) {
      console.log(error);
   }

};

module.exports = openFolder;
