# @frontjs/actions Documentation Plan – v0.0.3

## Current State

- Actions has API reference + README.
- Missing conceptual "why/when" docs and framework recipes.
- Integration examples only mention Actions briefly.

## v0.0.3 Deliverables

- New guide: `website/docs/guides/actions.md`
- References from:
  - Quick Start
  - Integrations guide
  - FAQ

## Outline for Actions Guide

1. **What is @frontjs/actions?**
   - High-level concept: type-safe RPC/command layer
   - Relationship to Islands Architecture
   - Comparison to direct fetch() calls

2. **Zero-Trust Communication Model**
   - Security model: validation at the boundary
   - How it extends core's zero-trust principles
   - Standard Schema as the validation layer

3. **Defining Standard Schema Maps**
   - Using Valibot (primary example)
   - Using Zod (alternative example)
   - Using ArkType (mention)
   - Organizing shared schema files

4. **Server Router Patterns**
   - `createRouter()` API
   - Handler functions and context
   - Error handling strategies
   - Validation failures
   - Framework integration (Next.js, Node, Bun, Cloudflare Workers)

5. **Client Usage Patterns**
   - `createClient()` API
   - Type-safe `send()` calls
   - Error handling on client
   - Retries and loading states
   - Integration with reactive values (val/run)

6. **Integrating with Islands (front.js core)**
   - Using Actions inside island components
   - Reactive state updates from Actions
   - Loading states and error UI
   - Complete example: Todo component with Actions

7. **When NOT to Use Actions**
   - Streaming HTML responses (use direct fetch + HTMX)
   - File uploads (use FormData directly)
   - WebSocket/SSE real-time (different pattern)
   - Simple GET requests (use fetch directly)

8. **Advanced Topics**
   - Authentication context
   - Rate limiting
   - Batching requests
   - Testing action handlers

## Examples to Include

- **Simple example**: Counter with increment action
- **Real-world example**: Todo CRUD with validation
- **Framework integration**: Next.js App Router handler
- **Error handling**: Validation failure + retry logic

## Cross-References

Update these existing docs to mention Actions:
- `website/docs/guides/quick-start.md` - Add Actions as optional step
- `website/docs/guides/integrations.md` - Mention Actions for HTMX backends
- `website/docs/FAQ.md` - Add Q&A about Actions vs fetch

## Success Criteria

- [ ] Actions guide is comprehensive but concise (<3000 words)
- [ ] At least 2 complete working examples
- [ ] Framework integration examples for Next.js and Bun
- [ ] Clear guidance on when to use vs not use Actions
- [ ] All code examples are runnable (or clearly marked as pseudocode)
