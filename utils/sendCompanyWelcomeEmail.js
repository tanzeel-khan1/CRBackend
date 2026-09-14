const sendEmail = require('./investorEmail');

const sendCompanyWelcomeEmail = async ({ email, fullName, companyName }) => {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:7000';
  const name = fullName || 'there';

  await sendEmail({
    to: email,
    subject: `Welcome to InvestorOS — ${companyName} is ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
        <div style="max-width:520px; margin:auto; background:white; padding:30px; border-radius:10px;">
          <h2 style="color:#111; margin-bottom:10px;">Welcome to InvestorOS 🚀</h2>
          <p style="color:#555; font-size:14px; line-height:1.6;">
            Hi ${name},
          </p>
          <p style="color:#555; font-size:14px; line-height:1.6;">
            Congratulations! Your company <strong>${companyName}</strong> has been created successfully.
            Here is a quick guide to get started:
          </p>
          <ol style="color:#444; font-size:14px; line-height:1.8; padding-left:20px;">
            <li><strong>Personal Space</strong> — View your overview, financials, notes, and documents.</li>
            <li><strong>Company Workspace</strong> — Manage investors, expenses, invoices, and team members.</li>
            <li><strong>Add Investors</strong> — Invite partners and track ownership from the Investors page.</li>
            <li><strong>Track Finances</strong> — Record expenses and invoices to keep everything organized.</li>
            <li><strong>Upload Documents</strong> — Store contracts, legal files, and important records securely.</li>
          </ol>
          <p style="text-align:center; margin:28px 0;">
            <a href="${appUrl}/personal" style="background:#111; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block;">
              Open InvestorOS
            </a>
          </p>
          <hr style="margin:20px 0;" />
          <p style="font-size:12px; color:#888;">
            Need help? Reply to this email or visit your dashboard settings.
          </p>
          <p style="font-size:12px; color:#aaa;">InvestorOS Team</p>
        </div>
      </div>
    `,
  });
};

module.exports = sendCompanyWelcomeEmail;
