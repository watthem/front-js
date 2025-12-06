#!/usr/bin/env node

/**
 * back.js - Minimal server for front.js
 * 
 * Serves static files and markdown content.
 * Optional SSR support for server-side rendering.
 */

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const KB_DIR = resolve(__dirname, '../KB');
const WEBSITE_DIR = resolve(__dirname, '../website');
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

/**
 * Get content type for file extension
 */
function getContentType(path) {
  const ext = extname(path);
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

/**
 * Serve static file
 */
async function serveFile(filePath, res) {
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const content = await readFile(filePath);
    const contentType = getContentType(filePath);
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      'Cache-Control': 'public, max-age=3600',
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      console.error('Error serving file:', error);
    }
  }
}

/**
 * SSR endpoint: Render markdown server-side
 * GET /api/render?file=WHEN-TO-USE-FRONT.md
 */
async function renderMarkdown(file, res) {
  try {
    const filePath = join(KB_DIR, 'content', file);
    const content = await readFile(filePath, 'utf-8');
    
    // For now, just return the markdown
    // In the future, could parse with marked server-side
    res.writeHead(200, {
      'Content-Type': 'text/markdown',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      console.error('Error rendering markdown:', error);
    }
  }
}

/**
 * Request handler
 */
async function handleRequest(req, res) {
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // SSR endpoint
  if (pathname.startsWith('/api/render')) {
    const file = url.searchParams.get('file');
    if (file) {
      await renderMarkdown(file, res);
      return;
    }
  }

  // Serve static files
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = join(WEBSITE_DIR, 'index.html');
  } else {
    filePath = join(WEBSITE_DIR, pathname);
  }

  await serveFile(filePath, res);
}

/**
 * Start server
 */
const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`back.js server running at http://localhost:${PORT}`);
  console.log(`Serving website from: ${WEBSITE_DIR}`);
  console.log(`KB available at: ${KB_DIR}`);
});
