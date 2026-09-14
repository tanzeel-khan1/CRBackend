const sendEmail = require('./investorEmail');

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const sendSubscriptionExpiryReminder = async ({ email, fullName, endDate, plan }) => {
  const billingUrl = `${process.env.CLIENT_URL || 'https://main.dsoa1hgcxw1e5.amplifyapp.com'}/billing`;
  const formattedEnd = formatDate(endDate);
  const name = fullName || 'there';

  await sendEmail({
    to: email,
    subject: 'Your InvestorOS subscription is ending soon',
    html: `
      <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
        <div style="max-width:520px; margin:auto; background:white; padding:30px; border-radius:10px;">
          <h2 style="color:#111; margin-bottom:10px;">Subscription Reminder</h2>
          <p style="color:#555; font-size:14px; line-height:1.6;">
            Hi ${name},
          </p>
          <p style="color:#555; font-size:14px; line-height:1.6;">
            This is a friendly reminder that your <strong>${plan || 'Enterprise'}</strong> subscription
            will end on <strong>${formattedEnd}</strong> (in 2 days).
          </p>
          <p style="color:#555; font-size:14px; line-height:1.6;">
            To keep uninterrupted access to InvestorOS, please renew or update your plan before the end date.
          </p>
          <p style="text-align:center; margin:28px 0;">
            <a href="${billingUrl}" style="background:#111; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block;">
              Manage Billing
            </a>
          </p>
          <hr style="margin:20px 0;" />
          <p style="font-size:12px; color:#888;">
            If you already renewed, you can ignore this email.
          </p>
          <p style="font-size:12px; color:#aaa;">InvestorOS Team</p>
        </div>
      </div>
    `,
  });
};

module.exports = sendSubscriptionExpiryReminder;
