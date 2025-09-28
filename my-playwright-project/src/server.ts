// src/server.ts
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// serve /public (../ because this file is in /src)
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

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

      <!-- ⬇️ Keep these selectors so your tests still pass -->
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

app.post('/login', (_req, res) => {
  // simple demo "auth"
  res.setHeader('Set-Cookie', 'auth=1; Path=/; HttpOnly');
  res.redirect('/dashboard');
});

app.get('/dashboard', (_req, res) => {
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

app.get('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'auth=; Path=/; Max-Age=0');
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
