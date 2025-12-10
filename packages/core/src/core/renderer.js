/**
 * @fileoverview Renderer abstraction layer
 * Wraps the underlying template renderer (currently uhtml) to enable swapping
 * without breaking the public API.
 *
 * This abstraction allows front.js to remain renderer-agnostic. In the future,
 * uhtml could be swapped for lit-html, preact, or another template library
 * without changing the public API or component code.
 */
import { html as uhtmlHtml, render as uhtmlRender } from 'uhtml';

/**
 * Template tag function for creating HTML templates.
 * Currently delegates to uhtml, but can be swapped to another renderer.
 *
 * IMPORTANT: This returns a template OBJECT, not a string.
 * - Use with render(): render(container, html`<div>...</div>`)
 * - DO NOT use with string APIs: insertAdjacentHTML, innerHTML, etc.
 * - For HTML strings, use plain template literals: `<div>...</div>`
 *
 * @param {TemplateStringsArray} strings - Template literal strings
 * @param {...*} values - Interpolated values (auto-escaped by renderer)
 * @returns {*} Template object (opaque, for use with render() only)
 * @example
 * // CORRECT: Use html tag with render()
 * const template = html`<div>${userInput}</div>`;
 * render(container, template);
 *
 * @example
 * // WRONG: html tag with string API
 * element.insertAdjacentHTML('beforeend', html`<div>...</div>`); // "[object Object]"
 *
 * @example
 * // CORRECT: Plain template literal for strings
 * element.insertAdjacentHTML('beforeend', `<div>...</div>`); // Works
 */
export function html(strings, ...values) {
  return uhtmlHtml(strings, ...values);
}

/**
 * Renders a template into a DOM container.
 * Currently delegates to uhtml, but can be swapped to another renderer.
 *
 * Uses efficient DOM diffing to minimize reflows and repaints.
 *
 * IMPORTANT: Only accepts template objects from html tag, NOT strings.
 * - CORRECT: render(container, html`<div>...</div>`)
 * - WRONG: render(container, `<div>...</div>`) or render(container, '<div>...</div>')
 *
 * @param {HTMLElement} container - Target DOM element
 * @param {*} template - Template object (from html() tag function)
 * @example
 * const container = document.getElementById('app');
 * render(container, html`<div>Hello</div>`);
 */
export function render(container, template) {
  return uhtmlRender(container, template);
}
