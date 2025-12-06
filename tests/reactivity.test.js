import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { val, run, calc } from '../src/core/reactivity.js';

describe('reactivity', () => {
  describe('val', () => {
    it('creates a val with initial value', () => {
      const s = val(42);
      expect(s()).toBe(42);
    });

    it('updates value via setter', () => {
      const s = val(0);
      s(5);
      expect(s()).toBe(5);
    });

    it('returns value when setting', () => {
      const s = val(0);
      expect(s(10)).toBe(10);
    });

    it('peek returns value without subscribing', () => {
      const s = val(42);
      let runExecuted = false;
      
      run(() => {
        s.peek(); // Should not subscribe
        runExecuted = true;
      });
      
      runExecuted = false;
      s(100); // Should not trigger run
      expect(runExecuted).toBe(false);
    });

    it('does not notify on same value', () => {
      const s = val(5);
      let callCount = 0;
      
      run(() => {
        s();
        callCount++;
      });
      
      callCount = 0;
      s(5); // Same value
      expect(callCount).toBe(0);
    });
  });

  describe('run', () => {
    it('runs immediately', () => {
      let executed = false;
      run(() => {
        executed = true;
      });
      expect(executed).toBe(true);
    });

    it('tracks val dependencies', () => {
      const s = val(0);
      let value = null;
      
      run(() => {
        value = s();
      });
      
      expect(value).toBe(0);
      s(5);
      expect(value).toBe(5);
    });

    it('handles multiple vals', () => {
      const a = val(1);
      const b = val(2);
      let sum = 0;
      
      run(() => {
        sum = a() + b();
      });
      
      expect(sum).toBe(3);
      a(10);
      expect(sum).toBe(12);
      b(20);
      expect(sum).toBe(30);
    });

    it('handles nested runs', () => {
      const s = val(0);
      let outer = 0;
      let inner = 0;
      
      run(() => {
        outer = s();
        run(() => {
          inner = s();
        });
      });
      
      expect(outer).toBe(0);
      expect(inner).toBe(0);
      s(5);
      expect(outer).toBe(5);
      expect(inner).toBe(5);
    });

    it('isolates errors in runs', () => {
      const s = val(0);
      let otherRunExecuted = false;
      
      run(() => {
        throw new Error('Test error');
      });
      
      run(() => {
        s();
        otherRunExecuted = true;
      });
      
      otherRunExecuted = false;
      s(5);
      expect(otherRunExecuted).toBe(true);
    });

    it('warns when async function is used directly', () => {
      const consoleWarn = console.warn;
      const warnings = [];
      console.warn = (...args) => warnings.push(args);
      
      run(async () => {
        await Promise.resolve();
      });
      
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0][0]).toContain('run() returned a Promise');
      
      console.warn = consoleWarn;
    });

    it('does not warn for cleanup functions', () => {
      const consoleWarn = console.warn;
      const warnings = [];
      console.warn = (...args) => warnings.push(args);
      
      run(() => {
        return () => {}; // Valid cleanup function
      });
      
      expect(warnings.length).toBe(0);
      console.warn = consoleWarn;
    });
  });

  describe('calc', () => {
    it('creates calculated value', () => {
      const s = val(5);
      const doubled = calc(() => s() * 2);
      expect(doubled()).toBe(10);
    });

    it('updates when dependencies change', () => {
      const s = val(5);
      const doubled = calc(() => s() * 2);
      
      expect(doubled()).toBe(10);
      s(10);
      expect(doubled()).toBe(20);
    });

    it('is read-only', () => {
      const s = val(5);
      const doubled = calc(() => s() * 2);

      expect(typeof doubled).toBe('function');
      // Calc is read-only - calling with argument is ignored
      expect(doubled()).toBe(10);
      doubled(999); // This does nothing
      expect(doubled()).toBe(10); // Value unchanged
    });

    it('handles multiple dependencies', () => {
      const a = val(2);
      const b = val(3);
      const product = calc(() => a() * b());
      
      expect(product()).toBe(6);
      a(5);
      expect(product()).toBe(15);
      b(4);
      expect(product()).toBe(20);
    });

    it('handles errors gracefully', () => {
      const s = val(5);
      const safe = calc(() => {
        if (s() > 10) throw new Error('Too large');
        return s() * 2;
      });

      expect(safe()).toBe(10);
      s(15);
      // Should keep previous value on error
      expect(safe()).toBe(10);
    });
  });
});

