// utils/emailService.js
// Sends OTP emails via Gmail using Nodemailer or Resend HTTP API

const nodemailer = require("nodemailer");
const { Resend } = require("resend");

// Initialize Resend if API key is provided
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // Force IPv4 to prevent connection issues on IPv6-disabled cloud servers
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

/**
 * Sends a 6-digit OTP to the given email address.
 * @param {string} email - Recipient email
 * @param {string} otp   - The plain-text OTP to send
 */
async function sendOtpEmail(email, otp) {
  const fromName = "अंतरमन AI";
  const subject = `${otp} — Your अंतरमन AI Verification Code`;
  const htmlContent = `
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
  `;

  if (resendClient) {
    try {
      // By default on free tier, Resend requires sender to be 'onboarding@resend.dev'
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const info = await resendClient.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: subject,
        html: htmlContent,
      });
      console.log(`[Resend Success] OTP email sent via HTTP API. ID: ${info.data?.id}`);
      return info;
    } catch (error) {
      console.error(`[Resend Error] Failed to send OTP email to ${email}:`, error);
      throw new Error(`SMTP_ERROR: Resend API delivery failed: ${error.message}`);
    }
  } else {
    // Fallback to Nodemailer SMTP
    const mailOptions = {
      from: `"${fromName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[SMTP Success] OTP email sent successfully to ${email}. Response: ${info.response}`);
      return info;
    } catch (error) {
      console.error(`[SMTP Error] Failed to send OTP email to ${email}:`, error);
      throw new Error(`SMTP_ERROR: SMTP connection failed (${error.message}). Note: Render blocks standard SMTP ports (25, 465, 587) on its Free tier. If you are on the Free tier, please configure the 'RESEND_API_KEY' environment variable to send emails via HTTP API.`);
    }
  }
}

module.exports = { sendOtpEmail };
