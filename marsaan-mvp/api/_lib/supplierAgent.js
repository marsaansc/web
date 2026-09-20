// api/_lib/supplierAgent.js
//
// Supplier Agent v1 — "draft, don't send; paste replies, don't poll inbox".
//
// 1) buildQuoteRequestDraft(): deterministic template (no AI). Chosen on
//    purpose: an RFQ email to a supplier must be predictable, and a template
//    can't leak customer names or margins because it is only ever given
//    part numbers, quantities and dates.
// 2) extractSupplierReply(): Haiku turns a pasted reply into per-part terms.
//    Anything uncertain is flagged needs_review instead of guessed.
// 3) sendSupplierEmail(): Resend, sent only after a human approves.

import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromMessage } from './modelJson.js';

const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001';
const COMPANY = process.env.COMPANY_SIGNATURE || 'Marsaan';

export function buildQuoteRequestDraft({ supplier, request }) {
  const items = Array.isArray(request.items) ? request.items : [];
  const lines = items.map((it, i) => {
    const parts = [it.partNumber || it.part_number || '(part no. missing)'];
    if (it.manufacturer) parts.push(`(${it.manufacturer})`);
    const desc = it.description ? ` - ${it.description}` : '';
    return `${i + 1}. ${parts.join(' ')}${desc} | Qty: ${it.qty ?? 1}`;
  });
  const greet = supplier.contact_person ? `Dear ${supplier.contact_person},` : 'Dear Sir/Madam,';
  const asks = [
    'Unit price (please state currency)',
    'MOQ and price breaks, if any',
    'Lead time / stock availability',
    'Payment terms and Incoterms',
    'Warranty and quote validity',
    'Country of origin / authorised-channel confirmation',
  ];
  const body = [
    greet,
    '',
    `We are ${COMPANY}, an electronics and FPGA distributor based in Bangalore, India. We would like a quotation for the following:`,
    '',
    ...lines,
    '',
    'Please include:',
    ...asks.map((a) => `- ${a}`),
    '',
    request.needed_by ? `Required by: ${request.needed_by}` : null,
    request.target_incoterms ? `Preferred Incoterms: ${request.target_incoterms}` : null,
    request.target_payment_terms ? `Preferred payment terms: ${request.target_payment_terms}` : null,
    request.reply_by ? `We would appreciate your reply by ${request.reply_by}.` : 'We would appreciate your reply within 3 working days.',
    '',
    'Thank you,',
    COMPANY,
  ].filter((l) => l !== null).join('\n');

  return {
    subject: `Quotation request ${request.request_number || ''} - ${request.title}`.replace(/\s+/g, ' ').trim(),
    body,
  };
}

function buildExtractionPrompt(replyText, items) {
  return `A supplier replied to a quotation request from an Indian electronics distributor. Extract the quoted terms per part.

Parts we asked about:
${JSON.stringify(items.map((i) => i.partNumber || i.part_number))}

Supplier reply:
"""
${replyText}
"""

Respond with ONLY a JSON object, no markdown fences:
{"declined":boolean,
 "generalTerms":{"paymentTerms":string|null,"incoterms":string|null,"warranty":string|null,"validUntil":string|null,"currency":string|null},
 "quotes":[{"partNumber":string,"unitPrice":number|null,"currency":string|null,"moq":number|null,"leadTimeDays":number|null,"paymentTerms":string|null,"incoterms":string|null,"warranty":string|null,"validUntil":string|null,"needsReview":boolean,"reviewNote":string|null}]}

Rules:
- Only extract what the reply states. Never invent prices, MOQs or dates.
- Use the part numbers from our list where the reply clearly refers to them; otherwise use what the supplier wrote.
- leadTimeDays: convert weeks to days (1 week = 7). "In stock" = 0. Unclear = null and needsReview true.
- If a price has ambiguous currency, tax basis (GST/duty included or not), or quantity tier, set needsReview true and explain in reviewNote.
- If the supplier says they cannot supply, set declined true and quotes [].`;
}

export async function extractSupplierReply(replyText, items) {
  if (!replyText || !replyText.trim()) return { ok: false, reason: 'empty_reply_text' };
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, reason: 'anthropic_api_key_missing' };

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: buildExtractionPrompt(replyText.slice(0, 12000), items) }],
  });
  const text = extractTextFromMessage(message).replace(/```json|```/g, '').trim();
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a === -1 || b < a) return { ok: false, reason: 'model_output_parse_error: no JSON object' };
  try {
    return { ok: true, extracted: JSON.parse(text.slice(a, b + 1)) };
  } catch (e) {
    return { ok: false, reason: `model_output_parse_error: ${e.message}` };
  }
}

export async function sendSupplierEmail({ to, subject, body }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) throw new Error('Resend is not configured (RESEND_API_KEY / RESEND_FROM).');
  const replyTo = process.env.MAIL_TO || undefined;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      bcc: replyTo ? [replyTo] : undefined, // keeps a copy in your own inbox
      reply_to: replyTo,
      subject,
      text: body,
    }),
  });
  const txt = await r.text().catch(() => '');
  if (!r.ok) throw new Error(`Resend ${r.status}: ${txt.slice(0, 200)}`);
  return { ok: true };
}
