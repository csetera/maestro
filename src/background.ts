'use strict';

import { app, crashReporter, protocol } from 'electron';
import { isDevelopment } from '@/shared/Utils';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import LoggerFactory from '@/shared/LoggerFactory';
import MainProcess from '@/main/MainProcess';

/**
 * Entry point for the main Electron/Chrome process.
 * This file does initial configuration before handing
 * off to the MainProcess class.
 */

app.allowRendererProcessReuse = true;
const logger = LoggerFactory.createMainLogger(app, 'MAIN');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function configureDevelopment() {
    // Install Vue Devtools
    try {
        await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
        logger.error('Vue Devtools failed to install: %s', e);
    }
}

function onReady() {
  if (isDevelopment && !process.env.IS_TEST) {
    configureDevelopment();
  }

  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol("app");
  }

  crashReporter.start({
    productName: 'Maestro',
    companyName: 'maestro',
    submitURL: 'https://submit.backtrace.io/maestro/62831640226bf2f6064074ab9b03bd85070a1cfa6afab46e2d3cd3994513b3c6/minidump',
    uploadToServer: true
  });

  // Set up the main processing functionality
  const mainProcess = new MainProcess(logger);
  mainProcess.openWindows();
}

app.whenReady().then(onReady);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Exit cleanly on request from parent process in development mode.
if (process.env.NODE_ENV !== 'production') {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
