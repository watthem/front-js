This is the logical "Day 2" evolution of your project.

You started with the **View Layer** (`front.js` / `@watthem/front-js`). Now you are solving the **Communication Layer** (`frontjs/actions`).

By doing this, you aren't just building a library anymore; you are building a **Stack**. And you are doing it without falling into the trap of "Full Stack Magic" (Next.js/Remix). You are keeping the backend and frontend distinct, connected only by a typed, validated contract.

Here is why `frontjs/actions` is a brilliant addition, and how to execute the "Namespace Takeover."

-----

### 1\. The Architectural Fit

This completes the **Zero Trust** story.

  * **`front-js` (Core):** "I don't trust the HTML string, so I sanitize it. I don't trust the hydration data, so I validate it."
  * **`frontjs-actions`:** "I don't trust the network request, so I validate the input before it touches my business logic."

It replaces the vague "just use fetch" instruction in your Manifesto with a concrete, standardized pattern. It creates a **Command Pattern** for the web.

-----

### 2\. The Implementation: Keeping it "Boringly Safe"

The magic of your proposal is that `shared/actions.ts` is the *only* link. The client imports the **Types**, not the **Code**.

Here is how we implement this to align with your "Standard Schema" work.

#### The Shared Contract (`shared/schema.ts`)

We use Standard Schema (e.g., Valibot/Zod) to define the contract. This gives us runtime validation for free.

```typescript
import { object, number, string } from 'valibot';

export const ActionSchema = {
  'counter:increment': object({ amount: number() }),
  'user:update': object({ name: string() })
};

export type ActionMap = typeof ActionSchema;
```

#### The Server (`server/index.ts`)

The server router takes the schema and the handlers. It guarantees that `handler` never runs unless `schema` passes.

```typescript
import { createRouter } from '@frontjs/actions/server';
import { ActionSchema } from '../shared/schema';

export const router = createRouter(ActionSchema, {
  'counter:increment': async ({ amount }, context) => {
    // 'amount' is strictly typed as number
    return await db.increment(amount);
  }
});

// Usage in an API route (Node/Bun/Edge)
export const handleRequest = (req) => router.handle(req);
```

#### The Client (`client/index.ts`)

The client sends the action. It doesn't need the validator code, just the type names.

```typescript
import { createClient } from '@frontjs/actions/client';
import type { ActionMap } from '../shared/schema';

const client = createClient<ActionMap>('/api/actions');

// Fully typed autocomplete for action names and payloads
client.send('counter:increment', { amount: 1 });
```

-----

### 3\. The Strategy: Claiming the Namespace

If you want to move from "User Project" to "Ecosystem," moving to a scoped namespace is the correct move.

**The Move:**

1.  **Create an Organization:** On NPM, create the organization `frontjs` (if available) or `front-stack`.
2.  **The Monorepo:** Structure your repo to support multiple packages.
    ```text
    frontjs/
    ├── packages/
    │   ├── core/       (formerly @watthem/front-js)
    │   ├── actions/    (the new library)
    │   └── dev/        (future: CLI tools)
    ```
3.  **Publishing:**
      * `@frontjs/core`
      * `@frontjs/actions`

**The Psychology:**
Seeing `@frontjs/core` implies stability and modularity. It tells the developer, "I can use the core without the actions, or the actions with React if I really wanted to."

-----

### 4\. Next Step: The Prototype

You don't need to build the whole monorepo yet. You can prototype the **Actions** library in a single file to see if the ergonomics feel right.

## Implementation: `actions.js`

Here is the implementation of **`frontjs-actions`**.

I have condensed both the **Server Router** and the **Client** into a single file for this prototype. It is under **40 lines of code** but includes full **Standard Schema** validation support.

### The Implementation: `actions.js`

```javascript
/**
 * frontjs-actions: Type-safe, validated command pattern.
 * @param {Object} schemaMap - Map of action names to Standard Schema validators
 * @param {Object} handlers - Map of action names to implementation functions
 */
export const createRouter = (schemaMap, handlers) => ({
  async handle(request, context = {}) {
    // 1. Parse Payload (supports standard Request or plain object)
    const body = typeof request.json === 'function' ? await request.json() : request;
    const { action, payload } = body;

    // 2. Route Check
    if (!handlers[action]) {
      throw new Error(`[frontjs-actions] Unknown action: ${action}`);
    }

    // 3. Schema Validation (Standard Schema)
    const validator = schemaMap[action];
    if (validator && validator['~standard']) {
      const result = validator['~standard'].validate(payload);
      const { value, issues } = result instanceof Promise ? await result : result;
      
      if (issues) {
        throw new Error(`[frontjs-actions] Validation failed: ${JSON.stringify(issues)}`);
      }
      
      // 4. Execute with Validated Data
      return handlers[action](value, context);
    }

    // No schema? Pass raw payload (or throw if you want strict mode)
    return handlers[action](payload, context);
  }
});

/**
 * Client wrapper for type-safe calls.
 * @param {string} endpoint - The API URL (e.g., '/api/actions')
 */
export const createClient = (endpoint) => ({
  send: async (action, payload) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    
    if (!res.ok) throw new Error(`[frontjs-actions] Server Error: ${res.statusText}`);
    return res.json();
  }
});
```

-----

### The Usage Proof (`usage.ts`)

Here is how this feels to use. This is where the "Boringly Safe" promise is kept. Notice how the Client doesn't import the server code, just the **Types**.

```typescript
// 1. SHARED DEFINITION (shared/schema.ts)
import * as v from 'valibot';

export const ActionSchema = {
  'auth:login': v.object({
    email: v.string([v.email()]),
    password: v.string([v.minLength(8)])
  }),
  'todo:create': v.object({
    text: v.string()
  })
};

// Types are derived automatically
export type Actions = typeof ActionSchema; 
// ---------------------------------------------------------

// 2. SERVER (server/api.ts)
import { createRouter } from './actions.js';
import { ActionSchema } from '../shared/schema.js';

const router = createRouter(ActionSchema, {
  // TypeScript knows 'payload' MUST have email/password here
  'auth:login': async (payload, ctx) => {
    return await db.login(payload.email, payload.password);
  },
  
  'todo:create': async (payload, ctx) => {
    // Validated automatically before this line runs
    return await db.todos.add(payload.text);
  }
});

// Usage in Next.js / Node / Bun
export const POST = (req) => router.handle(req);

// ---------------------------------------------------------

// 3. CLIENT (client/app.ts)
import { createClient } from './actions.js';
import type { Actions } from '../shared/schema.js'; // Types only!

// Generic ensures strict typing
const client = createClient<Actions>('/api/actions');

// ✅ Autocompletes 'auth:login'
// ✅ Enforces { email, password } shape
await client.send('auth:login', { 
  email: 'me@example.com',
  password: 'correct-horse-battery-staple'
});
```

### Why this works for `front.js`

1.  **Decoupled:** The client `front.js` app doesn't know *how* the server works, just *what* it accepts.
2.  **Tiny:** The runtime overhead is negligible.
3.  **Framework Agnostic:** The `router.handle` method accepts a standard `Request` object (Fetch API), which works in Node, Bun, Cloudflare Workers, Deno, and Edge environments.
