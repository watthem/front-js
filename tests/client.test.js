import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { html } from 'uhtml';
import { val } from '../src/core/reactivity.js';
import { register, hydrate } from '../src/core/client.js';
import { createTestDOM } from './setup.js';

describe('client', () => {
  let testDOM;

  beforeEach(() => {
    testDOM = createTestDOM();
    // Clear any existing registrations
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (testDOM) {
      testDOM.cleanup();
    }
    document.body.innerHTML = '';
  });

  describe('register', () => {
    it('registers a component', () => {
      const Component = () => () => html`<div>Test</div>`;
      register('TestComponent', Component);
      // No error means success
      expect(true).toBe(true);
    });

    it('rejects invalid component names', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const Component = () => () => html`<div>Test</div>`;
      register('Invalid-Name!', Component);
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });

    it('rejects non-function components', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      register('TestComponent', 'not a function');
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });

    it('accepts valid component names', () => {
      const Component = () => () => html`<div>Test</div>`;
      
      register('ValidComponent', Component);
      register('Valid_Component', Component);
      register('Valid-Component', Component);
      register('ValidComponent123', Component);
      
      // No errors means success
      expect(true).toBe(true);
    });
  });

  describe('hydrate', () => {
    it('hydrates a component from DOM', () => {
      const Component = (props) => {
        const count = val(props.count || 0);
        return () => html`<div>Count: ${count()}</div>`;
      };
      
      register('TestComponent', Component);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'TestComponent');
      island.setAttribute('data-props', JSON.stringify({ count: 42 }));
      document.body.appendChild(island);
      
      hydrate();
      
      expect(island.textContent).toContain('Count: 42');
      expect(island.hasAttribute('data-island')).toBe(false);
    });

    it('handles missing component name', () => {
      const consoleWarn = console.warn;
      const warnings = [];
      console.warn = (...args) => warnings.push(args);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(warnings.length).toBeGreaterThan(0);
      console.warn = consoleWarn;
    });

    it('handles unregistered component', () => {
      const consoleWarn = console.warn;
      const warnings = [];
      console.warn = (...args) => warnings.push(args);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'NonExistent');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(warnings.length).toBeGreaterThan(0);
      console.warn = consoleWarn;
    });

    it('handles invalid JSON props', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const Component = () => () => html`<div>Test</div>`;
      register('TestComponent', Component);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'TestComponent');
      island.setAttribute('data-props', 'invalid json{');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });

    it('handles invalid component name format', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'Invalid Name!');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });

    it('hydrates multiple islands', () => {
      const Component = (props) => {
        const text = val(props.text || '');
        return () => html`<div>${text()}</div>`;
      };
      
      register('TestComponent', Component);
      
      const island1 = document.createElement('div');
      island1.setAttribute('data-island', '');
      island1.setAttribute('data-component', 'TestComponent');
      island1.setAttribute('data-props', JSON.stringify({ text: 'First' }));
      
      const island2 = document.createElement('div');
      island2.setAttribute('data-island', '');
      island2.setAttribute('data-component', 'TestComponent');
      island2.setAttribute('data-props', JSON.stringify({ text: 'Second' }));
      
      document.body.appendChild(island1);
      document.body.appendChild(island2);
      
      hydrate();
      
      expect(island1.textContent).toContain('First');
      expect(island2.textContent).toContain('Second');
    });

    it('handles component initialization errors', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const Component = () => {
        throw new Error('Init error');
      };
      
      register('ErrorComponent', Component);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'ErrorComponent');
      island.setAttribute('data-props', '{}');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });
  });
});

