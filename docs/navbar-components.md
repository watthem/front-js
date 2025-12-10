# Website Components

This directory contains components used in the front.js website.

## NavBar Component

The NavBar component demonstrates server-side rendering (SSR) with client-side hydration for optimal performance.

### Files

- **`NavBar.js`** - Client-side component (uses `uhtml` for browser rendering)
- **`NavBar.server.js`** - Server-side renderer (uses template literals for Node.js compatibility)

### Why Two Files?

**The Problem**: `uhtml` (used in `NavBar.js`) is a browser-only library and can't run in Node.js during build scripts.

**The Solution**: Maintain two implementations:
1. **Client component** (`NavBar.js`): Used for hydration and reactive updates in the browser
2. **Server renderer** (`NavBar.server.js`): Used during build to generate static HTML

Both files implement the same logic and must be kept in sync.

### Architecture

```
┌─────────────────────────────┐
│  navbar-config.json         │  Single source of truth
│  (page configs)             │  for navbar links
└──────────┬──────────────────┘
           │
           ├─── Build Time ────────────────────────┐
           │                                       │
           v                                       v
    ┌─────────────────┐                   ┌──────────────┐
    │ NavBar.server.js│ ──generates──→    │  index.html  │
    │ (template       │                   │  (server-    │
    │  literals)      │                   │   rendered)  │
    └─────────────────┘                   └──────┬───────┘
                                                 │
           ├─── Browser Runtime ──────────────────┘
           │
           v
    ┌─────────────────┐
    │   NavBar.js     │ ──hydrates──→  Interactive navbar
    │   (uhtml)       │                 (mobile toggle, etc.)
    └─────────────────┘
```

### Updating Navbar Links

**Recommended: Use the build script**

1. Edit `website/navbar-config.json`:
   ```json
   {
     "pages": [
       {
         "path": "website/index.html",
         "links": [
           {"label": "Home", "url": "./"},
           {"label": "Docs", "url": "./docs/"},
           ...
         ],
         "activePath": "/"
       }
     ]
   }
   ```

2. Run the generator:
   ```bash
   npm run navbar:generate
   ```

3. Verify changes:
   ```bash
   npm run navbar:validate
   git diff website/
   ```

4. Commit the updated HTML files:
   ```bash
   git add website/
   git commit -m "Update navbar links"
   ```

**Manual Approach (Not Recommended)**

If you manually edit HTML:
1. Update `data-props` JSON in the island
2. Update server-rendered HTML inside the island
3. Ensure desktop and mobile menus both have the links
4. Ensure links order and active states match exactly

**Why manual fails**: Easy to create mismatches between props and HTML, causing visual "jumps" when hydration completes.

### Progressive Enhancement

The navbar follows progressive enhancement principles:

1. **Server-rendered HTML** - Navbar appears instantly (no pop-in/flash)
2. **CSS loaded** - Styling applied immediately
3. **JavaScript hydrates** - Mobile menu toggle becomes interactive
4. **Client updates** - Reactive state enables dynamic behavior

Without JavaScript, the navbar is still visible and links work (graceful degradation).

### Testing Checklist

When updating the navbar:

- [ ] No visual "pop-in" when page loads
- [ ] No visual "jump" when JavaScript hydrates
- [ ] Props JSON matches server-rendered HTML exactly
- [ ] Active link highlighting works on all pages
- [ ] Mobile menu toggle works (hamburger button)
- [ ] All links navigate correctly
- [ ] Navbar validation passes: `npm run navbar:validate`

### Common Issues

**Issue: Navbar appears blank, then pops in after 200-500ms**
- **Cause**: Empty `data-island` div (no server-rendered HTML)
- **Fix**: Run `npm run navbar:generate` to add server HTML

**Issue: Navbar "jumps" or links appear/disappear during page load**
- **Cause**: Mismatch between `data-props` and server-rendered HTML
- **Fix**: Run `npm run navbar:generate` to sync props with HTML

**Issue: Mobile menu doesn't open**
- **Cause**: JavaScript not loaded or component not registered
- **Fix**: Verify `app.js` imports and registers NavBar, check browser console

**Issue: Active link not highlighted correctly**
- **Cause**: `activePath` in config doesn't match page's actual path
- **Fix**: Update `activePath` in `navbar-config.json` for that page

### File Locations

```
/Users/matthewhendricks/projects/sources/front-js/
├── website/
│   ├── navbar-config.json           # Page configurations
│   ├── components/
│   │   ├── NavBar.js                # Client component
│   │   ├── NavBar.server.js         # Server renderer
│   │   └── README.md                # This file
│   ├── index.html                   # Homepage (has navbar)
│   ├── examples/index.html          # Examples page (has navbar)
│   ├── KB/index.html                # KB landing (has navbar)
│   └── docs/index.html              # Docs (NO navbar - uses Sidebar)
├── scripts/
│   ├── generate-navbar.js           # Build script
│   └── validate-navbar.js           # Validation script
└── package.json                     # npm scripts
```

### Philosophy Alignment

This approach aligns with front.js core principles:

- **Framework**: No build step (ships as ES modules) ✅
- **Website**: Optional build for progressive enhancement ✅
- **HTML is Truth**: Server-rendered HTML is the source of truth ✅
- **Generated output**: Committed to git (works without building) ✅
- **Security**: No eval, no innerHTML (uhtml handles escaping) ✅

### Extending to Other Components

This pattern can be applied to other components that benefit from SSR:

1. Create `ComponentName.server.js` with template literal renderer
2. Add component configs to a JSON file
3. Create/update build script in `scripts/`
4. Run script to generate HTML
5. Commit generated HTML

Examples: MarkdownViewer, Sidebar, Footer, etc.
