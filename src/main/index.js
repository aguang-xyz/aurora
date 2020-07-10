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

  // On linux or window, we should read the argv to determine opening path.
  if (process.platform !== "darwin" && process.argv.length > 1) {
    return openMarkdownFromArgv(process.argv[1]);
  }
});

// On macos, we will receive open-file events.
app.on("open-file", (event, path) => {
  event.preventDefault();
  openMarkdownFromArgv(path);
});
