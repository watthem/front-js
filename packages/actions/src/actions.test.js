import { describe, it, expect } from 'vitest';
import { createRouter, createClient, VERSION } from './index.js';

describe('@frontjs/actions', () => {
  describe('VERSION', () => {
    it('exports version string', () => {
      expect(VERSION).toBe('0.0.1');
    });
  });

  describe('createRouter', () => {
    it('creates a router with handle method', () => {
      const router = createRouter({}, {});
      expect(router).toHaveProperty('handle');
      expect(typeof router.handle).toBe('function');
    });

    it('handles basic action without schema', async () => {
      const handlers = {
        'test:action': (payload) => ({ success: true, data: payload }),
      };
      const router = createRouter({}, handlers);

      const result = await router.handle({
        action: 'test:action',
        payload: { foo: 'bar' },
      });

      expect(result.success).toBe(true);
      expect(result.data.foo).toBe('bar');
    });

    it('throws error for unknown action', async () => {
      const router = createRouter({}, {});

      await expect(router.handle({ action: 'unknown:action', payload: {} })).rejects.toThrow(
        '[frontjs-actions] Unknown action'
      );
    });
  });

  describe('createClient', () => {
    it('creates a client with send method', () => {
      const client = createClient('/api/test');
      expect(client).toHaveProperty('send');
      expect(typeof client.send).toBe('function');
    });
  });
});
