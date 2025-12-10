#!/usr/bin/env node

/**
 * Pre-commit hook to validate markdown file placement
 * Ensures LLMs and contributors place documentation in correct directories
 */

const { execSync } = require('child_process');
const path = require('path');

// Allowed patterns for markdown files
const ALLOWED_PATTERNS = [
  // Root level GitHub community files
  /^(README|CONTRIBUTING|CODE-OF-CONDUCT|LICENSE|CHANGELOG|DEVELOPMENT|CLAUDE|WARP)\.md$/i,

  // Maintainer docs
  /^docs\/(architecture|contributing|strategy|design)\/[^/]+\.md$/,
  /^docs\/(INDEX|DOCS-PLAN|DOCS-README)\.md$/,

  // User-facing docs
  /^website\/docs\/(guides|reference)\/[^/]+\.md$/,
  /^website\/docs\/FAQ\.md$/,
  /^website\/docs\/README\.md$/,
  /^website\/docs\/api\/(core|actions)\/.+\.md$/, // Auto-generated
  /^website\/docs\/content\/.+\.md$/, // KB content

  // Special directories
  /^examples\/[^/]+\.md$/,
  /^community\/[^/]+\.md$/,
  /^notes\/[^/]+\.md$/,
  /^KB\/.+\.md$/,

  // Package-level
  /^packages\/[^/]+\/(README|CHANGELOG|CONTRIBUTING)\.md$/,
];

// Suggestions for common misplacements
const SUGGESTIONS = {
  security: 'website/docs/guides/security.md',
  architecture: 'docs/architecture/',
  design: 'docs/architecture/ or docs/design/',
  guide: 'website/docs/guides/',
  tutorial: 'website/docs/guides/',
  api: 'Auto-generated via `npm run docs:api` in website/docs/api/',
  faq: 'website/docs/FAQ.md',
  limitation: 'website/docs/reference/limitations.md',
  roadmap: 'docs/strategy/ROADMAP.md',
  vision: 'docs/strategy/VISION.md',
  'how-to': 'website/docs/guides/',
  integration: 'website/docs/guides/',
};

function getStagedMarkdownFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output
      .split('\n')
      .filter((file) => file.endsWith('.md'))
      .filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

function isAllowedLocation(filePath) {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(filePath));
}

function getSuggestion(filePath) {
  const filename = path.basename(filePath, '.md').toLowerCase();

  // Check for keyword matches
  for (const [keyword, suggestion] of Object.entries(SUGGESTIONS)) {
    if (filename.includes(keyword)) {
      return suggestion;
    }
  }

  // Generic suggestions based on location
  if (filePath.match(/^[^/]+\.md$/)) {
    return 'Root level is reserved for GitHub community files (README.md, CONTRIBUTING.md, etc.)';
  }

  return 'Check docs/DOCS-README.md for placement guidelines';
}

function main() {
  const stagedMdFiles = getStagedMarkdownFiles();

  if (stagedMdFiles.length === 0) {
    process.exit(0); // No markdown files to check
  }

  const violations = [];

  for (const file of stagedMdFiles) {
    if (!isAllowedLocation(file)) {
      violations.push({
        file,
        suggestion: getSuggestion(file),
      });
    }
  }

  if (violations.length > 0) {
    console.error('\n❌ Documentation Placement Validation Failed\n');
    console.error(
      '⚠️  The following markdown files are in unexpected locations:\n',
    );

    for (const { file, suggestion } of violations) {
      console.error(`  📄 ${file}`);
      console.error(`     💡 Suggested location: ${suggestion}\n`);
    }

    console.error('📖 Documentation guidelines: docs/DOCS-README.md\n');
    console.error('💡 Quick fixes:');
    console.error(
      '   • Move file: git mv <file> <correct-location> && git add <correct-location>',
    );
    console.error('   • Delete file: git rm <file>');
    console.error(
      '   • Agent logs: Move to .agents/ (gitignored) and git rm <file>\n',
    );
    console.error(
      '⚠️  To bypass this check (not recommended): git commit --no-verify\n',
    );

    process.exit(1);
  }

  console.log('✅ Documentation placement validation passed');
  process.exit(0);
}

main();
