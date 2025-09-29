// tests/global.setup.ts
import type { FullConfig } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

export default async function globalSetup(_config: FullConfig) {
  // Pretend we already logged in: set the cookie your app expects.
  const state = {
    cookies: [
      {
        name: 'auth',
        value: '1',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        expires: -1,
      },
    ],
    origins: [],
  };
  await writeFile('tests/auth-state.json', JSON.stringify(state, null, 2));
}
