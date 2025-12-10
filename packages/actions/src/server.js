/**
 * @fileoverview Server-side router with Standard Schema validation
 * @module @frontjs/actions/server
 */

/**
 * Creates a router that handles action requests with validation.
 * @param {Object} schemaMap - Map of action names to Standard Schema validators
 * @param {Object} handlers - Map of action names to handler functions
 * @returns {Object} Router with handle method
 * @example
 * const router = createRouter(ActionSchema, {
 *   'todo:create': async (payload, ctx) => {
 *     return await db.todos.add(payload.text);
 *   }
 * });
 * await router.handle(request);
 */
export const createRouter = (schemaMap, handlers) => ({
  async handle(request, context = {}) {
    // 1. Parse Payload (supports standard Request or plain object)
    const body = typeof request.json === 'function' ? await request.json() : request;
    const { action, payload } = body;

    // 2. Route Check
    if (!handlers[action]) {
      throw new Error(`[frontjs-actions] Unknown action: ${action}`);
    }

    // 3. Schema Validation (Standard Schema)
    const validator = schemaMap[action];
    if (validator && validator['~standard']) {
      const result = validator['~standard'].validate(payload);
      const { value, issues } = result instanceof Promise ? await result : result;

      if (issues) {
        throw new Error(`[frontjs-actions] Validation failed: ${JSON.stringify(issues)}`);
      }

      // 4. Execute with Validated Data
      return handlers[action](value, context);
    }

    // No schema? Pass raw payload (can be made strict mode in future)
    return handlers[action](payload, context);
  },
});
