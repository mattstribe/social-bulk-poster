import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { safe } from "@/lib/cdn-paths";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const league = searchParams.get("league") || "";
  const week = searchParams.get("week") || "1";

  if (!league.trim()) {
    return NextResponse.json(
      { error: "league param is required" },
      { status: 400 }
    );
  }

  const safeLeague = safe(league) || "league";
  const prefix = `${safeLeague}/exports/Week-${week}/`;

  try {
    const files: Record<string, string[]> = {};
    let continuationToken: string | undefined;

    do {
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        })
      );

      for (const obj of res.Contents ?? []) {
        if (!obj.Key) continue;
        const relative = obj.Key.slice(prefix.length);
        const slashIdx = relative.indexOf("/");
        if (slashIdx === -1) continue; // file at root of prefix, skip
        const folder = relative.slice(0, slashIdx);
        const filename = relative.slice(slashIdx + 1);
        if (!filename) continue; // folder marker
        if (!files[folder]) files[folder] = [];
        files[folder].push(filename);
      }

      continuationToken = res.IsTruncated
        ? res.NextContinuationToken
        : undefined;
    } while (continuationToken);

    for (const folder of Object.keys(files)) {
      files[folder].sort();
    }

    return NextResponse.json({ files });
  } catch (err) {
    console.error("Failed to list CDN files:", err);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
