# @frontjs/core

**The secure-by-default, islands-first micro-framework.**

[![NPM Version](https://img.shields.io/npm/v/@frontjs/core.svg)](https://www.npmjs.com/package/@frontjs/core)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@frontjs/core)](https://bundlephobia.com/package/@frontjs/core)

**🌐 [Website](https://frontjs.dev)** | **📚 [Documentation](https://frontjs.dev/KB/)** | **💻 [Examples](https://frontjs.dev/examples/)**

## Install

```bash
npm install @frontjs/core uhtml
```

## Quick Start

```javascript
import { html, val, register, hydrate } from '@frontjs/core';

function Counter(props) {
  const count = val(props.start || 0);

  return () => html`
    <div>
      <button onclick=${() => count(count() - 1)}>-</button>
      <span>Count: ${count()}</span>
      <button onclick=${() => count(count() + 1)}>+</button>
    </div>
  `;
}

register('Counter', Counter);
hydrate();
```

## Features

* 🏝 **Islands Architecture:** Hydrate only what needs interaction
* 🔒 **Secure by Default:** Data flows via JSON only. No server closures
* ⚡ **Tiny Runtime:** <5KB gzipped. No build step required
* 🛡 **Sanitized Rendering:** Powered by `uhtml` to prevent XSS
* 🎯 **Fine-Grained Reactivity:** Value-based state management (val/run/calc)

## Documentation

See the [main repository](../../README.md) for complete documentation, examples, and API reference.

## Part of the frontjs Ecosystem

- [@frontjs/core](https://npmjs.com/package/@frontjs/core) - This package
- [@frontjs/actions](https://npmjs.com/package/@frontjs/actions) - Type-safe RPC layer

## License

ISC
