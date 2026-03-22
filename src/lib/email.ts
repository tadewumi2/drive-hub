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

const baseStyle = `max-width: 520px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;`;
const headerHtml = `<div style="text-align:center;margin-bottom:28px;"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0;">DriveHub</h1></div>`;
const footerHtml = `<p style="color:#94a3b8;font-size:12px;margin-top:32px;text-align:center;">DriveHub &mdash; Your driving journey starts here.</p>`;

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:140px;">${label}</td><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500;">${value}</td></tr>`;
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:00 ${period}`;
}

/** Sent to the instructor when a student creates a new booking */
export function getNewBookingRequestEmailHtml(params: {
  instructorName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  date: string;
  startHour: number;
  pickupAddress: string | null;
  roadTestCenter: string | null;
  notes: string | null;
  dashboardUrl: string;
}) {
  return `
    <div style="${baseStyle}">
      ${headerHtml}
      <h2 style="font-size:19px;font-weight:600;color:#0f172a;margin-bottom:6px;">New Booking Request</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:20px;">
        Hi ${params.instructorName}, a student has requested a lesson with you. You have <strong>30 minutes</strong> to approve it.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;padding:4px 16px;margin-bottom:24px;">
        ${row("Student", params.studentName)}
        ${row("Email", params.studentEmail)}
        ${row("Phone", params.studentPhone || "Not provided")}
        ${row("Date", params.date)}
        ${row("Time", `${formatHour(params.startHour)} – ${formatHour(params.startHour + 1)}`)}
        ${params.pickupAddress ? row("Pickup", params.pickupAddress) : ""}
        ${params.roadTestCenter ? row("Test Centre", params.roadTestCenter) : ""}
        ${params.notes ? row("Notes", params.notes) : ""}
      </table>
      <a href="${params.dashboardUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Review &amp; Approve
      </a>
      ${footerHtml}
    </div>
  `;
}

/** Sent to the student when their booking is approved by the instructor */
export function getBookingApprovedEmailHtml(params: {
  studentName: string;
  instructorName: string;
  date: string;
  startHour: number;
  pickupAddress: string | null;
  roadTestCenter: string | null;
  hourlyRate: number;
  paymentUrl: string;
}) {
  return `
    <div style="${baseStyle}">
      ${headerHtml}
      <h2 style="font-size:19px;font-weight:600;color:#0f172a;margin-bottom:6px;">Your Booking Was Approved! ✅</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:20px;">
        Hi ${params.studentName}, <strong>${params.instructorName}</strong> has approved your lesson request. Complete your payment to confirm the booking.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;padding:4px 16px;margin-bottom:24px;">
        ${row("Instructor", params.instructorName)}
        ${row("Date", params.date)}
        ${row("Time", `${formatHour(params.startHour)} – ${formatHour(params.startHour + 1)}`)}
        ${params.pickupAddress ? row("Pickup", params.pickupAddress) : ""}
        ${params.roadTestCenter ? row("Test Centre", params.roadTestCenter) : ""}
        ${row("Amount Due", `$${params.hourlyRate.toFixed(2)} CAD`)}
      </table>
      <a href="${params.paymentUrl}" style="display:inline-block;background:#d4a017;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Pay Now
      </a>
      ${footerHtml}
    </div>
  `;
}

/** Sent to the instructor when a student pays for their approved booking */
export function getBookingPaidEmailHtml(params: {
  instructorName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  date: string;
  startHour: number;
  pickupAddress: string | null;
  roadTestCenter: string | null;
  hourlyRate: number;
  dashboardUrl: string;
}) {
  return `
    <div style="${baseStyle}">
      ${headerHtml}
      <h2 style="font-size:19px;font-weight:600;color:#0f172a;margin-bottom:6px;">Payment Received — Lesson Confirmed! 🎉</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:20px;">
        Hi ${params.instructorName}, <strong>${params.studentName}</strong> has paid for their lesson. The booking is now confirmed.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;padding:4px 16px;margin-bottom:24px;">
        ${row("Student", params.studentName)}
        ${row("Email", params.studentEmail)}
        ${row("Phone", params.studentPhone || "Not provided")}
        ${row("Date", params.date)}
        ${row("Time", `${formatHour(params.startHour)} – ${formatHour(params.startHour + 1)}`)}
        ${params.pickupAddress ? row("Pickup", params.pickupAddress) : ""}
        ${params.roadTestCenter ? row("Test Centre", params.roadTestCenter) : ""}
        ${row("Amount", `$${params.hourlyRate.toFixed(2)} CAD`)}
      </table>
      <a href="${params.dashboardUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        View Bookings
      </a>
      ${footerHtml}
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
