# Kickinvest

Pentru a construi aplicatia, am rulat urmatoarele comenzi:

`$ npm install react`

`$ npx create-react-app kickinvest`

`$ npm install electron`

Am modificat `package.json`, adaugand cateva chestiute pe care le cere electronul:
```
...
"main": "main.js", // < aici path-ul catre fisierul .js ce initializeaza electronul
...
  "scripts": {
    ...
    "electron": "electron ."
  },
...
```

Fisierul `main.js` arata cam asa:
```
const {app, BrowserWindow} = require('electron')      

function createWindow () {   
    win = new BrowserWindow({width: 800, height: 600});
    win.loadURL('http://localhost:3000/'); // < url-url dev eserverului react
}

app.on('ready', createWindow);
```



ref: https://medium.com/@brockhoff/using-electron-with-react-the-basics-e93f9761f86f