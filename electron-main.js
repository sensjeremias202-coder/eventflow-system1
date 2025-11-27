const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_START_URL;

function createWindow () {
  const iconPath = path.join(__dirname, 'icon.svg');
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: nativeImage.createFromPath(iconPath)
  });

  // If you want to serve a local static server in development, set ELECTRON_START_URL
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'index.html')}`;
  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
