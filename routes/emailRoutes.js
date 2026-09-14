const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  const { to, subject, body, file_url, file_name } = req.body;
  if (!to) return res.status(400).json({ message: 'Recipient email is required' });

  if (!process.env.SMTP_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(503).json({ message: 'Email service not configured. Add SMTP_HOST, EMAIL_USER, EMAIL_PASS to your .env file.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${subject || 'Document shared with you'}</h2>
      <p style="color: #666; line-height: 1.6;">${body || 'A document has been shared with you via Investor OS.'}</p>
      ${file_url ? `<p><a href="${file_url}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">View / Download ${file_name || 'Document'}</a></p>` : ''}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#999;font-size:12px;">Sent via Investor OS</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Investor OS" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || 'Document shared with you',
    html,
  });

  res.json({ message: 'Email sent successfully' });
});

module.exports = router;
