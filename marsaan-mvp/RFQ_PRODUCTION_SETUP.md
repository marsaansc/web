# Marsaan RFQ – Production Setup (Vercel)

This MVP ships with a working RFQ endpoint:

- Frontend: `/rfq` page sends the RFQ + optional BOM file to **`/api/rfq`**
- Backend: Vercel Serverless Function **emails `rfq@marsaan.com`** and optionally posts the lead JSON to a webhook (Zoho Flow / Odoo)

---

## 1) Deploy on Vercel (correct root)

1. Push your repo to GitHub.
2. In Vercel: **Add New → Project → Import** your repo.
3. **Root Directory:** select `marsaan-mvp` (the folder that has `package.json`).
4. Build settings (Vite):
   - Build Command: `npm run build`
   - Output Directory: `dist`

---

## 2) Add Environment Variables (email)

Vercel → **Project → Settings → Environment Variables**

Add these keys (set for **Production** at minimum; you can also set Preview/Development):

- `SMTP_HOST` = `smtp.zoho.com`
- `SMTP_PORT` = `465`
- `SMTP_USER` = `rfq@marsaan.com`
- `SMTP_PASS` = *(Zoho Mail app password recommended)*
- `MAIL_TO` = `rfq@marsaan.com`
- (optional) `MAIL_FROM` = `rfq@marsaan.com`

> If your Zoho account uses 2FA, use an **app password** for SMTP.

After adding env vars, **redeploy**.

---

## 3) Test the endpoint

1. Visit: `https://<your-domain>/api/health` → should return `{ ok: true, ... }`
2. Visit: `https://<your-domain>/rfq`
3. Submit an RFQ (with or without BOM)
4. You should receive an email at **rfq@marsaan.com** with:
   - RFQ details
   - JSON attachment
   - BOM attachment (if uploaded; size limit defaults to 8MB)

---

## 4) Stop Vercel 404 on deep links (already included)

This repo includes `vercel.json` to ensure routes like `/catalog` and `/rfq` don't 404 on refresh.

---

## 5) Save leads to a pipeline (Zoho / Odoo)

The backend supports an optional webhook:

- `LEAD_WEBHOOK_URL` – a URL that accepts JSON
- `LEAD_WEBHOOK_SECRET` – optional shared secret (sent as `X-Lead-Secret`)

### A) Zoho (recommended): Zoho Flow “Incoming Webhook” → Zoho CRM Lead

1. Zoho Flow → **Create Flow**
2. Choose trigger: **Webhook → Incoming Webhook**
3. Copy the generated webhook URL
4. Add action: **Zoho CRM → Create/Update Lead**
5. Map fields:
   - Company → `form.company`
   - Last Name → `form.name` (or split if you want)
   - Email → `form.email`
   - Phone → `form.phone`
   - Description/Notes → `form.notes` + `cart`
6. In Vercel env vars:
   - `LEAD_WEBHOOK_URL` = (your Zoho Flow webhook URL)
   - `LEAD_WEBHOOK_SECRET` = (optional)
7. Redeploy

Now every RFQ creates a lead automatically.

### B) Odoo: Webhook → CRM Lead

Simplest approaches:

1) Use an automation platform (Make/Zapier) with an incoming webhook and Odoo CRM connector.

2) If you control an Odoo server with a custom module:
   - Create a public controller route (e.g., `/marsaan/leads`) that accepts JSON and creates a `crm.lead`.
   - Set `LEAD_WEBHOOK_URL` to that route.

---

## 6) Limits & best practices

- Keep BOM uploads small (< 8MB default). Adjust `RFQ_MAX_FILE_BYTES` if needed.
- Add spam protection later (Cloudflare Turnstile / reCAPTCHA / rate limiting).
- For large BOMs, store files in S3/Drive and email a link (future upgrade).
