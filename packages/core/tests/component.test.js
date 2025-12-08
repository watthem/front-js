import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { html, render } from 'uhtml';
import { val } from '../src/core/reactivity.js';
import { defineComponent } from '../src/core/component.js';
import { createTestDOM } from './setup.js';

describe('component', () => {
  let testDOM;

  beforeEach(() => {
    testDOM = createTestDOM();
  });

  afterEach(() => {
    if (testDOM) {
      testDOM.cleanup();
    }
  });

  it('renders component into container', () => {
    const renderFn = () => html`<div>Hello</div>`;
    defineComponent(renderFn, testDOM.container);
    
    expect(testDOM.container.innerHTML).toContain('Hello');
  });

  it('updates when vals change', () => {
    const count = val(0);
    const renderFn = () => html`<div>Count: ${count()}</div>`;
    
    defineComponent(renderFn, testDOM.container);
    expect(testDOM.container.textContent).toContain('Count: 0');
    
    count(5);
    expect(testDOM.container.textContent).toContain('Count: 5');
  });

  it('handles render errors gracefully', () => {
    const renderFn = () => {
      throw new Error('Render error');
    };
    
    defineComponent(renderFn, testDOM.container);
    expect(testDOM.container.textContent).toContain('Rendering error occurred');
  });

  it('validates render function', () => {
    const consoleError = console.error;
    const errors = [];
    console.error = (...args) => errors.push(args);
    
    defineComponent(null, testDOM.container);
    expect(errors.length).toBeGreaterThan(0);
    
    console.error = consoleError;
  });

  it('validates container element', () => {
    const consoleError = console.error;
    const errors = [];
    console.error = (...args) => errors.push(args);
    
    defineComponent(() => html`<div>test</div>`, null);
    expect(errors.length).toBeGreaterThan(0);
    
    console.error = consoleError;
  });
});

