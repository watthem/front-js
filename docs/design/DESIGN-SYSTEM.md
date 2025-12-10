# Design System

**front.js** uses a distinct "hacker/terminal" aesthetic that reflects its technical, no-nonsense philosophy.

## Core Identity

- **Theme:** Dark Mode / High Contrast
- **Vibe:** Terminal, Cyberpunk, Technical, Minimalist
- **Colors:** Deep black backgrounds with vibrant neon accents

## Color Palette

### Primary

- **Neon Lime / Volt:** `#ccff00`
- **Dark Lime:** `#aadd00`

### Backgrounds

- **Deep Black:** `#0a0a0a` (Main background)
- **Dark Grey:** `#111111` (Secondary background / Panels)
- **Code Background:** `#1a1a1a`

### Text

- **Primary Text:** `#ededed` (High legibility)
- **Secondary Text:** `#a1a1aa` (Muted)

### Borders

- **Subtle Border:** `#333333`

## Typography

- **Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Headings:** Bold, tight letter-spacing (`-0.05em` for hero)
- **Monospace:** `'Monaco', 'Menlo', 'Ubuntu Mono', monospace` (for code and technical details)

## UI Components

### Buttons

- **Primary:** Neon Lime background (`#ccff00`), Black text, Uppercase, Bold
- **Secondary:** Transparent background, White text, Bordered

### Cards / Panels

- Dark background (`#111111`)
- 1px Border (`#333333`)
- 4px Border Radius
- Subtle hover lift effect

### Code Blocks

- Dark background (`#1a1a1a`)
- Neon Lime text for highlighting
- Bordered

## CSS Variables

Copy-paste this into your CSS to adopt the front.js look:

```css
:root {
  --color-primary: #ccff00; /* Neon Lime / Volt */
  --color-primary-dark: #aadd00;
  --color-text: #ededed;
  --color-text-light: #a1a1aa;
  --color-bg: #0a0a0a; /* Very dark grey/black */
  --color-bg-light: #111111;
  --color-border: #333333;
  --color-code-bg: #1a1a1a;
  --color-code-text: #ededed;
  --border-radius: 0.5rem;
}
```

## Philosophy

The design avoids the "corporate SaaS" look (blue/purple gradients, heavy drop shadows) in favor of a raw, engineering-focused aesthetic. It signals: "This is a tool for builders."
