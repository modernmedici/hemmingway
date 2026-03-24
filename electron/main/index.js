const { app, BrowserWindow, ipcMain } = require('electron')
const path   = require('path')
const fs     = require('fs')
const os     = require('os')
const matter = require('gray-matter')

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
ipcMain.handle('posts:list', () => {
  ensurePostsDir()
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8')
      const { data, content } = matter(raw)
      return { ...data, body: content.trim() }
    })
    .filter(p => p.id) // skip malformed files
})

// ── IPC: posts:save ────────────────────────────────────────────────────────────
ipcMain.handle('posts:save', (_e, post) => {
  ensurePostsDir()
  const { body, ...frontmatter } = post
  const fileContent = matter.stringify(body ?? '', frontmatter)
  fs.writeFileSync(path.join(POSTS_DIR, `${post.id}.md`), fileContent, 'utf8')
})

// ── IPC: posts:delete ──────────────────────────────────────────────────────────
ipcMain.handle('posts:delete', (_e, id) => {
  const filepath = path.join(POSTS_DIR, `${id}.md`)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
})
