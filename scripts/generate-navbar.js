#!/usr/bin/env node

/**
 * generate-navbar.js
 *
 * Generates server-rendered NavBar HTML and injects it into website pages.
 * This ensures props and server HTML always match (single source of truth).
 *
 * Usage:
 *   node scripts/generate-navbar.js
 *   npm run navbar:generate
 *
 * Philosophy: Optional build step for progressive enhancement.
 * Generated HTML is committed to git so site works without building.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { renderNavBar } from '../website/components/NavBar.server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load page configuration
const configPath = path.join(__dirname, '../website/navbar-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║  NavBar Server-Rendering Generator for front.js      ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

let updatedCount = 0;
let errorCount = 0;

for (const pageConfig of config.pages) {
  const { path: pagePath, links, activePath } = pageConfig;
  const fullPath = path.join(__dirname, '..', pagePath);

  try {
    console.log(`Processing: ${pagePath}`);

    // Read HTML file
    if (!fs.existsSync(fullPath)) {
      console.error(`  ❌ File not found: ${fullPath}`);
      errorCount++;
      continue;
    }

    let html = fs.readFileSync(fullPath, 'utf-8');

    // Generate server-rendered NavBar HTML
    const navbarHTML = renderNavBar({ links, activePath });

    // Generate data-props JSON (single-line, properly escaped)
    const dataPropsJSON = JSON.stringify({ links });

    // Build replacement island
    // Match the indentation style of the existing files
    const replacement = `<div
      data-island
      data-component="NavBar"
      data-props='${dataPropsJSON}'
    >
      ${navbarHTML}
    </div>`;

    // Find and replace the NavBar island
    // Pattern matches: <div data-island data-component="NavBar" ...>...</div>
    // This regex handles multi-line islands with any content inside
    const navbarIslandRegex = /<div[^>]*data-island[^>]*data-component="NavBar"[^>]*>[\s\S]*?<\/div>\s*(?=\n\s*<)/;

    if (!navbarIslandRegex.test(html)) {
      console.error(`  ❌ No NavBar island found in ${pagePath}`);
      console.error(`     Make sure the file has a data-island with data-component="NavBar"`);
      errorCount++;
      continue;
    }

    // Replace
    const originalHtml = html;
    html = html.replace(navbarIslandRegex, replacement);

    // Verify replacement actually changed something
    if (html === originalHtml) {
      console.warn(`  ⚠️  Warning: No changes made to ${pagePath} (HTML unchanged)`);
    }

    // Write back
    fs.writeFileSync(fullPath, html, 'utf-8');

    console.log(`  ✅ Updated ${pagePath}`);
    updatedCount++;

  } catch (error) {
    console.error(`  ❌ Error processing ${pagePath}:`, error.message);
    errorCount++;
  }
}

console.log('\n' + '─'.repeat(55));
console.log(`✅ Success: ${updatedCount} file(s) updated`);
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount} file(s) failed`);
  process.exit(1);
}
console.log('\n💡 Changes committed to git (progressive enhancement)');
console.log('💡 Site works without build - HTML is pre-rendered\n');
