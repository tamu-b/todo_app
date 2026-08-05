import { afterAll, afterEach } from 'vitest';
import { server } from './msw-server';

// Must run at module top-level (not inside beforeAll) so that
// globalThis.fetch is patched before any test file's imports run.
// openapi-fetch captures `globalThis.fetch` once at client-creation time
// (src/lib/api-client.ts), so if msw patches it any later, that client
// keeps calling the real, unmocked fetch.
server.listen({ onUnhandledRequest: 'error' });

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
