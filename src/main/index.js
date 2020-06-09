import { app } from 'electron';

import { createMainWindow, currentWindow } from './lib/Windows';

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (currentWindow() === null) {
    createMainWindow();
  }
});

app.on('ready', () => {
  createMainWindow();
});
