import { dialog } from "electron";

export async function displayWarning(message) {
  return (
    await dialog.showMessageBox({
      type: "warning",
      message: message,
      buttons: ["Ok"],
    })
  ).response;
}

export async function confirmToSave(path) {
  return (
    await dialog.showMessageBox({
      type: "warning",
      message: `Save changes before closing ${path || "Utitled file"}?`,
      buttons: ["Close without saving", "Cancel", "Save"],
    })
  ).response;
}

export async function choosePathToSave(name = 'Markdown', extension = "md") {
  const { filePath } =
    await dialog.showSaveDialog({
      filters: [
        {
          name,
          extensions: [extension],
        },
      ],
    });

  if (!filePath) {
    return filePath;
  }

  return filePath.endsWith(`.${extension}`) ?
    filePath :
    `${filePath}.${extension}`;
}

export async function choosePathToSaveHtml() {
  return await choosePathToSave('HTML', 'html')
}

export async function choosePathToSavePng() {
  return await choosePathToSave('PNG', 'png')
}

export async function choosePathToOpen() {
  return (
    await dialog.showOpenDialog({
      title: "Open Markdown",
      filters: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
      ],
    })
  ).filePaths[0];
}
