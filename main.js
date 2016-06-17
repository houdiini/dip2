'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain ;

let mainWindow = null, clientWindow = [];

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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

  ipcMain.on('show-client', function(e, res){
  var client = JSON.parse(res);
  clientWindow.push( new BrowserWindow({width: 300, height: 400, title: client.name}));
  clientWindow[clientWindow.length - 1].loadURL('file://' + __dirname + '/app/templates/info.html');
  clientWindow[clientWindow.length - 1].webContents.on('did-finish-load', () => {
    clientWindow[clientWindow.length - 1].webContents.send('show-client-info', res);
  })
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
