import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`
// (function renamed `middleware` -> `proxy` too) — docs/TASKS.md #4
// predates the rename; see AGENTS.md and
// node_modules/next/dist/docs/.../upgrading/version-16.md.

// Default-deny: every route needs a session UNLESS it's listed here.
// This is deliberately an allowlist, not a denylist of protected routes
// — #5 onward all assume an authenticated req.auth (withUserContext,
// src/db/index.ts needs a user id from somewhere), so a new protected
// screen needs no proxy change to become protected; only a new *public*
// screen does.
const PUBLIC_ROUTES = new Set([
  "/",
  "/signup",
  "/login",
  "/forgot-password",
  "/reset-password",
]);

export const proxy = auth((req) => {
  const isPublicRoute = PUBLIC_ROUTES.has(req.nextUrl.pathname);

  if (!req.auth && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Note for #15 (Push notifications) or any future non-page API route:
  // this redirects to /login (a 30x + HTML), which is wrong for a fetch()
  // caller expecting JSON. An API route under here that needs auth should
  // still check req.auth (or call auth() itself) and return its own 401 —
  // don't rely on this redirect for anything but page navigation.
});

export const config = {
  // Skip the NextAuth API route (must stay reachable for sign-in/session/
  // callback requests) and Next internals; skip anything with a file
  // extension (icons, manifest.webmanifest, favicon.ico, and whatever
  // gets added to public/ later) rather than hand-listing each one.
  // Everything else — every current and future app route — goes through
  // the check above.
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\..*).*)"],
};
