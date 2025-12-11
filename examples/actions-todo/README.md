# Todo App with @frontjs/actions

> **Status:** Placeholder for v0.0.3

This example will demonstrate:

- Full CRUD todo application
- Type-safe server communication with `@frontjs/actions`
- Schema validation with Valibot
- Integration of Actions with Islands Architecture
- Loading states and error handling

## How to run

```bash
# Install dependencies
npm install

# Start server (TODO: specify server framework - Bun, Node, etc.)
npm start

# Open browser to http://localhost:3000
```

## Files

- `server.js` - Server-side router with action handlers
- `shared/schema.js` - Shared action schemas (Valibot)
- `public/index.html` - Server-rendered page
- `public/app.js` - Client-side islands and actions client

## Concepts Demonstrated

- Defining action schemas with Standard Schema (Valibot)
- Creating server router with `createRouter()`
- Creating client with `createClient()`
- Type-safe action calls from islands
- Reactive state updates from server responses
- Validation error handling
- Loading states

---

**TODO for v0.0.3:** Implement complete working example
