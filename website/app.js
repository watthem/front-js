import { html } from 'uhtml';
import { val, register, hydrate } from './front.esm.js';

/**
 * Counter Component - Simple demo
 */
function Counter(props) {
  const count = val(props.start || 0);
  
  return () => html`
    <div class="counter">
      <button class="counter-btn" onclick=${() => count(count() - 1)}>-</button>
      <span class="counter-value">${count()}</span>
      <button class="counter-btn" onclick=${() => count(count() + 1)}>+</button>
    </div>
  `;
}

// Register component
register('Counter', Counter);

// Hydrate on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrate);
} else {
  hydrate();
}
