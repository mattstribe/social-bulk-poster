/**
 * Mirrors the sanitization logic from the Photoshop plugin's exportHandler.js buildCdnPath.
 * Trim, replace spaces with hyphens, strip anything that isn't alphanumeric, period, underscore, or hyphen.
 */
export function safe(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

/**
 * Build a full public CDN URL for a given export.
 *
 * @param cdnBase  - e.g. "https://pub-3c06366d547445298c77e04b7c3c77ad.r2.dev"
 * @param league   - e.g. "NBHL"
 * @param week     - week number
 * @param folder   - type folder, e.g. "Standings", "Stats", "Final-Scores"
 * @param filename - e.g. "VICM12_Standings_1.png" or "" for placeholder types
 */
export function buildCdnUrl(
  cdnBase: string,
  league: string,
  week: number,
  folder: string,
  filename: string
): string {
  const base = cdnBase.replace(/\/+$/, "");
  const safeLeague = safe(league) || "league";
  const safeFolder = safe(folder) || "export";
  const path = `${safeLeague}/exports/Week-${week}/${safeFolder}`;

  if (!filename) return `${base}/${path}/`;
  return `${base}/${path}/${safe(filename)}`;
}

/** Manifest bucket key for files under `{league}/promo/` (not week-scoped). */
export const PROMO_MANIFEST_KEY = "promo";

/**
 * Relative path under `promo/` for matching list API results (e.g. `hats.png`, `tees/shirt.png`).
 */
export function promoRelativeKey(folder: string, filename: string): string {
  const f = folder
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");
  const fn = filename.trim();
  if (!fn) return "";
  return f ? `${f}/${fn}` : fn;
}

/**
 * Public URL for a promo asset at `{league}/promo/{folder}/{filename}`.
 * Empty folder → `{league}/promo/{filename}`.
 */
export function buildPromoCdnUrl(
  cdnBase: string,
  league: string,
  folder: string,
  filename: string
): string {
  const base = cdnBase.replace(/\/+$/, "");
  const safeLeague = safe(league) || "league";
  const fn = safe(filename.trim());
  if (!fn) return `${base}/${safeLeague}/promo/`;
  const segs = folder
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .map((s) => safe(s))
    .filter(Boolean);
  const pathSeg = [...segs, fn].join("/");
  return `${base}/${safeLeague}/promo/${pathSeg}`;
}

/**
 * Resolve the {divAbb} placeholder inside a filename pattern.
 * e.g. "{divAbb}_Standings_1.png" with divAbb="VICM12" => "VICM12_Standings_1.png"
 */
export function resolveFilenamePattern(
  pattern: string,
  divAbb: string
): string {
  return pattern.replace(/\{divAbb\}/g, divAbb);
}

/** Case-insensitive prefix match for CDN filenames (e.g. _Schedule vs _SCHEDULE). */
export function fileMatchesFilenamePrefix(
  filename: string,
  prefix: string
): boolean {
  return filename.toLowerCase().startsWith(prefix.toLowerCase());
}

/**
 * Built-in Stats uses a single file per division: `{divAbb}_Stats.png` (no _1, _2).
 * Other types use prefix matching so numbered exports still work.
 */
export function fileMatchesPostTypePattern(
  filename: string,
  postTypeId: string,
  resolvedPrefix: string
): boolean {
  if (postTypeId === "stats") {
    const base = filename.replace(/\.(png|jpe?g|webp)$/i, "");
    return base.toLowerCase() === resolvedPrefix.toLowerCase();
  }
  return fileMatchesFilenamePrefix(filename, resolvedPrefix);
}
