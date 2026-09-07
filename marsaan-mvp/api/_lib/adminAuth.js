// api/_lib/adminAuth.js
//
// Minimal password-gate for the admin area. Deliberately simple:
// one shared password (ADMIN_PASSWORD env var), one signed cookie.
// No user accounts, no database-backed sessions — appropriate for a
// single-founder admin view, not meant to scale to multiple admin users
// with different permissions. Revisit this if/when you add teammates
// who need their own logins.
//
// The cookie is an HMAC-signed token (payload + expiry), verified with
// a server-only secret (ADMIN_SESSION_SECRET). This means:
// - The browser can't forge or extend a session without knowing the secret
// - No session storage needed (nothing to query on every request)
// - Sessions expire automatically (default 12 hours)

import crypto from 'crypto';

const COOKIE_NAME = 'marsaan_admin_session';
const SESSION_HOURS = 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set in environment variables.');
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;

  // Timing-safe comparison so response time can't be used to guess the
  // password character-by-character. Lengths must match first, since
  // timingSafeEqual throws on mismatched buffer lengths.
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionCookie() {
  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const signature = sign(payload);
  const token = `${payload}.${signature}`;

  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? ' Secure;' : '';

  return `${COOKIE_NAME}=${token}; HttpOnly;${secureFlag} SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 60 * 60}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  }
  return out;
}

/**
 * Returns true if the request has a valid, unexpired admin session cookie.
 */
export function isAuthenticated(req) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[COOKIE_NAME];
    if (!token) return false;

    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expectedSignature = sign(payload);
    const sigMatches = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!sigMatches) return false;

    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

export function requireAuth(req, res) {
  if (isAuthenticated(req)) return true;
  res.statusCode = 401;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: false, error: 'Not authenticated.' }));
  return false;
}
