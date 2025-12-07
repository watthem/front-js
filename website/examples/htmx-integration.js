import { html } from 'uhtml';
import { val, run } from '../front.esm.js';

/**
 * ServerUptime Component
 * Demonstrates lifecycle management with setInterval cleanup.
 * When HTMX swaps the DOM, the cleanup function prevents memory leaks.
 */
export function ServerUptime(props) {
  const { name, region } = props;
  const uptime = val(0);
  
  console.log(`[front.js] 🟢 ServerUptime initialized: ${name} (${region})`);
  
  // Start timer that increments uptime every second
  run(() => {
    const intervalId = setInterval(() => {
      uptime(uptime() + 1);
    }, 1000);
    
    // Return cleanup function - this prevents memory leaks!
    return () => {
      clearInterval(intervalId);
      console.log(`[front.js] 🔴 ServerUptime cleanup: ${name} - Timer cleared (uptime was ${uptime()}s)`);
    };
  });
  
  // Helper to format uptime as HH:MM:SS
  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  
  return () => html`
    <div class="server-card">
      <div class="server-name">
        <span class="status-indicator"></span>
        ${name}
      </div>
      <div class="server-uptime">
        📍 ${region}<br/>
        ⏱️ Uptime: ${formatUptime(uptime())}
      </div>
    </div>
  `;
}

/**
 * Global HTMX cleanup handler
 * This ensures all front.js islands are disposed before HTMX swaps content.
 * 
 * CRITICAL: This must be set up once at app initialization.
 * Without this, timers and event listeners will leak memory!
 */
document.body.addEventListener('htmx:beforeCleanup', (event) => {
  console.log('[front.js] 🧹 HTMX beforeCleanup event detected');
  
  // Walk the target and all its children to find islands
  const target = event.target;
  const islands = target.querySelectorAll('[data-island]');
  
  console.log(`[front.js] Found ${islands.length} island(s) to dispose`);
  
  islands.forEach((island) => {
    if (island._front_dispose) {
      console.log(`[front.js] Disposing island: ${island.getAttribute('data-component')}`);
      island._front_dispose();
    }
  });
  
  // Also check if the target itself is an island
  if (target._front_dispose) {
    console.log(`[front.js] Disposing target: ${target.getAttribute('data-component')}`);
    target._front_dispose();
  }
});

console.log('[front.js] ✅ HTMX integration module loaded - cleanup handler registered');
