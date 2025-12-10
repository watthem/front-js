/**
 * @fileoverview Client-side wrapper for type-safe RPC calls
 * @module @frontjs/actions/client
 */

/**
 * Creates a client for making type-safe action requests.
 * @param {string} endpoint - The API URL (e.g., '/api/actions')
 * @returns {Object} Client with send method
 * @example
 * const client = createClient('/api/actions');
 * await client.send('todo:create', { text: 'Hello' });
 */
export const createClient = (endpoint) => ({
  send: async (action, payload) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) throw new Error(`[frontjs-actions] Server Error: ${res.statusText}`);
    return res.json();
  },
});
