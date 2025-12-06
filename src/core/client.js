import { defineComponent } from './component.js';

const registry = new Map();

/**
 * Validates that a component name is alphanumeric (with optional underscores/hyphens).
 * Prevents injection attacks via component names.
 * @param {string} name - Component name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidComponentName(name) {
  if (!name || typeof name !== 'string') return false;
  // Allow alphanumeric, underscores, and hyphens (common component naming patterns)
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Registers a component function by name for hydration.
 * @param {string} name - Component name (must be alphanumeric)
 * @param {Function} componentFn - Component function that accepts props and returns render function
 */
export function register(name, componentFn) {
  if (!isValidComponentName(name)) {
    console.error(
      `[front.js] Invalid component name "${name}". Component names must be alphanumeric (with optional underscores/hyphens).`
    );
    return;
  }
  if (typeof componentFn !== 'function') {
    console.error(`[front.js] Component "${name}" must be a function.`);
    return;
  }
  registry.set(name, componentFn);
}

/**
 * Hydrates all island components found in the DOM.
 * Scans for elements with `data-island` attribute and initializes components.
 * @param {HTMLElement} root - Root element to scan (defaults to document.body)
 */
export function hydrate(root = document.body) {
  const islands = root.querySelectorAll('[data-island]');

  islands.forEach((island) => {
    const name = island.dataset.component;

    // Security: Validate component name format
    if (!name) {
      console.warn(`[front.js] Island element missing "data-component" attribute.`, island);
      return;
    }

    if (!isValidComponentName(name)) {
      console.error(
        `[front.js] Invalid component name "${name}" on island element. Skipping.`,
        island
      );
      return;
    }

    // Security: Validate component existence
    const Component = registry.get(name);
    if (!Component) {
      console.warn(`[front.js] Component "${name}" not registered. Skipping island.`, island);
      return;
    }

    // Security: Safe JSON parsing
    let props = {};
    try {
      props = JSON.parse(island.dataset.props || '{}');
    } catch (e) {
      console.error(
        `[front.js] Failed to parse props for component "${name}". Invalid JSON.`,
        e,
        island
      );
      return;
    }

    // Initialize component
    try {
      const renderFn = Component(props);
      if (typeof renderFn !== 'function') {
        console.error(`[front.js] Component "${name}" did not return a render function.`, island);
        return;
      }
      defineComponent(renderFn, island);

      // Cleanup marker
      island.removeAttribute('data-island');
    } catch (e) {
      console.error(`[front.js] Error initializing component "${name}".`, e, island);
      // Continue with other islands even if one fails
    }
  });
}
