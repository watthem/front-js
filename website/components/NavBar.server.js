/**
 * NavBar.server.js
 *
 * Server-side NavBar renderer for generating static HTML during build.
 * Uses template literals instead of uhtml for Node.js compatibility.
 *
 * This file mirrors the logic in NavBar.js but outputs plain HTML strings.
 * Keep these two files in sync when updating navbar logic.
 */

/**
 * Renders the NavBar component to an HTML string
 * @param {Object} props - Component props
 * @param {Array} props.links - Array of {label, url} objects
 * @param {string} props.activePath - Current page path for active link detection
 * @returns {string} HTML string
 */
export function renderNavBar(props) {
  const links = props.links || [];
  const activePath = props.activePath || '/';

  /**
   * Helper to check if link is active
   * Matches logic in NavBar.js (client component)
   */
  const isLinkActive = (linkUrl) => {
    if (linkUrl.startsWith('http')) return false; // External links
    const normalizedLink = linkUrl.replace(/\/$/, '') || '/';
    const normalizedActive = activePath.replace(/\/$/, '') || '/';
    return normalizedActive === normalizedLink;
  };

  // Generate desktop menu links
  const desktopLinks = links.map(link =>
    `<a href="${link.url}" class="navbar-link${isLinkActive(link.url) ? ' active' : ''}">${link.label}</a>`
  ).join('\n            ');

  // Generate mobile menu links (with auto-close onclick)
  const mobileLinks = links.map(link =>
    `<a href="${link.url}" class="navbar-link${isLinkActive(link.url) ? ' active' : ''}">${link.label}</a>`
  ).join('\n          ');

  // Return complete navbar HTML
  // IMPORTANT: This structure must match NavBar.js render output
  return `<nav class="navbar">
        <div class="navbar-container">
          <a href="/" class="navbar-brand">front.js</a>

          <button class="navbar-toggle" aria-label="Toggle navigation" aria-expanded="false">
            <span class="hamburger"></span>
          </button>

          <div class="navbar-menu desktop">
            ${desktopLinks}
          </div>
        </div>

        <div class="navbar-mobile-menu">
          ${mobileLinks}
        </div>
      </nav>`;
}
