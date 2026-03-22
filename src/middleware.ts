import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Protected routes
  const protectedRoutes = ["/dashboard"];
  const instructorRoutes = ["/instructor"];
  const adminRoutes = ["/admin"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isInstructorRoute = instructorRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/"),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Auth routes
  const authRoutes = ["/auth"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to sign in if not logged in
  if ((isProtected || isInstructorRoute || isAdminRoute) && !isLoggedIn) {
    const signInUrl = new URL("/auth/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const isSuperAdmin = role === "SUPER_ADMIN";

  // Redirect non-instructors away from instructor routes
  if (isInstructorRoute && role !== "INSTRUCTOR" && role !== "ADMIN" && !isSuperAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  // Redirect non-admins away from admin routes
  if (isAdminRoute && role !== "ADMIN" && !isSuperAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Redirect logged-in users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    if (isSuperAdmin || role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    if (role === "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/instructor", req.nextUrl.origin));
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
