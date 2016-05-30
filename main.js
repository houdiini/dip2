'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain ;

let mainWindow = null, openFileWindow = null;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', function() {

    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipc.on('file-opened', function(res){
  console.log('File opened');
  console.log(res);
});

ipc.on('open-file-window', function(){
  console.log('ipc weeeee');
  if (!openFileWindow) {
    openFileWindow = new BrowserWindow({width: 300, height: 600});
    openFileWindow.loadURL('file://' + __dirname + '/app/templates/openDialog.html');
    openFileWindow.on('closed', function(){
      openFileWindow = null;
    });
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
