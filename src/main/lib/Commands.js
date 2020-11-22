import { app, shell } from "electron";
import { promises as Fs } from "fs";
import { tmpdir } from "os";
import Path from "path";
import Puppeteer from 'puppeteer-core';

import packageInfo from "../../../package.json";
import IpcEvent from "../../ipc/IpcEvent";
import IpcProxy from "../../ipc/IpcProxy";

import {
  choosePathToOpen,
  choosePathToSave,
  choosePathToSaveHtml,
  choosePathToSavePng,
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

async function getPreviewShape() {
  const {
    previewWidth,
    previewHeight,
  } = await getEditorStatus();

  return {
    previewWidth,
    previewHeight,
  };
}

export async function exportHtml() {
  const html = await getHtml();
  const path = await choosePathToSaveHtml();

  await Fs.writeFile(path, html);
}

const CHROMIUM_REVISION = '809590'

async function launchPuppeteerBrowser() {

  const cachePath = Path.join(app.getPath("cache"), "aurora-editor", "local-chromium")

  await Fs.mkdir(cachePath, { recursive: true })

  const browserFetcher = Puppeteer.createBrowserFetcher({
    path: cachePath,
  });

  console.log(`Tries to download chromium driver (revision: ${CHROMIUM_REVISION}).`)

  await browserFetcher.download(CHROMIUM_REVISION);

  console.log(`Finished chromium driver downloading.`)

  const localChromiums = await browserFetcher.localRevisions();

  if (!localChromiums.length) {
    throw new Error("Cannot resolve local chromium drivers.");
  }

  const { executablePath } =
    await browserFetcher.revisionInfo(localChromiums[0]);

  console.log(`Chromium driver path: ${executablePath}.`)

  return await Puppeteer.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

export async function exportPng() {
  const html = await getHtml();
  const { previewWidth, previewHeight } = await getPreviewShape();

  const tmpHtmlPath = Path.join(tmpdir(),
    `${Math.random().toString(36).substring(2, 15)}.html`);

  await Fs.writeFile(tmpHtmlPath, html);

  console.log(`Temporary HTML path: ${tmpHtmlPath}.`);

  console.log(`Starts HTML rendering.`)

  const browser = await launchPuppeteerBrowser();

  console.log(`Starts to create browser page.`)

  const page = await browser.newPage();

  console.log(`Setting viewport.`)

  await page.setViewport({
    width: previewWidth,
    height: previewHeight,
  })

  console.log(`Visiting file://${tmpHtmlPath}.`)

  await page.goto(`file://${tmpHtmlPath}`);

  console.log(`Choosing path to save PNG file.`)

  const path = await choosePathToSavePng();
  
  await page.screenshot({
    path: path,
    fullPage: true,
  })
}

export function changeTheme(theme) {
  IpcProxy.send(IpcEvent.SET_EDITOR_STATUS, { theme });
}
