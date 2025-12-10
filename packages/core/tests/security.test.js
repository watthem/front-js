import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { html } from 'uhtml';
import { val } from '../src/core/reactivity.js';
import { register, hydrate } from '../src/core/client.js';
import { defineComponent } from '../src/core/component.js';
import { createTestDOM } from './setup.js';

describe('security', () => {
  let testDOM;

  beforeEach(() => {
    testDOM = createTestDOM();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (testDOM) {
      testDOM.cleanup();
    }
    document.body.innerHTML = '';
  });

  describe('XSS protection', () => {
    it('escapes script tags in templates', () => {
      const malicious = val('<script>alert("XSS")</script>');
      const renderFn = () => html`<div>${malicious()}</div>`;
      
      defineComponent(renderFn, testDOM.container);
      
      // Should be escaped, not executed
      expect(testDOM.container.innerHTML).toContain('&lt;script&gt;');
      expect(testDOM.container.querySelector('script')).toBe(null);
    });

    it('escapes event handlers in user input', () => {
      const malicious = val('<img src=x onerror=alert(1)>');
      const renderFn = () => html`<div>${malicious()}</div>`;
      
      defineComponent(renderFn, testDOM.container);
      
      // Should be escaped
      expect(testDOM.container.innerHTML).toContain('&lt;img');
      expect(testDOM.container.querySelector('img')).toBe(null);
    });

    it('handles malicious props safely', () => {
      const Component = (props) => {
        const text = val(props.text || '');
        return () => html`<div>${text()}</div>`;
      };
      
      register('SecureComponent', Component);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'SecureComponent');
      island.setAttribute('data-props', JSON.stringify({ 
        text: '<script>alert("XSS")</script>' 
      }));
      document.body.appendChild(island);
      
      hydrate();
      
      // Should be escaped
      expect(island.innerHTML).toContain('&lt;script&gt;');
      expect(island.querySelector('script')).toBe(null);
    });
  });

  describe('component name validation', () => {
    it('rejects path traversal attempts', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', '../../../etc/passwd');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });

    it('rejects special characters in component names', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const Component = () => () => html`<div>Test</div>`;
      register('ValidComponent', Component);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'Component<script>');
      document.body.appendChild(island);
      
      hydrate();
      
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });
  });

  describe('JSON parsing safety', () => {
    it('rejects non-JSON props', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const Component = () => () => html`<div>Test</div>`;
      register('TestComponent', Component);
      
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'TestComponent');
      island.setAttribute('data-props', 'alert("XSS")');
      document.body.appendChild(island);
      
      hydrate();
      
      // Should fail to parse, not execute
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });

    it('rejects function injection attempts', () => {
      const consoleError = console.error;
      const errors = [];
      console.error = (...args) => errors.push(args);
      
      const Component = () => () => html`<div>Test</div>`;
      register('TestComponent', Component);
      
      // JSON.parse will reject this, but test that we handle it
      const island = document.createElement('div');
      island.setAttribute('data-island', '');
      island.setAttribute('data-component', 'TestComponent');
      island.setAttribute('data-props', '{"fn": function(){}}');
      document.body.appendChild(island);
      
      hydrate();
      
      // Should fail to parse (JSON doesn't support functions)
      expect(errors.length).toBeGreaterThan(0);
      console.error = consoleError;
    });
  });
});

