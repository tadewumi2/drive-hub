import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

const BACKUP_COOKIE = "authjs.super-admin-backup";

export async function POST() {
  const cookieStore = await cookies();
  const backup = cookieStore.get(BACKUP_COOKIE)?.value;

  if (!backup) {
    return NextResponse.json({ error: "No active impersonation session" }, { status: 400 });
  }

  // Restore original super admin session
  cookieStore.set(SESSION_COOKIE, backup, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  cookieStore.delete(BACKUP_COOKIE);

  return NextResponse.json({ redirect: "/admin/users" });
}
