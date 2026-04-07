export interface CaptionVars {
  divAbb: string;
  divName: string;
  conf: string;
  /** Export / CDN week (matches Week-{n} in paths). */
  week: number;
  /**
   * Next week for schedule-style copy (e.g. Upcoming Games). Typically week + 1.
   */
  upcomingWeek: number;
  type: string;
  sponsor?: string;
}

/**
 * Replace {variable} placeholders in a caption template with actual values.
 * Supports `{upcoming week}` and `{upcomingWeek}` for the upcoming week number.
 */
export function renderCaption(
  template: string,
  vars: CaptionVars
): string {
  return template
    .replace(/\{divAbb\}/g, vars.divAbb)
    .replace(/\{divName\}/g, vars.divName)
    .replace(/\{conf\}/g, vars.conf)
    .replace(/\{week\}/g, String(vars.week))
    .replace(/\{upcomingWeek\}/g, String(vars.upcomingWeek))
    .replace(/\{upcoming week\}/g, String(vars.upcomingWeek))
    .replace(/\{sponsor\}/g, vars.sponsor ?? "")
    .replace(/\{type\}/g, vars.type);
}
