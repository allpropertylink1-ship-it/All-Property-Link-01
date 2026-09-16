import { NextRequest, NextResponse } from "next/server";

// Stores a maintenance preview-bypass token in the `apl_bypass` httpOnly
// cookie, then redirects to `/`. The token is NOT validated here —
// validation happens server-side on every layout fetch via
// GET /api/site-status (purpose === "maintenance-bypass", signed with the
// REFRESH secret). An invalid token simply doesn't bypass.
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  const token = new URL(req.url).searchParams.get("token");
  if (token) {
    res.cookies.set("apl_bypass", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12h — matches the token expiry
    });
  }
  return res;
}
