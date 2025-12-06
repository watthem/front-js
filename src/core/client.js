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
 * Registers a component function by name for hydration with optional schema validation.
 * @param {string} name - Component name (must be alphanumeric)
 * @param {Function} componentFn - Component function that accepts props and returns render function
 * @param {Object} [options] - Configuration options
 * @param {Object} [options.schema] - Standard Schema compliant validator
 */
export function register(name, componentFn, options = {}) {
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
  registry.set(name, {
    componentFn,
    schema: options.schema
  });
}

/**
 * Hydrates all island components found in the DOM.
 * Supports async validation if schema returns a Promise.
 * Scans for elements with `data-island` attribute and initializes components.
 * @param {HTMLElement} root - Root element to scan (defaults to document.body)
 * @returns {Promise<void>}
 */
export async function hydrate(root = document.body) {
  const islands = root.querySelectorAll('[data-island]');

  for (const island of islands) {
    const name = island.dataset.component;

    // Security: Validate component name format
    if (!name) {
      console.warn(`[front.js] Island element missing "data-component" attribute.`, island);
      continue;
    }

    if (!isValidComponentName(name)) {
      console.error(
        `[front.js] Invalid component name "${name}" on island element. Skipping.`,
        island
      );
      continue;
    }

    // Security: Validate component existence
    const entry = registry.get(name);
    if (!entry) {
      console.warn(`[front.js] Component "${name}" not registered. Skipping island.`, island);
      continue;
    }

    const { componentFn, schema } = entry;

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
      continue;
    }

    // Validate schema if provided
    if (schema && schema['~standard']) {
      try {
        const result = schema['~standard'].validate(props);
        const resolved = result instanceof Promise ? await result : result;

        if (resolved.issues) {
          console.error(
            `[front.js] Schema validation failed for "${name}":`,
            resolved.issues,
            island
          );
          continue;
        }
        props = resolved.value;
      } catch (err) {
        console.error(`[front.js] Validator Error for "${name}":`, err);
        continue;
      }
    }

    // Initialize component
    try {
      const renderFn = componentFn(props);
      if (typeof renderFn !== 'function') {
        console.error(`[front.js] Component "${name}" did not return a render function.`, island);
        continue;
      }
      defineComponent(renderFn, island);

      // Cleanup marker
      island.removeAttribute('data-island');
    } catch (e) {
      console.error(`[front.js] Error initializing component "${name}".`, e, island);
      // Continue with other islands even if one fails
    }
  }
}
