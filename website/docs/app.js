import { html } from 'uhtml';
import { val, run, register, hydrate } from './front.esm.js';

// Document configuration
const DOCS = {
  // Getting Started
  'when-to-use': {
    title: 'When to Use',
    file: 'reference/when-to-use.md'
  },
  'faq': {
    title: 'FAQ',
    file: 'FAQ.md'
  },
  
  // Guides
  'security': {
    title: 'Security',
    file: 'guides/security.md'
  },
  'integrations': {
    title: 'Integrations',
    file: 'guides/integrations.md'
  },
  'template-tags': {
    title: 'Template Tags',
    file: 'guides/template-tags-vs-strings.md'
  },
  
  // API Reference
  'api-core': {
    title: 'API: Core',
    file: 'api/core/index.md'
  },
  'api-actions': {
    title: 'API: Actions',
    file: 'api/actions/index.md'
  },
  
  // Reference
  'limitations': {
    title: 'Limitations',
    file: 'reference/limitations.md'
  },
  
  // Legacy
  'manifesto': {
    title: 'Manifesto',
    file: 'content/MANIFESTO.md'
  }
};

/**
 * MarkdownViewer Component
 * Fetches and renders markdown content using marked library
 */
function MarkdownViewer(props) {
  const content = val('');
  const loading = val(true);
  const error = val(null);
  // Get initial hash, default to when-to-use
  const initialHash = typeof window !== 'undefined' 
    ? (window.location.hash.slice(1) || 'when-to-use')
    : 'when-to-use';
  const docId = val(initialHash);

  // Fetch markdown content
  const loadMarkdown = async (docId) => {
    const doc = DOCS[docId];
    if (!doc) {
      const errorMsg = `Document "${docId}" not found. Available documents: ${Object.keys(DOCS).join(', ')}`;
      error(errorMsg);
      loading(false);
      console.error('[MarkdownViewer]', errorMsg);
      return;
    }

    // Set loading state first to hide old content immediately
    loading(true);
    error(null);
    content(''); // Clear previous content

    try {
      const response = await fetch(doc.file);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error(`File "${doc.file}" is empty`);
      }
      
      // Use marked library (loaded from CDN) to parse markdown
      if (typeof marked !== 'undefined' && marked.parse) {
        const html = marked.parse(text);
        content(html);
      } else {
        // Fallback: render as plain text if marked isn't loaded
        // Escape HTML for safety
        const escaped = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        content(`<pre>${escaped}</pre>`);
        console.warn('[MarkdownViewer] marked library not loaded, rendering as plain text');
      }
      loading(false);
    } catch (err) {
      const errorMsg = err.message || 'Unknown error occurred';
      error(errorMsg);
      loading(false);
      console.error('[MarkdownViewer] Failed to load markdown:', err);
    }
  };

  // Load markdown when docId changes
  run(() => {
    const currentId = docId();
    if (currentId && DOCS[currentId]) {
      loadMarkdown(currentId);
    }
  });

  // Listen for hash changes and update docId
  // Hash-based routing: when URL hash changes (e.g., #manifesto), load that document
  run(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'when-to-use';
      if (DOCS[hash]) {
        docId(hash);
      }
    };

    // Initial sync with current hash
    handleHashChange();

    // Set default hash if none exists (only once, to avoid race conditions)
    if (!window.location.hash) {
      window.location.hash = 'when-to-use';
      // hashchange event will fire automatically, no need to call handleHashChange again
    }

    // Listen for hash changes (browser fires this when URL hash changes)
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  // Intercept clicks on internal links
  const handleLinkClick = (e) => {
    // Find closest anchor tag
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if it's an internal markdown link (e.g., ./LIMITATIONS.md)
    if (href.endsWith('.md') && (href.startsWith('./') || !href.includes('://'))) {
      e.preventDefault();
      // Map filename to doc ID
      const filename = href.split('/').pop();
      const docEntry = Object.entries(DOCS).find(([_, doc]) => doc.file === filename);
      
      if (docEntry) {
        window.location.hash = docEntry[0];
      }
    }
  };

  return () => html`
    <div class="markdown-viewer">
      ${loading() ? html`
        <div class="loading" role="status" aria-live="polite">
          <div class="loading-spinner"></div>
          <p>Loading content...</p>
        </div>
      ` : ''}
      ${error() ? html`
        <div class="error" role="alert">
          <strong>Error loading content:</strong>
          <p>${error()}</p>
          <details>
            <summary>Troubleshooting</summary>
            <ul>
              <li>Make sure you're serving this from a web server (not file://)</li>
              <li>Try: <code>npx serve KB</code> from the project root</li>
              <li>Or use the back.js server: <code>node back-js/index.js</code></li>
              <li>Check the browser console for more details</li>
            </ul>
          </details>
        </div>
      ` : ''}
      ${!loading() && !error() && content() ? html`
        <div class="markdown-content" innerHTML=${content()} onclick=${handleLinkClick}></div>
      ` : ''}
    </div>
  `;
}

/**
 * Navigation Component
 * Tab-based navigation between documents
 * 
 * Uses hash-based routing (no router needed):
 * - Clicking a button sets window.location.hash (e.g., #explainer, #manifesto)
 * - Browser fires 'hashchange' event automatically
 * - This component listens to hashchange and updates active button styling
 * - MarkdownViewer also listens to hashchange and loads the appropriate content
 */
function Navigation(props) {
  // Get initial hash, default to when-to-use
  const initialHash = typeof window !== 'undefined'
    ? (window.location.hash.slice(1) || 'when-to-use')
    : 'when-to-use';
  const activeDoc = val(initialHash);

  // Listen for hash changes
  run(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'when-to-use';
      if (DOCS[hash]) {
        activeDoc(hash);
      }
    };

    // Initial hash sync
    handleHashChange();

    // Listen for hash changes (browser fires this when URL hash changes)
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  // Click handler: sets URL hash, which triggers hashchange event
  const handleNavClick = (docId) => {
    window.location.hash = docId;
  };

  return () => html`
    <nav class="navigation">
      ${Object.entries(DOCS).map(([id, doc]) => html`
        <button
          class=${`nav-button ${activeDoc() === id ? 'active' : ''}`}
          onclick=${() => handleNavClick(id)}
        >
          ${doc.title}
        </button>
      `)}
    </nav>
  `;
}

// Register components
register('Navigation', Navigation);
register('MarkdownViewer', MarkdownViewer);

// Hydrate on load - wait for DOM and marked library
function init() {
  try {
    hydrate();
    console.log('[front.js] Hydration complete');
  } catch (err) {
    console.error('[front.js] Hydration failed:', err);
    const main = document.querySelector('.main');
    if (main) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.setAttribute('role', 'alert');
      errorDiv.innerHTML = `
        <strong>Error: Failed to initialize front.js</strong>
        <p>${err.message || 'Unknown error'}</p>
        <details>
          <summary>Error details</summary>
          <pre>${err.stack || err.toString()}</pre>
        </details>
        <p><small>Check the browser console for more details.</small></p>
      `;
      main.appendChild(errorDiv);
    }
  }
}

// Wait for both DOM and marked library to be ready
function waitForMarked(callback, maxAttempts = 50) {
  if (typeof marked !== 'undefined' && marked.parse) {
    callback();
    return;
  }
  
  if (maxAttempts <= 0) {
    console.warn('[front.js] marked library not loaded after timeout, proceeding anyway');
    callback();
    return;
  }
  
  setTimeout(() => waitForMarked(callback, maxAttempts - 1), 50);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    waitForMarked(init);
  });
} else {
  // DOM already loaded
  waitForMarked(init);
}
