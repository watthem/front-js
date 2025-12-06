# front.js Repository Context

This repository contains the source code and documentation for **front.js**, a <5KB secure-by-default JavaScript micro-framework enforcing Islands Architecture.

## Key Concepts

- **Islands Architecture**: Server renders HTML, client hydrates only interactive components
- **Zero-Trust Hydration**: Data flows via JSON only, no eval, no innerHTML
- **Fine-Grained Reactivity**: val/run/calc primitives with automatic dependency tracking
- **Platform First**: Uses native ESM, tagged templates, no build required
- **Security First**: XSS protection via uhtml, strict component validation

## Repository Structure

```
front-js/
├── src/              # Core framework code (reactivity, components, client hydration)
├── tests/            # Comprehensive test suite
├── examples/         # Working examples (Todo app, GM Board)
├── docs/             # Technical documentation (BLUEPRINT, ENGINE, DESIGN)
├── wiki/             # Shared knowledge (API, FAQ, PRD, STANDARDS, TRANSLATIONS)
└── community/        # User feedback and tribal knowledge
```

## When analyzing this codebase:

1. **Security is paramount** - Look for eval, innerHTML, or function string conversion
2. **Size matters** - Runtime must stay <5KB (excluding uhtml peer dependency)
3. **Headless reactivity** - core/reactivity.js must never import DOM APIs
4. **Standard Schema** - Validation should accept any Standard Schema compliant validator
5. **Zero magic** - No auto-importing, explicit registration only
