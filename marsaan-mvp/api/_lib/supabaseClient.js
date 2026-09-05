// api/_lib/supabaseClient.js
//
// Server-side Supabase client. This file only ever runs inside a Vercel
// serverless function (api/*.js) — it is NEVER imported from anything
// under src/, so SUPABASE_SERVICE_ROLE_KEY never reaches the browser.
//
// The service role key bypasses Row Level Security, which is intentional
// here: this backend function is the only thing allowed to write RFQs,
// and it validates the payload itself before writing.

import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    // Callers should check isPersistenceConfigured() first and degrade
    // gracefully (email-only) rather than call this and get a throw.
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.'
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}

export function isPersistenceConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
