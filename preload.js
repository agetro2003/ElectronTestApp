const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    encryptFile: (filePath) => {
        ipcRenderer.send('encrypt-file', filePath);
    }
});