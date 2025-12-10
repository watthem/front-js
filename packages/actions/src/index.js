/**
 * @fileoverview Public API for @frontjs/actions
 * @module @frontjs/actions
 */

export const VERSION = '0.0.1';

// Re-export server and client utilities
export { createRouter } from './server.js';
export { createClient } from './client.js';
