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

**Note:** This is the internal knowledge base. The main website is in the `website/` directory.

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
