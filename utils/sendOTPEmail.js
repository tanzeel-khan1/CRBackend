const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `InvestorOS <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - OTP Code",

    html: `
      <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
        <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px;">

          <h2 style="color:#111; margin-bottom:10px;">
            Welcome to Investor Dashboard 🚀
          </h2>

          <p style="color:#555; font-size:14px;">
            Thank you for signing up. Use the OTP below to verify your email address.
          </p>

          <div style="text-align:center; margin:25px 0;">
            <div style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#111;">
              ${otp}
            </div>
          </div>

          <p style="color:#e11d48; font-size:13px; font-weight:600;">
            ⚠️ This OTP will expire in 5 minutes.
          </p>

          <hr style="margin:20px 0;" />

          <p style="font-size:12px; color:#888;">
            If you did not request this email, you can safely ignore it.
          </p>

          <p style="font-size:12px; color:#aaa;">
            InvestorOS Team
          </p>

        </div>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;