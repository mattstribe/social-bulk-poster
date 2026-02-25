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
  tier: string;
  color1?: string;
  checked: boolean;
  fbAccountId: string;
  igAccountId: string;
}

export interface PostType {
  id: string;
  label: string;
  captionTemplate: string;
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

export const DEFAULT_CDN_BASE_URL =
  "https://pub-3c06366d547445298c77e04b7c3c77ad.r2.dev";

export const DEFAULT_POST_TYPES: PostType[] = [
  {
    id: "standings",
    label: "Standings",
    captionTemplate:
      "Week {week} {divName} {type} are here! #{league} #BallHockey",
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
      "Week {week} {divName} {type} update! #{league} #BallHockey",
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
      "Week {week} Final Scores are in! #{league} #BallHockey",
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
      "Week {week} Schedule is out! #{league} #BallHockey",
    defaultDate: "",
    defaultTime: "12:00",
    cdnFolder: "Upcoming-Games",
    filenamePattern: "",
    enabled: true,
    isBuiltIn: true,
  },
];
