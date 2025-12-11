/**
 * @fileoverview Animation frame helpers (EXPERIMENTAL)
 * @module @frontjs/labs/unstable/raf
 *
 * ⚠️ UNSTABLE API - May change before v0.1.0
 */

/**
 * Executes a callback every animation frame, automatically tied to island cleanup.
 *
 * TODO: Implement requestAnimationFrame loop with automatic cleanup integration.
 *
 * @param {Function} callback - Function to call every animation frame
 * @returns {Function} Cleanup function to stop the animation loop
 *
 * @example
 * import { onFrame } from '@frontjs/labs/unstable/raf';
 *
 * register('AnimatedCounter', (props) => {
 *   const rotation = val(0);
 *
 *   onFrame(() => {
 *     rotation(rotation() + 1);
 *   });
 *
 *   return () => html`<div style="transform: rotate(${rotation()}deg)">Spinning</div>`;
 * });
 */
export function onFrame(callback) {
  // TODO: Implement requestAnimationFrame loop
  console.warn('[frontjs/labs] onFrame is not yet implemented');

  let rafId = null;
  let running = true;

  const loop = () => {
    if (!running) return;
    // TODO: Call callback with timestamp
    // callback(timestamp);
    rafId = requestAnimationFrame(loop);
  };

  // TODO: Start loop
  // rafId = requestAnimationFrame(loop);

  // Return cleanup function
  return () => {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}
