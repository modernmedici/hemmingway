const { contextBridge, ipcRenderer } = require('electron')

// Preload-scoped listener maps for proper cleanup
const _lineListeners = new Map()
const _errorListeners = new Map()

contextBridge.exposeInMainWorld('api', {
  linkedin: {
    connect:    ()                   => ipcRenderer.invoke('linkedin:connect'),
    disconnect: ()                   => ipcRenderer.invoke('linkedin:disconnect'),
    getProfile: ()                   => ipcRenderer.invoke('linkedin:get-profile'),
    request:    (method, path, body) => ipcRenderer.invoke('linkedin:request', { method, path, body }),
  },
  posts: {
    list:   ()     => ipcRenderer.invoke('posts:list'),
    save:   (post) => ipcRenderer.invoke('posts:save', post),
    delete: (id)   => ipcRenderer.invoke('posts:delete', id),
  },
  transcription: {
    start:   ()         => ipcRenderer.invoke('transcription:start'),
    stop:    ()         => ipcRenderer.invoke('transcription:stop'),
    onLine:  (callback) => {
      const wrapped = (_, text) => callback(text)
      _lineListeners.set(callback, wrapped)
      ipcRenderer.on('transcription:line', wrapped)
    },
    offLine: (callback) => {
      const wrapped = _lineListeners.get(callback)
      if (wrapped) {
        ipcRenderer.removeListener('transcription:line', wrapped)
        _lineListeners.delete(callback)
      }
    },
    onError: (callback) => {
      const wrapped = (_, msg) => callback(msg)
      _errorListeners.set(callback, wrapped)
      ipcRenderer.on('transcription:error', wrapped)
    },
  },
})
