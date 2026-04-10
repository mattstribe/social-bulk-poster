import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { PROMO_MANIFEST_KEY, safe } from "@/lib/cdn-paths";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function listWeekExportFiles(
  bucket: string | undefined,
  safeLeague: string,
  week: string
): Promise<Record<string, string[]>> {
  const files: Record<string, string[]> = {};
  if (!bucket) return files;

  const prefix = `${safeLeague}/exports/Week-${week}/`;
  let continuationToken: string | undefined;

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    for (const obj of res.Contents ?? []) {
      if (!obj.Key) continue;
      const relative = obj.Key.slice(prefix.length);
      const slashIdx = relative.indexOf("/");
      if (slashIdx === -1) continue;
      const folder = relative.slice(0, slashIdx);
      const filename = relative.slice(slashIdx + 1);
      if (!filename) continue;
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

  return files;
}

/** Relative paths under `{league}/promo/` (e.g. `hats.png`, `tees/shirt.png`). */
async function listPromoFiles(
  bucket: string | undefined,
  safeLeague: string
): Promise<string[]> {
  if (!bucket) return [];

  const prefix = `${safeLeague}/promo/`;
  const relPaths: string[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    for (const obj of res.Contents ?? []) {
      if (!obj.Key) continue;
      const rel = obj.Key.slice(prefix.length);
      if (!rel || rel.endsWith("/")) continue;
      relPaths.push(rel);
    }

    continuationToken = res.IsTruncated
      ? res.NextContinuationToken
      : undefined;
  } while (continuationToken);

  relPaths.sort();
  return relPaths;
}

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
  const bucket = process.env.R2_BUCKET_NAME;

  try {
    const files = await listWeekExportFiles(bucket, safeLeague, week);
    const promoList = await listPromoFiles(bucket, safeLeague);
    if (promoList.length) {
      files[PROMO_MANIFEST_KEY] = promoList;
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
