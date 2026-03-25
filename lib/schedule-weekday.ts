/** Monday-first labels (for display only; schedule is league-week based now). */
export const WEEKDAY_SELECT_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function parseIsoWeekday(iso: string): number | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return undefined;
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt.getDay();
}

function parseLocalDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function addDaysIso(iso: string, deltaDays: number): string {
  const d = parseLocalDate(iso);
  if (!d) return "";
  d.setDate(d.getDate() + deltaDays);
  return formatLocalDate(d);
}

/**
 * Monday that starts league "week N" (N >= 1). `week1MondayIso` is the Monday of week 1.
 */
export function mondayOfLeagueWeek(
  week1MondayIso: string,
  weekNumber: number
): string | null {
  if (!week1MondayIso.trim() || weekNumber < 1) return null;
  return addDaysIso(week1MondayIso, (weekNumber - 1) * 7);
}

/**
 * Default post date for a post type from the selected league week and "Week 1 Monday" anchor.
 * Built-in: FS Mon, Standings Tue, UG Wed, Stats Fri for week >= 1.
 * Week 0: only Upcoming Games (Wed before week 1 Monday). Others empty until week >= 1.
 * Custom types: Monday of that league week.
 */
export function computePostTypeScheduleDate(
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string
): string {
  const anchor = leagueWeek1MondayIso.trim();
  if (!anchor) return "";

  const mon = mondayOfLeagueWeek(anchor, weekNumber);
  if (!mon && weekNumber !== 0) return "";

  switch (postTypeId) {
    case "final-scores":
      if (weekNumber < 1) return "";
      return mon!;
    case "standings":
      if (weekNumber < 1) return "";
      return addDaysIso(mon!, 1);
    case "upcoming-games":
      if (weekNumber === 0) {
        return addDaysIso(anchor, -5);
      }
      return addDaysIso(mon!, 2);
    case "stats":
      if (weekNumber < 1) return "";
      return addDaysIso(mon!, 4);
    default:
      if (weekNumber < 1) return "";
      return mon!;
  }
}

export function resolveLocationPostDate(
  locked: boolean,
  savedDate: string,
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string
): string {
  if (locked && savedDate.trim()) return savedDate;
  return computePostTypeScheduleDate(postTypeId, weekNumber, leagueWeek1MondayIso);
}

export function resolveTierPostDate(
  locked: boolean,
  savedDate: string,
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string
): string {
  if (locked && savedDate.trim()) return savedDate;
  return computePostTypeScheduleDate(postTypeId, weekNumber, leagueWeek1MondayIso);
}

/** @deprecated kept for any stray imports */
export function dateStringForNextWeekday(
  targetWeekday: number,
  ref: Date = new Date()
): string {
  const local = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const d0 = local.getDay();
  const add = (targetWeekday - d0 + 7) % 7;
  local.setDate(local.getDate() + add);
  return formatLocalDate(local);
}
