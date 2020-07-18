const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  win = new BrowserWindow({
    width: 1080,
    height: 600,
    frame: false,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      nodeIntegration: true,
    },
    backgroundColor: "#E3E5E8",
    minHeight: 600,
    minWidth: 800,
    show: false,
    titleBarStyle: "hidden",
    //titleBarStyle: "none",
  });

  // Wait until the page is loaded, then show the window

  win.once("ready-to-show", () => {
    win.show();
  });

  //DEBUG: show dev tools
  win.openDevTools();

  // Load dev server where our react app is served. This should
  // be replaced once we build our app for production
  win.loadURL("http://localhost:3000/");
  // win.loadFile('./build/index.html');
}

app.on("ready", createWindow);

ipcMain.on('test', (event, ...args) => {
  console.log(...args);
});