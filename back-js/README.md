# back.js

Minimal server for front.js. Serves static files and markdown content with optional SSR support.

## Features

- Serves static files from `website/` directory (main site)
- KB/docs available in `KB/` directory
- Serves markdown files with proper content-type
- Optional SSR endpoint for server-side markdown rendering
- CORS headers for local development
- Zero dependencies (uses Node.js built-in modules)

## Usage

```bash
# Start server
npm start

# Development mode (auto-reload)
npm run dev
```

Server runs on `http://localhost:3000` by default. Set `PORT` environment variable to change.

## API

### Static Files

All files in `website/` directory are served as static files.

- `GET /` → `website/index.html`
- `GET /app.js` → `website/app.js`
- `GET /styles.css` → `website/styles.css`

KB content is in `KB/` directory (internal knowledge base).

### SSR Endpoint (Optional)

Render markdown server-side:

```
GET /api/render?file=WHEN-TO-USE-FRONT.md
```

Returns the markdown file content. In the future, this could parse markdown server-side with `marked` or similar.

## Why back.js?

front.js is designed for static sites. back.js provides a minimal server for:

- Local development
- Optional SSR (future)
- Testing server-rendered scenarios

**Note:** back.js is optional. The website works as a pure static site and can be deployed to GitHub Pages, Netlify, or any static host.

## Philosophy

Like front.js, back.js is minimal:

- No framework bloat
- Uses Node.js built-in modules only
- Simple, focused on serving files
- Easy to understand and modify

If you need more features, use Express, Fastify, or another server framework.
