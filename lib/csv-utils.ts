import Papa from "papaparse";
import type {
  SocialAccount,
  Division,
  PostType,
  CsvRow,
  CdnManifest,
  AppState,
} from "./types";
import { buildCdnUrl, resolveFilenamePattern } from "./cdn-paths";
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
 * When a CDN manifest is provided, finds all files matching the resolved
 * prefix (e.g. "BUF_Standings" matches "BUF_Standings_1.png", "BUF_Standings_2.png").
 * Falls back to a single best-guess URL when no manifest is available.
 */
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
      .filter((f) => f.startsWith(prefix))
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

  return [
    buildCdnUrl(
      state.cdnBaseUrl,
      state.leagueName,
      state.weekNumber,
      folder,
      `${prefix}_1.png`
    ),
  ];
}

/**
 * Generate SocialPilot-compatible CSV rows from the current app state.
 *
 * Iterates checked posting accounts. For each account, gathers the assigned
 * divisions, builds combined image URLs, and picks the caption template
 * based on account type (location vs tier).
 */
export function generateCsvRows(
  state: AppState,
  manifest: CdnManifest | null = null
): CsvRow[] {
  const rows: CsvRow[] = [];
  const enabledTypes = state.postTypes.filter((pt) => pt.enabled);
  const checkedAccounts = state.postingAccounts.filter((pa) => pa.checked);

  if (!checkedAccounts.length) return rows;

  const divMap = new Map<string, Division>();
  for (const d of state.divisions) {
    divMap.set(d.abb, d);
  }

  for (const postType of enabledTypes) {
    const postTime = formatPostTime(
      postType.defaultDate,
      postType.defaultTime
    );

    for (const account of checkedAccounts) {
      if (!account.fbAccountId && !account.igAccountId) continue;
      if (!account.divisionAbbs.length) continue;

      const activeAbbs = account.divisionAbbs.filter(
        (abb) => !account.disabledDivisionAbbs?.includes(abb)
      );
      const divs = activeAbbs
        .map((abb) => divMap.get(abb))
        .filter((d): d is Division => !!d);

      if (!divs.length) continue;

      const allUrls = divs.flatMap((d) =>
        divImageUrls(state, postType, d, manifest)
      );
      const imageUrlStr = allUrls.join("; ");

      const template =
        account.type === "tier"
          ? postType.tierCaptionTemplate || postType.captionTemplate
          : postType.captionTemplate;

      const firstDiv = divs[0];
      const caption = renderCaption(template, {
        divAbb: divs.length === 1 ? firstDiv.abb : "",
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
