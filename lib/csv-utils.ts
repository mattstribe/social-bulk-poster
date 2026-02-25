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
 * Parse a division info CSV with tier structure.
 * Columns: Tier, Division, Abbreviation, Color 1, ...
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
      tier: r[0].trim(),
      div: r[1].trim(),
      abb: r[2].trim(),
      color1: r[3]?.trim() || "",
      checked: true,
      fbAccountId: "",
      igAccountId: "",
    }));
}

/**
 * Collect unique tier names from the division list (preserving order).
 */
export function getTierNames(divisions: Division[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const d of divisions) {
    if (d.tier && !seen.has(d.tier)) {
      seen.add(d.tier);
      names.push(d.tier);
    }
  }
  return names;
}

/**
 * Group divisions by tier name.
 */
export function groupByTier(
  divisions: Division[]
): Map<string, Division[]> {
  const map = new Map<string, Division[]>();
  for (const d of divisions) {
    const key = d.tier || "(no tier)";
    const list = map.get(key) || [];
    list.push(d);
    map.set(key, list);
  }
  return map;
}

/**
 * Generate SocialPilot-compatible CSV rows from the current app state.
 * Groups divisions by tier. Each tier produces one post per post type,
 * combining image URLs for all checked divisions in the tier.
 * Accounts come from the divisions (all divisions in a tier share accounts).
 */
export function generateCsvRows(state: AppState): CsvRow[] {
  const rows: CsvRow[] = [];
  const enabledTypes = state.postTypes.filter((pt) => pt.enabled);
  const tierGroups = groupByTier(state.divisions);

  for (const postType of enabledTypes) {
    for (const [tierName, tierDivisions] of tierGroups) {
      const checkedDivs = tierDivisions.filter((d) => d.checked);
      if (!checkedDivs.length) continue;

      const fbAccountId = checkedDivs.find((d) => d.fbAccountId)?.fbAccountId || "";
      const igAccountId = checkedDivs.find((d) => d.igAccountId)?.igAccountId || "";

      if (!fbAccountId && !igAccountId) continue;

      const hasFilenamePattern = !!postType.filenamePattern.trim();
      const imageUrls: string[] = [];
      let caption = "";

      if (hasFilenamePattern) {
        for (const div of checkedDivs) {
          const filename = resolveFilenamePattern(
            postType.filenamePattern,
            div.abb
          );
          const url = buildCdnUrl(
            state.cdnBaseUrl,
            state.leagueName,
            state.weekNumber,
            postType.cdnFolder,
            filename
          );
          imageUrls.push(url);
        }

        const firstDiv = checkedDivs[0];
        caption = renderCaption(postType.captionTemplate, {
          divAbb: firstDiv.abb,
          divName: firstDiv.div,
          conf: firstDiv.conf,
          week: state.weekNumber,
          league: state.leagueName,
          type: postType.label,
        });
      } else {
        const folderUrl = buildCdnUrl(
          state.cdnBaseUrl,
          state.leagueName,
          state.weekNumber,
          postType.cdnFolder,
          ""
        );
        imageUrls.push(folderUrl);
        caption = renderCaption(postType.captionTemplate, {
          divAbb: "",
          divName: tierName,
          conf: tierName,
          week: state.weekNumber,
          league: state.leagueName,
          type: postType.label,
        });
      }

      const imageUrlStr = imageUrls.join("; ");
      const postTime = formatPostTime(
        postType.defaultDate,
        postType.defaultTime
      );

      if (fbAccountId) {
        rows.push({
          caption,
          imageUrl: imageUrlStr,
          postTime,
          accountId: fbAccountId,
          firstComment: "",
          tags: "",
        });
      }

      if (igAccountId) {
        rows.push({
          caption,
          imageUrl: imageUrlStr,
          postTime,
          accountId: igAccountId,
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
