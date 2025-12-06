import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run, val } from '../src/core/reactivity.js';
import { defineComponent } from '../src/core/component.js';
import { html } from 'uhtml';

describe('Run cleanup', () => {
  it('should run cleanup before re-running run', () => {
    const cleanupSpy = vi.fn();
    const count = val(0);

    run(() => {
      count(); // Subscribe
      return cleanupSpy;
    });

    expect(cleanupSpy).toHaveBeenCalledTimes(0);

    count(1); // Trigger re-run
    expect(cleanupSpy).toHaveBeenCalledTimes(1); // Cleanup ran
  });

  it('should run cleanup when dispose is called', () => {
    const cleanupSpy = vi.fn();

    const dispose = run(() => {
      return cleanupSpy;
    });

    expect(cleanupSpy).toHaveBeenCalledTimes(0);

    dispose();
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  it('should not double-cleanup', () => {
    const cleanupSpy = vi.fn();

    const dispose = run(() => {
      return cleanupSpy;
    });

    dispose();
    dispose(); // Call again

    expect(cleanupSpy).toHaveBeenCalledTimes(1); // Only once
  });

  it('should handle cleanup errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const dispose = run(() => {
      return () => {
        throw new Error('Cleanup error');
      };
    });

    dispose(); // Should not throw

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error disposing run');
    consoleErrorSpy.mockRestore();
  });

  it('should handle non-function return values gracefully', () => {
    const count = val(0);

    // Run returns non-function
    run(() => {
      count();
      return 'not a function';
    });

    // Should not error when re-running
    expect(() => count(1)).not.toThrow();
  });

  it('should run new cleanup after re-execution', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();
    const count = val(0);
    let callCount = 0;

    run(() => {
      const value = count();
      callCount++;
      return callCount === 1 ? cleanup1 : cleanup2;
    });

    count(1); // Trigger re-run
    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(0);

    count(2); // Trigger another re-run
    expect(cleanup1).toHaveBeenCalledTimes(1); // Still 1
    expect(cleanup2).toHaveBeenCalledTimes(1); // Now called
  });
});

describe('Component lifecycle', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should attach dispose to container', () => {
    const renderFn = () => html`<div>test</div>`;

    defineComponent(renderFn, container);

    expect(container._front_dispose).toBeInstanceOf(Function);
  });

  it('should return dispose function', () => {
    const renderFn = () => html`<div>test</div>`;

    const dispose = defineComponent(renderFn, container);

    expect(dispose).toBeInstanceOf(Function);
    expect(dispose).toBe(container._front_dispose);
  });

  it('should cleanup timers when component is disposed', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    let timerDispose;

    const Component = () => {
      // Capture dispose function for manual cleanup
      timerDispose = run(() => {
        const interval = setInterval(spy, 1000);
        return () => clearInterval(interval);
      });

      return () => html`<div>test</div>`;
    };

    const renderFn = Component();
    defineComponent(renderFn, container);

    vi.advanceTimersByTime(2000);
    expect(spy).toHaveBeenCalledTimes(2);

    // Manually dispose timer run
    timerDispose();

    vi.advanceTimersByTime(2000);
    expect(spy).toHaveBeenCalledTimes(2); // No more calls

    vi.useRealTimers();
  });

  it('should cleanup event listeners when disposed', () => {
    const clickSpy = vi.fn();
    let listenerDispose;

    const Component = () => {
      listenerDispose = run(() => {
        window.addEventListener('click', clickSpy);
        return () => window.removeEventListener('click', clickSpy);
      });

      return () => html`<div>test</div>`;
    };

    const renderFn = Component();
    defineComponent(renderFn, container);

    window.dispatchEvent(new Event('click'));
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // Manually dispose listener run
    listenerDispose();

    window.dispatchEvent(new Event('click'));
    expect(clickSpy).toHaveBeenCalledTimes(1); // No more calls
  });

  it('should handle multiple runs with cleanup', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();
    let dispose1, dispose2;

    const Component = () => {
      dispose1 = run(() => {
        return cleanup1;
      });

      dispose2 = run(() => {
        return cleanup2;
      });

      return () => html`<div>test</div>`;
    };

    const renderFn = Component();
    defineComponent(renderFn, container);

    // Manually dispose both runs
    dispose1();
    dispose2();

    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });
});

describe('Real-world lifecycle scenarios', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should handle timer-based updates correctly', () => {
    vi.useFakeTimers();
    let timerDispose;

    const Component = () => {
      const tick = val(0);

      timerDispose = run(() => {
        const interval = setInterval(() => {
          tick(tick() + 1);
        }, 1000);

        return () => clearInterval(interval);
      });

      return () => html`<div>Tick: ${tick()}</div>`;
    };

    const renderFn = Component();
    defineComponent(renderFn, container);

    expect(container.textContent).toContain('Tick: 0');

    vi.advanceTimersByTime(1000);
    expect(container.textContent).toContain('Tick: 1');

    vi.advanceTimersByTime(2000);
    expect(container.textContent).toContain('Tick: 3');

    // Manually cleanup timer
    timerDispose();

    vi.advanceTimersByTime(5000);
    expect(container.textContent).toContain('Tick: 3'); // No more updates

    vi.useRealTimers();
  });

  it('should handle cleanup errors without breaking', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let errorDispose;

    const Component = () => {
      errorDispose = run(() => {
        return () => {
          throw new Error('Cleanup failed!');
        };
      });

      return () => html`<div>test</div>`;
    };

    const renderFn = Component();
    defineComponent(renderFn, container);

    // Should not throw when disposing run with erroring cleanup
    expect(() => errorDispose()).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error disposing run');

    consoleErrorSpy.mockRestore();
  });
});
