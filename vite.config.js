import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'linkedin-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, 'http://localhost:5173');

            // ── OAuth callback ──────────────────────────────────────────
            if (url.pathname === '/auth/linkedin/callback') {
              const code  = url.searchParams.get('code');
              const state = url.searchParams.get('state');
              const error = url.searchParams.get('error');

              if (error) {
                res.writeHead(302, { Location: `/?linkedin_error=${encodeURIComponent(error)}` });
                res.end(); return;
              }
              if (!code || !state) {
                res.writeHead(302, { Location: '/?linkedin_error=missing_params' });
                res.end(); return;
              }

              // Recover verifier from state (base64url-encoded JSON)
              let verifier;
              try {
                const decoded = Buffer.from(state, 'base64').toString('utf8');
                verifier = JSON.parse(decoded).verifier;
              } catch {
                res.writeHead(302, { Location: '/?linkedin_error=invalid_state' });
                res.end(); return;
              }

              const params = new URLSearchParams({
                grant_type:    'authorization_code',
                code,
                redirect_uri:  'http://localhost:5173/auth/linkedin/callback',
                client_id:     env.VITE_LINKEDIN_CLIENT_ID,
                client_secret: env.LINKEDIN_CLIENT_SECRET,
                code_verifier: verifier,
              });

              try {
                const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: params.toString(),
                });
                if (!tokenRes.ok) {
                  const msg = await tokenRes.text();
                  console.error('[LinkedIn] Token exchange failed:', msg);
                  res.writeHead(302, { Location: '/?linkedin_error=token_failed' });
                  res.end(); return;
                }
                const { access_token } = await tokenRes.json();
                res.writeHead(302, { Location: `/?linkedin_token=${encodeURIComponent(access_token)}` });
                res.end();
              } catch (e) {
                console.error('[LinkedIn] Token exchange error:', e);
                res.writeHead(302, { Location: '/?linkedin_error=network' });
                res.end();
              }
              return;
            }

            // ── LinkedIn API proxy ──────────────────────────────────────
            if (url.pathname.startsWith('/api/linkedin/')) {
              const liPath = url.pathname.replace('/api/linkedin/', '');
              const target = `https://api.linkedin.com/v2/${liPath}${url.search}`;

              let body;
              if (req.method === 'POST' || req.method === 'PATCH') {
                body = await new Promise((resolve, reject) => {
                  const chunks = [];
                  req.on('data', c => chunks.push(c));
                  req.on('end',  () => resolve(Buffer.concat(chunks)));
                  req.on('error', reject);
                });
              }

              try {
                const apiRes = await fetch(target, {
                  method: req.method,
                  headers: {
                    'Authorization':              req.headers['authorization'] ?? '',
                    'Content-Type':               req.headers['content-type']  ?? 'application/json',
                    'X-Restli-Protocol-Version':  '2.0.0',
                    'LinkedIn-Version':           '202401',
                  },
                  body: body ?? undefined,
                });
                const text = await apiRes.text();
                res.writeHead(apiRes.status, {
                  'Content-Type': apiRes.headers.get('content-type') ?? 'application/json',
                });
                res.end(text);
              } catch (e) {
                console.error('[LinkedIn proxy]', e);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'proxy_error' }));
              }
              return;
            }

            next();
          });
        },
      },
    ],
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
