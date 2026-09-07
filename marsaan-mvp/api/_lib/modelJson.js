// api/_lib/modelJson.js
//
// Both agents (bomParser.js and leadScout.js) ask Claude to respond with
// strict JSON and then need to reliably parse that response. This is the
// one shared piece of code between them — literally the same normalization
// step regardless of whether the raw input was a spreadsheet row or a
// scraped forum post. Keeping it in one place means a fix or improvement
// here (e.g. handling a new way models wrap JSON) benefits both agents
// at once, and both agents stay consistent in how strictly they parse.

/**
 * Extracts the text content from a Claude API response, ignoring any
 * tool_use/tool_result blocks (relevant for leadScout.js, which uses the
 * web_search tool and gets mixed content blocks back).
 */
export function extractTextFromMessage(message) {
  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

/**
 * Parses a JSON array out of a model's text response, defensively handling
 * the common ways models deviate from "respond with ONLY JSON" instructions
 * (markdown code fences being the most frequent one).
 *
 * Throws on genuinely unparseable output — callers should catch this and
 * treat it as "extraction failed for this item," never silently return
 * fabricated data.
 */
export function parseJsonArrayFromModelText(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error('Model did not return a JSON array.');
  }
  return parsed;
}
