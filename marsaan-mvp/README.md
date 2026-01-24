# Marsaan MVP Website (Catalog + RFQ + BOM Upload)

This project is a working **Phase‑1 B2B MVP** for a semiconductor distribution business:

- Public catalog (from your uploaded Excel "High" priority SKUs)
- Request Quote + BOM upload (MVP downloads RFQ JSON; connect to a real endpoint later)
- Lead capture for Startup / OEM / University
- Credibility pages: Quality, Sourcing, Traceability, Returns
- Product pages show **Tier‑1 authorized** and **Tier‑2 India stockist** RFQ routing (from your mapping files)

## 1) Run locally

1. Install Node.js (LTS)
2. In a terminal:

```bash
cd marsaan-mvp
npm install
npm run dev
```

Open: http://localhost:5173

## 2) Build for production

```bash
npm run build
npm run preview
```

## 3) Deploy + connect marsaan.com

### Option A (easiest): Vercel / Netlify
- Push this folder to GitHub
- Import the repo into Vercel or Netlify
- Build command: `npm run build`
- Output folder: `dist`

Then connect your domain:
- Add `marsaan.com` and `www.marsaan.com` in the hosting dashboard
- Update DNS at your domain registrar (A record / CNAME as instructed by host)
- Enable SSL (automatic)

### Option B: Any static hosting
Upload `/dist` output to any static site host (S3+CloudFront, Cloudflare Pages, etc.)

## 4) Make RFQ submissions real (important)

Right now, RFQ submissions download as a JSON file so you can email it + BOM to your inbox.

To productionize, choose one:
- Formspree: send form data to your email (quick)
- Netlify Forms: capture submissions (quick)
- Vercel serverless function: save to CRM + email to rfq@marsaan.com (best)
- Odoo/Zoho integration: create leads/quotes automatically

## 5) Data sources used

- `/src/data/products.json` generated from:
  - `FPGA_AI_Product_Research_Workbook_GTM_and_Supplier_Verification_v10_HIGH_TOP20.xlsx` (Products_Master, Priority_Label=High)
  - `SKU_Tier1_Authorized_Distributors_Mapping_Bangalore.xlsx` (SKU_Tier1_Mapping)
  - `SKU_Tier2_India_GST_Stockists_Mapping_Bangalore.xlsx` (SKU_Tier2_GST_Stockists)

Reference files are copied to `/references/` (remove before public publishing if you don’t want them exposed).

## 6) Next upgrades (recommended)
- Customer login + quote tracking
- Admin dashboard for RFQs + status + follow-ups
- Email automation & CRM pipeline
- Inventory visibility + lead time rules
- Payments + shipping labels + invoices
