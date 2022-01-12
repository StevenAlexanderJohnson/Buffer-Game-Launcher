// preload.js
const { ipcRenderer } = require('electron');
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

process.once('loaded', ()=> {
  window.ipcRenderer = ipcRenderer;
});