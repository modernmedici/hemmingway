# Hemingway Web Setup

## InstantDB Configuration

1. **Create an InstantDB app:**
   - Go to https://instantdb.com/dash
   - Create a new app
   - Copy your App ID

2. **Set the App ID:**
   - Open `src/lib/db.js`
   - Replace `YOUR_APP_ID_HERE` with your actual App ID

3. **Push the schema:**
   ```bash
   npx instant-cli push-schema instant.schema.ts
   ```

4. **Add permissions:**
   - Go to your InstantDB dashboard → Permissions
   - Add this rule to the `posts` entity:
     ```javascript
     {
       "posts": {
         "allow": {
           "$default": "auth.id == data.creator"
         }
       }
     }
     ```

## Running the App

```bash
bun install
bun run dev
```

Open http://localhost:5173

## First Use

1. Enter your email on the auth screen
2. Check your email for the magic link
3. Click the link to sign in
4. Start creating posts!

## Migration from Local Files

If you have existing posts in `~/Desktop/Hemingway/*.md`, you'll need to migrate them:

```bash
# TODO: Create a migration script if needed
```

## Deployment

```bash
bun run build
```

Deploy the `dist/` folder to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.)
