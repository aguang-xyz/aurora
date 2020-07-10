import { app, shell } from "electron";
import { promises as Fs } from "fs";
import Path from "path";

import packageInfo from "../../../package.json";
import IpcEvent from "../../ipc/IpcEvent";
import IpcProxy from "../../ipc/IpcProxy";

import {
  choosePathToOpen,
  choosePathToSave,
  choosePathToSaveHtml,
  confirmToSave,
  displayWarning,
} from "./Dialogs";
import { createMainWindow, currentWindow } from "./Windows";

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

  if (path === null && editingContent === "") {
    return true;
  }

  const response = await confirmToSave(path);

  if (response === 0) {
    return true;
  }

  if (response === 1) {
    return false;
  }

  path = path || (await choosePathToSave());

  if (!path) {
    return false;
  } else {
    await Fs.writeFile(path, editingContent);

    return true;
  }
}

export async function newMarkdown() {
  if (await confirmSavedOrIgnored()) {
    IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { path: null, content: "" });
  }
}

IpcProxy.on(IpcEvent.NEW_MARKDOWN, newMarkdown);

export async function openMarkdown() {
  if (await confirmSavedOrIgnored()) {
    const path = await choosePathToOpen();

    if (path) {
      const content = await Fs.readFile(path, "utf8");

      IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { path, content });
    }
  }
}

IpcProxy.on(IpcEvent.OPEN_MARKDOWN, openMarkdown);

const ready = new Promise((resolve) =>
  IpcProxy.on(IpcEvent.READY, () => resolve())
);

export async function openMarkdownFromArgv(path) {
  await ready;

  if (await confirmSavedOrIgnored()) {
    try {
      const content = await Fs.readFile(path, "utf8");

      IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { path, content });
    } catch (err) {
      // Ignore this error.
      // displayWarning(err && err.message);
    }
  }
}

export async function saveMarkdown() {
  let { path, saved, editingContent } = await getEditorStatus();

  if (!saved) {
    path = path || (await choosePathToSave());

    if (path) {
      await Fs.writeFile(path, editingContent, "utf8");

      IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, {
        path,
        content: editingContent,
      });
    }
  }
}

IpcProxy.on(IpcEvent.SAVE_MARKDOWN, saveMarkdown);

export async function saveAsMarkdown() {
  const { editingContent } = await getEditorStatus();

  let path = await choosePathToSave();

  if (path) {
    await Fs.writeFile(path, editingContent, "utf8");

    IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, {
      path,
      content: editingContent,
    });
  }
}

IpcProxy.on(IpcEvent.SAVE_AS_MARKDOWN, saveAsMarkdown);

export async function quit() {
  if (await confirmSavedOrIgnored()) {
    app.exit(0);
  }
}

IpcProxy.on(IpcEvent.QUIT, quit);

export async function toggleFullScreen() {
  const win = currentWindow();

  if (win) {
    win.setFullScreen(!win.isFullScreen());
  }
}

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
  shell.openExternal(packageInfo.homepage + "/releases");
};

async function getHtml() {
  const { url, path, title, editingContent, theme } = await getEditorStatus();

  const asset_url = "https://aguang-xyz.github.io/aurora-editor/assets";

  return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<link rel="stylesheet" type="text/css"
          href="${asset_url}/main.css" />
        <title>${title}</title>
			</head>

			<body>
				<div id="app" />

				<script>
					const Electron = false;

					window.AuroraProps = {
            path: ${JSON.stringify(path)},
						content: ${JSON.stringify(editingContent)},
						theme: ${JSON.stringify(theme)}	
					};
				</script>
				<script src="${asset_url}/main.js"></script>
			</body>
		</html>
	`;
}

export async function exportHtml() {
  const html = await getHtml();
  const path = await choosePathToSaveHtml();

  await Fs.writeFile(path, html);
}

export function changeTheme(theme) {
  IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { theme });
}
