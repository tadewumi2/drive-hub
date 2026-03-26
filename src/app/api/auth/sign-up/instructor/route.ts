import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";
import { generateOTP } from "@/lib/otp";
import { logAudit, getIp } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const instructorSignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  location: z.string().min(2, "Location is required"),
  carType: z.string().min(2, "Car type is required"),
  hourlyRate: z.number().min(1, "Hourly rate must be at least $1"),
  bio: z.string().max(500).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  const ip = getIp(req);

  const rl = rateLimit({ key: `sign-up-instructor:${ip}`, limit: 5, windowSecs: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = instructorSignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, location, carType, hourlyRate, bio } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      if (!existing.emailVerified) {
        // Unverified — update and resend OTP
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: { name, password: hashedPassword },
        });

        // Update profile fields if profile exists
        const profile = await prisma.instructorProfile.findUnique({
          where: { userId: existing.id },
        });
        if (profile) {
          await prisma.instructorProfile.update({
            where: { id: profile.id },
            data: { location, carType, hourlyRate, bio: bio || null },
          });
        }

        await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
        const otp = generateOTP();
        await prisma.verificationToken.create({
          data: { identifier: normalizedEmail, token: otp, expires: new Date(Date.now() + 10 * 60 * 1000) },
        });
        await sendEmail({
          to: normalizedEmail,
          subject: "Your DriveHub verification code",
          html: getVerificationEmailHtml(name, otp),
        });
      }

      // Same message regardless to prevent enumeration
      return NextResponse.json(
        { message: "Account created. Verification code sent to your email." },
        { status: 201 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "INSTRUCTOR",
      },
    });

    await prisma.instructorProfile.create({
      data: {
        userId: user.id,
        location,
        carType,
        hourlyRate,
        bio: bio || null,
        isActive: false, // not active until verified
        verificationStatus: "UNVERIFIED",
      },
    });

    logAudit({
      userId: user.id,
      userEmail: normalizedEmail,
      action: "INSTRUCTOR_REGISTERED",
      details: { name, location },
      ipAddress: ip,
    });

    const otp = generateOTP();
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Your DriveHub verification code",
      html: getVerificationEmailHtml(name, otp),
    });

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    return NextResponse.json(
      { message: "Account created. Verification code sent to your email." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Instructor sign-up error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
