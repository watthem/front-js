/**
 * @fileoverview Experimental helpers for the Front.js ecosystem.
 *
 * ⚠️ WARNING: All exports from this package are considered UNSTABLE until v0.1.0.
 * APIs may change between releases without notice.
 *
 * Please use the namespaced imports:
 *   import { createShader } from '@frontjs/labs/unstable/shaders';
 *   import { onFrame } from '@frontjs/labs/unstable/raf';
 */

// TODO: Implement experimental modules
console.warn(
  '[frontjs/labs] This package contains experimental features. ' +
  'Use at your own risk. APIs may change before v0.1.0.'
);

// Re-export with clear unstable marker
export * as unstableShaders from './unstable/shaders.js';
export * as unstableRaf from './unstable/raf.js';
