// api/admin/logout.js
import { clearSessionCookie } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
}
