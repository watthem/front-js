import { describe, it, expect, vi, beforeEach } from 'vitest';
import { val, run, calc } from '../src/core/reactivity.js';
import { html } from 'uhtml';

/**
 * Limitations Test Suite
 * 
 * These tests document and verify EXPECTED behaviors that might seem like bugs
 * but are actually intentional design constraints. They serve as:
 * 
 * 1. Documentation of limitations in executable form
 * 2. Regression prevention (ensure limitations don't accidentally "fix" themselves)
 * 3. Guidance for future refactoring (know what behavior to preserve)
 * 
 * See docs/LIMITATIONS.md for full context.
 */

describe('Limitations: Reactivity', () => {
  describe('Object Mutation Detection', () => {
    it('does NOT detect in-place mutations (by design)', () => {
      const items = val([1, 2, 3]);
      const spy = vi.fn();
      
      run(() => {
        spy(items());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Mutate in-place
      items().push(4);
      
      // EXPECTED: No re-run because reference didn't change
      expect(spy).toHaveBeenCalledTimes(1);
      expect(items()).toEqual([1, 2, 3, 4]); // Mutation worked, but no notification
    });
    
    it('DOES detect new reference assignments', () => {
      const items = val([1, 2, 3]);
      const spy = vi.fn();
      
      run(() => {
        spy(items());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Create new reference
      items([...items(), 4]);
      
      // EXPECTED: Re-runs because reference changed
      expect(spy).toHaveBeenCalledTimes(2);
      expect(items()).toEqual([1, 2, 3, 4]);
    });
  });
  
  describe('Async Reactivity', () => {
    it('DOES track all synchronous reads even in async functions', async () => {
      // NOTE: This documents actual behavior. The run wrapper is synchronous,
      // so all value reads (even in async functions) are tracked.
      
      const userId = val(1);
      const result = val(null);
      const spy = vi.fn();
      
      run(async () => {
        const id = userId(); // Read before await - TRACKED
        spy('run started', id);
        
        await Promise.resolve(); // Async boundary
        
        // Even after await, the run context remains, so this IS tracked
        const idAfterAwait = userId();
        spy('after await', idAfterAwait);
        
        result(idAfterAwait);
      });
      
      // Wait for async run to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result()).toBe(1);
      
      // Change userId
      userId(2);
      
      // EXPECTED: Re-runs because currentRun stays set
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(spy).toHaveBeenCalledTimes(4); // Re-runs
    });
    
    it('CAN track async if values read synchronously first', async () => {
      const userId = val(1);
      const result = val(null);
      const spy = vi.fn();
      
      run(() => {
        const id = userId(); // Read synchronously - TRACKED
        spy('sync read', id);
        
        // Use captured value in async code
        (async () => {
          await Promise.resolve();
          result(id); // Uses captured value, not reading userId again
        })();
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(result()).toBe(1);
      
      // Change userId
      userId(2);
      
      // EXPECTED: Re-runs because userId was read synchronously
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Conditional Dependency Tracking', () => {
    it('only tracks values actually read during execution', () => {
      const showDetails = val(false);
      const userId = val(1);
      const userName = val('Alice');
      const spy = vi.fn();
      
      run(() => {
        spy('run');
        if (showDetails()) {
          // userId only tracked when showDetails is true
          spy('details', userId());
        }
        // userName always tracked
        spy('name', userName());
      });
      
      expect(spy).toHaveBeenCalledTimes(2); // 'run', 'name'
      
      // Change userId - should NOT trigger re-run
      userId(2);
      expect(spy).toHaveBeenCalledTimes(2); // Still 2
      
      // Change userName - SHOULD trigger re-run
      userName('Bob');
      expect(spy).toHaveBeenCalledTimes(4); // 'run', 'name'
      
      // Enable showDetails
      showDetails(true);
      expect(spy).toHaveBeenCalledTimes(7); // 'run', 'details', 'name'
      
      // NOW userId changes should trigger re-runs
      userId(3);
      expect(spy).toHaveBeenCalledTimes(10); // 'run', 'details', 'name'
    });
    
    it('this is EXPECTED behavior (fine-grained reactivity)', () => {
      // This test documents that conditional tracking is intentional,
      // not a bug. Both branches subscribe during evaluation.
      
      const flag = val(true);
      const a = val(1);
      const b = val(2);
      const spy = vi.fn();
      
      run(() => {
        spy(flag() ? a() : b());
      });
      
      expect(spy).toHaveBeenCalledWith(1); // Initial: flag=true, returns a
      
      // Change b - does NOT trigger (not in active branch)
      b(20);
      expect(spy).toHaveBeenCalledTimes(1); // Still 1
      
      // Change a - triggers re-run
      a(10);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(10);
      
      // Toggle flag - now reads b instead
      flag(false);
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenLastCalledWith(20);
    });
  });
  
  describe('Shallow Equality Check', () => {
    it('uses shallow equality to prevent unnecessary updates', () => {
      const count = val(5);
      const spy = vi.fn();
      
      run(() => {
        spy(count());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Set to same value
      count(5);
      
      // EXPECTED: No re-run (shallow equality check)
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Set to different value
      count(6);
      
      expect(spy).toHaveBeenCalledTimes(2);
    });
    
    it('uses !== for equality (NaN is always different)', () => {
      const value = val(NaN);
      const spy = vi.fn();
      
      run(() => {
        spy(value());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Set to NaN again
      value(NaN);
      
      // EXPECTED: Re-runs because NaN !== NaN in JavaScript
      // This is a known edge case - could be improved with Object.is
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Limitations: Component Architecture', () => {
  describe('Props Are Not Reactive', () => {
    it('props are read once during component initialization', () => {
      // This test documents that props are static initial values,
      // not reactive subscriptions
      
      function Counter(props) {
        const count = val(props.start);
        
        return () => count();
      }
      
      const props = { start: 10 };
      const renderFn = Counter(props);
      
      expect(renderFn()).toBe(10);
      
      // Mutating props object does NOT affect component
      props.start = 20;
      
      // EXPECTED: Component still has original value
      expect(renderFn()).toBe(10);
    });
    
    it('to update component state, use val() not props', () => {
      function Counter(props) {
        const count = val(props.start);
        
        // Expose setter for testing
        const increment = () => count(count() + 1);
        
        return Object.assign(
          () => count(),
          { increment }
        );
      }
      
      const renderFn = Counter({ start: 5 });
      
      expect(renderFn()).toBe(5);
      
      // Update via val(), not props
      renderFn.increment();
      
      expect(renderFn()).toBe(6);
    });
  });
});

describe('Limitations: Performance', () => {
  describe('Deep Nested Runs', () => {
    it('nested runs create separate subscriptions', () => {
      const a = val(1);
      const outerSpy = vi.fn();
      const innerSpy = vi.fn();
      
      run(() => {
        outerSpy(a());
        
        run(() => {
          innerSpy(a());
        });
      });
      
      expect(outerSpy).toHaveBeenCalledTimes(1);
      expect(innerSpy).toHaveBeenCalledTimes(1);
      
      // Change a
      a(2);
      
      // EXPECTED: Outer re-runs (2), which creates new inner run (3), 
      // plus inner re-runs independently (4)
      expect(outerSpy).toHaveBeenCalledTimes(2);
      expect(innerSpy).toHaveBeenCalledTimes(4); // Initial + created + 2 re-runs
    });
    
    it('prefer calc() for derived values to avoid nested runs', () => {
      const count = val(1);
      const outerSpy = vi.fn();
      const innerSpy = vi.fn();
      
      // Better pattern: use calc instead of nested run
      const doubled = calc(() => count() * 2);
      
      run(() => {
        outerSpy(count());
        innerSpy(doubled());
      });
      
      expect(outerSpy).toHaveBeenCalledTimes(1);
      expect(innerSpy).toHaveBeenCalledTimes(1);
      
      count(2);
      
      // calc creates internal run, so there are multiple executions
      // but it's still more efficient than manual nested runs
      expect(outerSpy).toHaveBeenCalledTimes(3); // Initial + 2 updates from doubled changing
      expect(innerSpy).toHaveBeenCalledTimes(3); // Initial + 2 updates
    });
  });
});

describe('Limitations: Edge Cases', () => {
  describe('peek() Does Not Track', () => {
    it('peek() reads value without subscribing', () => {
      const count = val(5);
      const spy = vi.fn();
      
      run(() => {
        spy(count.peek()); // Use peek() instead of count()
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(5);
      
      // Change value
      count(10);
      
      // EXPECTED: No re-run (peek doesn't subscribe)
      expect(spy).toHaveBeenCalledTimes(1);
    });
    
    it('useful for reading values in cleanup functions', () => {
      vi.useFakeTimers();
      
      const enabled = val(true);
      const count = val(0);
      const spy = vi.fn();
      
      run(() => {
        if (enabled()) {
          const interval = setInterval(() => {
            count(count.peek() + 1); // peek() avoids subscription
          }, 10);
          
          return () => {
            clearInterval(interval);
            spy('cleanup', count.peek());
          };
        }
      });
      
      // Run for a bit
      vi.advanceTimersByTime(25);
      expect(count()).toBeGreaterThan(0);
      
      // Disable (triggers cleanup)
      enabled(false);
      
      expect(spy).toHaveBeenCalledWith('cleanup', expect.any(Number));
      
      vi.useRealTimers();
    });
  });
  
  describe('Calc Is Read-Only', () => {
    it('calc() returns a getter-only function (no setter)', () => {
      const count = val(5);
      const doubled = calc(() => count() * 2);
      
      expect(doubled()).toBe(10);
      
      // EXPECTED: calc() is a getter function, calling with arg does nothing
      // (doesn't throw, but also doesn't change the value)
      doubled(20);
      expect(doubled()).toBe(10); // Still 10, setter ignored
    });
    
    it('to update calc, change its dependencies', () => {
      const count = val(5);
      const doubled = calc(() => count() * 2);
      
      expect(doubled()).toBe(10);
      
      // Update source value
      count(10);
      
      // Calc updates automatically
      expect(doubled()).toBe(20);
    });
  });
});

describe('Limitations: Documentation', () => {
  it('these tests document EXPECTED behavior, not bugs', () => {
    // This test suite serves as executable documentation.
    // If any of these tests fail, it means:
    // 
    // 1. The limitation has been "fixed" (intentionally or accidentally)
    // 2. The behavior has changed (review if this is desired)
    // 3. The test is wrong (update the test)
    // 
    // Before changing behavior, consult:
    // - docs/LIMITATIONS.md
    // - wiki/STANDARDS.md
    // - GitHub discussions
    
    expect(true).toBe(true);
  });
});
