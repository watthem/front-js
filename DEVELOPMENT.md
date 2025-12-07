# Development Guide

How to run the website and KB locally, and how to deploy them.

## Local Development

### Option 1: Static File Server (Simplest)

Both the `website/` and `KB/` directories are pure static sites. You can serve them with any static file server.

#### Website (Main Landing Page)

```bash
cd website
npx serve . -p 8000
# Or: python3 -m http.server 8000
# Or: php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

#### KB (Knowledge Base)

```bash
cd KB
npx serve . -p 8001
# Or: python3 -m http.server 8001
# Or: php -S localhost:8001
```

Open `http://localhost:8001` in your browser.

### Option 2: Using back.js (Recommended for Development)

`back.js` serves the website and can also serve KB content via API.

```bash
cd back-js
npm install  # First time only
npm start
```

This serves:
- **Website**: `http://localhost:3000` (main landing page)
- **KB API**: `http://localhost:3000/api/render?file=FILENAME.md`

For development with auto-reload:

```bash
npm run dev
```

## Deployment

Both `website/` and `KB/` are pure static sites and can be deployed to Cloudflare Pages, Netlify, Vercel, or any static hosting service.

### Cloudflare Pages (Recommended)

The project is configured to deploy to Cloudflare Pages with the custom domain frontjs.dev.

#### Deploy to Production

```bash
# Deploy to production (master branch)
npm run deploy:cf:prod

# Or deploy current state (including uncommitted changes)
npm run deploy:cf
```

The `website/` directory is deployed to https://frontjs.dev.

**Configuration:**
- Custom domain configured via `website/CNAME`
- Deployment uses wrangler CLI
- See `package.json` for deployment scripts

### Netlify

#### Deploy Website

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd website
netlify deploy --prod
```

Or drag and drop the `website/` folder to [Netlify Drop](https://app.netlify.com/drop).

#### Deploy KB

Same process, but from the `KB/` directory.

### Vercel

#### Deploy Website

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd website
vercel --prod
```

Or connect your GitHub repository and set the root directory to `website/`.

#### Deploy KB

Same process, but from the `KB/` directory.

### Manual Deployment

Since both are pure static sites, you can:

1. Copy the contents of `website/` or `KB/` to any web server
2. Upload via FTP/SFTP to your hosting provider
3. Use any static hosting service

**Important:** Make sure to copy the entire directory contents, including:
- `index.html`
- `app.js`
- `styles.css`
- `front.esm.js` (for website)
- `content/` directory (for KB)

## Directory Structure

```
front-js/
├── website/          # Main landing page (deploy this for public site)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── front.esm.js
│
├── KB/               # Knowledge base (internal docs)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── front.esm.js
│   └── content/
│       ├── WHEN-TO-USE-FRONT.md
│       ├── MANIFESTO.md
│       └── LIMITATIONS.md
│
└── back-js/          # Optional dev server
    ├── index.js
    └── package.json
```

## Quick Reference

### Start Website Locally
```bash
cd website && npx serve . -p 8000
```

### Start KB Locally
```bash
cd KB && npx serve . -p 8001
```

### Start back.js Server
```bash
cd back-js && npm start
```

### Deploy Website to Netlify
```bash
cd website && netlify deploy --prod
```

### Deploy KB to Netlify
```bash
cd KB && netlify deploy --prod
```

## Notes

- **No build step required** - Both sites work as-is
- **ESM imports** - Uses native ES modules, works in modern browsers
- **CDN dependencies** - `uhtml` is loaded from CDN via importmap
- **CORS** - If serving locally, make sure you're using a web server (not `file://`)
