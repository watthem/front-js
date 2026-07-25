# Audience & Content Strategy

The positioning decision (2026): front.js is an **educational reference
implementation and portfolio piece**, not a production framework. Every content
choice flows from that. This doc is the north star for what we write and why.

## Primary audiences

1. **The signals-curious app developer.** Ships React/Vue/Svelte; has never read
   an implementation of the reactivity they use daily. Wants the mental model.
   → Serve with: the reactivity walkthrough, small readable source, honest
   limitations. This is the core audience.
2. **The platform-first engineer.** Enjoys the browser and web standards
   directly (ESM, tagged templates, native events, new HTTP verbs). → Serve
   with: "Platform First" deep dives like the QUERY guide; link primary specs.
3. **The security-minded builder.** Wants the threat-model reasoning behind
   secure-by-default. → Serve with: the security guide and the "what it refuses
   to do" framing.
4. **The evaluator.** A hiring engineer or peer assessing the author. → Serve
   with: clean repo, code that reads well, docs that don't overclaim.

## What each audience needs from the site

- A **path**, not a pile: an ordered curriculum (see
  `website/docs/guides/README.md`), each step stating prerequisites.
- **Accuracy they can trust.** We teach standards and internals; a confident
  wrong claim is disqualifying. Every load-bearing fact is verified against a
  primary source (see the private fact-check vault) and linked inline.
- **Interactivity** where a concept is easier shown than told — dogfooded as
  front.js islands (a live signal graph; a real QUERY request over the wire).
- **Honesty about scope.** "Learn here, ship with Solid/Preact/Astro." Stating
  the limitation is part of the credibility.

## Content principles

- **Teach the idea, then the API** — not the reverse.
- **Show the source.** The repo is small on purpose; link into it.
- **Name the trade-off.** Every constraint has a cost; say it.
- **Cite primary sources.** RFCs, living standards, TC39, or our own code.
- **Dogfood.** Interactive demos are built with front.js itself.

## Not in scope (for now)

- Competing on features with production frameworks.
- Stability/versioning guarantees.
- The private fact-check vault and any personal blog/site integration — those
  stay out of the public repo. (A future pass will add outbound links to the
  author's site/blog once it exists.)
