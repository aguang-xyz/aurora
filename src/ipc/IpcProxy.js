import { ipcMain, ipcRenderer } from 'electron';

const isMainProc = process.type === 'browser';

let webContents

const IpcProxy = {

  on: (channel, listener) =>
    (isMainProc ? ipcMain : ipcRenderer).on(channel, listener),

  once: (channel, listener) =>
    (isMainProc ? ipcMain : ipcRenderer).on(channel, listener),

  send: (channel, data) =>
    (isMainProc ? webContents: ipcRenderer)
      .send(channel, data),

  setWebContents: (_webContents) =>
    webContents = _webContents
};

export default IpcProxy;
