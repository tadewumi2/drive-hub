import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: `"DriveHub" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export function getVerificationEmailHtml(name: string, otp: string) {
  return `
    <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">DriveHub</h1>
      </div>
      <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 8px;">Verify your email</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Hi ${name}, thanks for signing up! Use the code below to verify your email address.
      </p>
      <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a; margin: 0;">
          ${otp}
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
        This code expires in 10 minutes. If you didn't create an account, you can ignore this email.
      </p>
    </div>
  `;
}

export function getPasswordResetEmailHtml(name: string, url: string) {
  return `
    <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">DriveHub</h1>
      </div>
      <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
      </p>
      <a href="${url}" style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
        Reset Password
      </a>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">
        This link expires in 1 hour. If you didn't request a reset, you can ignore this email.
      </p>
    </div>
  `;
}
