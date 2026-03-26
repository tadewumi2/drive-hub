import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/audit";

export async function POST(req: Request) {
  const ip = getIp(req);

  const rl = rateLimit({ key: `forgot-password:${ip}`, limit: 3, windowSecs: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Always return success to prevent email enumeration
    const successMessage =
      "If an account with that email exists, we've sent a password reset link.";

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ message: successMessage }, { status: 200 });
    }

    // Invalidate any existing reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate new reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    await sendEmail({
      to: normalizedEmail,
      subject: "Reset your DriveHub password",
      html: getPasswordResetEmailHtml(user.name || "there", resetUrl),
    });

    return NextResponse.json({ message: successMessage }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
