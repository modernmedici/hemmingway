const { app, BrowserWindow, ipcMain } = require('electron')
const path      = require('path')
const fs        = require('fs')
const fsPromises = require('fs').promises
const os        = require('os')
const matter    = require('gray-matter')
const Store     = require('electron-store')
const { askCoach } = require('./coach.js')

const store = new Store()
const POSTS_DIR = path.join(os.homedir(), 'Desktop', 'Hemingway')

// Set app name early so macOS dock tooltip shows correctly
app.setName('Hemingway')

let mainWindow

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../../build/icon.png'))
  }
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── IPC: posts:list ────────────────────────────────────────────────────────────
ipcMain.handle('posts:list', async () => {
  ensurePostsDir()
  const files = await fsPromises.readdir(POSTS_DIR)
  const mds = files.filter(f => f.endsWith('.md'))
  const posts = await Promise.all(mds.map(async filename => {
    const raw = await fsPromises.readFile(path.join(POSTS_DIR, filename), 'utf8')
    const { data, content } = matter(raw)
    return { ...data, body: content.trim() }
  }))
  return posts.filter(p => p.id) // skip malformed files
})

// ── IPC: posts:save ────────────────────────────────────────────────────────────
ipcMain.handle('posts:save', async (_e, post) => {
  if (!post?.id || typeof post.id !== 'string' || post.id.includes('/') || post.id.includes('..')) {
    throw new Error('Invalid post id')
  }
  ensurePostsDir()
  const { body, ...frontmatter } = post
  const fileContent = matter.stringify(body ?? '', frontmatter)
  await fsPromises.writeFile(path.join(POSTS_DIR, `${post.id}.md`), fileContent, 'utf8')
})

// ── IPC: posts:delete ──────────────────────────────────────────────────────────
ipcMain.handle('posts:delete', async (_e, id) => {
  if (!id || typeof id !== 'string' || id.includes('/') || id.includes('..')) {
    throw new Error('Invalid post id')
  }
  const filepath = path.join(POSTS_DIR, `${id}.md`)
  await fsPromises.unlink(filepath).catch(e => {
    if (e.code !== 'ENOENT') throw e
  })
})

// ── IPC: coach:ask ─────────────────────────────────────────────────────────────
ipcMain.handle('coach:ask', async (_e, payload) => {
  return askCoach(payload, store)
})

// ── IPC: settings:getApiKey ────────────────────────────────────────────────────
ipcMain.handle('settings:getApiKey', () => {
  return store.get('anthropic_api_key') ?? ''
})

// ── IPC: settings:setApiKey ────────────────────────────────────────────────────
ipcMain.handle('settings:setApiKey', (_e, key) => {
  if (typeof key === 'string' && key.trim()) {
    store.set('anthropic_api_key', key.trim())
  }
})
