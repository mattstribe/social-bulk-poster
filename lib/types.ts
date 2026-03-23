export interface SocialAccount {
  id: string;
  platform: "Facebook Page" | "Instagram Business Account";
  name: string;
  url: string;
}

export interface Division {
  conf: string;
  div: string;
  abb: string;
  color1?: string;
}

export interface PostingAccount {
  id: string;
  name: string;
  type: "location" | "tier";
  fbAccountId: string;
  igAccountId: string;
  divisionAbbs: string[];
  disabledDivisionAbbs: string[];
  checked: boolean;
}

export interface PostType {
  id: string;
  label: string;
  captionTemplate: string;
  tierCaptionTemplate: string;
  defaultDate: string;
  defaultTime: string;
  cdnFolder: string;
  filenamePattern: string;
  enabled: boolean;
  isBuiltIn: boolean;
}

export interface AppState {
  leagueName: string;
  cdnBaseUrl: string;
  weekNumber: number;
  accounts: SocialAccount[];
  divisions: Division[];
  postingAccounts: PostingAccount[];
  postTypes: PostType[];
}

export interface CsvRow {
  caption: string;
  imageUrl: string;
  postTime: string;
  accountId: string;
  firstComment: string;
  tags: string;
}

/** Folder name → array of filenames found in that folder on the CDN. */
export type CdnManifest = Record<string, string[]>;

export const DEFAULT_CDN_BASE_URL = "";

export const DEFAULT_POSTING_ACCOUNTS: PostingAccount[] = [
  // ── Location accounts ──
  { id: "buffalo", name: "Buffalo", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["BUFL", "BUF2", "BUF3"], disabledDivisionAbbs: [], checked: true },
  { id: "long-island", name: "Long Island", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["LIL", "LI2", "LI3"], disabledDivisionAbbs: [], checked: true },
  { id: "massachusetts", name: "Massachusetts", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["MAL", "MA1", "MA2", "MA3", "MAW1", "MAW2"], disabledDivisionAbbs: [], checked: true },
  { id: "new-jersey", name: "New Jersey", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["NJL", "NJ1", "SJ2", "SJ3E", "SJ3W", "NJW2"], disabledDivisionAbbs: [], checked: true },
  { id: "pittsburgh", name: "Pittsburgh", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["PITL", "PIT1", "PIT2", "PIT3", "PIT3E", "PIT3W", "PITW2"], disabledDivisionAbbs: [], checked: true },
  { id: "halifax", name: "Halifax", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["HFX1"], disabledDivisionAbbs: [], checked: true },
  { id: "niagara", name: "Niagara", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["NIA1"], disabledDivisionAbbs: [], checked: true },
  { id: "bermuda", name: "Bermuda", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["BDA2"], disabledDivisionAbbs: [], checked: true },
  { id: "british-columbia", name: "British Columbia", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["BC2"], disabledDivisionAbbs: [], checked: true },
  { id: "chicago", name: "Chicago", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["CHI2"], disabledDivisionAbbs: [], checked: true },
  { id: "great-britain", name: "Great Britain", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["GB2"], disabledDivisionAbbs: [], checked: true },
  { id: "midwest", name: "Midwest", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["MID2", "MID3"], disabledDivisionAbbs: [], checked: true },
  { id: "philadelphia", name: "Philadelphia", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["PHI2", "PHI3"], disabledDivisionAbbs: [], checked: true },
  { id: "washington-dc", name: "Washington D.C.", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["DC2"], disabledDivisionAbbs: [], checked: true },
  { id: "california", name: "California", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["CA2", "CA3"], disabledDivisionAbbs: [], checked: true },
  { id: "carolina", name: "Carolina", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["CAR3"], disabledDivisionAbbs: [], checked: true },
  { id: "florida", name: "Florida", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["FL3"], disabledDivisionAbbs: [], checked: true },
  { id: "georgia", name: "Georgia", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["GA3"], disabledDivisionAbbs: [], checked: true },
  { id: "maryland", name: "Maryland", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["MD3", "MDW2"], disabledDivisionAbbs: [], checked: true },
  { id: "mountain-west", name: "Mountain West", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["MW3"], disabledDivisionAbbs: [], checked: true },
  { id: "new-england", name: "New England", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["NE3"], disabledDivisionAbbs: [], checked: true },
  { id: "north-jersey", name: "North Jersey", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["NOJ3"], disabledDivisionAbbs: [], checked: true },
  { id: "north-shore", name: "North Shore", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["NS3"], disabledDivisionAbbs: [], checked: true },
  { id: "pacific-northwest", name: "Pacific Northwest", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["PNW3"], disabledDivisionAbbs: [], checked: true },
  { id: "texas", name: "Texas", type: "location", fbAccountId: "", igAccountId: "", divisionAbbs: ["TX3"], disabledDivisionAbbs: [], checked: true },
  // ── Tier accounts ──
  { id: "legends", name: "Legends", type: "tier", fbAccountId: "", igAccountId: "", divisionAbbs: ["BUFL", "LIL", "MAL", "NJL", "PITL"], disabledDivisionAbbs: [], checked: true },
  { id: "tier-1", name: "Tier 1", type: "tier", fbAccountId: "", igAccountId: "", divisionAbbs: ["HFX1", "MA1", "NJ1", "NIA1", "PIT1"], disabledDivisionAbbs: [], checked: true },
  { id: "tier-2", name: "Tier 2", type: "tier", fbAccountId: "", igAccountId: "", divisionAbbs: ["BDA2", "BC2", "BUF2", "CHI2", "GB2", "LI2", "MA2", "MID2", "PHI2", "PIT2", "SJ2", "SE2", "DC2", "CA2"], disabledDivisionAbbs: [], checked: true },
  { id: "tier-3", name: "Tier 3", type: "tier", fbAccountId: "", igAccountId: "", divisionAbbs: ["BUF3", "CA3", "CAR3", "FL3", "GA3", "LI3", "MD3", "MA3", "MID3", "MW3", "NE3", "NOJ3", "NS3", "PNW3", "PHI3", "PIT3", "PIT3E", "PIT3W", "SJ3E", "SJ3W", "TX3"], disabledDivisionAbbs: [], checked: true },
  { id: "womens-tier-1", name: "Women's Tier 1", type: "tier", fbAccountId: "", igAccountId: "", divisionAbbs: ["MAW1"], disabledDivisionAbbs: [], checked: true },
  { id: "womens-tier-2", name: "Women's Tier 2", type: "tier", fbAccountId: "", igAccountId: "", divisionAbbs: ["MDW2", "MAW2", "NJW2", "PITW2"], disabledDivisionAbbs: [], checked: true },
];

/**
 * Apply current built-in defaults for fields that were historically empty in saved settings
 * (e.g. Final Scores / Upcoming Games filename patterns).
 */
export function mergeBuiltInPostTypeDefaults(postTypes: PostType[]): PostType[] {
  const byId = new Map(DEFAULT_POST_TYPES.map((d) => [d.id, d]));
  return postTypes.map((pt) => {
    const def = byId.get(pt.id);
    if (!def || !pt.isBuiltIn) return pt;
    if (!pt.filenamePattern?.trim() && def.filenamePattern) {
      return { ...pt, filenamePattern: def.filenamePattern };
    }
    return pt;
  });
}

export const DEFAULT_POST_TYPES: PostType[] = [
  {
    id: "standings",
    label: "Standings",
    captionTemplate:
      "Week {week} {divName} {type} are here! #NBHL #BallHockey",
    tierCaptionTemplate:
      "Week {week} {conf} {type} are here! #NBHL #BallHockey",
    defaultDate: "",
    defaultTime: "12:00",
    cdnFolder: "Standings",
    filenamePattern: "{divAbb}_Standings",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "stats",
    label: "Stats",
    captionTemplate:
      "Week {week} {divName} {type} update! #NBHL #BallHockey",
    tierCaptionTemplate:
      "Week {week} {conf} {type} update! #NBHL #BallHockey",
    defaultDate: "",
    defaultTime: "12:00",
    cdnFolder: "Stats",
    filenamePattern: "{divAbb}_Stats",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "final-scores",
    label: "Final Scores",
    captionTemplate:
      "Week {week} Final Scores are in! #NBHL #BallHockey",
    tierCaptionTemplate:
      "Week {week} Final Scores are in! #NBHL #BallHockey",
    defaultDate: "",
    defaultTime: "12:00",
    cdnFolder: "Final-Scores",
    /** Matches R2 files like `BUF2_SCHEDULE_1.png` in the Final-Scores folder */
    filenamePattern: "{divAbb}_SCHEDULE",
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: "upcoming-games",
    label: "Upcoming Games",
    captionTemplate:
      "Week {week} Schedule is out! #NBHL #BallHockey",
    tierCaptionTemplate:
      "Week {week} Schedule is out! #NBHL #BallHockey",
    defaultDate: "",
    defaultTime: "12:00",
    cdnFolder: "Upcoming-Games",
    /** Same prefix as Final Scores; folder distinguishes upcoming vs final */
    filenamePattern: "{divAbb}_SCHEDULE",
    enabled: true,
    isBuiltIn: true,
  },
];
