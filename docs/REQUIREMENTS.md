# front.js – Design & Architecture Requirements Checklist

## 1. Core Philosophy (Non-Negotiables)

- [ ] front.js must **not deserialize executable intent from client input**
- [ ] front.js must treat **all client-supplied data as inert**
- [ ] front.js must not rely on “magic” serialization formats that encode behavior
- [ ] front.js must prefer **explicit constraints over convenience**
- [ ] Limitations must be documented as **features**, not omissions
- [x] front.js must **not deserialize executable intent from client input** — (uses `JSON.parse` for `data-props`, no exec deserialization)
- [x] front.js must treat **all client-supplied data as inert** — (props parsed as plain JSON; framework does not execute values)
- [x] front.js must not rely on “magic” serialization formats that encode behavior — (no custom serialization protocols in core)
- [x] front.js must prefer **explicit constraints over convenience** — (component name validation, optional schema validators)
- [x] Limitations must be documented as **features**, not omissions — (see `docs/LIMITATIONS.md`, `community/LIMITATIONS-SUMMARY.md`)

---

## 2. Security Boundary Requirements

### Client → Framework Boundary

- [ ] Only **plain JSON** may cross the boundary (`data-props`)
- [ ] No functions, closures, symbols, promises, or class instances allowed in props
- [ ] No shape-based behavior (e.g. `then`, `constructor`, prototype tricks)
- [ ] No dynamic dispatch derived from client-provided keys
- [ ] No Promise/thenable assimilation anywhere in framework internals
- [ ] No `eval`, `new Function`, or string-based execution
- [x] Only **plain JSON** may cross the boundary (`data-props`) — (`hydrate()` uses `JSON.parse` only)
- [x] No functions, closures, symbols, promises, or class instances allowed in props — (props are plain JSON)
- [x] No shape-based behavior (e.g. `then`, `constructor`, prototype tricks) — (core does not interpret shapes as behavior)
- [x] No dynamic dispatch derived from client-provided keys — (framework does not perform dispatch; components receive props but framework doesn't call functions from props)
- [x] No Promise/thenable assimilation anywhere in framework internals — (`run()` treats Promise returns as warnings; no assimilation)
- [x] No `eval`, `new Function`, or string-based execution — (no occurrences in core)

### Server-Side Guarantees

- [ ] front.js core must **not expose server actions / RPC / Flight-style endpoints**
- [ ] front.js must not encourage or assume server execution hooks
- [ ] Any “actions” layer must remain **opt-in and explicit**
- [ ] Security model must clearly state what front.js **does not protect against**
- [ ] CSP, CSRF, auth, business logic remain server responsibilities
- [x] front.js core must **not expose server actions / RPC / Flight-style endpoints** — (core `src/` contains no server RPC surface)
- [x] front.js must not encourage or assume server execution hooks — (core is client-side hydration-focused)
- [x] Any “actions” layer must remain **opt-in and explicit** — (`packages/actions` exists as an opt-in package)
- [x] Security model must clearly state what front.js **does not protect against** — (`docs/Security-Model.md` created; explicitly documents CSRF, auth, CSP, business logic as server responsibilities)
- [x] CSP, CSRF, auth, business logic remain server responsibilities — (documented expectation; see `community/LIMITATIONS-SUMMARY.md`)

---

## 3. React2Shell / RSC-Class Vulnerability Avoidance

- [ ] No protocol that serializes “intent” across trust boundaries
- [ ] No framework-level deserialization into live executable objects
- [ ] No implicit interpretation of object structure as behavior
- [ ] No server-side decoding of “what to run” from client payloads
- [ ] Framework must remain safe even under **cleverly shaped JSON input**
- [x] No protocol that serializes “intent” across trust boundaries — (core uses plain JSON)
- [x] No framework-level deserialization into live executable objects — (no eval/Function usage)
- [x] No implicit interpretation of object structure as behavior — (core treats props as inert)
- [x] No server-side decoding of “what to run” from client payloads — (core does not implement server-side execution)
- [~] Framework must remain safe even under **cleverly shaped JSON input** — (largely true; component name validation and schema hooks help, but add Security Model docs and more tests for adversarial shapes)

---

## 4. Islands Architecture Requirements

- [ ] Hydration only applies to **explicit islands** (`data-island`)
- [ ] Components must be **explicitly registered**
- [ ] Props are **initialization-only**, not reactive
- [ ] No implicit parent/child component trees
- [ ] Cross-island communication requires:
  - [ ] shared module state, or
  - [ ] DOM events, or
  - [ ] user-authored logic

- [ ] Islands must fail **locally and gracefully**
- [x] Hydration only applies to **explicit islands** (`data-island`) — (`hydrate()` queries `[data-island]`)
- [x] Components must be **explicitly registered** — (`register(name, componentFn, options)`)
- [x] Props are **initialization-only**, not reactive — (props are parsed once and passed to componentFn)
- [x] No implicit parent/child component trees — (framework does not build implicit tree relationships)
- [x] Cross-island communication requires:
- [~] Islands must fail **locally and gracefully** — (render errors are caught and a fallback is shown; cleanup via `container._front_dispose` exists but is currently left to integrators to call — consider auto-cleanup)

---

## 5. Reactivity System Requirements (frontjs-core)

- [ ] Reactivity must be **DOM-agnostic**
- [ ] Core primitives:
  - [ ] `val()` – explicit, fine-grained reactive state
  - [ ] `run()` – tracked effects with cleanup
  - [ ] `calc()` – derived/computed values

- [ ] Dependency tracking must be explicit and predictable
- [ ] In-place mutation should be discouraged or documented clearly
- [ ] Async behavior must not silently alter tracking semantics
- [ ] Cleanup must occur when an island is removed or replaced
- [x] Reactivity must be **DOM-agnostic** — (`src/core/reactivity.js` has no DOM references)

- [x] `val()` – explicit, fine-grained reactive state
- [x] `run()` – tracked effects with cleanup
- [x] `calc()` – derived/computed values
- [x] Dependency tracking must be explicit and predictable
- [~] In-place mutation should be discouraged or documented clearly — (code avoids implicit mutation but this could use explicit docs)
- [x] Async behavior must not silently alter tracking semantics — (`run()` warns on Promise returns)
- [~] Cleanup must occur when an island is removed or replaced — (dispose function attached to `container._front_dispose` exists, but automatic invocation on DOM removal is currently integrator-responsibility)

---

## 6. Renderer Abstraction Requirements

- [ ] Rendering layer must be **replaceable**
- [ ] uhtml v4 is acceptable as default renderer (for now)
- [ ] Renderer must be wrapped behind an internal abstraction:
  - [ ] `html()` for templating
  - [ ] `render(container, template)`

- [ ] Core runtime must not depend on renderer internals
- [ ] Ability to swap renderer without breaking public API
- [ ] Renderer must escape values by default (XSS-safe)
- [x] Rendering layer must be **replaceable** — (`packages/core/src/core/renderer.js` wrapper created; core no longer depends on uhtml directly)
- [x] uhtml v4 is acceptable as default renderer (for now) — (used via renderer wrapper)
- [x] Renderer must be wrapped behind an internal abstraction:
  - [x] `html()` for templating
  - [x] `render(container, template)`

- [x] Core runtime must not depend on renderer internals — (imports from `./core/renderer.js` wrapper, not uhtml directly)
- [x] Ability to swap renderer without breaking public API — (renderer wrapper enables swapping; all tests pass unchanged)
- [x] Renderer must escape values by default (XSS-safe) — (uhtml provides escaping by default)

---

## 7. API Stability & Public Surface

- [ ] Core public API remains small:
  - [ ] `html`
  - [ ] `val`
  - [ ] `run`
  - [ ] `calc`
  - [ ] `register`
  - [ ] `hydrate`

- [ ] No hidden behaviors behind imports
- [ ] No framework-controlled global state unless documented
- [ ] Future changes must preserve security guarantees first, DX second
- [x] Core public API remains small: (`src/index.js` exports `val`, `run`, `calc`, `defineComponent`, `register`, `hydrate`, plus re-export of `html`/`render` from renderer wrapper)
- [x] No hidden behaviors behind imports — (core is explicit; renderer abstraction hides uhtml internals)
- [x] No framework-controlled global state unless documented — (registry is module-scoped)
- [x] Future changes must preserve security guarantees first, DX second — (principle followed in code)

---

## 8. frontjs-actions (Optional Companion Layer)

- [ ] Actions must be **separate from core**
- [ ] Actions must not reintroduce:
  - [ ] server execution surfaces
  - [ ] intent serialization
  - [ ] implicit control flow

- [ ] All “intent handling” must be explicit user-authored code
- [ ] Actions should operate on:
  - [ ] DOM events
  - [ ] fetch calls
  - [ ] local reactive state

- [ ] Actions must degrade safely if misused
- [x] Actions must be **separate from core** — (`packages/actions`)
- [~] Actions must not reintroduce:
  - [x] server execution surfaces — (actions package provides a server handler but it's explicit and in a separate package)
  - [x] intent serialization — (actions use JSON payloads and validators)
  - [x] implicit control flow — (action handlers are user-provided)

- [x] All “intent handling” must be explicit user-authored code — (handlers and validators are passed in)
- [x] Actions must degrade safely if misused — (validation and explicit errors in `packages/actions`)

---

## 9. Ecosystem / Naming Constraints

- [ ] Avoid claiming “stack” prematurely
- [ ] Prefer:
  - [ ] “front.js core”
  - [ ] “front.js actions”
  - [ ] “front.js ecosystem”

- [ ] Do not imply full SPA coverage
- [ ] Do not compete with routers, data frameworks, or server frameworks by default
- [x] Avoid claiming “stack” prematurely
- [x] Prefer:
  - [x] “front.js core”
  - [x] “front.js actions”
  - [x] “front.js ecosystem”

- [x] Do not imply full SPA coverage
- [x] Do not compete with routers, data frameworks, or server frameworks by default

---

## 10. Documentation & Trust Requirements

- [ ] Maintain a visible **Limitations** document
- [ ] Maintain a **Security Model** document
- [ ] Explicitly state:
  - [ ] what front.js does
  - [ ] what it refuses to do
  - [ ] what risks it avoids
  - [ ] what risks remain

- [ ] Be honest about alpha / experimental status
- [ ] Encourage informed usage, not blanket adoption
- [x] Maintain a visible **Limitations** document — (`docs/LIMITATIONS.md`, community summaries)
- [x] Maintain a **Security Model** document — (`docs/Security-Model.md` created with 12 comprehensive sections)
- [x] Explicitly state:
  - [x] what front.js does
  - [x] what it refuses to do — (Security Model section 3: what front.js protects; section 4: what it does NOT protect)
  - [x] what risks it avoids
  - [x] what risks remain — (Security Model sections 8-10: limitations, comparisons, incident response)

- [x] Be honest about alpha / experimental status
- [x] Encourage informed usage, not blanket adoption

---

## 11. Size & Performance Constraints

- [ ] Core runtime must remain ≤ ~1–2KB gzipped
- [ ] Core + renderer must remain ≤ ~5KB gzipped
- [ ] No build step required for users
- [ ] ES Modules-first, platform-native approach
- [ ] No optimization that compromises clarity or security
- [ ] Core runtime must remain ≤ ~1–2KB gzipped — (UNKNOWN; recommend adding a size-measure script and CI check)
- [ ] Core + renderer must remain ≤ ~5KB gzipped — (UNKNOWN; measurement required)
- [x] No build step required for users — (ESM-first source available)
- [x] ES Modules-first, platform-native approach
- [~] No optimization that compromises clarity or security — (principle followed; track in contributor docs)

---

## 12. Future-Proofing Principles

- [ ] Any new feature must pass:
  - “Does this enlarge the attack surface?”
  - “Does this add hidden semantics to data?”

- [ ] Prefer removing features over adding flags
- [ ] Swappability > cleverness
- [ ] Stability > hype
- [ ] Predictability > power
- [x] Any new feature must pass:
  - “Does this enlarge the attack surface?”
  - “Does this add hidden semantics to data?”

- [x] Prefer removing features over adding flags
- [x] Swappability > cleverness
- [x] Stability > hype
- [x] Predictability > power

---

### Summary Principle (If You Had to Reduce This to One Line)

> **front.js exists to make hydration boring, predictable, and safe — and refuses anything that makes it clever.**

---

**Notes & Next Actions**

- Files confirming implementation: `src/core/reactivity.js`, `src/core/component.js`, `src/core/client.js`, `src/index.js`.
- Missing / recommended additions:
  - `docs/Security-Model.md` (create to explicitly list non-protections and server responsibilities).
  - Renderer wrapper (`src/core/renderer.js`) to make renderer swappable and avoid direct re-export of `uhtml`.
  - Auto-cleanup behavior (call `container._front_dispose()` on re-init or detect DOM removals via MutationObserver).
  - Size measurement script and CI check to validate gzipped size targets.

If you want, I can implement the renderer wrapper and auto-cleanup next, and add a draft `docs/Security-Model.md`.
