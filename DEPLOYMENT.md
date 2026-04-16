# Deploying Hemingway to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Resend Account**: Sign up at [resend.com](https://resend.com)
3. **Domain (Optional)**: For production email sending, you'll need a verified domain in Resend

## Setup Steps

### 1. Configure Resend

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)

**For production:**
- Go to [resend.com/domains](https://resend.com/domains)
- Add and verify your domain
- Update `api/send-invite.js` line 30 to use your domain:
  ```js
  from: 'Hemingway <invites@yourdomain.com>',
  ```

### 2. Deploy to Vercel

#### Option A: CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variable
vercel env add RESEND_API_KEY
# Paste your Resend API key when prompted
# Select: Production, Preview, Development

# Redeploy to use the env var
vercel --prod
```

#### Option B: GitHub Integration (Recommended)

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your GitHub repository

4. Add environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
   - Select all environments (Production, Preview, Development)

5. Click **Deploy**

### 3. Update Email Domain (Production)

Once deployed, update the email sender in `api/send-invite.js`:

```js
from: 'Hemingway <invites@yourdomain.com>', // Your verified domain
```

And update the app URL if needed (line 21):
```js
const inviteUrl = `${appUrl || 'https://your-app.vercel.app'}`
```

Commit and push to trigger a new deployment.

### 4. Test Invitations

1. Open your deployed app
2. Create a board
3. Click "Share Board"
4. Enter an email and send an invitation
5. Check that the email arrives

## Troubleshooting

### Email not sending

1. Check Vercel logs: `vercel logs` or in the Vercel dashboard
2. Verify `RESEND_API_KEY` is set correctly
3. Check Resend logs at [resend.com/emails](https://resend.com/emails)

### Domain not verified

- Resend's free tier allows sending to **your own email only** until you verify a domain
- For production, verify your domain following [Resend's docs](https://resend.com/docs/dashboard/domains/introduction)

### API route not found

- Ensure `api/send-invite.js` exists in your repo
- Vercel automatically detects `/api` routes
- Check build logs for errors

## Local Development

To test email sending locally:

1. Create `.env.local`:
   ```bash
   RESEND_API_KEY=re_your_key_here
   ```

2. Run Vercel dev server:
   ```bash
   vercel dev
   ```

This starts a local Vercel environment with serverless functions.

## Cost

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions

- **Resend**: Free tier includes:
  - 3,000 emails/month
  - 100 emails/day
  - Perfect for getting started!

## Security Notes

- Never commit `.env` or `.env.local` files
- Rotate API keys if accidentally exposed
- Use Vercel's environment variables (encrypted at rest)
