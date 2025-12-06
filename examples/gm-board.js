import { html } from 'uhtml';
import { val, calc, run, register, hydrate } from '../src/index.js';

/**
 * GMBoard Component
 * Tests front.js with:
 * - Complex nested state (kudos tracking)
 * - Calculated values (live status)
 * - Timers (setInterval for status updates)
 * - Forms and authentication flow
 * - Conditional rendering
 */
function GMBoard(props) {
  // ===== STATE =====
  const currentUser = val(null);        // { username: string } or null
  const gmEntries = val([]);            // [{ username, timestamp, emoji }]
  const kudosMap = val({});             // { "alice->bob": true }
  const usernameInput = val('');
  const tick = val(0);                  // Updates every 30s to refresh live status

  const defaultEmoji = props.defaultEmoji || '☀️';

  // ===== COMPUTED VALUES =====

  // Helper: Check if a user is "live" (gm'd in last 5 mins)
  const isUserLive = (timestamp) => {
    return (Date.now() - timestamp) < (5 * 60 * 1000); // 5 minutes
  };

  // Helper: Format timestamp as "X mins ago"
  const formatTimestamp = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  // Helper: Count kudos for a user
  const getKudosCount = (username) => {
    const map = kudosMap();
    return Object.keys(map).filter(key => key.endsWith(`->${username}`)).length;
  };

  // Helper: Check if current user already gave kudos to someone
  const hasGivenKudos = (toUsername) => {
    const user = currentUser();
    if (!user) return false;
    const key = `${user.username}->${toUsername}`;
    return kudosMap()[key] === true;
  };

  // ===== ACTIONS =====

  // Login action
  const login = () => {
    const username = usernameInput().trim();
    if (!username) {
      alert('Please enter a username');
      return;
    }
    currentUser({ username });
    usernameInput(''); // Clear input
  };

  // Logout action
  const logout = () => {
    currentUser(null);
  };

  // Say GM action
  const sayGM = () => {
    const user = currentUser();
    if (!user) return;

    const entries = gmEntries();
    const existingIndex = entries.findIndex(e => e.username === user.username);

    if (existingIndex !== -1) {
      // User already said GM - update timestamp
      const updated = [...entries];
      updated[existingIndex] = {
        ...updated[existingIndex],
        timestamp: Date.now()
      };
      gmEntries(updated);
    } else {
      // New GM entry
      gmEntries([
        ...entries,
        {
          username: user.username,
          timestamp: Date.now(),
          emoji: defaultEmoji
        }
      ]);
    }
  };

  // Give kudos action
  const giveKudos = (toUsername) => {
    const user = currentUser();
    if (!user) return;
    if (user.username === toUsername) return; // Can't kudos yourself

    const key = `${user.username}->${toUsername}`;
    if (kudosMap()[key]) return; // Already gave kudos

    kudosMap({
      ...kudosMap(),
      [key]: true
    });
  };

  // Handle Enter key in login form
  const handleLoginKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  // ===== LIFECYCLE =====

  // Set up interval to update live status every 30 seconds
  // Using run-based lifecycle for proper cleanup
  run(() => {
    const interval = setInterval(() => {
      tick(tick() + 1); // Increment tick to trigger re-render
    }, 30000); // 30 seconds

    // Cleanup function - runs when run is disposed
    return () => clearInterval(interval);
  });

  // ===== RENDER =====

  return () => {
    const user = currentUser();
    const entries = gmEntries();

    // Read tick to create dependency for periodic updates
    tick();

    // Not logged in - show login form
    if (!user) {
      return html`
        <div class="login-form">
          <input
            type="text"
            value=${usernameInput()}
            oninput=${e => usernameInput(e.target.value)}
            onkeypress=${handleLoginKeyPress}
            placeholder="Enter your username..."
            autofocus
          />
          <button onclick=${login}>Log In</button>
        </div>
      `;
    }

    // Logged in - show board
    return html`
      <div>
        <!-- Header -->
        <div class="board-header">
          <div class="welcome">Welcome, ${user.username}! 👋</div>
          <button class="logout-btn" onclick=${logout}>Logout</button>
        </div>

        <!-- Say GM Button -->
        <button class="gm-button" onclick=${sayGM}>
          ${defaultEmoji} Say Good Morning
        </button>

        <!-- User List -->
        ${entries.length === 0
          ? html`<div class="empty-state">No one has said GM yet. Be the first!</div>`
          : html`
            <div class="user-list">
              ${entries.map(entry => {
                const live = isUserLive(entry.timestamp);
                const kudos = getKudosCount(entry.username);
                const alreadyGaveKudos = hasGivenKudos(entry.username);
                const isSelf = entry.username === user.username;

                return html`
                  <div class="user-card">
                    <div class="user-emoji">${entry.emoji}</div>
                    <div class="user-info">
                      <div class="user-name">${entry.username}</div>
                      <div class="user-time">${formatTimestamp(entry.timestamp)}</div>
                    </div>
                    <div class="status-indicator">
                      ${live ? '🟢' : '⚫'}
                    </div>
                    <div class="kudos-section">
                      <div class="kudos-count">
                        ${kudos} kudos
                      </div>
                      <button
                        class="kudos-btn"
                        onclick=${() => giveKudos(entry.username)}
                        disabled=${isSelf || alreadyGaveKudos}
                      >
                        ${isSelf ? 'You' : alreadyGaveKudos ? 'Kudos Sent' : 'Give Kudos'}
                      </button>
                    </div>
                  </div>
                `;
              })}
            </div>
          `
        }
      </div>
    `;
  };
}

// Register and hydrate
register('GMBoard', GMBoard);
hydrate();
