# @frontjs/actions

**Type-safe command/RPC layer with Standard Schema validation.**

[![NPM Version](https://img.shields.io/npm/v/@frontjs/actions.svg)](https://www.npmjs.com/package/@frontjs/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Part of the [frontjs](https://frontjs.dev) ecosystem.

## Install

```bash
npm install @frontjs/actions valibot
```

> **Note:** This package requires a Standard Schema compliant validator like [Valibot](https://valibot.dev), [Zod](https://zod.dev), or [ArkType](https://arktype.io).

## Quick Start

### 1. Define Your Actions (Shared)

```typescript
// shared/schema.ts
import * as v from 'valibot';

export const ActionSchema = {
  'todo:create': v.object({
    text: v.string([v.minLength(1)])
  }),
  'todo:delete': v.object({
    id: v.string()
  })
};

export type Actions = typeof ActionSchema;
```

### 2. Server (Create Router)

```typescript
// server/api.ts
import { createRouter } from '@frontjs/actions/server';
import { ActionSchema } from '../shared/schema.js';

const router = createRouter(ActionSchema, {
  'todo:create': async (payload, ctx) => {
    // payload.text is validated and typed
    return await db.todos.add(payload.text);
  },
  'todo:delete': async (payload, ctx) => {
    return await db.todos.delete(payload.id);
  }
});

// Works with any framework (Next.js, Node, Bun, Cloudflare Workers)
export const POST = (req) => router.handle(req);
```

### 3. Client (Type-Safe Calls)

```typescript
// client/app.ts
import { createClient } from '@frontjs/actions/client';
import type { Actions } from '../shared/schema.js';

const client = createClient<Actions>('/api/actions');

// ✅ Fully typed - autocomplete for action names and payloads
await client.send('todo:create', { text: 'Buy milk' });
```

## Features

- **Zero Trust:** All payloads validated before reaching handlers
- **Standard Schema:** Works with Valibot, Zod, or ArkType
- **Type-Safe:** Full TypeScript support with type inference
- **Tiny:** Minimal runtime overhead
- **Framework Agnostic:** Works anywhere (Node, Bun, Edge, Cloudflare Workers)

## API

### Server

```typescript
createRouter(schemaMap, handlers) => Router
```

- **schemaMap:** Map of action names to Standard Schema validators
- **handlers:** Map of action names to handler functions
- Returns router with `handle(request, context?)` method

### Client

```typescript
createClient<T>(endpoint) => Client<T>
```

- **endpoint:** API endpoint URL (e.g., '/api/actions')
- Returns client with `send(action, payload)` method

## Documentation

See the [main repository](../../README.md) for complete documentation and integration guides.

## Part of the frontjs Ecosystem

- [@frontjs/core](https://npmjs.com/package/@frontjs/core) - Islands Architecture runtime
- [@frontjs/actions](https://npmjs.com/package/@frontjs/actions) - This package

## License

ISC
