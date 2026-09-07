// api/_lib/leadScout.js
//
// The demand-discovery agent — finds public posts/listings where someone
// appears to be looking for a specific part you stock, so you can reach
// out proactively instead of only reacting to inbound RFQs.
//
// Shares its JSON-extraction step with bomParser.js (see modelJson.js) —
// same underlying skill (turn messy text into structured data), applied
// to a different kind of input. See ARCHITECTURE note in modelJson.js.
//
// Design choices:
//
// - Uses Sonnet (not Haiku, unlike bomParser.js) — this task requires
//   judgment about whether a search result is a *genuine* demand signal
//   vs. noise (a spec sheet, an old post, an unrelated product), and
//   false positives here waste your time chasing bad leads. Worth the
//   extra cost for a task that only runs on manual trigger, not per-RFQ.
//
// - Uses Claude's built-in web_search tool (a real Anthropic API feature,
//   not a custom scraper) — searches public, indexed content only. It
//   cannot see closed platforms, login-gated listings, or private groups.
//
// - Scoped to India-relevant sourcing platforms by default in the prompt,
//   since that's where your actual buyers are — general web search alone
//   skews toward US/global forums that aren't where your customers are.
//
// - Never auto-contacts anyone. Output is a list of leads for a human
//   (you) to review and decide whether/how to reach out.

import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromMessage, parseJsonArrayFromModelText } from './modelJson.js';

const SCOUT_MODEL = 'claude-sonnet-5';

function buildScoutPrompt({ sku, productName, manufacturer, keySpecs }) {
  return `You are helping an Indian electronics distributor (Marsaan) find potential customers by searching the public web for people currently looking to buy a specific part.

Part to search for:
- Internal SKU: ${sku}
- Product name: ${productName}
- Manufacturer: ${manufacturer || 'unknown'}
- Key specs: ${keySpecs || 'none provided'}

Search the web for PUBLIC posts, listings, or requests where someone appears to be actively looking to buy, source, or get a quote for this part (or a very close equivalent) — not general information pages, datasheets, or unrelated product listings. Prioritize sources relevant to Indian buyers first (IndiaMART, TradeIndia, Indian engineering/maker forums, Indian startup/hardware communities), then general global sources (Reddit, X/Twitter, industry forums) if nothing India-specific turns up.

For each genuine demand signal you find, note:
- The exact source URL
- The platform/site name
- A short snippet showing why this looks like real demand (quote or paraphrase the relevant part)
- Quantity mentioned, if any (as a number, or null if not specified)

Be conservative — only include results that look like a real person actively wanting to buy this part soon, not old archived posts, general discussions about the technology, or spec/comparison pages. It's fine to return an empty list if nothing genuine turns up.

After searching, respond with ONLY a JSON array, no other text, no markdown code fences. Example shape:
[{"sourceUrl":"https://...","platform":"IndiaMART","snippet":"...","qtyMentioned":50}]`;
}

/**
 * Searches the public web for demand signals for one catalog part.
 *
 * @param {{ sku, productName, manufacturer, keySpecs }} product
 * @returns {Promise<{ ok: boolean, leads: Array, reason?: string }>}
 */
export async function scanForLeads(product) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, leads: [], reason: 'anthropic_api_key_missing' };
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: SCOUT_MODEL,
    max_tokens: 4096,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: buildScoutPrompt(product) }],
  });

  const text = extractTextFromMessage(message);

  let leads;
  try {
    leads = parseJsonArrayFromModelText(text);
  } catch (e) {
    return { ok: false, leads: [], reason: `model_output_parse_error: ${e.message}` };
  }

  return { ok: true, leads };
}
