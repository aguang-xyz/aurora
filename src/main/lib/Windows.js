import { Menu, BrowserWindow } from 'electron';

import Url from 'url';
import Path from 'path';

import IpcProxy from '../../ipc/IpcProxy';

import {

  newMarkdown,
  openMarkdown,
  saveMarkdown,
  saveAsMarkdown,
  quit,
  toggleFullScreen,
  openHomePage,
  reportIssue,
  checkUpdate,
  exportHtml,

} from './Commands';


const isDev = process.env.NODE_ENV !== 'production';

let win;

const createMenu = () => 

  Menu.buildFromTemplate(
    [{
      label: 'File',
      submenu: [{
        label: 'New Markdown (Ctrl+N)',
        click: newMarkdown,
      }, {
        label: 'Open Markdown... (Ctrl+O)',
        click: openMarkdown,
      },{
        label: 'Save (Ctrl+S)',
        click: saveMarkdown,
      }, {
        label: 'Save As... (Shift+Ctrl+S)',
        click: saveAsMarkdown,
      }, {
        label: 'Export',
        submenu: [{
          label: 'Html',
          click: exportHtml,
        }],
      }, {
        label: 'Quit (Ctrl+Q)',
        click: quit,
      }],
    }, {
      label: 'View',
      submenu: [{
        label: 'Toggle Fullscreen (Ctrl-F)',
        click: toggleFullScreen,
      }],
    }, {
      role: 'help',
      submenu: [{
        label: 'Home Page',
        click: openHomePage,
      },  {
        label: 'Report Issue',
        click: reportIssue,
      }, {
        label: 'Check Update',
        click: checkUpdate,
      }]
    }]
  );

export const createMainWindow = () => {

  win = new BrowserWindow({

    center: true,
    minWidth: 600,
    minHeight: 400,
    backgroundColor: '#0b2a35',
    icon: Path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    }
  });

  IpcProxy.setWebContents(win.webContents);

  if (isDev) {

    win.webContents.openDevTools();
  }

  win.loadURL(isDev ? 
    `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}` :
    Url.format({
      pathname: Path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    })
  );

  win.on('closed', () => {

    win = null;
  });

  win.webContents.on('devtools-opened', () => {

    win.focus();

    setImmediate(() => win.focus());
  });
 
  Menu.setApplicationMenu(createMenu());
};


export const currentWindow = () => win;
