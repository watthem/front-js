# Contributing to front.js

We welcome contributions! Please read the [Blueprint](./docs/BLUEPRINT.md) and [Standards](./wiki/STANDARDS.md) before submitting code to ensure you align with our architecture.

## Core Philosophy

1. **Zero Magic:** If it can be done with a standard Web API, use the API.
2. **Security First:** Never compromise on the "No Eval" rule.
3. **Size Matters:** The core runtime must stay under 5KB (minified + gzipped).
4. **HTML is Truth:** Server renders HTML, client hydrates islands.
5. **Platform First:** Use native browser APIs whenever possible.

## Development Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/front-js.git
   cd front-js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run examples:**
   ```bash
   npx serve .
   # Navigate to http://localhost:3000/examples/index.html
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Check bundle size:**
   ```bash
   npm run size-check
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. **Read the docs first:**
   - [`docs/BLUEPRINT.md`](./docs/BLUEPRINT.md) - Architecture overview
   - [`wiki/STANDARDS.md`](./wiki/STANDARDS.md) - Coding standards
   - [`wiki/PRD.md`](./wiki/PRD.md) - Product requirements

2. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make your changes:**
   - Follow existing code style
   - Add JSDoc comments for public APIs
   - Update documentation if needed

4. **Test your changes:**
   - Run `npm test` to ensure tests pass
   - Test manually with examples
   - Verify bundle size with `npm run size-check`

5. **Format code:**
   ```bash
   npm run format
   ```

6. **Submit a PR:**
   - Include description of changes
   - Reference any related issues
   - Ensure CI passes

## Code Standards

### File Structure

- `src/core/` - Core framework code
- `src/index.js` - Public API exports
- `examples/` - Example implementations
- `tests/` - Test files
- `docs/` - Documentation

### Code Style

- Use ES modules (`import`/`export`)
- Add JSDoc comments for all public APIs
- Use descriptive variable names
- Keep functions small and focused
- Handle errors gracefully

### Security Requirements

- **Never use `eval()` or `new Function()`**
- Validate all user input (component names, props)
- Use `JSON.parse()` only for props (never eval)
- Escape all user content (handled by uhtml)

### Size Budget

- Core runtime: <5KB minified + gzipped
- Check size with `npm run size-check` before PR
- If adding features, consider removing or optimizing existing code

## Testing

### Manual Testing

Test the Todo app example against these criteria:

1. ✅ Adding todos updates the list
2. ✅ Typing in input doesn't lose focus (proves uhtml diffing works)
3. ✅ Initial state from `data-props` loads correctly
4. ✅ XSS protection: `<script>alert(1)</script>` displays as text

### Automated Testing

```bash
npm test          # Run tests once
npm run test:watch # Watch mode
```

## Pull Request Guidelines

* **Follow the Blueprint:** Changes to the architecture must be discussed in `docs/BLUEPRINT.md` first.
* **Keep it Dependency-Free:** Do not add NPM dependencies to the runtime. `uhtml` is the only allowed exception (peer dependency).
* **Test Thoroughly:** Run tests and verify examples work.
* **Check Size:** Ensure bundle size stays under 5KB.
* **Update Docs:** Update wiki/API.md and README if adding/changing APIs.
* **Security Review:** All changes are reviewed for security implications.

## Architecture Decisions

Major architectural decisions should be:

1. Discussed in an issue first
2. Documented in `docs/BLUEPRINT.md`
3. Aligned with `wiki/STANDARDS.md`
4. Approved before implementation

## Questions?

- Open an issue for bugs or feature requests
- Check existing documentation first
- Review the Blueprint for architecture questions