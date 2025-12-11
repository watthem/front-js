# Front.js Labs (Experimental)

> **Status:** Draft for v0.0.3  
> **Warning:** APIs here are experimental and may change before v0.1.0.

## What is Front.js Labs?

<!-- TODO: Explain Labs package concept -->
<!-- Optional experimental utilities -->
<!-- Not required for core functionality -->
<!-- Marked as unstable -->

Front.js Labs (`@frontjs/labs`) is an experimental package containing optional utilities that extend Front.js with additional capabilities. These modules are:

- **Experimental**: APIs may change between releases
- **Optional**: Not required for core Front.js functionality
- **Unstable**: No stability guarantees until v0.1.0
- **Namespaced**: All exports under `unstable/*` paths

## Installation

```bash
npm install @frontjs/labs
```

> **Note:** Labs package is separate from core and actions. Only install if you need experimental features.

## Available Modules

### Shader Helper (`unstable/shaders`)

<!-- TODO: What it does -->
<!-- When to use it -->
<!-- Basic example -->

Tiny WebGL shader utility for progressive enhancement and visual effects.

```javascript
// TODO: Shader example
import { createShader } from '@frontjs/labs/unstable/shaders';
```

**Use cases:**
- Background effects
- Procedural textures
- Interactive visualizations
- Progressive enhancement

**Constraints:**
- <3KB bundle size
- No build step required
- String-literal shaders only

### Animation Frame Loop (`unstable/raf`)

<!-- TODO: What it does -->
<!-- When to use it -->
<!-- Basic example -->

Reactive animation loop tied to island lifecycle.

```javascript
// TODO: RAF example
import { onFrame } from '@frontjs/labs/unstable/raf';
```

**Use cases:**
- Canvas animations
- DOM micro-animations
- Time-based effects
- Game loops

**Features:**
- Automatic cleanup on island disposal
- Works with or without `onCleanup()`
- Optional frame skip/throttle

## Integration with Islands

<!-- TODO: How Labs modules integrate with core -->
<!-- onCleanup() integration -->
<!-- Lifecycle management -->

### Example: Shader Background Island

```javascript
// TODO: Complete shader island example
```

### Example: Animated Counter

```javascript
// TODO: Complete animation example
```

## When NOT to Use Labs

<!-- TODO: Guidance on alternatives -->

- For production-critical features (use stable APIs)
- When bundle size is critical (Labs adds overhead)
- For simple animations (use CSS animations instead)
- When browser support is critical (WebGL may not be available)

## Browser Support

<!-- TODO: Browser compatibility notes -->

## Migration Path

<!-- TODO: What happens when features graduate to stable -->

As Labs features mature, they may be:
- Moved to stable packages
- Renamed without `unstable/` prefix
- Removed if not successful

## Examples

See the `examples/` directory for working demos:
- `examples/shader-demo/` - Shader background effect
- `examples/animated-counter/` - Animation frame usage

## API Reference

### createShader(options)

<!-- TODO: Full API documentation -->

### onFrame(callback)

<!-- TODO: Full API documentation -->

---

**See also:**
- [Core API Reference](../api/core/)
- [Best Practices Guide](./best-practices.md)
- [Examples](../../examples/)
