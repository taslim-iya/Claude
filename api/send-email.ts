import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { to, from, fromName, subject, html, text, replyTo } = req.body || {};

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html or text' });
  }

  // Try Resend first, fall back to SendGrid
  const resendKey = req.headers['x-resend-key'] as string || process.env.RESEND_API_KEY || '';
  const sendgridKey = req.headers['x-sendgrid-key'] as string || process.env.SENDGRID_API_KEY || '';

  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromName ? `${fromName} <${from || 'noreply@prospectiq.app'}>` : (from || 'noreply@prospectiq.app'),
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || undefined,
          text: text || undefined,
          reply_to: replyTo || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.message || 'Resend error', provider: 'resend' });
      return res.status(200).json({ success: true, id: data.id, provider: 'resend' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message, provider: 'resend' });
    }
  }

  if (sendgridKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: Array.isArray(to) ? to[0] : to }] }],
          from: { email: from || 'noreply@prospectiq.app', name: fromName || 'ProspectIQ' },
          subject,
          content: [
            html ? { type: 'text/html', value: html } : { type: 'text/plain', value: text },
          ],
          reply_to: replyTo ? { email: replyTo } : undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: data.errors?.[0]?.message || 'SendGrid error', provider: 'sendgrid' });
      }
      return res.status(200).json({ success: true, provider: 'sendgrid' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message, provider: 'sendgrid' });
    }
  }

  return res.status(400).json({
    error: 'No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY in Vercel environment variables, or pass x-resend-key / x-sendgrid-key header.',
    setup: {
      resend: 'Sign up at resend.com → get API key → add as RESEND_API_KEY env var in Vercel',
      sendgrid: 'Sign up at sendgrid.com → get API key → add as SENDGRID_API_KEY env var in Vercel',
    }
  });
}
