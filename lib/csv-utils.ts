import Papa from "papaparse";
import type {
  SocialAccount,
  Division,
  PostType,
  CsvRow,
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
      checked: true,
      fbAccountId: "",
      igAccountId: "",
    }));
}

/**
 * Collect unique conf/tier names from the division list (preserving order).
 */
export function getTierNames(divisions: Division[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const d of divisions) {
    if (d.conf && !seen.has(d.conf)) {
      seen.add(d.conf);
      names.push(d.conf);
    }
  }
  return names;
}

/**
 * Group divisions by conf (tier).
 */
export function groupByTier(
  divisions: Division[]
): Map<string, Division[]> {
  const map = new Map<string, Division[]>();
  for (const d of divisions) {
    const key = d.conf || "(ungrouped)";
    const list = map.get(key) || [];
    list.push(d);
    map.set(key, list);
  }
  return map;
}

/**
 * Build the image URL for a division + post type combo.
 */
function divImageUrl(
  state: AppState,
  postType: PostType,
  div: Division
): string {
  if (postType.filenamePattern.trim()) {
    const filename = resolveFilenamePattern(
      postType.filenamePattern,
      div.abb
    );
    return buildCdnUrl(
      state.cdnBaseUrl,
      state.leagueName,
      state.weekNumber,
      postType.cdnFolder,
      filename
    );
  }
  return buildCdnUrl(
    state.cdnBaseUrl,
    state.leagueName,
    state.weekNumber,
    postType.cdnFolder,
    ""
  );
}

/**
 * Generate SocialPilot-compatible CSV rows from the current app state.
 *
 * Divisions sharing the same account ID are grouped into one post with
 * combined image URLs (semicolon-separated). This covers both location
 * accounts (per-division) and tier accounts.
 */
export function generateCsvRows(state: AppState): CsvRow[] {
  const rows: CsvRow[] = [];
  const enabledTypes = state.postTypes.filter((pt) => pt.enabled);
  const checkedDivs = state.divisions.filter((d) => d.checked);

  if (!checkedDivs.length) return rows;

  for (const postType of enabledTypes) {
    const postTime = formatPostTime(
      postType.defaultDate,
      postType.defaultTime
    );

    // Collect every (accountId → divisions[]) pair from both
    // division-level and tier-level assignments.
    const accountDivs = new Map<string, Division[]>();

    for (const div of checkedDivs) {
      if (div.fbAccountId) {
        const list = accountDivs.get(div.fbAccountId) || [];
        list.push(div);
        accountDivs.set(div.fbAccountId, list);
      }
      if (div.igAccountId) {
        const list = accountDivs.get(div.igAccountId) || [];
        list.push(div);
        accountDivs.set(div.igAccountId, list);
      }
    }

    // Tier-level accounts: all checked divisions in that tier
    const tierGroups = groupByTier(checkedDivs);
    for (const [conf, tierDivisions] of tierGroups) {
      const ta = state.tierAccounts[conf];
      if (!ta) continue;
      if (ta.fbAccountId) {
        const list = accountDivs.get(ta.fbAccountId) || [];
        for (const d of tierDivisions) {
          if (!list.some((x) => x.abb === d.abb)) list.push(d);
        }
        accountDivs.set(ta.fbAccountId, list);
      }
      if (ta.igAccountId) {
        const list = accountDivs.get(ta.igAccountId) || [];
        for (const d of tierDivisions) {
          if (!list.some((x) => x.abb === d.abb)) list.push(d);
        }
        accountDivs.set(ta.igAccountId, list);
      }
    }

    // One row per unique account ID with combined images
    for (const [accountId, divs] of accountDivs) {
      const imageUrls = divs.map((d) => divImageUrl(state, postType, d));
      const imageUrlStr = imageUrls.join("; ");

      const firstDiv = divs[0];
      const caption = renderCaption(postType.captionTemplate, {
        divAbb: divs.length === 1 ? firstDiv.abb : "",
        divName: divs.length === 1 ? firstDiv.div : firstDiv.conf,
        conf: firstDiv.conf,
        week: state.weekNumber,
        league: state.leagueName,
        type: postType.label,
      });

      rows.push({
        caption,
        imageUrl: imageUrlStr,
        postTime,
        accountId,
        firstComment: "",
        tags: "",
      });
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

  return Papa.unparse(data);
}
