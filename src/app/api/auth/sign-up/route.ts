import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";
import { generateOTP } from "@/lib/otp";
import { logAudit, getIp } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getIp(req);

  const rl = rateLimit({ key: `sign-up:${ip}`, limit: 5, windowSecs: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Unverified account — update details and resend OTP
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: { name, password: hashedPassword },
        });

        await prisma.verificationToken.deleteMany({
          where: { identifier: normalizedEmail },
        });

        const otp = generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.verificationToken.create({
          data: { identifier: normalizedEmail, token: otp, expires },
        });

        await sendEmail({
          to: normalizedEmail,
          subject: "Your DriveHub verification code",
          html: getVerificationEmailHtml(name, otp),
        });
      }

      // Return the same message regardless of whether account is verified
      // to prevent email enumeration
      return NextResponse.json(
        { message: "Account created. Verification code sent to your email." },
        { status: 201 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    logAudit({ userId: newUser.id, userEmail: normalizedEmail, action: "USER_SIGNED_UP", details: { name }, ipAddress: ip });

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: otp,
        expires,
      },
    });

    // Send verification email
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Your DriveHub verification code",
      html: getVerificationEmailHtml(name, otp),
    });

    if (!emailResult.success) {
      const errMsg = emailResult.error instanceof Error ? emailResult.error.message : JSON.stringify(emailResult.error);
      console.error("Failed to send verification email:", errMsg);
      return NextResponse.json(
        { error: `Email failed: ${errMsg}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Account created. Verification code sent to your email." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
