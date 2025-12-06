let currentRun = null;

/**
 * Creates a reactive value that tracks dependencies and notifies subscribers on changes.
 * @param {*} initialValue - Initial value for the value
 * @returns {Function} - Value function that acts as getter/setter
 * @example
 * const count = val(0);
 * count(); // getter: returns 0
 * count(5); // setter: updates to 5
 * count.peek(); // non-reactive read
 */
export function val(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  const s = (...args) => {
    // Getter: No arguments provided
    if (args.length === 0) {
      if (currentRun) subscribers.add(currentRun);
      return value;
    }
    // Setter: Argument provided
    const newValue = args[0];
    if (value !== newValue) {
      value = newValue;
      // Notify all subscribers, with error isolation
      subscribers.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error('[front.js] Error in value subscriber:', error);
          // Continue notifying other subscribers even if one fails
        }
      });
    }
    return value;
  };

  s.peek = () => value;
  return s;
}

/**
 * Runs code that automatically re-executes when any values it reads change.
 * Runs are isolated - if one fails, others continue to run.
 * The run function can return a cleanup function that runs before re-execution or disposal.
 * @param {Function} fn - Function to execute reactively. Can return a cleanup function.
 * @returns {Function} - Dispose function to stop the run and execute cleanup
 * @example
 * run(() => {
 *   const timer = setInterval(() => console.log('tick'), 1000);
 *   return () => clearInterval(timer); // Cleanup function
 * });
 */
export function run(fn) {
  if (typeof fn !== 'function') {
    console.error('[front.js] run() requires a function argument.');
    return () => {};
  }

  let cleanup; // Track cleanup function returned by user's run

  const wrapper = () => {
    // Run previous cleanup before re-executing run
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error('[front.js] Error in run cleanup:', error);
        // Continue execution even if cleanup fails
      }
    }

    const prevRun = currentRun;
    currentRun = wrapper;
    try {
      // Execute run and capture cleanup function (if returned)
      const result = fn();
      // Check for Promise return (async functions not supported)
      if (result instanceof Promise || (result && typeof result.then === 'function')) {
        console.warn(
          '[front.js] run() returned a Promise. Use an IIFE instead: run(() => { (async () => {...})(); })'
        );
        cleanup = undefined;
      } else {
        cleanup = typeof result === 'function' ? result : undefined;
      }
    } catch (error) {
      console.error('[front.js] Error in run:', error);
      // Don't re-throw - isolate errors so one failing run doesn't break others
    } finally {
      currentRun = prevRun;
    }
  };

  wrapper(); // Run immediately

  // Return dispose function for manual cleanup
  return () => {
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error('[front.js] Error disposing run:', error);
      }
    }
    cleanup = undefined; // Prevent double-cleanup
  };
}

/**
 * Creates a calculated (derived) value that automatically updates when dependencies change.
 * @param {Function} fn - Function that calculates the derived value
 * @returns {Function} - Read-only getter function
 * @example
 * const doubled = calc(() => count() * 2);
 * doubled(); // returns current calculated value
 */
export function calc(fn) {
  if (typeof fn !== 'function') {
    console.error('[front.js] calc() requires a function argument.');
    return () => undefined;
  }

  let calculatedValue;
  try {
    calculatedValue = fn();
  } catch (error) {
    console.error('[front.js] Error calculating initial value:', error);
    calculatedValue = undefined;
  }

  const s = val(calculatedValue);

  run(() => {
    try {
      const newValue = fn();
      s(newValue);
    } catch (error) {
      console.error('[front.js] Error recalculating value:', error);
      // Keep previous value on error
    }
  });

  return () => s(); // Read-only getter
}
