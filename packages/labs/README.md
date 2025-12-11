# @frontjs/labs

**Experimental utilities for the Front.js ecosystem.**

> ⚠️ **WARNING**: This package contains experimental features. All APIs are unstable and may change between releases. Not recommended for production use until v0.1.0.

[![NPM Version](https://img.shields.io/npm/v/@frontjs/labs.svg)](https://www.npmjs.com/package/@frontjs/labs)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Part of the [frontjs](https://frontjs.dev) ecosystem.

## What is Labs?

Front.js Labs is a collection of experimental utilities that extend the core framework with optional capabilities:

- **WebGL Shader Helpers** - Tiny utilities for progressive enhancement with shaders
- **Animation Frame Loops** - Reactive animation helpers tied to island lifecycle
- **Canvas 2D Helpers** (coming soon) - Reactive canvas drawing utilities

## Installation

```bash
npm install @frontjs/labs
```

## Status: Experimental

All modules in this package are marked as **unstable** and should be imported from the `unstable/*` namespace:

```javascript
import { createShader } from '@frontjs/labs/unstable/shaders';
import { onFrame } from '@frontjs/labs/unstable/raf';
```

## Quick Example

```javascript
import { register, val, onCleanup } from '@frontjs/core';
import { onFrame } from '@frontjs/labs/unstable/raf';

register('AnimatedCounter', (props) => {
  const rotation = val(0);
  
  // Runs every frame, automatically stops on cleanup
  const stopAnimation = onFrame(() => {
    rotation(rotation() + 1);
  });
  
  onCleanup(stopAnimation);
  
  return () => html`
    <div style="transform: rotate(${rotation()}deg)">
      Spinning!
    </div>
  `;
});
```

## Documentation

See the [Labs Guide](../../website/docs/guides/labs.md) for complete documentation, examples, and integration patterns.

## Stability

- **v0.0.3**: Initial experimental release
- **v0.1.0**: Stability evaluation, possible API changes
- **v1.0.0**: Some features may graduate to stable packages

## Part of the frontjs Ecosystem

- [@frontjs/core](https://npmjs.com/package/@frontjs/core) - Islands Architecture runtime
- [@frontjs/actions](https://npmjs.com/package/@frontjs/actions) - Type-safe RPC layer
- [@frontjs/labs](https://npmjs.com/package/@frontjs/labs) - This package (experimental)

## License

ISC
