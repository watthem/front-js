# Product Vision: The "Glue" Layer of the Future Web

**Status:** Living Document  
**Last Updated:** December 2025

---

## 1. The Core Thesis

The era of "Everything is a Single Page App" is ending. The future is **Server-Driven UIs** (HTMX, Rails, Laravel, Astro) where the browser is just a runtime for hyper-local interactivity.

**front.js** exists to be the **standard glue layer** for this new era. It is the "jQuery for the 2020s"—not because it manipulates the DOM like jQuery, but because it is the default tool you reach for when you just need "a little bit of interactivity" without a build step.

---

## 2. The Trajectory (3 Months → 1 Year → 3 Years)

### Phase 1: The "Better Vanilla" (3 Months)

- **Goal:** Be the obvious choice for developers who "hate frameworks" but need state management.
- **Target User:** Rails/Django/Go developers, junior devs overwhelmed by React, and security-conscious teams.
- **Success Metric:** 50+ GitHub stars, 3 production usages in the wild.
- **Key Deliverable:** Flawless documentation, "Copy-Paste" examples, and zero bugs in the `val/run/calc` engine.

### Phase 2: The "HTMX Companion" (1 Year)

- **Goal:** Become the de-facto scripting partner for HTMX and Server-Driven apps.
- **The Narrative:** "HTMX handles the server round-trip; `front.js` handles the instant feedback."
- **Integration:** Explicit plugins or patterns for `hx-on` cleanup, ensuring `front.js` islands survive or hydrate elegantly during HTML swaps.
- **Key Deliverable:** A robust "HTMX + front.js" starter kit or demo (e.g., a Trello clone).

### Phase 3: The "Standard Polyfill" (3 Years)

- **Goal:** Fade into the platform.
- **The Strategy:** As the **TC39 Signals Proposal** moves toward standardization, `front.js` becomes a tiny wrapper around native browser signals.
- **The End Game:** We prove that `val/run/calc` is the superior DX over `Signal.State`. We influence the platform or become the thinnest possible abstraction over it.

---

## 3. Ecosystem Positioning

### Does it play well with React?

**Yes, as a "Containment Strategy."**

- **The Use Case:** A legacy React app that is too slow. Teams can migrate leaf nodes (static parts) to server-rendered HTML and hydrate the remaining interactive bits with `front.js`.
- **The Vibe:** We are not "React Killers." We are "React Methadone." We help teams wean off the complexity of full-page hydration.

### Does it play well with HTMX?

**Yes, this is the "Power Couple."**

- **The Gap:** HTMX is great at coarse-grained updates (replace the list). It is bad at fine-grained updates (update the character counter as I type).
- **The Solution:** `front.js` fills that exact gap. It handles the 100ms interactions that don't need a server round-trip.

### Is it Ignored?

**By the "Vercel Industrial Complex"? Yes.**

- We will not be adopted by people building "Next.js AI Wrappers." That is fine.
- We _will_ be adopted by the "Indie Web," the "No Build" movement, and enterprise internal tool builders who prioritize stability and security over hype.

---

## 4. The "Zero" Compromises (Internal Guardrails)

To achieve this vision, we must strictly enforce these constraints. If we break these, we become "just another framework."

1.  **Zero Build Steps:** If a feature requires a CLI to work, we reject it.
2.  **Zero Transpilation:** No JSX. No TS-only features. It must run in Chrome console.
3.  **Zero Magic Imports:** No auto-discovery. Explicit `register()` keeps us honest and secure.
4.  **Zero Runtime Deps:** We strictly control our supply chain.

---

## 5. Success Looks Like...

A developer writes a Django app. They need a complex dynamic form. They don't install Node.js. They don't set up Webpack. They drop a `<script>` tag, write 30 lines of `front.js`, and it works. securely. forever.
