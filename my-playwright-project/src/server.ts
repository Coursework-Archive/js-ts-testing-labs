// src/server.ts
import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- Auth helpers ----------
function parseCookies(req: Request): Record<string, string> {
  const raw = req.headers.cookie ?? '';
  return raw.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [k, ...rest] = pair.trim().split('=');
    if (!k) return acc;
    acc[k] = decodeURIComponent(rest.join('=') ?? '');
    return acc;
  }, {});
}

function isAuthed(req: Request): boolean {
  const c = parseCookies(req);
  return c['auth'] === '1';
}

function currentName(req: Request): string {
  const c = parseCookies(req);
  return (c['name'] && c['name'].trim()) || 'user';
}

function setAuthCookies(res: Response, name?: string) {
  // HttpOnly demo cookies (add SameSite/Secure in real apps)
  res.append('Set-Cookie', 'auth=1; Path=/; HttpOnly');
  if (name) {
    res.append('Set-Cookie', `name=${encodeURIComponent(name)}; Path=/; HttpOnly`);
  }
}

function clearAuthCookie(res: Response) {
  res.append('Set-Cookie', 'auth=; Path=/; Max-Age=0; HttpOnly');
  res.append('Set-Cookie', 'name=; Path=/; Max-Age=0; HttpOnly');
}

function wantsJSON(req: Request): boolean {
  return req.path.startsWith('/api/') || req.accepts(['html', 'json']) === 'json';
}

// ---------- UI Routes (HTML preserved) ----------
app.get('/', (_req, res) => {
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Demo Login</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="bg">
    <main class="card">
      <h1 class="title">Welcome back 👋</h1>
      <p class="muted">Sign in to continue</p>
      <form method="POST" action="/login" class="form">
        <label class="label">
          <span>Username</span>
          <input name="username" placeholder="username" />
        </label>
        <label class="label">
          <span>Password</span>
          <input name="password" type="password" placeholder="password" />
        </label>
        <button class="btn" type="submit">Sign in</button>
      </form>
      <p class="fineprint">Tip: anything works on this demo 😉</p>
    </main>
  </body>
</html>`);
});

// POST /login supports form (HTML redirect) and JSON (API)
app.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (wantsJSON(req)) {
    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        error: 'USERNAME_PASSWORD_REQUIRED',
        message: 'Provide both username and password.'
      });
    }
    setAuthCookies(res, String(username));
    return res.status(200).json({
      ok: true,
      user: { name: String(username) },
      redirect: '/dashboard'
    });
  }

  // HTML flow
  setAuthCookies(res);
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (wantsJSON(req)) {
    return res.json({
      ok: true,
      authenticated: isAuthed(req),
      tip: 'If at first you don’t succeed, call it version 1.0.0.'
    });
  }

  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Dashboard</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="bg">
    <main class="card">
      <h1 class="title">Welcome!</h1>
      <p class="muted">You are logged in. Here’s a very serious productivity tip:</p>
      <blockquote class="joke">“If at first you don’t succeed, call it version 1.0.0.”</blockquote>
      <div class="actions">
        <a class="btn secondary" href="/">Back to login</a>
        <a class="btn danger" href="/logout">Log out</a>
      </div>
    </main>
  </body>
</html>`);
});

// GET/POST logout
app.get('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.redirect('/');
});
app.post('/logout', (req, res) => {
  clearAuthCookie(res);
  if (wantsJSON(req)) return res.json({ ok: true });
  res.redirect('/');
});

// ---------- API endpoints ----------
app.get('/api/session', (req, res) => {
  res.json({ ok: true, authenticated: isAuthed(req) });
});

// ✅ Health for tests
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Profile for tests
app.get('/api/profile', (req, res) => {
  if (!isAuthed(req)) {
    return res.status(401).json({
      ok: false,
      error: 'UNAUTHENTICATED',
      message: 'Login required',
    });
  }
  return res.json({
    ok: true,
    user: { name: currentName(req) },
  });
});

// ✅ Login (JSON) — already present; keep as-is but ensures "name" cookie is set
app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({
      ok: false,
      error: 'USERNAME_PASSWORD_REQUIRED',
      message: 'Provide both username and password.'
    });
  }
  setAuthCookies(res, String(username));
  res.status(200).json({
    ok: true,
    user: { name: String(username) },
    redirect: '/dashboard'
  });
});

app.post('/api/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// ✅ Very simple in-memory todos (per user name)
type Todo = { id: number; title: string; done: boolean };
const todosByUser: Record<string, Todo[]> = {};
let nextId = 1;

function requireAuth(req: Request, res: Response): string | null {
  if (!isAuthed(req)) {
    res.status(401).json({ ok: false, error: 'UNAUTHENTICATED' });
    return null;
  }
  return currentName(req);
}

app.get('/api/todos', (req, res) => {
  const name = requireAuth(req, res);
  if (!name) return;
  const list = todosByUser[name] ?? [];
  res.json({ ok: true, todos: list });
});

app.post('/api/todos', (req, res) => {
  const name = requireAuth(req, res);
  if (!name) return;

  const title = String((req.body?.title ?? '')).trim();
  if (!title) {
    return res.status(400).json({ ok: false, error: 'TITLE_REQUIRED' });
  }
  const todo: Todo = { id: nextId++, title, done: false };
  todosByUser[name] = (todosByUser[name] ?? []).concat(todo);
  res.status(201).json({ ok: true, todo });
});

// 404 for API paths (keep last)
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'NOT_FOUND' });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
