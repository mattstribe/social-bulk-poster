import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const CDN_BASE = process.env.R2_PUBLIC_URL || "";
const SETTINGS_KEY = "social-bulk-poster/settings.json";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function GET() {
  if (!CDN_BASE) {
    return NextResponse.json(
      { accounts: [], divisions: [], tierAccounts: {} },
      { status: 200 }
    );
  }

  try {
    const url = `${CDN_BASE.replace(/\/+$/, "")}/${SETTINGS_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`CDN returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to read settings from R2:", err);
    return NextResponse.json(
      { accounts: [], divisions: [], tierAccounts: {} },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const json = JSON.stringify(body);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: SETTINGS_KEY,
        Body: json,
        ContentType: "application/json",
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save settings to R2:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
