// utils/emailService.js
// Sends OTP emails via Gmail using Nodemailer

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a 6-digit OTP to the given email address.
 * @param {string} email - Recipient email
 * @param {string} otp   - The plain-text OTP to send
 */
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"अंतरमन AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} — Your अंतरमन AI Verification Code`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a12; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e2e;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            अंतरमन <span style="font-weight: 400; opacity: 0.9;">AI</span>
          </h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">
            Email Verification
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px; text-align: center;">
          <p style="color: #a0a0b8; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
            Use the code below to verify your email address and complete your registration.
          </p>

          <!-- OTP Code -->
          <div style="background: #12121f; border: 2px solid #7c3aed; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
            <span style="color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>

          <p style="color: #6b6b80; font-size: 12px; margin: 20px 0 0;">
            This code expires in <strong style="color: #a78bfa;">5 minutes</strong>.
          </p>
          <p style="color: #6b6b80; font-size: 12px; margin: 8px 0 0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid #1e1e2e; text-align: center;">
          <p style="color: #4a4a5a; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} अंतरमन AI — Personality Forge
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
