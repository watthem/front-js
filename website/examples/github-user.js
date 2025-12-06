import { html } from 'uhtml';
import { val, run, register, hydrate } from '../../src/index.js';

/**
 * GitHub User Search Component
 * Demonstrates the "Active Flag" pattern for safe async data fetching within run()
 */
function GithubUser({ initialUser }) {
  // State (Values)
  const username = val(initialUser || 'octocat');
  const profile = val(null);
  const error = val(null);
  const loading = val(false);

  // Effect (The Run) - demonstrates safe async pattern
  run(() => {
    const user = username();
    if (!user) return;

    // Cancellation flag - prevents stale responses from updating state
    let active = true;
    loading(true);
    error(null);
    profile(null); // Clear previous result

    // The Async Logic wrapped in IIFE
    (async () => {
      try {
        // Artificial delay to demonstrate race conditions if you type fast
        await new Promise(r => setTimeout(r, 500));
        
        const res = await fetch(`https://api.github.com/users/${user}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        
        // Safety Check: only update if this run is still active
        if (active) {
          profile(data);
          loading(false);
        } else {
          console.log(`[front.js] Ignored stale response for ${user}`);
        }
      } catch (err) {
        if (active) {
          error(err.message);
          loading(false);
        }
      }
    })();

    // Cleanup function - invalidates this run's async operations
    return () => {
      active = false;
    };
  });

  // Render
  return () => html`
    <div class="card">
      <h3>GitHub User Search</h3>
      <input 
        value="${username()}" 
        oninput="${(e) => username(e.target.value)}" 
        placeholder="Enter username..."
        style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box;"
      />
      
      ${loading() ? html`<p>Loading...</p>` : ''}
      
      ${error() ? html`<p style="color: red">Error: ${error()}</p>` : ''}
      
      ${profile() ? html`
        <div style="margin-top: 10px; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
          <img 
            src="${profile().avatar_url}" 
            width="50" 
            style="float:left; margin-right:10px; border-radius: 50%;"
            alt="${profile().login}"
          />
          <strong>${profile().name || profile().login}</strong><br>
          <small>Public Repos: ${profile().public_repos}</small><br>
          ${profile().bio ? html`<p style="margin-top: 5px; font-size: 0.9em;">${profile().bio}</p>` : ''}
          <a 
            href="${profile().html_url}" 
            target="_blank" 
            style="font-size: 0.9em;"
          >
            View Profile →
          </a>
        </div>
      ` : ''}
    </div>
  `;
}

register('GithubUser', GithubUser);
hydrate();
