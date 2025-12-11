# Labs / Experimental Modules – v0.0.3

## Vision

Provide small, opt-in utilities (e.g., shaders, animation loops) that:
- Respect zero-build, zero-magic constraints.
- Integrate cleanly with islands.
- Are explicitly marked experimental.

## Initial Focus for v0.0.3

- A single `@frontjs/labs` package.
- Inside:
  - `unstable/shaders` – tiny WebGL helper.
  - `unstable/raf` – animation frame helper tied to island cleanup.

## Module A: Shader Helper

**Purpose:** Basic WebGL shader setup utility for progressive enhancement and low-footprint visual effects.

**API Surface:**
```javascript
import { createShader } from '@frontjs/labs/unstable/shaders';

const shader = createShader({
  fragment: `...`,  // GLSL fragment shader
  vertex: `...`,    // GLSL vertex shader (optional, uses default if omitted)
  uniforms: {       // Initial uniform values
    time: 0,
    resolution: [800, 600]
  }
});

// Mount to canvas element
shader.mount(canvasElement);

// Update uniforms
shader.setUniform('time', performance.now());

// Cleanup (automatically called on island disposal)
shader.dispose();
```

**Constraints:**
- Must be <3KB
- No build step required
- String-literal shaders (no shader imports)
- Minimal error handling (console warnings)

**Integration with Islands:**
```javascript
register('ShaderBackground', (props) => {
  const canvas = document.createElement('canvas');
  const shader = createShader({ fragment: props.shader });
  
  onCleanup(() => shader.dispose());
  
  return () => html`<div>${canvas}</div>`;
});
```

## Module B: Animation Frame Loop

**Purpose:** Reactive animation loop tied to island lifecycle.

**API Surface:**
```javascript
import { onFrame } from '@frontjs/labs/unstable/raf';

register('AnimatedCounter', (props) => {
  const rotation = val(0);
  
  // Runs every frame, automatically stops on cleanup
  onFrame(() => {
    rotation(rotation() + 1);
  });
  
  return () => html`<div style="transform: rotate(${rotation()}deg)">
    Spinning
  </div>`;
});
```

**Features:**
- Returns cleanup function
- Automatically uses requestAnimationFrame
- Pauses when island is disposed
- Optional frame skip/throttle

**Constraints:**
- Must be <1KB
- Zero dependencies beyond core
- Works without onCleanup() but integrates with it

## Module C: Canvas 2D Helpers (Stretch Goal)

If time permits, add basic Canvas 2D utilities:
- `Canvas2DIsland` component wrapper
- Reactive draw loop with `val()` signals
- Simple drawing primitives

**Defer if not completed by target date.**

## Constraints

- Must not bloat core runtime.
- Must not be required for basic front.js usage.
- Documented as "labs" with no stability guarantee before v0.1.0.
- All exports namespaced under `unstable/*` path.

## Package Structure

```
packages/labs/
├── src/
│   ├── index.js              # Re-exports with deprecation warnings
│   ├── unstable/
│   │   ├── shaders.js        # WebGL shader helpers
│   │   ├── raf.js            # Animation frame helpers
│   │   └── canvas.js         # Canvas 2D helpers (stretch)
├── package.json
└── README.md
```

## Documentation

Create `website/docs/guides/labs.md` with:
- What is Labs
- Experimental/unstable warning
- Installation instructions
- Examples for each module
- Integration patterns with islands
- When to use vs alternatives

## Testing Strategy

- Smoke tests only (package loads, exports exist)
- Shader initialization test (mock WebGL context)
- Animation frame registration/cleanup test
- No comprehensive testing until promoted to stable

## Success Criteria

- [ ] @frontjs/labs package created and publishable
- [ ] Shader helper implemented and documented
- [ ] Animation frame helper implemented and documented
- [ ] All exports under `unstable/*` namespace
- [ ] README warns about experimental status
- [ ] At least one working example in examples/shader-island/
- [ ] Package size <5KB total
