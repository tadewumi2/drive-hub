import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";
import { generateOTP } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        { message: "If your account exists, a new code has been sent." },
        { status: 200 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Your email is already verified. You can sign in." },
        { status: 200 },
      );
    }

    // Rate limit — check if a token was created in the last 60 seconds
    const recentToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentToken) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new code." },
        { status: 429 },
      );
    }

    // Delete old tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: otp,
        expires,
      },
    });

    await sendEmail({
      to: normalizedEmail,
      subject: "Your DriveHub verification code",
      html: getVerificationEmailHtml(user.name || "there", otp),
    });

    return NextResponse.json(
      { message: "A new verification code has been sent to your email." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
