import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
    const isOnboardingPage = req.nextUrl.pathname.startsWith("/onboarding");
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

    // 1. If user is authenticated and tries to access login/register, redirect to dashboard or onboarding
    if (token && isAuthPage) {
      if (token.familyId) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }

    // 2. If user is authenticated but has no family and tries to access dashboard, redirect to onboarding
    if (token && !token.familyId && isDashboardPage) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 3. If user has family and tries to access onboarding, redirect to dashboard
    if (token?.familyId && isOnboardingPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isPublicPage = 
          req.nextUrl.pathname === "/" || 
          req.nextUrl.pathname.startsWith("/login") || 
          req.nextUrl.pathname.startsWith("/register");
        
        if (isPublicPage) return true;
        return !!token; // Protected by default
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/register"],
};
