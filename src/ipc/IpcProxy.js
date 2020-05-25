import Electron, { ipcMain, ipcRenderer } from "electron";

const isMainProc = process.type === "browser";

let webContents;

const IpcProxy = {
  on: (channel, listener) => {
    if (Electron) {
      (isMainProc ? ipcMain : ipcRenderer).on(channel, listener);
    }
  },

  once: (channel, listener) => {
    if (Electron) {
      (isMainProc ? ipcMain : ipcRenderer).on(channel, listener);
    }
  },

  send: (channel, data) => {
    if (Electron) {
      (isMainProc ? webContents : ipcRenderer).send(channel, data);
    }
  },

  setWebContents: (_webContents) => {
    if (Electron) {
      webContents = _webContents;
    }
  },
};

export default IpcProxy;
