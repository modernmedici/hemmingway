const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { createHash, randomBytes } = require('crypto')
const Store = require('electron-store')

const store = new Store({ name: 'linkedin' })

const LINKEDIN_CLIENT_ID     = process.env.VITE_LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI  = 'http://localhost:5173/auth/linkedin/callback'
const LINKEDIN_TOKEN_URL     = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_AUTH_URL      = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_API_BASE      = 'https://api.linkedin.com/v2'

let mainWindow

function generateVerifier() {
  return randomBytes(64).toString('hex')
}

function generateChallenge(verifier) {
  return createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
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
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
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
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── IPC: linkedin:connect ──────────────────────────────────────────────────────
ipcMain.handle('linkedin:connect', () => {
  const verifier  = generateVerifier()
  const challenge = generateChallenge(verifier)
  const state     = Buffer.from(JSON.stringify({ nonce: Math.random().toString(36).slice(2) })).toString('base64')

  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             LINKEDIN_CLIENT_ID,
    redirect_uri:          LINKEDIN_REDIRECT_URI,
    scope:                 'openid profile w_member_social',
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    state,
  })

  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 600, height: 700,
      parent: mainWindow, modal: true,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    })

    authWindow.loadURL(`${LINKEDIN_AUTH_URL}?${params}`)

    const handleNavigation = async (url) => {
      if (!url.startsWith(LINKEDIN_REDIRECT_URI)) return
      authWindow.destroy()

      const { searchParams } = new URL(url)
      const code  = searchParams.get('code')
      const error = searchParams.get('error')
      if (error || !code) { reject(new Error(error ?? 'No code received')); return }

      try {
        const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code', code,
            redirect_uri: LINKEDIN_REDIRECT_URI,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            code_verifier: verifier,
          }).toString(),
        })
        if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`)
        const { access_token } = await tokenRes.json()

        const profileRes = await fetch(
          `${LINKEDIN_API_BASE}/me?projection=(id,localizedFirstName,localizedLastName)`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        )
        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`)
        const data = await profileRes.json()
        const profile = {
          id:   data.id,
          urn:  `urn:li:person:${data.id}`,
          name: `${data.localizedFirstName ?? ''} ${data.localizedLastName ?? ''}`.trim(),
        }

        store.set('token', access_token)
        store.set('profile', profile)
        resolve(profile)
      } catch (e) { reject(e) }
    }

    authWindow.webContents.on('will-navigate',           (_, url) => handleNavigation(url))
    authWindow.webContents.on('did-navigate',            (_, url) => handleNavigation(url))
    authWindow.webContents.on('did-redirect-navigation', (_, url) => handleNavigation(url))
    authWindow.on('closed', () => reject(new Error('Auth window closed')))
  })
})

// ── IPC: linkedin:disconnect ───────────────────────────────────────────────────
ipcMain.handle('linkedin:disconnect', () => {
  store.delete('token')
  store.delete('profile')
})

// ── IPC: linkedin:get-profile ──────────────────────────────────────────────────
ipcMain.handle('linkedin:get-profile', () => store.get('profile') ?? null)

// ── IPC: linkedin:request ──────────────────────────────────────────────────────
ipcMain.handle('linkedin:request', async (_e, { method, path: apiPath, body }) => {
  const token = store.get('token')
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${LINKEDIN_API_BASE}/${apiPath}`, {
    method,
    headers: {
      Authorization:               `Bearer ${token}`,
      'Content-Type':              'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version':          '202401',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`LinkedIn API ${res.status}: ${text}`)
  try { return JSON.parse(text) } catch { return text }
})
