
import { html } from 'uhtml';
import { val } from '../front.esm.js';

/**
 * NavBar Component
 * Mobile-friendly responsive navigation bar
 */
export function NavBar(props) {
  const isOpen = val(false);
  const links = props.links || [];
  const currentPath = window.location.pathname;

  // Helper to check if link is active
  const isLinkActive = (linkUrl) => {
    if (linkUrl.startsWith('http')) return false; // External links
    const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
    const resolvedLink = new URL(linkUrl, window.location.href).pathname;
    const normalizedLink = resolvedLink.replace(/\/$/, '') || '/';
    return normalizedCurrent === normalizedLink;
  };

  return () => html`
    <nav class="navbar">
      <div class="navbar-container">
        <a href="/" class="navbar-brand">
          front.js
        </a>

        <!-- Mobile Menu Button -->
        <button 
          class="navbar-toggle" 
          onclick=${() => isOpen(!isOpen())}
          aria-label="Toggle navigation"
          aria-expanded=${isOpen()}
        >
          <span class="hamburger"></span>
        </button>

        <!-- Desktop Menu -->
        <div class="navbar-menu desktop">
          ${links.map(link => html`
            <a 
              href="${link.url}" 
              class="${`navbar-link ${isLinkActive(link.url) ? 'active' : ''}`}"
            >
              ${link.label}
            </a>
          `)}
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div class="${`navbar-mobile-menu ${isOpen() ? 'open' : ''}`}">
        ${links.map(link => html`
          <a 
            href="${link.url}" 
            class="${`navbar-link ${isLinkActive(link.url) ? 'active' : ''}`}"
            onclick=${() => setTimeout(() => isOpen(false), 50)}
          >
            ${link.label}
          </a>
        `)}
      </div>
    </nav>
  `;
}
