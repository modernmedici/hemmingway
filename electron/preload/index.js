const { contextBridge, ipcRenderer } = require('electron')

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
})
