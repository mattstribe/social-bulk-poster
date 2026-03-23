import Papa from "papaparse";
import type {
  SocialAccount,
  Division,
  PostType,
  CsvRow,
  CdnManifest,
  AppState,
} from "./types";
import {
  buildCdnUrl,
  resolveFilenamePattern,
  fileMatchesPostTypePattern,
} from "./cdn-paths";
import { renderCaption } from "./caption-template";

/**
 * Parse SocialPilot account CSV text into SocialAccount[].
 */
export function parseAccountsCsv(csvText: string): SocialAccount[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row["Account ID"] && row["Account Platform"])
    .map((row) => ({
      id: row["Account ID"].trim(),
      platform: row["Account Platform"].trim() as SocialAccount["platform"],
      name: row["Account Name"]?.trim() || "",
      url: row["Account URL"]?.trim() || "",
    }));
}

/**
 * Parse a division info CSV.
 * Columns: Conference/Tier, Division, Abbreviation [, Color 1, ...]
 * Detects header row automatically.
 */
export function parseDivisionsCsv(csvText: string): Division[] {
  const result = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  if (!rows.length) return [];

  const first = rows[0];
  const hasHeader =
    first[0]?.toLowerCase().includes("conf") ||
    first[0]?.toLowerCase().includes("conference") ||
    first[0]?.toLowerCase().includes("tier");

  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .filter((r) => r[0] && r[1] && r[2])
    .map((r) => ({
      conf: r[0].trim(),
      div: r[1].trim(),
      abb: r[2].trim(),
      color1: r[3]?.trim() || undefined,
    }))
    .sort((a, b) => a.abb.localeCompare(b.abb));
}

/**
 * Build image URLs for a division + post type combo.
 * Uses manifest file lists; Stats matches `{divAbb}_Stats.png` only (no _1/_2).
 * Other types use prefix matching (e.g. Standings → _1.png, _2.png).
 * Falls back to a best-guess URL when no manifest is available.
 */
/**
 * Total image files for a division abbreviation across enabled post types
 * (each matching file in each type folder counts toward the total).
 */
/** Short label for the weekly accounts preview (UG / FS / Stats / Standings / custom label). */
export function getPostTypePreviewLabel(
  pt: Pick<PostType, "id" | "label">
): string {
  switch (pt.id) {
    case "upcoming-games":
      return "UG";
    case "final-scores":
      return "FS";
    case "stats":
      return "Stats";
    case "standings":
      return "Standings";
    default:
      return pt.label.trim() || "Custom";
  }
}

/**
 * Per enabled post type, how many CDN files match this division (counts > 0 only).
 * Only include types that are enabled with a filename pattern (CSV-eligible).
 */
export function divisionImageBreakdown(
  abb: string,
  manifest: CdnManifest | null,
  enabledPatternedTypes: PostType[]
): { postTypeId: string; label: string; count: number }[] {
  if (!manifest) return [];
  const out: { postTypeId: string; label: string; count: number }[] = [];
  for (const pt of enabledPatternedTypes) {
    const pattern = pt.filenamePattern.trim();
    if (!pattern) continue;
    const prefix = resolveFilenamePattern(pattern, abb);
    const files = manifest[pt.cdnFolder] ?? [];
    const count = files.filter((f) =>
      fileMatchesPostTypePattern(f, pt.id, prefix)
    ).length;
    if (count > 0) {
      out.push({
        postTypeId: pt.id,
        label: getPostTypePreviewLabel(pt),
        count,
      });
    }
  }
  return out;
}

export function countImagesForDivision(
  abb: string,
  manifest: CdnManifest | null,
  enabledPatternedTypes: PostType[]
): number {
  return divisionImageBreakdown(abb, manifest, enabledPatternedTypes).reduce(
    (sum, x) => sum + x.count,
    0
  );
}

function divisionHasFilesForPostType(
  postType: PostType,
  div: Division,
  manifest: CdnManifest | null
): boolean {
  const pattern = postType.filenamePattern.trim();
  if (!pattern || !manifest) return false;
  const prefix = resolveFilenamePattern(pattern, div.abb);
  const files = manifest[postType.cdnFolder] ?? [];
  return files.some((f) =>
    fileMatchesPostTypePattern(f, postType.id, prefix)
  );
}

function divImageUrls(
  state: AppState,
  postType: PostType,
  div: Division,
  manifest: CdnManifest | null
): string[] {
  const pattern = postType.filenamePattern.trim();
  if (!pattern) {
    return [
      buildCdnUrl(
        state.cdnBaseUrl,
        state.leagueName,
        state.weekNumber,
        postType.cdnFolder,
        ""
      ),
    ];
  }

  const prefix = resolveFilenamePattern(pattern, div.abb);
  const folder = postType.cdnFolder;

  if (manifest && manifest[folder]) {
    const matches = manifest[folder]
      .filter((f) => fileMatchesPostTypePattern(f, postType.id, prefix))
      .sort();

    if (matches.length) {
      return matches.map((f) =>
        buildCdnUrl(
          state.cdnBaseUrl,
          state.leagueName,
          state.weekNumber,
          folder,
          f
        )
      );
    }
  }

  const fallbackFile =
    postType.id === "stats" ? `${prefix}.png` : `${prefix}_1.png`;

  return [
    buildCdnUrl(
      state.cdnBaseUrl,
      state.leagueName,
      state.weekNumber,
      folder,
      fallbackFile
    ),
  ];
}

/**
 * Generate SocialPilot-compatible CSV rows from the current app state.
 *
 * Includes posting accounts that have FB or IG linked. For each enabled
 * post type with a filename pattern, only divisions that have matching
 * files on the CDN (per manifest) are included—no manual account/division
 * checkboxes. Rows are skipped when the manifest has no matches for that
 * account/post type combo.
 */
export function generateCsvRows(
  state: AppState,
  manifest: CdnManifest | null = null
): CsvRow[] {
  const rows: CsvRow[] = [];
  const enabledTypes = state.postTypes.filter(
    (pt) => pt.enabled && pt.filenamePattern.trim() !== ""
  );
  const linkedAccounts = state.postingAccounts.filter(
    (pa) => pa.fbAccountId || pa.igAccountId
  );

  if (!linkedAccounts.length || !enabledTypes.length) return rows;

  const divMap = new Map<string, Division>();
  for (const d of state.divisions) {
    divMap.set(d.abb, d);
  }

  for (const postType of enabledTypes) {
    const postTime = formatPostTime(
      postType.defaultDate,
      postType.defaultTime
    );

    for (const account of linkedAccounts) {
      if (!account.divisionAbbs.length) continue;

      const divs = account.divisionAbbs
        .map((abb) => divMap.get(abb))
        .filter((d): d is Division => !!d);

      const divsWithFiles = divs.filter((d) =>
        divisionHasFilesForPostType(postType, d, manifest)
      );

      if (!divsWithFiles.length) continue;

      const allUrls = divsWithFiles.flatMap((d) =>
        divImageUrls(state, postType, d, manifest)
      );
      const imageUrlStr = allUrls.join("; ");

      const template =
        account.type === "tier"
          ? postType.tierCaptionTemplate || postType.captionTemplate
          : postType.captionTemplate;

      const firstDiv = divsWithFiles[0];
      const caption = renderCaption(template, {
        divAbb: divsWithFiles.length === 1 ? firstDiv.abb : "",
        divName: account.name,
        conf: account.name,
        week: state.weekNumber,
        type: postType.label,
      });

      if (account.fbAccountId) {
        rows.push({
          caption,
          imageUrl: imageUrlStr,
          postTime,
          accountId: account.fbAccountId,
          firstComment: "",
          tags: "",
        });
      }
      if (account.igAccountId) {
        rows.push({
          caption,
          imageUrl: imageUrlStr,
          postTime,
          accountId: account.igAccountId,
          firstComment: "",
          tags: "",
        });
      }
    }
  }

  return rows;
}

function formatPostTime(date: string, time: string): string {
  if (!date) return "";
  return `${date} ${time || "12:00"}`;
}

/**
 * Convert CsvRow[] to a downloadable CSV string (SocialPilot format).
 */
export function rowsToCsvString(rows: CsvRow[]): string {
  const data = rows.map((r) => ({
    Caption: r.caption,
    "image url": r.imageUrl,
    "post time": r.postTime,
    "account id": r.accountId,
    "first comment": r.firstComment,
    tags: r.tags,
  }));

  return Papa.unparse(data, { header: false });
}
