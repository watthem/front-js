import { html } from 'uhtml';
import { val, calc, run, register, hydrate } from '../front.esm.js';

/**
 * Walking Timer Component
 * Implements Japanese Interval Walking Training (IWT) - 3x3 method
 * Demonstrates:
 * - Lifecycle cleanup with run() returning cleanup functions
 * - Complex timer state management
 * - Derived state with calc()
 * - Audio feedback for interval transitions
 */
function WalkingTimer(props) {
  // Configuration (in seconds)
  const FAST_DURATION = props.fastDuration || 180; // 3 minutes
  const SLOW_DURATION = props.slowDuration || 180; // 3 minutes
  const TARGET_SETS = props.targetSets || 5;
  
  // State
  const isRunning = val(false);
  const currentPhase = val('slow'); // 'fast' or 'slow'
  const timeRemaining = val(SLOW_DURATION);
  const completedSets = val(0);
  const totalTime = val(0);
  
  // Computed values
  const currentDuration = calc(() => 
    currentPhase() === 'fast' ? FAST_DURATION : SLOW_DURATION
  );
  
  const progress = calc(() => 
    ((currentDuration() - timeRemaining()) / currentDuration()) * 100
  );
  
  const isComplete = calc(() => 
    completedSets() >= TARGET_SETS && timeRemaining() === 0
  );
  
  const formattedTime = calc(() => {
    const seconds = timeRemaining();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });
  
  const formattedTotalTime = calc(() => {
    const seconds = totalTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });
  
  // Audio feedback helper
  const playTone = (frequency, duration) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Audio not available, silently fail
    }
  };
  
  // Phase transition logic
  const switchPhase = () => {
    if (currentPhase() === 'slow') {
      currentPhase('fast');
      timeRemaining(FAST_DURATION);
      playTone(880, 0.2); // High beep for fast
    } else {
      currentPhase('slow');
      timeRemaining(SLOW_DURATION);
      completedSets(completedSets() + 1);
      playTone(440, 0.2); // Lower beep for slow
      
      // Check if workout complete
      if (completedSets() >= TARGET_SETS) {
        isRunning(false);
        playTone(660, 0.5); // Completion sound
      }
    }
  };
  
  // Timer effect with cleanup
  run(() => {
    if (!isRunning()) return;
    
    const interval = setInterval(() => {
      totalTime(totalTime() + 1);
      
      if (timeRemaining() > 0) {
        timeRemaining(timeRemaining() - 1);
      } else {
        switchPhase();
      }
    }, 1000);
    
    // Cleanup function - runs when effect re-executes or component unmounts
    return () => clearInterval(interval);
  });
  
  // Actions
  const start = () => {
    if (isComplete()) {
      reset();
    }
    isRunning(true);
  };
  
  const pause = () => {
    isRunning(false);
  };
  
  const reset = () => {
    isRunning(false);
    currentPhase('slow');
    timeRemaining(SLOW_DURATION);
    completedSets(0);
    totalTime(0);
  };
  
  const skipPhase = () => {
    if (!isRunning()) return;
    timeRemaining(0);
    setTimeout(() => switchPhase(), 100);
  };
  
  // Render function
  return () => html`
    <div class="walking-timer">
      <div class="timer-header">
        <h2>🚶‍♂️ Interval Walking Training</h2>
        <p class="method-info">3x3 Method: Japanese Progressive Walking</p>
      </div>
      
      <div class="phase-indicator ${currentPhase()}">
        <div class="phase-emoji">${currentPhase() === 'fast' ? '🏃‍♂️' : '🚶‍♂️'}</div>
        <div class="phase-label">
          ${currentPhase() === 'fast' ? 'Fast Walk' : 'Slow Walk'}
        </div>
      </div>
      
      <div class="timer-display">
        <div class="time-remaining">${formattedTime()}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress()}%"></div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${completedSets()}</div>
          <div class="stat-label">Sets Done</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${TARGET_SETS - completedSets()}</div>
          <div class="stat-label">Sets Left</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formattedTotalTime()}</div>
          <div class="stat-label">Total Time</div>
        </div>
      </div>
      
      ${isComplete() 
        ? html`
          <div class="completion-message">
            <div class="completion-emoji">🎉</div>
            <h3>Workout Complete!</h3>
            <p>Great job! You've completed ${TARGET_SETS} sets.</p>
          </div>
        `
        : html``
      }
      
      <div class="controls">
        ${!isRunning() && !isComplete()
          ? html`<button class="btn btn-start" onclick=${start}>
              ${completedSets() === 0 && totalTime() === 0 ? 'Start' : 'Resume'}
            </button>`
          : html``
        }
        
        ${isRunning()
          ? html`<button class="btn btn-pause" onclick=${pause}>Pause</button>`
          : html``
        }
        
        ${isComplete()
          ? html`<button class="btn btn-start" onclick=${start}>Start New</button>`
          : html``
        }
        
        ${(isRunning() || (!isRunning() && totalTime() > 0)) && !isComplete()
          ? html`<button class="btn btn-reset" onclick=${reset}>Reset</button>`
          : html``
        }
        
        ${isRunning() && !isComplete()
          ? html`<button class="btn btn-skip" onclick=${skipPhase}>Skip Phase</button>`
          : html``
        }
      </div>
      
      <div class="info-section">
        <h3>About IWT (3x3 Method)</h3>
        <ul>
          <li>🚶‍♂️ <strong>3 minutes slow walk</strong> - comfortable pace, catch your breath</li>
          <li>🏃‍♂️ <strong>3 minutes fast walk</strong> - brisk pace, slightly breathless</li>
          <li>🔄 <strong>Repeat ${TARGET_SETS} times</strong> - build endurance gradually</li>
          <li>❤️ <strong>Benefits:</strong> Improved cardiovascular health, strength, and weight management</li>
        </ul>
      </div>
    </div>
  `;
}

// Register component
register('WalkingTimer', WalkingTimer);

// Hydrate all islands on page load
hydrate();
