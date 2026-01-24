import Busboy from 'busboy';
import nodemailer from 'nodemailer';

function badRequest(res, message) {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: false, error: message }));
}

function serverError(res, message) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: false, error: message }));
}

function formatSmtpError(e) {
  // Keep it safe (no credentials), but include helpful diagnostics.
  const code = e?.code || e?.responseCode || e?.errno || 'smtp_error';
  const cmd = e?.command ? ` (${e.command})` : '';
  const msg = e?.message ? String(e.message) : 'Email send failed.';
  const response = e?.response ? ` | response: ${String(e.response).slice(0, 240)}` : '';
  return `Email send failed [${code}]${cmd}: ${msg}${response}`;
}

function ok(res, body) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, ...body }));
}

function parseMultipart(req, { maxFileBytes }) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: { fileSize: maxFileBytes }
    });

    const fields = {};
    let bom = null; // { filename, mimeType, buffer }
    let bomTooLarge = false;

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      if (name !== 'bom') {
        // drain unknown file field
        file.resume();
        return;
      }
      const chunks = [];
      file.on('limit', () => { bomTooLarge = true; });
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        bom = { filename: filename || 'bom', mimeType: mimeType || 'application/octet-stream', buffer: Buffer.concat(chunks) };
      });
    });

    bb.on('error', reject);
    bb.on('finish', () => resolve({ fields, bom, bomTooLarge }));

    req.pipe(bb);
  });
}

function buildEmailText(payload) {
  const f = payload?.form || {};
  const lines = Array.isArray(payload?.cart) ? payload.cart : [];

  const header = [
    'New RFQ received on Marsaan.com',
    '',
    `Submitted At: ${payload?.submittedAt || new Date().toISOString()}`,
    '',
    'Lead details',
    `Company: ${f.company || ''}`,
    `Name: ${f.name || ''}`,
    `Email: ${f.email || ''}`,
    `Phone: ${f.phone || ''}`,
    `Customer Type: ${f.customerType || ''}`,
    `Country: ${f.country || ''}`,
    `Needed By: ${f.neededBy || ''}`,
    '',
    'Items'
  ].join('\n');

  const items = lines.length
    ? lines.map((x, i) => `${i + 1}. ${x.sku || ''} | ${x.name || ''} | ${x.model || ''} | Qty: ${x.qty || ''}`).join('\n')
    : '(No cart items — BOM-only submission)';

  const notes = `\n\nNotes\n${f.notes || ''}\n`;

  return header + '\n' + items + notes;
}

async function sendLeadWebhook(payload) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return { sent: false };
  const secret = process.env.LEAD_WEBHOOK_SECRET;

  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers['X-Lead-Secret'] = secret;

  const r = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  return { sent: true, status: r.status };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST, OPTIONS');
    res.end('Method Not Allowed');
    return;
  }

  const maxFileBytes = Number(process.env.RFQ_MAX_FILE_BYTES || 8000000);

  let parsed;
  try {
    parsed = await parseMultipart(req, { maxFileBytes });
  } catch (e) {
    return serverError(res, 'Failed to parse form data.');
  }

  if (parsed.bomTooLarge) {
    return badRequest(res, `BOM file too large. Max allowed is ${Math.floor(maxFileBytes / 1000000)}MB.`);
  }

  // Expect JSON in field "rfq"
  let payload;
  try {
    payload = parsed.fields?.rfq ? JSON.parse(parsed.fields.rfq) : null;
  } catch (e) {
    return badRequest(res, 'Invalid RFQ JSON.');
  }

  if (!payload || !payload.form || (!Array.isArray(payload.cart) && !parsed.bom)) {
    return badRequest(res, 'Missing RFQ payload.');
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const MAIL_TO = process.env.MAIL_TO || SMTP_USER;
  const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return serverError(res, 'SMTP environment variables are not configured.');
  }

  const portNum = Number(SMTP_PORT || 465);
  const secure = portNum === 465;

  async function sendMailWithFallback(mail) {
    const candidates = [
      { host: SMTP_HOST, port: portNum, secure },
    ];
    // Auto-fallback between 465 (SSL) and 587 (STARTTLS) — common Zoho setups.
    if (portNum === 465) candidates.push({ host: SMTP_HOST, port: 587, secure: false });
    if (portNum === 587) candidates.push({ host: SMTP_HOST, port: 465, secure: true });

    let lastErr;
    for (const c of candidates) {
      try {
        const transporter = nodemailer.createTransport({
          host: c.host,
          port: c.port,
          secure: c.secure,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          // Prevent long hangs in serverless.
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 15_000,
        });

        await transporter.sendMail(mail);
        return { ok: true, used: { port: c.port, secure: c.secure } };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }

  const rfqJson = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
  const subject = `Marsaan RFQ — ${payload?.form?.company || payload?.form?.name || 'New lead'} — ${new Date().toLocaleString()}`;

  const attachments = [
    {
      filename: `Marsaan_RFQ_${Date.now()}.json`,
      content: rfqJson,
      contentType: 'application/json'
    }
  ];

  if (parsed.bom?.buffer?.length) {
    attachments.push({
      filename: parsed.bom.filename || `BOM_${Date.now()}`,
      content: parsed.bom.buffer,
      contentType: parsed.bom.mimeType || 'application/octet-stream'
    });
  }

  const text = buildEmailText(payload);

  let sendMeta;
  try {
    sendMeta = await sendMailWithFallback({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject,
      text,
      attachments
    });
  } catch (e) {
    return serverError(res, formatSmtpError(e));
  }

  // optional webhook to CRM
  let webhook = null;
  try {
    webhook = await sendLeadWebhook(payload);
  } catch (e) {
    webhook = { sent: false, error: 'webhook_failed' };
  }

  ok(res, { message: 'RFQ received and emailed successfully.', smtp: sendMeta?.used || null, webhook });
}
