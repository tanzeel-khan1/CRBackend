const createMailer = require('./mailer');

const transporter = createMailer();

const investorEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

module.exports = investorEmail;;