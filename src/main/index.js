import { app } from "electron";

import { createMainWindow, currentWindow } from "./lib/Windows";
import { openMarkdownFromArgv } from "./lib/Commands";

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (currentWindow() === null) {
    createMainWindow();
  }
});

app.on("ready", () => {
  createMainWindow();

  app.on("open-file", (event, path) => {
    openMarkdownFromArgv(path);
  });

  console.log("process.argv:", JSON.stringify(process.argv[1]));

  if (process.argv.length > 1) {
    return openMarkdownFromArgv(process.argv[1]);
  }
});
