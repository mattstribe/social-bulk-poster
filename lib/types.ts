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
  checked: boolean;
  fbAccountId: string;
  igAccountId: string;
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

export interface TierAccount {
  fbAccountId: string;
  igAccountId: string;
}

export interface AppState {
  leagueName: string;
  cdnBaseUrl: string;
  weekNumber: number;
  accounts: SocialAccount[];
  divisions: Division[];
  tierAccounts: Record<string, TierAccount>;
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

export const DEFAULT_CDN_BASE_URL = "";

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
    filenamePattern: "{divAbb}_Standings_1.png",
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
    filenamePattern: "{divAbb}_Stats.png",
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
    filenamePattern: "",
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
    filenamePattern: "",
    enabled: true,
    isBuiltIn: true,
  },
];
