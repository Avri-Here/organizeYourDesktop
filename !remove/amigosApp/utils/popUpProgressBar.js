const ProgressBar = require("electron-progressbar");

const popUpProgressBar = (timeToClose, message = "Preparing data ...", indeterminate = true) => {

  let value = 0;

  const progressBar = new ProgressBar({
    indeterminate,
    text: message,
    detail: "Wait ..."
  });

  const intervalOfCounter = setInterval(() => {
    value = value + 1;

    if (value > timeToClose) {
      clearInterval(intervalOfCounter);

      progressBar.setCompleted();
    }
  }, 1000);
}

module.exports = popUpProgressBar;

