import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { logAudit, getIp } from "@/lib/audit";

const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

const BACKUP_COOKIE = "authjs.super-admin-backup";

export async function POST(req: Request) {
  const ip = getIp(req);
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot impersonate another super admin" }, { status: 403 });
  }

  if (target.id === session.user.id) {
    return NextResponse.json({ error: "Cannot impersonate yourself" }, { status: 400 });
  }

  const cookieStore = await cookies();

  // Back up the super admin's current session
  const current = cookieStore.get(SESSION_COOKIE)?.value;
  if (current) {
    cookieStore.set(BACKUP_COOKIE, current, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }

  // Create a new JWT for the impersonated user
  const newToken = await encode({
    token: {
      sub: target.id,
      name: target.name,
      email: target.email,
      role: target.role,
      emailVerified: target.emailVerified,
      impersonatedBy: session.user.id,
    },
    secret: process.env.AUTH_SECRET!,
    salt: SESSION_COOKIE,
  });

  cookieStore.set(SESSION_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  // Redirect to the appropriate dashboard based on target role
  const destination =
    target.role === "INSTRUCTOR" ? "/instructor" :
    target.role === "ADMIN" ? "/admin" :
    "/dashboard";

  logAudit({ userId: session.user.id, userEmail: session.user.email ?? undefined, action: "ADMIN_IMPERSONATED_USER", details: { targetUserId: target.id, targetEmail: target.email, targetRole: target.role }, ipAddress: ip });

  return NextResponse.json({ redirect: destination });
}
