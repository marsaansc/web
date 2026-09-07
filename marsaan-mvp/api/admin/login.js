// api/admin/login.js
import { checkPassword, createSessionCookie } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Method not allowed.' }));
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { password } = body;

  if (!process.env.ADMIN_PASSWORD) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({ ok: false, error: 'Admin area is not configured (ADMIN_PASSWORD missing).' })
    );
  }

  if (!checkPassword(password)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Incorrect password.' }));
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
}
