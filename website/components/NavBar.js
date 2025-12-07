
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

    <style>
      .navbar {
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .navbar-brand {
        font-weight: bold;
        font-size: 1.5rem;
        text-decoration: none;
        color: #333;
      }

      .navbar-menu.desktop {
        display: none;
      }

      .navbar-link {
        text-decoration: none;
        color: #666;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: color 0.2s;
      }

      .navbar-link:hover, .navbar-link.active {
        color: #007bff;
        background: #f8f9fa;
      }

      .navbar-toggle {
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        display: block;
      }

      .hamburger {
        display: block;
        width: 24px;
        height: 2px;
        background: #333;
        position: relative;
        transition: background 0.2s;
      }

      .hamburger::before, .hamburger::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: #333;
        left: 0;
        transition: transform 0.2s;
      }

      .hamburger::before { top: -6px; }
      .hamburger::after { bottom: -6px; }

      /* Mobile Menu Styles */
      .navbar-mobile-menu {
        display: none;
        background: white;
        border-top: 1px solid #eee;
        padding: 1rem;
      }

      .navbar-mobile-menu.open {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      @media (min-width: 768px) {
        .navbar-toggle, .navbar-mobile-menu, .navbar-mobile-menu.open {
          display: none;
        }

        .navbar-menu.desktop {
          display: flex;
          gap: 1rem;
        }
      }
    </style>
  `;
}
