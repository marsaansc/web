// api/_lib/bomParser.js
//
// The "customer-facing BOM agent" — step 4 of the roadmap.
//
// Job: take the raw file a customer uploaded with their RFQ, and turn it
// into structured rows (part number, manufacturer, description, qty) that
// land in rfq_line_items — the same table manually-added cart items use.
//
// Design choices, and why:
//
// - CSV/XLSX only for now. PDF BOMs exist too, but reliably extracting a
//   table from an arbitrary PDF layout is a meaningfully harder problem
//   (scanned images, multi-column layouts, merged cells rendered as text).
//   Shipping CSV/XLSX now covers the common case; PDF is a clearly-scoped
//   follow-up, not something to bolt on halfway here.
//
// - Two-stage extraction: first XLSX (SheetJS) reads the actual file
//   structure deterministically — no AI involved yet, this part is exact.
//   Then Claude reads that raw tabular data and normalizes it into a
//   consistent shape, because real-world BOMs are messy: headers vary
//   ("MPN" vs "Part No" vs "Manufacturer Part Number"), notes rows sneak
//   in, columns are reordered. A model handles that variance far better
//   than hand-written column-matching rules would.
//
// - Bounded and non-blocking by design: row count is capped, and the
//   caller (api/rfq.js) wraps this in a timeout. If parsing fails or is
//   slow, the RFQ still gets saved and emailed exactly as before — this
//   is a bonus enrichment step, never a dependency for the core flow.
//
// - Every parsed row keeps its original raw data (see raw_extracted in
//   the schema) so a human can verify what the model saw, since AI
//   extraction of messy real-world documents is inherently imperfect.

import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';
import { extractTextFromMessage, parseJsonArrayFromModelText } from './modelJson.js';

const MAX_ROWS = 300; // bounds cost/latency on very large BOMs
const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap; this is a well-defined structured task, not one that needs the flagship model

const SUPPORTED_EXTENSIONS = ['csv', 'xlsx', 'xls'];

function getExtension(filename) {
  return (filename || '').split('.').pop()?.toLowerCase();
}

export function isBomFileSupported(filename) {
  return SUPPORTED_EXTENSIONS.includes(getExtension(filename));
}

/**
 * Reads a CSV/XLSX buffer into a plain 2D array of cell values (no AI yet —
 * this part is exact, using SheetJS's own parsing).
 */
function extractRawRows(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  // header: 1 -> array-of-arrays (raw rows), not object-per-row, because
  // we don't yet know which row (if any) is the real header — that's
  // exactly the kind of ambiguity we hand to Claude next.
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  return rows.slice(0, MAX_ROWS);
}

function buildExtractionPrompt(rawRows) {
  return `You are extracting a structured Bill of Materials (BOM) from raw spreadsheet data uploaded by a customer to an electronics distributor's RFQ form.

Raw rows (as parsed directly from their file, one row per array):
${JSON.stringify(rawRows)}

Extract each real line item as JSON. Rules:
- Skip header rows, blank rows, section titles, and notes/comment rows — only include actual parts.
- "partNumber" is the manufacturer part number / MPN / model number (whatever the customer used to identify the part) — required, skip rows without one.
- "manufacturer" — the maker's name, if present, else null.
- "description" — any descriptive text about the part (value, package, specs), else null.
- "qty" — quantity needed, as a number. If missing, default to 1.
- Do not invent data that isn't in the rows.

Respond with ONLY a JSON array, no other text, no markdown code fences. Example shape:
[{"partNumber":"XC7A35T-1CSG324C","manufacturer":"AMD/Xilinx","description":"FPGA, 33K LUT","qty":10}]`;
}




/**
 * Parses an uploaded BOM file into structured line items.
 *
 * @param {Buffer} buffer - the raw uploaded file
 * @param {string} filename - original filename, used to check the extension
 * @returns {Promise<{ supported: boolean, items: Array, reason?: string }>}
 */
export async function parseBomFile(buffer, filename) {
  if (!isBomFileSupported(filename)) {
    return { supported: false, items: [], reason: 'unsupported_file_type' };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { supported: false, items: [], reason: 'anthropic_api_key_missing' };
  }

  let rawRows;
  try {
    rawRows = extractRawRows(buffer);
  } catch (e) {
    return { supported: false, items: [], reason: `file_read_error: ${e.message}` };
  }

  if (rawRows.length === 0) {
    return { supported: true, items: [], reason: 'empty_file' };
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: 'user', content: buildExtractionPrompt(rawRows) }],
  });

  const text = extractTextFromMessage(message);

  let items;
  try {
    items = parseJsonArrayFromModelText(text);
  } catch (e) {
    return { supported: true, items: [], reason: `model_output_parse_error: ${e.message}` };
  }

  return { supported: true, items };
}
