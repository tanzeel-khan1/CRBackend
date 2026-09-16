const sendEmail = require('./investorEmail');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const sendCompanyWelcomeEmail = async ({ email, fullName, companyName }) => {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:7000';
  const name = escapeHtml(fullName || 'there');
  const safeCompanyName = escapeHtml(companyName || 'your company');

  await sendEmail({
    to: email,
    subject: `Welcome to TBuilds OS — ${companyName} is ready!`,
    html: `
      <div style="margin:0;background:#f4f5f7;padding:32px 16px;font-family:Arial,sans-serif;color:#172033;">
        <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <div style="background:#07101f;padding:30px 32px;color:#fff;">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#f8d36a;font-weight:700;">TBuilds OS</div>
            <div style="font-size:28px;font-weight:700;margin-top:12px;">Your workspace is ready.</div>
            <div style="font-size:14px;color:#b7c0cf;margin-top:8px;">A smarter home for your real estate workflow.</div>
          </div>
          <div style="padding:32px;">
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">Hi ${name},</p>
            <p style="color:#475569;font-size:14px;line-height:1.7;">Congratulations! <strong>${safeCompanyName}</strong> has been created successfully in TBuilds OS.</p>
            <div style="margin:24px 0;">
              <div style="padding:14px 0;border-bottom:1px solid #e5e7eb;"><strong style="font-size:14px;">Manage properties</strong><div style="color:#64748b;font-size:13px;margin-top:4px;">Create listings, track availability, pricing, and photos.</div></div>
              <div style="padding:14px 0;border-bottom:1px solid #e5e7eb;"><strong style="font-size:14px;">Build your client pipeline</strong><div style="color:#64748b;font-size:13px;margin-top:4px;">Move clients from new lead to viewing, negotiation, and closing.</div></div>
              <div style="padding:14px 0;border-bottom:1px solid #e5e7eb;"><strong style="font-size:14px;">Run the business</strong><div style="color:#64748b;font-size:13px;margin-top:4px;">Send invoices, track expenses, manage your team, and store documents.</div></div>
            </div>
            <p style="text-align:center;margin:28px 0;"><a href="${appUrl}/personal" style="background:#07101f;color:#fff;padding:13px 24px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">Open TBuilds OS</a></p>
            <p style="font-size:12px;color:#94a3b8;line-height:1.6;">Need help? Reply to this email or visit your dashboard settings.</p>
          </div>
          <div style="border-top:1px solid #e5e7eb;padding:18px 32px;color:#94a3b8;font-size:12px;">Sent by Tanzil · TBuilds OS</div>
        </div>
      </div>
    `,
  });
};

module.exports = sendCompanyWelcomeEmail;
