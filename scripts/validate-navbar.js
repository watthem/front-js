#!/usr/bin/env node

/**
 * validate-navbar.js
 *
 * Validates that data-props and server-rendered HTML match
 * for all NavBar islands across the website.
 *
 * Usage:
 *   node scripts/validate-navbar.js
 *   npm run navbar:validate
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - One or more validation errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const configPath = path.join(__dirname, '../website/navbar-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║  NavBar Validation Check                              ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

let errors = [];
let warnings = [];
let checkedCount = 0;

for (const pageConfig of config.pages) {
  const { path: pagePath, links } = pageConfig;
  const fullPath = path.join(__dirname, '..', pagePath);

  console.log(`Checking: ${pagePath}`);

  // Check file exists
  if (!fs.existsSync(fullPath)) {
    errors.push(`${pagePath}: File not found`);
    continue;
  }

  const html = fs.readFileSync(fullPath, 'utf-8');

  // Extract data-props
  const propsMatch = html.match(/data-component="NavBar"\s+data-props='([^']*)'/);
  if (!propsMatch) {
    errors.push(`${pagePath}: No NavBar data-props found`);
    continue;
  }

  // Validate JSON
  let dataProps;
  try {
    dataProps = JSON.parse(propsMatch[1]);
  } catch (e) {
    errors.push(`${pagePath}: Invalid JSON in data-props - ${e.message}`);
    continue;
  }

  // Check links property exists
  if (!dataProps.links) {
    errors.push(`${pagePath}: data-props missing 'links' property`);
    continue;
  }

  // Validate links match config
  const propsLinksJSON = JSON.stringify(dataProps.links);
  const configLinksJSON = JSON.stringify(links);
  if (propsLinksJSON !== configLinksJSON) {
    errors.push(`${pagePath}: data-props links don't match config`);
    console.log(`  Expected: ${configLinksJSON}`);
    console.log(`  Got:      ${propsLinksJSON}`);
    continue;
  }

  // Check server HTML exists
  const hasServerHTML = /<nav class="navbar">/.test(html);
  if (!hasServerHTML) {
    errors.push(`${pagePath}: No server-rendered HTML in island (empty island)`);
    continue;
  }

  // Count links in server HTML
  const serverLinkMatches = html.match(/class="navbar-link/g);
  const serverLinkCount = serverLinkMatches ? serverLinkMatches.length : 0;
  const expectedLinkCount = links.length * 2; // Desktop + mobile

  if (serverLinkCount !== expectedLinkCount) {
    warnings.push(`${pagePath}: Expected ${expectedLinkCount} links (${links.length} × 2 for desktop+mobile), found ${serverLinkCount}`);
  }

  // Check for hamburger button
  if (!html.includes('class="navbar-toggle"')) {
    warnings.push(`${pagePath}: Missing navbar-toggle button`);
  }

  console.log(`  ✅ Valid`);
  checkedCount++;
}

console.log('\n' + '─'.repeat(55));

// Report warnings
if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:\n');
  warnings.forEach(warning => console.log(`  - ${warning}`));
}

// Report errors
if (errors.length > 0) {
  console.log('\n❌ Validation failed:\n');
  errors.forEach(err => console.log(`  - ${err}`));
  console.log('\n💡 Run `npm run navbar:generate` to fix these issues\n');
  process.exit(1);
} else {
  console.log(`\n✅ All ${checkedCount} NavBar island(s) valid`);
  if (warnings.length > 0) {
    console.log('⚠️  However, there are warnings to review\n');
  } else {
    console.log('');
  }
}
