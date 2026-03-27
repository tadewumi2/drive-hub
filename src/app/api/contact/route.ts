import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.enum(["booking", "payment", "instructor", "account", "other"]),
  message: z.string().min(10).max(2000),
});

const SUBJECT_LABELS: Record<string, string> = {
  booking: "Booking Issue",
  payment: "Payment / Refund",
  instructor: "Instructor Issue",
  account: "Account Help",
  other: "General Enquiry",
};

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  const limit = rateLimit({ key: `contact:${ip}`, limit: 5, windowSecs: 3600 });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, subject, message } = parsed.data;
  const subjectLabel = SUBJECT_LABELS[subject] ?? "General Enquiry";
  const supportEmail = process.env.GMAIL_USER!;

  // Email to support team
  await sendEmail({
    to: supportEmail,
    subject: `[Support] ${subjectLabel} – from ${name}`,
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px 20px;">
        <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px;">New Support Request</h2>
        <p style="color:#64748b;font-size:13px;margin-bottom:24px;">${subjectLabel}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#d97706;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Topic</td><td style="padding:8px 0;color:#0f172a;font-size:14px;">${subjectLabel}</td></tr>
        </table>
        <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#0f172a;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Reply directly to this email to respond to ${name}.</p>
      </div>
    `,
  });

  // Auto-reply to sender
  await sendEmail({
    to: email,
    subject: "We received your message – DriveHub Support",
    html: `
      <div style="max-width:520px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:28px;">
          <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0;">DriveHub</h1>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:6px;">We got your message!</h2>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:16px;">
          Hi ${name}, thanks for reaching out. Our support team will get back to you within <strong>1 business day</strong>.
        </p>
        <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Your message</p>
          <p style="margin:0;font-size:14px;color:#0f172a;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
          In the meantime, you may find answers in our
          <a href="${process.env.NEXTAUTH_URL ?? ""}/contact#faq" style="color:#d97706;">FAQ section</a>.
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px;text-align:center;">DriveHub &mdash; Your driving journey starts here.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
