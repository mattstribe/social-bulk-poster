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
 * Generate SocialPilot-compatible CSV rows from the current app state.
 *
 * Per-division rows: each division with linked accounts gets its own post(s).
 * Per-tier rows: the tier account gets a combined post with all checked
 * division images (semicolon-separated URLs).
 */
export function generateCsvRows(state: AppState): CsvRow[] {
  const rows: CsvRow[] = [];
  const enabledTypes = state.postTypes.filter((pt) => pt.enabled);
  const tierGroups = groupByTier(state.divisions);

  for (const postType of enabledTypes) {
    for (const [conf, tierDivisions] of tierGroups) {
      const checkedDivs = tierDivisions.filter((d) => d.checked);
      if (!checkedDivs.length) continue;

      const hasFilenamePattern = !!postType.filenamePattern.trim();
      const postTime = formatPostTime(
        postType.defaultDate,
        postType.defaultTime
      );

      // --- Per-division rows ---
      for (const div of checkedDivs) {
        if (!div.fbAccountId && !div.igAccountId) continue;

        let imageUrl = "";
        let caption = "";

        if (hasFilenamePattern) {
          const filename = resolveFilenamePattern(
            postType.filenamePattern,
            div.abb
          );
          imageUrl = buildCdnUrl(
            state.cdnBaseUrl,
            state.leagueName,
            state.weekNumber,
            postType.cdnFolder,
            filename
          );
        } else {
          imageUrl = buildCdnUrl(
            state.cdnBaseUrl,
            state.leagueName,
            state.weekNumber,
            postType.cdnFolder,
            ""
          );
        }

        caption = renderCaption(postType.captionTemplate, {
          divAbb: div.abb,
          divName: div.div,
          conf: div.conf,
          week: state.weekNumber,
          league: state.leagueName,
          type: postType.label,
        });

        if (div.fbAccountId) {
          rows.push({
            caption,
            imageUrl,
            postTime,
            accountId: div.fbAccountId,
            firstComment: "",
            tags: "",
          });
        }
        if (div.igAccountId) {
          rows.push({
            caption,
            imageUrl,
            postTime,
            accountId: div.igAccountId,
            firstComment: "",
            tags: "",
          });
        }
      }

      // --- Tier-level combined row ---
      const ta = state.tierAccounts[conf];
      if (!ta || (!ta.fbAccountId && !ta.igAccountId)) continue;

      const tierImageUrls: string[] = [];
      for (const div of checkedDivs) {
        if (hasFilenamePattern) {
          const filename = resolveFilenamePattern(
            postType.filenamePattern,
            div.abb
          );
          tierImageUrls.push(
            buildCdnUrl(
              state.cdnBaseUrl,
              state.leagueName,
              state.weekNumber,
              postType.cdnFolder,
              filename
            )
          );
        } else {
          tierImageUrls.push(
            buildCdnUrl(
              state.cdnBaseUrl,
              state.leagueName,
              state.weekNumber,
              postType.cdnFolder,
              ""
            )
          );
        }
      }

      const tierImageUrlStr = tierImageUrls.join("; ");
      const firstDiv = checkedDivs[0];
      const tierCaption = renderCaption(postType.captionTemplate, {
        divAbb: "",
        divName: conf,
        conf,
        week: state.weekNumber,
        league: state.leagueName,
        type: postType.label,
      });

      if (ta.fbAccountId) {
        rows.push({
          caption: tierCaption,
          imageUrl: tierImageUrlStr,
          postTime,
          accountId: ta.fbAccountId,
          firstComment: "",
          tags: "",
        });
      }
      if (ta.igAccountId) {
        rows.push({
          caption: tierCaption,
          imageUrl: tierImageUrlStr,
          postTime,
          accountId: ta.igAccountId,
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

  return Papa.unparse(data);
}
