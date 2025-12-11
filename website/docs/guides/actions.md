# @frontjs/actions Guide

> **Status:** Draft for v0.0.3  
> **Audience:** Application developers using Front.js with a backend.

## 1. What is @frontjs/actions?

<!-- TODO: Explain high-level concept here -->
<!-- Type-safe RPC/command layer for client-server communication -->
<!-- Built on Standard Schema for validation -->
<!-- Zero-Trust extension of core framework -->

## 2. When should I use it?

<!-- TODO: "Use for commands / RPC, not for streaming HTML" -->
<!-- When you need type-safe server communication -->
<!-- When you want validation at the boundary -->
<!-- Alternative to direct fetch() for structured commands -->

## 3. Defining Action Schemas

<!-- TODO: Valibot / Zod / ArkType examples -->
<!-- Shared schema pattern -->
<!-- Type inference from schemas -->

```javascript
// Example placeholder
import * as v from 'valibot';

export const ActionSchema = {
  'todo:create': v.object({
    text: v.string([v.minLength(1)])
  }),
  'todo:delete': v.object({
    id: v.string()
  })
};
```

## 4. Server Setup

<!-- TODO: createRouter, error handling, context -->
<!-- Framework integration examples -->

```javascript
// Example placeholder
import { createRouter } from '@frontjs/actions/server';
```

## 5. Client Usage

<!-- TODO: createClient, typed send, retries, etc. -->
<!-- Integration with val/run for reactive updates -->

```javascript
// Example placeholder
import { createClient } from '@frontjs/actions/client';
```

## 6. Integrating with Islands

<!-- TODO: Using Actions inside island components -->
<!-- Reactive state updates -->
<!-- Loading states and error UI -->
<!-- Complete example: Todo component -->

## 7. Framework Integrations

### Next.js

<!-- TODO: App Router handler example -->

### Bun

<!-- TODO: Bun server example -->

### Node/Express

<!-- TODO: Express middleware example -->

### HTMX Backend

<!-- TODO: How Actions work with HTMX frontend -->

## 8. When NOT to Use Actions

<!-- TODO: Streaming HTML responses (use direct fetch + HTMX) -->
<!-- File uploads (use FormData directly) -->
<!-- WebSocket/SSE real-time (different pattern) -->
<!-- Simple GET requests (use fetch directly) -->

## 9. Security Model

<!-- TODO: Zero-Trust explanation -->
<!-- Validation at the boundary -->
<!-- Standard Schema as security layer -->
<!-- How it extends core's security principles -->

## 10. Error Handling

<!-- TODO: Validation errors -->
<!-- Network errors -->
<!-- Server errors -->
<!-- Retry strategies -->

## 11. Advanced Topics

<!-- TODO: Authentication context -->
<!-- Rate limiting -->
<!-- Batching requests -->
<!-- Testing action handlers -->

---

**See also:**
- [API Reference: createClient](../api/actions/createClient.md)
- [API Reference: createRouter](../api/actions/createRouter.md)
- [Quick Start Guide](./quick-start.md)
- [Integrations Guide](./integrations.md)
