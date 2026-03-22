import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") || process.env.GMAIL_USER!;

  const result = await sendEmail({
    to,
    subject: "DriveHub Email Test",
    html: "<p>If you see this, email is working correctly.</p>",
  });

  return NextResponse.json({ to, ...result });
}
