const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const createMailer = require('../utils/mailer');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not specified'
    : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

router.post('/', protect, async (req, res) => {
  const { to, subject, body, file_url, file_name, invoice } = req.body;
  if (!to) return res.status(400).json({ message: 'Recipient email is required' });

  if (!process.env.SMTP_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(503).json({ message: 'Email service not configured. Add SMTP_HOST, EMAIL_USER, EMAIL_PASS to your .env file.' });
  }

  const safeSubject = escapeHtml(subject || 'Document shared with you');
  const html = invoice ? `
    <div style="margin:0;background:#f4f5f7;padding:32px 16px;font-family:Arial,sans-serif;color:#172033;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#07101f;padding:28px 32px;color:#fff;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#f8d36a;font-weight:700;">Ranvola</div>
          <div style="font-size:26px;font-weight:700;margin-top:10px;">Invoice</div>
          <div style="font-size:13px;color:#b7c0cf;margin-top:5px;">Prepared for ${escapeHtml(invoice.recipient_name)}</div>
        </div>
        <div style="padding:32px;">
          <div style="display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #e5e7eb;padding-bottom:22px;">
            <div><div style="font-size:20px;font-weight:700;">${escapeHtml(invoice.title)}</div><div style="font-size:13px;color:#6b7280;margin-top:6px;">${escapeHtml(invoice.invoice_number)}</div></div>
            <div style="text-align:right;font-size:24px;font-weight:700;">$${Number(invoice.total_amount || 0).toLocaleString()}</div>
          </div>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:22px;font-size:14px;">
            <tr><td style="padding:9px 0;color:#6b7280;">Subtotal</td><td style="padding:9px 0;text-align:right;font-weight:600;">$${Number(invoice.amount || 0).toLocaleString()}</td></tr>
            <tr><td style="padding:9px 0;color:#6b7280;">Tax</td><td style="padding:9px 0;text-align:right;font-weight:600;">$${Number(invoice.tax_amount || 0).toLocaleString()}</td></tr>
            <tr><td style="border-top:1px solid #e5e7eb;padding:14px 0 0;font-size:16px;font-weight:700;">Total due</td><td style="border-top:1px solid #e5e7eb;padding:14px 0 0;text-align:right;font-size:16px;font-weight:700;">$${Number(invoice.total_amount || 0).toLocaleString()}</td></tr>
          </table>
          <div style="margin-top:24px;background:#f8fafc;border-radius:10px;padding:14px 16px;font-size:13px;color:#475569;"><strong>Due date:</strong> ${formatDate(invoice.due_date)} &nbsp; <strong>Status:</strong> ${escapeHtml(invoice.status)}</div>
          ${invoice.notes ? `<div style="margin-top:20px;font-size:13px;color:#64748b;"><strong>Notes</strong><div style="margin-top:6px;white-space:pre-line;">${escapeHtml(invoice.notes)}</div></div>` : ''}
          <p style="margin:28px 0 0;color:#64748b;font-size:13px;line-height:1.6;">Thank you for your business.</p>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding:18px 32px;color:#94a3b8;font-size:12px;">Sent by Ranvola</div>
      </div>
    </div>
  ` : `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#333;">${safeSubject}</h2>
      <p style="color:#666;line-height:1.6;white-space:pre-line;">${escapeHtml(body || 'A document has been shared with you via Ranvola.')}</p>
      ${file_url ? `<p><a href="${escapeHtml(file_url)}" style="background:#111827;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">View / Download ${escapeHtml(file_name || 'Document')}</a></p>` : ''}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#999;font-size:12px;">Sent by Ranvola</p>
    </div>
  `;

  try {
    await createMailer().sendMail({
      from: `"Ranvola" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Document shared with you',
      html,
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Document email failed:', error.message);
    res.status(503).json({ message: 'Email service is temporarily unavailable.' });
  }
});

module.exports = router;
