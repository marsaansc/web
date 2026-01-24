export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    service: 'marsaan-mvp',
    ts: new Date().toISOString(),
    hasSmtpHost: Boolean(process.env.SMTP_HOST),
    hasSmtpUser: Boolean(process.env.SMTP_USER),
    hasMailTo: Boolean(process.env.MAIL_TO),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    hasResendFrom: Boolean(process.env.RESEND_FROM),
    hasWebhook: Boolean(process.env.LEAD_WEBHOOK_URL)
  }));
}
