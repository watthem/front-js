/**
 * @fileoverview Public API for front.js
 * @module front
 */

// Reactivity primitives
export { val, run, calc } from './core/reactivity.js';

// Component utilities
export { defineComponent } from './core/component.js';

// Client hydration
export { register, hydrate } from './core/client.js';

// Re-export renderer abstraction (wraps uhtml)
export { html, render } from './core/renderer.js';
