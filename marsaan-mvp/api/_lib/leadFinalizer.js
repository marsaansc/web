// api/_lib/leadFinalizer.js
//
// Agent 3 — RFQ Finalization. Closes the loop: a lead found by Lead Scout,
// contacted (by you, manually or via Agent 2's drafts later), replies —
// and that reply gets turned into a real RFQ in the same tables and
// dashboard every other RFQ already uses.
//
// Shares the same extraction pattern as bomParser.js and leadScout.js
// (see modelJson.js) — same underlying skill, applied to a third kind of
// input: a free-text customer reply instead of a spreadsheet or search
// result. This is the point of that shared utility: one consistent way
// to turn messy text into structured data, reused across every agent.
//
// Deliberately lenient: a real reply may not mention a company name or
// give contact details in the same message — nothing here is required.
// The output is a starting point for the RFQ, not a finished one; you
// review it in the admin dashboard same as any other RFQ.

import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromMessage, parseJsonArrayFromModelText } from './modelJson.js';

const FINALIZATION_MODEL = 'claude-haiku-4-5-20251001'; // structured extraction, same class of task as bomParser.js

function buildFinalizationPrompt(replyText) {
  return `A potential customer replied to an outreach message about sourcing electronic components from Marsaan, an Indian semiconductor/FPGA distributor. Extract what they said into structured data.

Their reply:
"""
${replyText}
"""

Extract:
- "company": company name, if mentioned, else null
- "contactName": their name, if mentioned, else null
- "email": their email, if mentioned, else null
- "phone": their phone number, if mentioned, else null
- "items": array of parts they want, each with "partNumber" (or best description if no exact part number given), "manufacturer" (if mentioned, else null), "description" (else null), "qty" (as a number; if unspecified default to 1)

Only extract what's actually stated — do not invent company names, contact details, or parts that weren't mentioned. If they didn't mention any specific parts, return an empty items array.

Respond with ONLY a JSON object (not wrapped in an array), no other text, no markdown code fences. Example shape:
{"company":"Acme Robotics","contactName":"Priya","email":null,"phone":null,"items":[{"partNumber":"XC7A35T","manufacturer":"AMD/Xilinx","description":null,"qty":200}]}`;
}

/**
 * Parses a pasted customer reply into structured RFQ data.
 *
 * @param {string} replyText - the raw text the admin pasted in
 * @returns {Promise<{ ok: boolean, extracted?: object, reason?: string }>}
 */
export async function finalizeLeadReply(replyText) {
  if (!replyText || !replyText.trim()) {
    return { ok: false, reason: 'empty_reply_text' };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, reason: 'anthropic_api_key_missing' };
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: FINALIZATION_MODEL,
    max_tokens: 2048,
    temperature: 0,
    messages: [{ role: 'user', content: buildFinalizationPrompt(replyText) }],
  });

  const text = extractTextFromMessage(message);

  let extracted;
  try {
    // Reusing the array parser here would fail (this returns a single
    // object, not an array) — wrap/unwrap so we still get the same
    // defensive code-fence stripping the shared util provides.
    extracted = parseJsonArrayFromModelText(`[${text}]`)[0];
  } catch (e) {
    return { ok: false, reason: `model_output_parse_error: ${e.message}` };
  }

  return { ok: true, extracted };
}
