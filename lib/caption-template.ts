export interface CaptionVars {
  divAbb: string;
  divName: string;
  conf: string;
  week: number;
  type: string;
}

/**
 * Replace {variable} placeholders in a caption template with actual values.
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
    .replace(/\{type\}/g, vars.type);
}
