# Shader Island Demo (@frontjs/labs)

> **Status:** Placeholder for v0.0.3  
> **Requires:** @frontjs/labs (experimental)

This example will demonstrate:

- Using WebGL shaders within Front.js islands
- Progressive enhancement with shader effects
- Integration with `@frontjs/labs/unstable/shaders`
- Cleanup and lifecycle management
- Reactive uniform updates

## How to run

```bash
npx serve .
# then open /examples/shader-demo/index.html
```

## Files

- `index.html` - Page with shader island
- `app.js` - Shader island component
- `shaders/` - GLSL shader source files

## Concepts Demonstrated

- Creating shader programs with `createShader()`
- Mounting shaders to canvas elements
- Updating uniforms reactively
- Shader cleanup with `onCleanup()`
- Zero-build shader workflow

## Example Usage

```javascript
import { register, onCleanup } from '@frontjs/core';
import { createShader } from '@frontjs/labs/unstable/shaders';

register('ShaderBackground', (props) => {
  const shader = createShader({
    fragment: props.fragmentSource,
    uniforms: {
      time: 0,
      resolution: [800, 600]
    }
  });

  // TODO: Implement mounting and animation
  
  onCleanup(() => shader.dispose());
  
  return () => html`<canvas></canvas>`;
});
```

---

**TODO for v0.0.3:** Implement complete working example with actual shader
