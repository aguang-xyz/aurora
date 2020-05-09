import { app, shell } from 'electron';

import { promises as Fs } from 'fs';

import IpcEvent from '../../ipc/IpcEvent';
import IpcProxy from '../../ipc/IpcProxy';

import { currentWindow, createMainWindow } from './Windows';

import {

  confirmToSave,
  choosePathToSave,
  choosePathToOpen

} from './Dialogs';

import packageInfo from '../../../package.json';


const getEditorStatus = () =>

  new Promise((resolve, reject) => {

    IpcProxy.once(IpcEvent.GET_EDITOR_STATUS_REPLY, (_, editorStatus) => {

      resolve(editorStatus);
    });

    IpcProxy.send(IpcEvent.GET_EDITOR_STATUS);
  });


async function confirmSavedOrIgnored() {

  let { path, saved, editingContent } = await getEditorStatus();

  if (saved) {

    return true;
  }

  if (path === null && editingContent === '') {

    return true;
  }

  const response = await confirmToSave(path);

  if (response === 0) {

    return true;
  }

  if (response === 1) {

    return false;
  }

  path = path || await choosePathToSave();

  if (!path) {

    return false;

  } else {

    await Fs.writeFile(path, editingContent);

    return true;
  }
};


export async function newMarkdown() {

  if (await confirmSavedOrIgnored()) {

    IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { path: null, content: '' });
  }
};

IpcProxy.on(IpcEvent.NEW_MARKDOWN, newMarkdown);


export async function openMarkdown() {

  if (await confirmSavedOrIgnored()) {

    const path = await choosePathToOpen();

    console.log('path', path);

    if (path) {

      const content = await Fs.readFile(path, 'utf8');

      IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { path, content });
    }
  }
};

IpcProxy.on(IpcEvent.OPEN_MARKDOWN, openMarkdown);


export async function saveMarkdown() {

  let { path, saved, editingContent } = await getEditorStatus();

  if (!saved) {

    path = path || await choosePathToSave();

    if (path) {

      await Fs.writeFile(path, editingContent, 'utf8');

      IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, {
        path, content: editingContent
      });
    }
  }
};

IpcProxy.on(IpcEvent.SAVE_MARKDOWN, saveMarkdown);


export async function saveAsMarkdown() {

  const { editingContent } = await getEditorStatus();

  let path = await choosePathToSave();

  if (path) {

    await Fs.writeFile(path, editingContent, 'utf8');

    IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, {
      path, content: editingContent
    });
  }
};

IpcProxy.on(IpcEvent.SAVE_AS_MARKDOWN, saveAsMarkdown);


export async function quit() {

  if (await confirmSavedOrIgnored()) {

    app.exit(0);
  }
};

IpcProxy.on(IpcEvent.QUIT, quit);


export async function toggleFullScreen() {

  const win = currentWindow();

  if (win) {

    win.setFullScreen(!win.isFullScreen());
  }
};


IpcProxy.on(IpcEvent.TOGGLE_FULLSCREEN, toggleFullScreen);

IpcProxy.on(IpcEvent.SET_FULLSCREEN, (_, on) => {

  const win = currentWindow();

  win.setFullScreen(false);
});


export const openHomePage = () => {

  shell.openExternal(packageInfo.homepage);
};


export const reportIssue = () => {

  shell.openExternal(packageInfo.bugs.url);
};

export const checkUpdate = () => {

  shell.openExternal(packageInfo.homepage + '/releases');
};
