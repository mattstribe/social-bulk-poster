import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "sbp_access";

export async function POST(request: NextRequest) {
  const configuredPassword = process.env.SITE_PASSWORD;
  if (!configuredPassword) {
    return NextResponse.json(
      { error: "SITE_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { password?: string; next?: string };
  const provided = body.password ?? "";
  if (provided !== configuredPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "1",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return response;
}

