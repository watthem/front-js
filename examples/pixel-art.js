import { html } from 'uhtml';
import { val, calc, run, register, hydrate } from '../src/index.js';

/**
 * Collaborative Pixel Art Canvas
 * Demonstrates:
 * - Multiple islands communicating via shared state
 * - Canvas drawing with reactive updates
 * - Simulated "multiplayer" with AI collaborators
 * - Advanced run() usage for animation loops
 * - LocalStorage persistence
 */

// Shared state bus (simulates WebSocket/server state)
const sharedCanvas = val(null);
const activeUsers = val([]);

// AI "collaborators" that draw autonomously
function startAICollaborators() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const names = ['Pixel Bot', 'Art AI', 'Doodle Helper', 'Color Sprite'];
  
  // Simulate 2-4 AI users joining
  const aiCount = 2 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < aiCount; i++) {
    setTimeout(() => {
      const user = {
        id: `ai-${i}`,
        name: names[i % names.length],
        color: colors[Math.floor(Math.random() * colors.length)],
        isAI: true
      };
      activeUsers([...activeUsers(), user]);
      
      // AI draws random pixels occasionally
      const drawInterval = setInterval(() => {
        if (!sharedCanvas()) return;
        
        const canvas = sharedCanvas();
        const x = Math.floor(Math.random() * 32);
        const y = Math.floor(Math.random() * 32);
        
        // Only draw if pixel is empty (null)
        if (!canvas[y][x]) {
          const newCanvas = canvas.map(row => [...row]);
          newCanvas[y][x] = user.color;
          sharedCanvas(newCanvas);
        }
      }, 2000 + Math.random() * 3000); // Every 2-5 seconds
      
      // Store interval for cleanup
      user.interval = drawInterval;
    }, i * 1000); // Stagger AI joins
  }
}

function PixelCanvas(props) {
  const canvasSize = props.size || 32;
  const pixelSize = props.pixelSize || 12;
  
  // Local state
  const userColor = val(props.color || '#333333');
  const hoveredPixel = val(null);
  const isDrawing = val(false);
  
  // Initialize canvas from shared state or create new
  run(() => {
    if (!sharedCanvas()) {
      // Try to load from localStorage
      const saved = localStorage.getItem('pixel-canvas');
      if (saved) {
        sharedCanvas(JSON.parse(saved));
      } else {
        // Create empty canvas
        const canvas = Array(canvasSize).fill(null).map(() => 
          Array(canvasSize).fill(null)
        );
        sharedCanvas(canvas);
      }
    }
  });
  
  // Save to localStorage on changes
  run(() => {
    if (sharedCanvas()) {
      localStorage.setItem('pixel-canvas', JSON.stringify(sharedCanvas()));
    }
  });
  
  // Add current user to active users
  run(() => {
    const currentUser = {
      id: 'local',
      name: 'You',
      color: userColor(),
      isAI: false
    };
    
    // Only add if not already in list
    if (!activeUsers().some(u => u.id === 'local')) {
      activeUsers([currentUser, ...activeUsers()]);
    } else {
      // Update color if changed
      const updated = activeUsers().map(u => 
        u.id === 'local' ? { ...u, color: userColor() } : u
      );
      activeUsers(updated);
    }
  });
  
  const drawPixel = (x, y) => {
    if (!sharedCanvas()) return;
    
    const canvas = sharedCanvas();
    const newCanvas = canvas.map(row => [...row]);
    
    // Toggle: if pixel has our color, clear it. Otherwise, set our color
    if (newCanvas[y][x] === userColor()) {
      newCanvas[y][x] = null;
    } else {
      newCanvas[y][x] = userColor();
    }
    
    sharedCanvas(newCanvas);
  };
  
  const handleMouseDown = (x, y) => {
    isDrawing(true);
    drawPixel(x, y);
  };
  
  const handleMouseOver = (x, y) => {
    hoveredPixel({ x, y });
    if (isDrawing()) {
      drawPixel(x, y);
    }
  };
  
  const handleMouseUp = () => {
    isDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = Array(canvasSize).fill(null).map(() => 
      Array(canvasSize).fill(null)
    );
    sharedCanvas(canvas);
    localStorage.removeItem('pixel-canvas');
  };
  
  return () => {
    const canvas = sharedCanvas();
    if (!canvas) return html`<div>Loading canvas...</div>`;
    
    // Flatten canvas into a single array for rendering
    const pixels = [];
    for (let y = 0; y < canvas.length; y++) {
      for (let x = 0; x < canvas[y].length; x++) {
        pixels.push({ x, y, color: canvas[y][x] });
      }
    }
    
    return html`
      <div class="pixel-canvas-container">
        <div class="canvas-header">
          <h3>🎨 Collaborative Canvas</h3>
          <div class="color-picker-group">
            <label>Your Color:</label>
            <input 
              type="color" 
              value=${userColor()} 
              oninput=${e => userColor(e.target.value)}
            />
            <button class="btn-clear" onclick=${clearCanvas}>Clear All</button>
          </div>
        </div>
        
        <div 
          class="pixel-grid" 
          style=${`grid-template-columns: repeat(${canvasSize}, ${pixelSize}px); gap: 1px;`}
          onmouseup=${handleMouseUp}
          onmouseleave=${handleMouseUp}
        >
          ${pixels.map(({ x, y, color }) => {
            const isHovered = hoveredPixel() && hoveredPixel().x === x && hoveredPixel().y === y;
            const displayColor = color || (isHovered ? userColor() : '#f0f0f0');
            const opacity = color ? 1 : (isHovered ? 0.5 : 1);
            
            return html`
              <div 
                class="pixel"
                style=${`background-color: ${displayColor}; opacity: ${opacity}; width: ${pixelSize}px; height: ${pixelSize}px;`}
                onmousedown=${() => handleMouseDown(x, y)}
                onmouseover=${() => handleMouseOver(x, y)}
              ></div>
            `;
          })}
        </div>
        
        <div class="canvas-info">
          <p>Click to draw, drag to paint continuously. Click your color again to erase.</p>
        </div>
      </div>
    `;
  };
}

function UserList(props) {
  const pulseAnimations = val({});
  
  // Animate user indicators when canvas changes
  run(() => {
    // Read sharedCanvas to track changes (even if null initially)
    const canvas = sharedCanvas();
    // Read activeUsers to track changes
    const users = activeUsers();
    
    if (!canvas) return;
    
    // Trigger pulse animation for all users
    const newPulses = {};
    users.forEach(user => {
      newPulses[user.id] = Date.now();
    });
    pulseAnimations(newPulses);
  });
  
  return () => {
    const users = activeUsers() || [];
    return html`
      <div class="user-list">
        <h3>👥 Active Artists (${users.length})</h3>
        <div class="users">
          ${users.length === 0 
            ? html`<div style="color: #999; text-align: center; padding: 1rem;">No active artists yet...</div>`
            : users.map(user => {
                const lastPulse = pulseAnimations()[user.id] || 0;
                const shouldPulse = Date.now() - lastPulse < 500;
                
                return html`
                  <div class="user-badge ${shouldPulse ? 'pulse' : ''}">
                    <div class="user-color" style=${`background-color: ${user.color}`}></div>
                    <span class="user-name">${user.name}</span>
                    ${user.isAI ? html`<span class="ai-badge">🤖</span>` : ''}
                  </div>
                `;
              })
          }
        </div>
      </div>
    `;
  };
}

function PixelStats(props) {
  const totalPixels = calc(() => {
    if (!sharedCanvas()) return 0;
    return sharedCanvas().flat().filter(p => p !== null).length;
  });
  
  const colorCounts = calc(() => {
    const canvas = sharedCanvas();
    if (!canvas) return [];
    
    const counts = {};
    canvas.flat().forEach(color => {
      if (color) {
        counts[color] = (counts[color] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });
  
  const coverage = calc(() => {
    const canvas = sharedCanvas();
    if (!canvas || canvas.length === 0 || !canvas[0]) return 0;
    const total = canvas.length * canvas[0].length;
    return ((totalPixels() / total) * 100).toFixed(1);
  });
  
  return () => html`
    <div class="pixel-stats">
      <h3>📊 Canvas Stats</h3>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">${totalPixels()}</div>
          <div class="stat-label">Pixels Drawn</div>
        </div>
        <div class="stat">
          <div class="stat-value">${coverage()}%</div>
          <div class="stat-label">Coverage</div>
        </div>
      </div>
      
      ${colorCounts().length > 0 ? html`
        <div class="top-colors">
          <h4>Top Colors</h4>
          ${colorCounts().map(([color, count]) => html`
            <div class="color-stat">
              <div class="color-swatch" style="background-color: ${color}"></div>
              <div class="color-count">${count} pixels</div>
            </div>
          `)}
        </div>
      ` : ''}
    </div>
  `;
}

// Register all components
register('PixelCanvas', PixelCanvas);
register('UserList', UserList);
register('PixelStats', PixelStats);

// Hydrate islands
hydrate();

// Start AI collaborators after a delay
setTimeout(startAICollaborators, 1000);
