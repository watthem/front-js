#!/usr/bin/env node

/**
 * Validate that documentation and markdown files don't contain underscores
 * This enforces kebab-case naming conventions for better readability
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Recursively find all files in a directory
 */
async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const path = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, and other hidden directories
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        yield* walkDir(path);
      }
    } else {
      yield path;
    }
  }
}

/**
 * Check if a file path violates naming conventions
 */
function checkFile(filePath) {
  const fileName = filePath.split('/').pop();
  
  // Check if file is markdown or in docs directory
  const isMarkdown = fileName.endsWith('.md');
  const isInDocs = filePath.includes('/docs/') || 
                   filePath.includes('/wiki/') || 
                   filePath.includes('/community/');
  
  if (!isMarkdown && !isInDocs) {
    return null; // Skip files that aren't markdown or in docs
  }
  
  // Check for underscores in filename (excluding path separators)
  if (fileName.includes('_')) {
    return {
      file: filePath,
      issue: 'Filename contains underscores',
      suggestion: fileName.replace(/_/g, '-'),
    };
  }
  
  return null;
}

/**
 * Main validation function
 */
async function validate() {
  console.log('🔍 Validating filename conventions...\n');
  
  const violations = [];
  
  for await (const file of walkDir('.')) {
    const violation = checkFile(file);
    if (violation) {
      violations.push(violation);
    }
  }
  
  if (violations.length === 0) {
    console.log(`${COLORS.green}✓ All filenames follow conventions${COLORS.reset}`);
    console.log('  - No underscores in documentation or markdown files\n');
    return true;
  }
  
  console.log(`${COLORS.red}✗ Found ${violations.length} naming violation(s):${COLORS.reset}\n`);
  
  for (const { file, issue, suggestion } of violations) {
    console.log(`  ${COLORS.yellow}${file}${COLORS.reset}`);
    console.log(`    Issue: ${issue}`);
    console.log(`    Suggestion: ${suggestion}\n`);
  }
  
  console.log(`${COLORS.red}Please rename these files to use kebab-case (hyphens) instead of underscores.${COLORS.reset}\n`);
  
  return false;
}

// Run validation
validate().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error(`${COLORS.red}Error during validation:${COLORS.reset}`, error);
  process.exit(1);
});
