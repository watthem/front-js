import { html } from 'uhtml';
import { val, run, register, hydrate } from './front.esm.js';

// Document configuration organized by category
const DOCS_CATEGORIES = [
  {
    label: 'Getting Started',
    items: [
      { id: 'when-to-use', title: 'When to Use', file: 'reference/when-to-use.md' },
      { id: 'faq', title: 'FAQ', file: 'FAQ.md' }
    ]
  },
  {
    label: 'Guides',
    items: [
      { id: 'security', title: 'Security Model', file: 'guides/security.md' },
      { id: 'integrations', title: 'Integrations', file: 'guides/integrations.md' },
      { id: 'template-tags', title: 'Template Tags vs Strings', file: 'guides/template-tags-vs-strings.md' }
    ]
  },
  {
    label: 'API Reference',
    items: [
      { id: 'api-core', title: 'Core API', file: 'api/core/index.md' },
      { id: 'api-actions', title: 'Actions API', file: 'api/actions/index.md' }
    ]
  },
  {
    label: 'Reference',
    items: [
      { id: 'limitations', title: 'Limitations', file: 'reference/limitations.md' },
      { id: 'manifesto', title: 'Manifesto', file: 'content/MANIFESTO.md' }
    ]
  }
];

// Flatten for lookup
const DOCS = DOCS_CATEGORIES.flatMap(cat => cat.items).reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

/**
 * MarkdownViewer Component
 * Fetches and renders markdown content using marked library
 */
function MarkdownViewer(props) {
  const content = val('');
  const loading = val(true);
  const error = val(null);
  const initialHash = typeof window !== 'undefined' 
    ? (window.location.hash.slice(1) || 'when-to-use')
    : 'when-to-use';
  const docId = val(initialHash);

  // Fetch markdown content
  const loadMarkdown = async (docId) => {
    const doc = DOCS[docId];
    if (!doc) {
      const errorMsg = `Document "${docId}" not found`;
      error(errorMsg);
      loading(false);
      console.error('[MarkdownViewer]', errorMsg);
      return;
    }

    loading(true);
    error(null);
    content('');

    try {
      const response = await fetch(doc.file);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error(`File "${doc.file}" is empty`);
      }
      
      if (typeof marked !== 'undefined' && marked.parse) {
        const html = marked.parse(text);
        content(html);
      } else {
        const escaped = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        content(`<pre>${escaped}</pre>`);
        console.warn('[MarkdownViewer] marked library not loaded');
      }
      loading(false);
    } catch (err) {
      error(err.message || 'Unknown error');
      loading(false);
      console.error('[MarkdownViewer]', err);
    }
  };

  // Load markdown when docId changes
  run(() => {
    const currentId = docId();
    if (currentId && DOCS[currentId]) {
      loadMarkdown(currentId);
    }
  });

  // Listen for hash changes
  run(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'when-to-use';
      if (DOCS[hash]) {
        docId(hash);
      }
    };

    handleHashChange();

    if (!window.location.hash) {
      window.location.hash = 'when-to-use';
    }

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  // Intercept internal markdown links
  const handleLinkClick = (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    if (href.endsWith('.md') && (href.startsWith('./') || !href.includes('://'))) {
      e.preventDefault();
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
          <p>Loading...</p>
        </div>
      ` : ''}
      ${error() ? html`
        <div class="error" role="alert">
          <strong>Error:</strong>
          <p>${error()}</p>
        </div>
      ` : ''}
      ${!loading() && !error() && content() ? html`
        <div class="markdown-content" innerHTML=${content()} onclick=${handleLinkClick}></div>
      ` : ''}
    </div>
  `;
}

/**
 * Sidebar Component
 * Hierarchical navigation with categories
 */
function Sidebar(props) {
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

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  const handleNavClick = (e, docId) => {
    e.preventDefault();
    window.location.hash = docId;
  };

  return () => html`
    <aside class="sidebar">
      <div class="sidebar-content">
        ${DOCS_CATEGORIES.map(category => html`
          <div class="sidebar-section">
            <h3 class="sidebar-category">${category.label}</h3>
            <ul class="sidebar-links">
              ${category.items.map(item => html`
                <li>
                  <a
                    href=${`#${item.id}`}
                    class=${activeDoc() === item.id ? 'active' : ''}
                    onclick=${(e) => handleNavClick(e, item.id)}
                  >
                    ${item.title}
                  </a>
                </li>
              `)}
            </ul>
          </div>
        `)}
      </div>
    </aside>
  `;
}

// Register components
register('Sidebar', Sidebar);
register('MarkdownViewer', MarkdownViewer);

// Hydrate on load
function init() {
  try {
    hydrate();
    console.log('[front.js] Hydration complete');
  } catch (err) {
    console.error('[front.js] Hydration failed:', err);
  }
}

// Wait for marked library
function waitForMarked(callback, maxAttempts = 50) {
  if (typeof marked !== 'undefined' && marked.parse) {
    callback();
    return;
  }
  
  if (maxAttempts <= 0) {
    console.warn('[front.js] marked library timeout');
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
  waitForMarked(init);
}
