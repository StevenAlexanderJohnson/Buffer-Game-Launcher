'use strict'
import fs from 'fs';
import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path';
const isDevelopment = process.env.NODE_ENV !== 'production'
import { createStore } from 'vuex';
import { FindGames, TestLaunchGame } from './FindGames';

const store = createStore({
  state() {
    return {
      currentPage: 'home',
      libraryList: [],
      gameList: []
    }
  },
  getters: {
    getCurrentPage(state) {
      return state.currentPage;
    },
    getLibraryList(state) {
      return state.libraryList;
    },
    getGameList(state) {
      return state.gameList;
    }
  },
  mutations: {
    setPage(state, data) {
      if (state.currentPage == data) {
        state.currentPage = 'home';
      }
      else {
        state.currentPage = data;
      }
    },
    setLibraryList(state, data) {
      state.libraryList = data;
    },
    addLibrary(state, data) {
      state.libraryList.push(data);
    },
    removeLibrary(state, data) {
      let index = state.libraryList.indexOf(data);
      if (index !== -1) {
        state.libraryList.splice(index, 1);
      }
      console.log(state.libraryList)
    },
    setGameList(state, data) {
      state.gameList = data;
    }
  },
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);
let settings = {
  windowSize: {
    width: 800,
    height: 600
  },
  fullscreen: false,
  libraryPaths: []
}
fs.open(app.getPath("userData") + "/settings.json", 'r', function (error) {
  if (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync(app.getPath("userData") + "/settings.json", JSON.stringify(settings));
      console.log("SETTINGS CREATED");
    }
    else {
      console.error(error);
    }
  }
  else {
    let settingsJson = fs.readFileSync(app.getPath("userData") + "/settings.json");
    settings = JSON.parse(settingsJson);
    console.log("SETTINGS LOADED")
  }

  store.commit('setLibraryList', settings['libraryPaths']);
});


async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: settings['windowSize']['width'],
    height: settings['windowSize']['height'],
    minWidth: 800,
    minHeight: 600,
    frame: false,
    backgroundColor: "#444",
    show: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: true
    }
  });
  console.log("FULLSCREEN: " + settings['fullscreen']);

  win.on('ready-to-show', function () {
    win.show();
    if (settings['fullscreen'] == true) {
      win.maximize();
    }
  });

  win.on('resize', function () {
    if (win.isMaximized()) {
      settings['fullscreen'] = true;
    }
    else {
      let size = win.getSize();
      settings['windowSize']['width'] = size[0];
      settings['windowSize']['height'] = size[1];
      settings['fullscreen'] = false;
    }
  });

  win.on('close', function () {
    fs.writeFileSync(app.getPath("userData") + "/settings.json", JSON.stringify(settings));
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  ipcMain.on('quit-app', () => {
    app.quit();
  });

  ipcMain.on('minimize', () => {
    win.minimize()
  });

  ipcMain.on('maximize', () => {
    if (win.isMaximized()) {
      win.restore();
    }
    else {
      win.maximize();
    }
  });

  ipcMain.on('vuex-set-page', (event, args) => {
    store.commit('setPage', args);
    event.reply('replyPage', store.getters.getCurrentPage);
  });

  ipcMain.on('vuex-getLibrary', (event) => {
    event.reply('replyLibrary', JSON.stringify(store.getters.getLibraryList));
  })
  ipcMain.on('vuex-addLibrary', (event, arg) => {
    store.commit('addLibrary', arg);
    event.reply('replyLibrary', JSON.stringify(store.getters.getLibraryList));
    try {
      store.commit('setGameList', FindGames(settings['libraryPaths']));
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        store.commit('removeLibrary', arg);
        event.reply('errorLibrary', ["Invalid library path", JSON.stringify(store.getters.getLibraryList)]);
      }
    }
  });
  ipcMain.on('vuex-removeLibrary', (event, arg) => {
    store.commit('removeLibrary', arg);
    event.reply('replyLibrary', JSON.stringify(store.getters.getLibraryList));
    store.commit('setGameList', FindGames(settings['libraryPaths']));
  });

  ipcMain.on('vuex-getGameList', (event) => {
    event.reply('acknowledgeGameList');
    if (store.getters.getGameList.length == 0) {
      store.commit('setGameList', FindGames(settings['libraryPaths']));
    }
    event.reply('replyGameList', JSON.stringify(store.getters.getGameList));
  });

  ipcMain.on('launch-game', (event, arg) => {
    try {
      TestLaunchGame(arg);
    }
    catch (error) {
      console.error("Error: " + error);
    }
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    });
  }
}