const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  posts: {
    list:   ()     => ipcRenderer.invoke('posts:list'),
    save:   (post) => ipcRenderer.invoke('posts:save', post),
    delete: (id)   => ipcRenderer.invoke('posts:delete', id),
  },
  coach: {
    ask: (payload) => ipcRenderer.invoke('coach:ask', payload),
  },
  settings: {
    getApiKey: ()    => ipcRenderer.invoke('settings:getApiKey'),
    setApiKey: (key) => ipcRenderer.invoke('settings:setApiKey', key),
  },
})
