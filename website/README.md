# front.js Website

Simple landing page for front.js focused on intention signals and validation.

## Purpose

This website is designed to:
- Show what front.js is (micro-framework for hydration)
- Display key intention signals (security, size, simplicity)
- Provide a simple live demo
- Link to KB/docs for detailed information

## Structure

- `index.html` - Main landing page
- `app.js` - Simple demo component (Counter)
- `styles.css` - Modern, clean styling
- `front.esm.js` - front.js bundle (copied from build)

## Running Locally

### Option 1: Static Server

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx serve)
npx serve . -p 8000

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

The website is a pure static site and can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Just deploy the `website/` directory contents.

## Philosophy

This website is intentionally minimal. It's not a full documentation site—that's what the KB is for. This site exists to:

1. **Validate the project** - Show that front.js works
2. **Signal intentions** - Communicate what front.js stands for
3. **Provide entry point** - Link to KB/docs for those who want more

Keep it simple. Keep it focused.
