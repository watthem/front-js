# SEO & Developer Experience Audit for @frontjs/core v0.0.1 (GitHub & NPM)

## Overview

front.js is a **secure‑by‑default micro‑framework** that hydrates islands of server‑rendered HTML. The library is new and the public site and GitHub repository form the primary touch points for search engines, developers and potential users. A comprehensive audit looked at the landing pages in the website/ directory, the package.json published to NPM, and the repository content to assess SEO, user‑experience and developer friendliness. This report summarises findings and provides actionable recommendations.

## SEO & Site‑Optimization Review

### Meta tags and Open Graph

The landing page (website/index.html) sets a \<title\> and a basic viewport meta tag, but **lacks critical SEO meta tags** like a descriptive \<meta name="description"\>, Open Graph tags for social sharing, canonical links and a robots directive. Only a bare‐bones HTML header exists [\[1\]](https://github.com/frontjs/core/blob/master/website/index.html#L3-L8). Similar deficiencies occur on the examples page and KB page. Absence of these tags makes it harder for search engines to understand and rank the site.

*Recommendations*

* **Description:** Add a concise meta description summarizing front.js and its benefits (≈ 150–160 characters). E.g.,

\<meta name="description" content="front.js is a secure‑by‑default micro‑framework (\<5 KB) for hydrating server‑rendered islands of HTML with fine‑grained reactivity."\>

* **Canonical URL:** For each page include a \<link rel="canonical" href="https://frontjs.dev/"\> tag pointing to the canonical version of the page. This prevents duplicate‑content issues if the site is hosted under different base paths (GitHub Pages, Cloudflare Pages, etc.).

* **Open Graph & Twitter cards:** Provide \<meta property="og:\*"\> and \<meta name="twitter:\*"\> tags with the page title, description, URL and preview image. This improves sharing on social platforms. Example:

\<meta property="og:title" content="front.js – Secure Islands Architecture"\>  
\<meta property="og:description" content="A \<5 KB micro‑framework for hydrating server‑rendered HTML with JSON‑only data flow."\>  
\<meta property="og:type" content="website"\>  
\<meta property="og:url" content="https://frontjs.dev/"\>  
\<meta property="og:image" content="https://frontjs.dev/assets/og-image.png"\>  
\<meta name="twitter:card" content="summary\_large\_image"\>  
\<meta name="twitter:site" content="@yourTwitterHandle"\>

* **Favicons & Manifest:** Include \<link rel="icon" href="/favicon.ico"\> and, if the project may become a PWA, add a manifest.json and \<link rel="manifest" ...\> to aid mobile bookmarking.

* **Language and regional targeting:** specify lang="en" (already present) and, if offering translations in future, add hreflang tags for each locale.

### Structured‑data markup (Schema.org)

Adding structured data helps search engines understand the project. The landing page should embed a JSON‑LD script describing the project as a software application. Example:

\<script type="application/ld+json"\>  
{  
  "@context": "https://schema.org",  
  "@type": "SoftwareApplication",  
  "name": "front.js",  
  "url": "https://frontjs.dev/",  
  "image": "https://frontjs.dev/assets/og-image.png",  
  "description": "front.js is a secure‑by‑default micro‑framework for hydrating server‑rendered islands of HTML.",  
  "softwareVersion": "0.0.1",  
  "license": "ISC",  
  "applicationCategory": "WebApplication",  
  "offers": {  
    "@type": "Offer",  
    "price": "0",  
    "priceCurrency": "USD"  
  },  
  "downloadUrl": "https://www.npmjs.com/package/@frontjs/core"  
}  
\</script\>

For the documentation pages (/KB/) you can use the **TechArticle** or **Article** type and a **BreadcrumbList** for navigation. Structured data helps Google display rich snippets and increases click‑through rates.

### Sitemap and robots.txt

No sitemap.xml or robots.txt file exists in the repository. Search engines may still discover pages, but a sitemap improves crawl efficiency and ensures all documentation pages are indexed. Generate a simple sitemap.xml listing the home page, examples, KB index, each example (Todo, Calculator, Pixel Art, GM Board, Walking Timer, NavBar, GitHub user search, etc.) and any KB articles. Example entry:

\<?xml version="1.0" encoding="UTF‑8"?\>  
\<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\>  
  \<url\>  
    \<loc\>https://frontjs.dev/\</loc\>  
    \<lastmod\>2025-12-06\</lastmod\>  
    \<priority\>1.0\</priority\>  
  \</url\>  
  \<url\>  
    \<loc\>https://frontjs.dev/examples/\</loc\>  
    \<lastmod\>2025-12-06\</lastmod\>  
    \<priority\>0.8\</priority\>  
  \</url\>  
  \<\!-- more entries \--\>  
\</urlset\>

The robots.txt file should specify the sitemap’s location and, if needed, block irrelevant paths (e.g., test fixtures):

User-agent: \*  
Disallow: /tests/  
Sitemap: https://frontjs.dev/sitemap.xml

### Core Web Vitals & Performance

Although we can’t run PageSpeed Insights from this environment, inspecting the code reveals several performance opportunities.

1. **Eliminate render‑blocking CSS and scripts:** Currently the stylesheet is loaded synchronously via \<link rel="stylesheet" href="styles.css"\>[\[1\]](https://github.com/frontjs/core/blob/master/website/index.html#L3-L8). If the CSS file is large, it can block rendering. Minify and compress CSS. Consider inlining critical CSS (above‑the‑fold styles) and loading the rest asynchronously via rel="preload" or rel="prefetch".

2. **Lazy‑load non‑critical images:** The landing page uses inline SVG icons and no external images, which is good. For future screenshots or hero images, add loading="lazy" and specify width and height attributes to avoid cumulative layout shift.

3. **Preconnect to CDN domains:** The framework loads **uhtml** from https://esm.sh at runtime[\[2\]](https://github.com/frontjs/core/blob/master/website/index.html#L327-L338). Preconnect to this domain and to NPM/JSDelivr if used:

\<link rel="preconnect" href="https://esm.sh" crossorigin\>  
\<link rel="dns-prefetch" href="https://esm.sh"\>

1. **Minimise JavaScript footprint:** front.js emphasises a \<5 KB runtime. Ensure the script served from front.esm.js is minified and that tree‑shaking is enabled. Add type="module" defer to the script tag so that it does not block HTML parsing:

\<script type="module" defer src="./app.js"\>\</script\>

1. **Reduce layout shifts:** Reserve space for dynamic elements (e.g., mobile menu) in the CSS so that toggling does not shift content. Provide explicit heights for the navbar and hero section.

2. **Use a CDN or Cloudflare caching for static assets:** The site currently times out when accessed via frontjs.dev[\[3\]](https://frontjs.dev/#:~:text=Connection%20timed%20out%20Error%20code,522). Deploying via GitHub Pages or Netlify with caching headers will improve latency.

### Accessibility & UX improvements

* **Broken links & base path:** The navigation component hard‑codes absolute paths like /examples/index.html[\[4\]](https://github.com/frontjs/core/blob/master/website/index.html#L15-L20) and /KB/[\[5\]](https://github.com/frontjs/core/blob/master/website/KB/index.html#L14-L19). If the site is hosted under a sub‑path (e.g., https://watthem.github.io/front-js/ on GitHub Pages), these links resolve to the root of the domain and break. **Use relative URLs** (examples/index.html, KB/) or compute the base path dynamically based on window.location. Alternatively, specify a \<base href="/front-js/"\> tag when deploying to GitHub Pages.

* **Active link detection:** NavBar.js computes currentPath.includes(link.url)[\[6\]](https://github.com/frontjs/core/blob/master/website/components/NavBar.js#L32-L37). This will highlight /examples/index.html when the path includes /examples, but it can misfire if the URL is a substring of another path. Compare full paths or use new URL(link.url, window.location.origin).pathname.

* **User friction points:** New visitors might “rage quit” if they cannot quickly see code in action. Provide **inline interactive demos** (e.g., embedded CodeSandbox or StackBlitz) for the counter, Todo list and other examples. Offer a **Playground** link so developers can experiment without installing anything.

* **Navigation & discovery:** The KB page lists features but there is no search or table of contents; users must manually click into individual markdown files. Add a sidebar with article links and a search box. Use hash‑based navigation for deep linking (the KB code already hints at this). Provide a “back to top” button.

* **Accessibility:** Add aria-label and role attributes to navigation buttons, ensure contrast ratio for text and backgrounds, and set aria-hidden="true" on decorative SVG icons. Provide skip navigation links.

* **Call‑to‑action clarity:** The landing page includes a “Get Started” anchor linking to \#get-started[\[7\]](https://github.com/frontjs/core/blob/master/website/index.html#L32-L34). Many developers expect a single copy‑and‑paste snippet at the top of the README. Mirror the installation instructions from the README at the top of the landing page to reduce friction.

## GitHub Repository & Developer Experience

### README & Documentation

The README is well written—it describes installation, a quick Hello World, core concepts, a list of features and limitations, and provides links to examples and API documentation[\[8\]](https://github.com/frontjs/core/blob/master/README.md#L1-L208). However, there are opportunities to further polish it:

* **Add a Table of Contents** to help developers navigate quickly. Use anchor links (\#install, \#hello-world, etc.).

* **Badge farm:** Include NPM version, bundle size (e.g., [bundlephobia](https://bundlephobia.com/result?p=front-js)), CI status (GitHub Actions), license and code coverage. These badges provide social proof and visibility.

* **Link to website and KB:** Add links to the live documentation site and KB at the top of the README so developers know where to find full docs.

* **Examples in code sandboxes:** Provide direct links to interactive sandboxes for each example (Todo list, Calculator, Pixel Art, etc.). This encourages experimentation.

* **Changelog:** Create a CHANGELOG.md or update RELEASES.md to document changes per version. This is helpful for those upgrading.

### Repository configuration & package metadata

* **Package.json fields:** The package.json includes a description, keywords and a homepage field[\[9\]](https://github.com/frontjs/core/blob/master/package.json#L2-L60). To improve ecosystem integration:

* Add sideEffects: false to enable tree‑shaking.

* Add types or typesVersions to point to generated TypeScript definitions. Consider generating .d.ts files from JSDoc to improve DX.

* Add a funding field or sponsor badge if donations are accepted.

* Ensure publishConfig.access is set to public to avoid accidental private publishes.

* **Issue & PR templates:** Provide .github/ISSUE\_TEMPLATE/ and .github/PULL\_REQUEST\_TEMPLATE.md to standardize contributions. Include checklists for tests, documentation and size budgets.

* **Release workflow:** Configure GitHub Actions to run the test suite, lint and size‑check on every push and PR. Use semantic versioning and optionally automate release notes.

* **License clarification:** The ISC license is present in the repository and package.json[\[10\]](https://github.com/frontjs/core/blob/master/README.md#L249-L258). Consider including a LICENSE badge in the README.

* **CODEOWNERS:** Adding a CODEOWNERS file can enforce reviews from maintainers on PRs.

### Contributing & Standards

The CONTRIBUTING.md outlines philosophy, development setup, code standards and security requirements[\[11\]](https://github.com/frontjs/core/blob/master/CONTRIBUTING.md#L2-L138). It invites contributions and provides detailed instructions, which is excellent. A few enhancements:

* **Commit message convention:** Suggest using Conventional Commits for consistent history and automated changelog generation.

* **Branch naming guidelines:** Already uses feat/your-feature-name but could standardize for bugfixes and docs (e.g., fix/, docs/).

* **Code of Conduct:** A CODE-OF-CONDUCT.md is already present. Consider linking to it from the README.

### Documentation & Knowledge Base

The project includes a KB built with front.js, but it currently requires separate hosting (the KB and main site are distinct). To improve discoverability:

* Deploy the KB under a subpath of the main site (e.g., /docs/) and generate relative links accordingly. The Development guide mentions using separate servers[\[12\]](https://github.com/frontjs/core/blob/master/DEVELOPMENT.md#L7-L31); unify them in production to avoid confusion.

* Provide a search bar in the KB using [Lunr.js](https://lunrjs.com/) or Algolia DocSearch to allow developers to find API references quickly.

* Auto‑generate API documentation from JSDoc comments. The README refers to wiki/API.md; consider publishing the API docs as part of the KB so they are searchable and discoverable.

## Summary of Key Recommendations

| Area | Current issue | Recommendation |
| :---- | :---- | :---- |
| **Meta tags** | Only title and basic charset/viewport tags; no description or Open Graph[\[1\]](https://github.com/frontjs/core/blob/master/website/index.html#L3-L8) | Add descriptive meta tags, canonical links, Open Graph/Twitter tags, favicons and manifest. |
| **Schema markup** | No structured data | Embed JSON‑LD describing the software application and articles. |
| **Sitemap & robots** | Missing sitemap.xml and robots.txt | Generate a sitemap listing all pages and reference it in a robots.txt. |
| **Broken links** | NavBar uses absolute URLs starting with /, which break on sub‑path deployments[\[4\]](https://github.com/frontjs/core/blob/master/website/index.html#L15-L20) | Use relative paths or compute base path; consider adding \<base\> tag per environment. |
| **UX friction** | Visitors cannot try the library quickly; no search in KB; active link detection may misfire[\[6\]](https://github.com/frontjs/core/blob/master/website/components/NavBar.js#L32-L37) | Embed interactive demos, add search and sidebar to KB, fix active link logic, improve call‑to‑action clarity. |
| **Core Web Vitals** | Unoptimised CSS and JS, no preconnect/prefetch, no lazy‑loading hints | Minify CSS/JS, preconnect to CDNs, use deferred scripts, specify dimensions for dynamic elements. |
| **Readme & Developer DX** | Good content but missing ToC, badges and changelog[\[10\]](https://github.com/frontjs/core/blob/master/README.md#L249-L258) | Add Table of Contents, NPM/CI/bundle size badges, interactive sandbox links, a changelog and contribution templates. |
| **Package metadata** | No sideEffects or TypeScript types; publishConfig unspecified[\[9\]](https://github.com/frontjs/core/blob/master/package.json#L2-L60) | Add sideEffects: false, include generated .d.ts definitions and ensure publishConfig.access: public. |
| **Contribution process** | CONTRIBUTING.md covers philosophy and workflow[\[11\]](https://github.com/frontjs/core/blob/master/CONTRIBUTING.md#L2-L138) but lacks commit conventions | Adopt Conventional Commits, branch naming patterns and PR templates. |
| **Docs/Kb** | KB requires separate hosting and has no search | Deploy KB under the main domain, add a search function and auto‑generate API docs. |

Implementing these recommendations will improve search‑engine visibility, user experience and developer satisfaction, making front.js more discoverable and attractive to contributors.

---

[\[1\]](https://github.com/frontjs/core/blob/master/website/index.html#L3-L8) [\[2\]](https://github.com/frontjs/core/blob/master/website/index.html#L327-L338) [\[4\]](https://github.com/frontjs/core/blob/master/website/index.html#L15-L20) [\[7\]](https://github.com/frontjs/core/blob/master/website/index.html#L32-L34) index.html

[https://github.com/frontjs/core/blob/master/website/index.html](https://github.com/frontjs/core/blob/master/website/index.html)

[\[3\]](https://frontjs.dev/#:~:text=Connection%20timed%20out%20Error%20code,522) frontjs.dev | 522: Connection timed out

[https://frontjs.dev/](https://frontjs.dev/)

[\[5\]](https://github.com/frontjs/core/blob/master/website/KB/index.html#L14-L19) index.html

[https://github.com/frontjs/core/blob/master/website/KB/index.html](https://github.com/frontjs/core/blob/master/website/KB/index.html)

[\[6\]](https://github.com/frontjs/core/blob/master/website/components/NavBar.js#L32-L37) NavBar.js

[https://github.com/frontjs/core/blob/master/website/components/NavBar.js](https://github.com/frontjs/core/blob/master/website/components/NavBar.js)

[\[8\]](https://github.com/frontjs/core/blob/master/README.md#L1-L208) [\[10\]](https://github.com/frontjs/core/blob/master/README.md#L249-L258) README.md

[https://github.com/frontjs/core/blob/master/README.md](https://github.com/frontjs/core/blob/master/README.md)

[\[9\]](https://github.com/frontjs/core/blob/master/package.json#L2-L60) package.json

[https://github.com/frontjs/core/blob/master/package.json](https://github.com/frontjs/core/blob/master/package.json)

[\[11\]](https://github.com/frontjs/core/blob/master/CONTRIBUTING.md#L2-L138) CONTRIBUTING.md

[https://github.com/frontjs/core/blob/master/CONTRIBUTING.md](https://github.com/frontjs/core/blob/master/CONTRIBUTING.md)

[\[12\]](https://github.com/frontjs/core/blob/master/DEVELOPMENT.md#L7-L31) DEVELOPMENT.md

[https://github.com/frontjs/core/blob/master/DEVELOPMENT.md](https://github.com/frontjs/core/blob/master/DEVELOPMENT.md)
