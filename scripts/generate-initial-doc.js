#!/usr/bin/env node

/**
 * generate-initial-doc.js
 *
 * Optional script to pre-render quick-start.md to HTML for progressive enhancement.
 *
 * Usage:
 *   node scripts/generate-initial-doc.js
 *
 * This script is OPTIONAL - respects front.js's "zero build" philosophy.
 * You can:
 * 1. Run this script and copy-paste the output
 * 2. Manually render the HTML once
 * 3. Skip it entirely (the site works without pre-rendering)
 */

import fs from 'fs';
import { marked } from 'marked';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read quick-start.md
const quickStartPath = join(__dirname, '../website/docs/quick-start.md');
const markdown = fs.readFileSync(quickStartPath, 'utf-8');

// Parse to HTML
const html = marked.parse(markdown);

// Output for data-props attribute (JSON-escaped)
const escapedForJSON = JSON.stringify(html);

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  Pre-rendered HTML for Quick Start (Progressive Enhancement)  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('Copy this into website/docs/index.html:\n');
console.log(`data-props='{"initialContent": ${escapedForJSON}}'\n`);

console.log('Or copy this HTML into the island div:\n');
console.log(html);
console.log('\n---\n');
console.log('✅ This provides instant content visibility (no loading spinner)');
console.log('✅ Better SEO (search engines see content)');
console.log('✅ Progressive enhancement (works without JS)\n');
