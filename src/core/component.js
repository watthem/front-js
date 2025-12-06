import { render } from 'uhtml';
import { run } from './reactivity.js';

/**
 * Defines a component by binding its render function to a run.
 * The component will automatically re-render when any values it reads change.
 * Returns a dispose function and attaches it to container._front_dispose for cleanup.
 * @param {Function} renderFn - Function that returns a uhtml template
 * @param {HTMLElement} container - DOM element to render into
 * @returns {Function} - Dispose function to stop rendering and cleanup runs
 * @example
 * const renderFn = () => html`<div>Hello</div>`;
 * const dispose = defineComponent(renderFn, document.getElementById('app'));
 * // Later: dispose() to cleanup
 */
export function defineComponent(renderFn, container) {
  if (typeof renderFn !== 'function') {
    console.error('[front.js] defineComponent() requires a render function.');
    return;
  }

  if (!container || !(container instanceof HTMLElement)) {
    console.error('[front.js] defineComponent() requires a valid DOM element container.');
    return;
  }

  // Capture dispose function from run
  const dispose = run(() => {
    try {
      const template = renderFn();
      render(container, template);
    } catch (error) {
      console.error('[front.js] Error rendering component:', error, container);
      // Render error fallback to prevent blank UI
      container.textContent = '[front.js] Rendering error occurred.';
    }
  });

  // Attach to container for manual cleanup (HTMX integration, testing, etc.)
  container._front_dispose = dispose;

  // Return dispose for programmatic use
  return dispose;
}
