// scripts/build-public-catalog.js
//
// Generates the PUBLIC catalog (src/data/products.json) from the PRIVATE
// master data (data/products.master.json).
//
// data/products.master.json contains real commercial data: buy prices,
// gross margins, and internal sourcing strategy per SKU. That file must
// NEVER be imported from anything under src/ — Vite bundles whatever src/
// imports straight into the public JS, which is how these fields leaked
// to every visitor's browser before this fix.
//
// This script runs automatically before `npm run dev` and `npm run build`
// (see package.json "predev"/"prebuild"), so the public catalog is always
// regenerated from the master file and can't drift out of sync.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_PATH = path.join(__dirname, '..', 'data', 'products.master.json');
const PUBLIC_PATH = path.join(__dirname, '..', 'src', 'data', 'products.json');

// Fields that must never reach the client bundle.
const SENSITIVE_FIELDS = [
  'plannedBuyPriceINR',
  'plannedGrossMarginPct',
  'supplierPlan',
  'priorityScore',
];

function stripSensitiveFields(product) {
  const clean = { ...product };
  for (const field of SENSITIVE_FIELDS) {
    delete clean[field];
  }
  return clean;
}

function main() {
  const master = JSON.parse(readFileSync(MASTER_PATH, 'utf-8'));

  const publicCatalog = {
    generatedAt: new Date().toISOString(),
    count: master.products.length,
    products: master.products.map(stripSensitiveFields),
  };

  writeFileSync(PUBLIC_PATH, JSON.stringify(publicCatalog, null, 2) + '\n');

  console.log(
    `[build-public-catalog] Wrote ${publicCatalog.count} products to src/data/products.json ` +
    `(stripped: ${SENSITIVE_FIELDS.join(', ')})`
  );
}

main();
