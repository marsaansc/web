import Busboy from 'busboy'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Vercel Serverless Function: POST /api/rfq
// - Accepts multipart/form-data with:
//   - payload: JSON string (required)
//   - bom: file (optional)
// - Sends an email to rfq@marsaan.com (or MAIL_TO)
// - Optionally forwards lead JSON to a webhook (Zoho Flow / Odoo endpoint)

const MAX_FILE_BYTES = Number(process.env.RFQ_MAX_FILE_BYTES || 8_000_000) // 8 MB

function json(res, status, body){
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function setCors(req, res){
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function parseMultipart(req){
  return new Promise((resolve, reject)=>{
    const bb = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: MAX_FILE_BYTES,
        fields: 25
      }
    })

    const fields = {}
    let file = null

    bb.on('field', (name, val)=>{
      fields[name] = val
    })

    bb.on('file', (name, stream, info)=>{
      const { filename, mimeType } = info
      if(name !== 'bom'){
        stream.resume()
        return
      }
      const chunks = []
      let size = 0
      stream.on('data', (d)=>{
        size += d.length
        chunks.push(d)
      })
      stream.on('limit', ()=>{
        reject(new Error(`BOM file too large. Max ${MAX_FILE_BYTES} bytes.`))
      })
      stream.on('end', ()=>{
        file = {
          filename,
          mimeType: mimeType || 'application/octet-stream',
          size,
          buffer: Buffer.concat(chunks)
        }
      })
    })

    bb.on('error', reject)
    bb.on('finish', ()=> resolve({ fields, file }))
    req.pipe(bb)
  })
}

function requireEnv(name){
  const v = process.env[name]
  if(!v) throw new Error(`Missing env: ${name}`)
  return v
}

function buildEmailText(payload){
  const f = payload?.form || {}
  const cart = payload?.cart || []

  const lines = []
  lines.push(`Marsaan RFQ received: ${payload?.submittedAt || new Date().toISOString()}`)
  lines.push('')
  lines.push('Lead')
  lines.push(`Company: ${f.company || '-'}`)
  lines.push(`Name: ${f.name || '-'}`)
  lines.push(`Email: ${f.email || '-'}`)
  lines.push(`Phone: ${f.phone || '-'}`)
  lines.push(`Customer Type: ${f.customerType || '-'}`)
  lines.push(`Country: ${f.country || '-'}`)
  lines.push(`Needed By: ${f.neededBy || '-'}`)
  lines.push('')
  lines.push('Notes')
  lines.push(f.notes || '-')
  lines.push('')
  lines.push(`Quote Lines (${cart.length})`)
  for(const item of cart){
    lines.push(`- ${item.sku || ''} | ${item.name || ''} | ${item.model || ''} | qty: ${item.qty || 1}`)
  }
  return lines.join('\n')
}

export default async function handler(req, res){
  setCors(req, res)
  if(req.method === 'OPTIONS') return res.end('ok')
  if(req.method !== 'POST') return json(res, 405, { ok:false, error: 'Method not allowed' })

  try{
    const { fields, file } = await parseMultipart(req)
    if(!fields.payload) return json(res, 400, { ok:false, error: 'Missing payload' })

    let payload
    try{
      payload = JSON.parse(fields.payload)
    }catch{
      return json(res, 400, { ok:false, error: 'Invalid JSON in payload' })
    }

    const f = payload?.form || {}
    const id = crypto.randomUUID()

    // 1) Email
    const SMTP_HOST = requireEnv('SMTP_HOST')
    const SMTP_PORT = Number(process.env.SMTP_PORT || 465)
    const SMTP_USER = requireEnv('SMTP_USER')
    const SMTP_PASS = requireEnv('SMTP_PASS')

    const MAIL_TO = process.env.MAIL_TO || 'rfq@marsaan.com'
    const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })

    const subject = `[Marsaan RFQ] ${f.company || 'Company'} | ${f.name || 'Contact'} | ${id.slice(0,8)}`
    const text = buildEmailText(payload)
    const attachments = [
      {
        filename: `marsaan-rfq-${id}.json`,
        content: Buffer.from(JSON.stringify({ id, ...payload }, null, 2)),
        contentType: 'application/json'
      }
    ]
    if(file?.buffer?.length){
      attachments.push({
        filename: file.filename || 'bom',
        content: file.buffer,
        contentType: file.mimeType
      })
    }

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject,
      text,
      replyTo: f.email || undefined,
      attachments
    })

    // 2) Optional webhook to CRM automation (Zoho Flow / Odoo / Make / Zapier)
    const hook = process.env.LEAD_WEBHOOK_URL
    if(hook){
      const secret = process.env.LEAD_WEBHOOK_SECRET || ''
      const resp = await fetch(hook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'X-Lead-Secret': secret } : {})
        },
        body: JSON.stringify({ id, ...payload })
      })
      if(!resp.ok){
        // Don't fail the RFQ if CRM webhook fails; just log
        console.error('Lead webhook failed:', resp.status)
      }
    }

    return json(res, 200, { ok:true, id })
  }catch(err){
    console.error(err)
    return json(res, 500, { ok:false, error: err?.message || 'Server error' })
  }
}
