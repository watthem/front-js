# front.js Knowledge Base

Internal knowledge base built with front.js that showcases documentation, guides, and detailed explanations.

## Structure

- `index.html` - Main HTML page
- `app.js` - front.js components (Navigation, MarkdownViewer)
- `styles.css` - Site styling
- `content/` - Markdown files to display

## Running Locally

### Option 1: Static Server (Recommended)

Use any static file server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx serve)
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Using back.js

From the `back-js/` directory:

```bash
cd ../back-js
npm start
```

Then open `http://localhost:3000` in your browser.

## Deployment

The KB is a pure static site and can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Just deploy the `KB/` directory contents.

### Recommended: GitHub Pages

For the best user experience, deploy the KB to GitHub Pages at `kb.frontjs.com` (or a subdomain of your choosing):

1. **Configure custom domain** (optional):
   - Add a `CNAME` file to the `KB/` directory with your domain name
   - Configure DNS with your domain registrar

2. **Deploy via GitHub Actions**:
   - Use the provided `.github/workflows/deploy-kb.yml` workflow
   - Or manually push the `KB/` directory to the `gh-pages` branch

3. **Update website links**:
   - Once deployed, update `website/KB/index.html` to point to the live URL
   - Update navigation links in `website/index.html` and `website/examples/index.html`

**Note:** This is the internal knowledge base showcase. The main website is in the `website/` directory.

## Features

- **Client-side markdown rendering** - Uses `marked` library from CDN
- **Hash-based navigation** - Deep linking via URL hash (`#explainer`, `#manifesto`, etc.)
- **Reactive navigation** - Built with front.js `val`/`run` for reactivity
- **No build step** - Pure HTML, CSS, and JavaScript

## Adding Content

To add a new document:

1. Add markdown file to `content/` directory
2. Update `DOCS` object in `app.js`:

```javascript
const DOCS = {
  // ... existing docs
  'new-doc': {
    title: 'New Document',
    file: 'NEW-DOC.md',
    id: 'new-doc'
  }
};
```

The navigation and viewer will automatically pick it up.
