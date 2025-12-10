/**
 * Test setup utilities for front.js
 */

/**
 * Creates a fresh DOM environment for testing
 * @returns {Object} Object with document and cleanup function
 */
export function createTestDOM() {
  // Create a minimal DOM structure
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  return {
    container,
    cleanup: () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
  };
}

/**
 * Waits for next tick (microtask)
 * @returns {Promise} Promise that resolves after microtask
 */
export function nextTick() {
  return Promise.resolve();
}

/**
 * Waits for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

