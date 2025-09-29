import { test, expect } from '@playwright/test';

test.describe('API', () => {

  test.describe('authenticated-only', () => {
    test.use({ storageState: 'tests/auth-state.json' }); 

    test('health is ok', async ({ request }) => {
      const res = await request.get('/api/health');
      await expect(res).toBeOK();
      await expect(res.headers()['content-type'] ?? '').toContain('application/json');
      await expect(await res.json()).toMatchObject({ status: 'ok' });
    });

    test('profile returns 200 when authed', async ({ request }) => {
      const res = await request.get('/api/profile');
      await expect(res).toBeOK();
    });
  });

  test.describe('unauthenticated-only', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('profile requires auth', async ({ request }) => {
      const res = await request.get('/api/profile');
      expect(res.status()).toBe(401);
    });

    test('login via JSON sets cookie and allows profile/todos', async ({ request }) => {
      const login = await request.post('/api/login', { data: { username: 'user', password: 'password' } });
      await expect(login).toBeOK();

      const setCookies = login.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie');
      expect(setCookies.some(h => h.value.includes('auth=1'))).toBeTruthy();

      const profile = await request.get('/api/profile');
      await expect(profile).toBeOK();
      await expect(await profile.json()).toMatchObject({ user: { name: 'user' } });

      const before = await request.get('/api/todos');
      await expect(before).toBeOK();
      const todosBefore = await before.json();
      const countBefore = Array.isArray(todosBefore.todos) ? todosBefore.todos.length : 0;

      const created = await request.post('/api/todos', { data: { title: 'write tests' } });
      expect(created.status()).toBe(201);

      const after = await request.get('/api/todos');
      await expect(after).toBeOK();
      const todosAfter = await after.json();
      const countAfter = Array.isArray(todosAfter.todos) ? todosAfter.todos.length : 0;

      expect(countAfter).toBe(countBefore + 1);
    });
  });
});
