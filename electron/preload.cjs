const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vexa', {
  update: {
    status: () => ipcRenderer.invoke('update-status'),
    check: () => ipcRenderer.invoke('update-check'),
    install: () => ipcRenderer.invoke('update-install'),
    onState: (callback) => {
      const listener = (_event, state) => callback(state);
      ipcRenderer.on('update-state', listener);
      return () => ipcRenderer.removeListener('update-state', listener);
    },
  },
});
