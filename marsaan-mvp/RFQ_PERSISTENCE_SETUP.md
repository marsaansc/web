# RFQ Persistence Setup (Supabase)

This adds a real database behind your RFQ form. Until you complete this
setup, **nothing breaks** — RFQs continue to be emailed exactly as before.
Once configured, every RFQ also gets saved with a reference number
(e.g. `RFQ-2026-0001`) you can look up later.

## 1) Create a Supabase project

1. Go to https://supabase.com and sign up / log in (free tier is enough to start)
2. Click "New Project"
3. Pick any name (e.g. `marsaan-prod`), a strong database password (save it
   somewhere safe — you likely won't need it directly, Supabase manages this),
   and a region close to your users (e.g. Singapore or Mumbai if available)
4. Wait ~2 minutes for it to provision

## 2) Run the database migration

1. In your new Supabase project, go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Open `data/schema/001_rfq_persistence.sql` from this repo, copy its entire
   contents, and paste into the SQL Editor
4. Click "Run" (or Ctrl+Enter)
5. You should see "Success. No rows returned" — this created two tables:
   `rfqs` and `rfq_line_items`

## 3) Create the storage bucket for BOM files

1. Go to **Storage** (left sidebar) → "New bucket"
2. Name it exactly: `rfq-boms`
3. Leave it **Private** (not public) — BOM files may contain sensitive
   customer data
4. Click "Create bucket"

## 4) Get your API credentials

1. Go to **Project Settings** (gear icon) → **API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **service_role** key (under "Project API keys" — NOT the
   "anon public" key). This is a secret, treat it like a password.

## 5) Add credentials to Vercel

1. Go to your Vercel project (`website2`, the one connected to marsaan.com)
   → **Settings** → **Environment Variables**
2. Add:
   - `SUPABASE_URL` = the Project URL from step 4
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key from step 4
3. Make sure both are set for **Production** (and Preview, if you want RFQ
   testing to persist on preview deployments too)
4. Redeploy (or just push any small commit — Vercel will pick up the new
   env vars on the next deployment)

## 6) Verify it's working

1. Submit a test RFQ on your live site
2. You should see a reference number in the success message (e.g.
   "Your reference number is RFQ-2026-0001")
3. In Supabase, go to **Table Editor** → `rfqs` — you should see your test
   submission as a new row
4. Check `rfq_line_items` too, if your test RFQ had cart items

## What happens if you skip this setup

Nothing breaks. `api/rfq.js` checks whether `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are set before attempting any database call —
if they're not set, RFQs are emailed exactly as they were before this
change, with no reference number and no database row. You can do this
setup whenever you're ready.
