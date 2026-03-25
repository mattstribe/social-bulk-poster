/** Monday-first labels (for weekday selects; values match `Date.getDay()`). */
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

/** Offset from Monday to the given JS weekday (0=Sun … 6=Sat). */
export function daysFromMondayToWeekday(weekday: number): number {
  return weekday === 0 ? 6 : weekday - 1;
}

function builtInSkipsWeek0(postTypeId: string): boolean {
  return (
    postTypeId === "final-scores" ||
    postTypeId === "standings" ||
    postTypeId === "stats"
  );
}

/**
 * Calendar date for `postTypeId` in the selected league `weekNumber`, on the given `weekday`,
 * using `leagueWeek1MondayIso` as the week-1 anchor.
 * Week 0 uses the Monday seven days before week 1 Monday; week N≥1 uses that week’s Monday.
 */
export function computeScheduleDate(
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string,
  weekday: number
): string {
  const anchor = leagueWeek1MondayIso.trim();
  if (!anchor) return "";

  if (weekNumber === 0 && builtInSkipsWeek0(postTypeId)) {
    return "";
  }

  let weekMondayIso: string;
  if (weekNumber === 0) {
    weekMondayIso = addDaysIso(anchor, -7);
  } else {
    const m = mondayOfLeagueWeek(anchor, weekNumber);
    if (!m) return "";
    weekMondayIso = m;
  }

  const wd = Number.isFinite(weekday) ? Math.min(6, Math.max(0, weekday)) : 1;
  return addDaysIso(weekMondayIso, daysFromMondayToWeekday(wd));
}

/** @deprecated use computeScheduleDate with location/tier weekdays */
export function computePostTypeScheduleDate(
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string
): string {
  return computeScheduleDate(
    postTypeId,
    weekNumber,
    leagueWeek1MondayIso,
    1
  );
}

export function resolveLocationPostDate(
  locked: boolean,
  savedDate: string,
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string,
  locationWeekday: number
): string {
  if (locked && savedDate.trim()) return savedDate;
  return computeScheduleDate(
    postTypeId,
    weekNumber,
    leagueWeek1MondayIso,
    locationWeekday
  );
}

export function resolveTierPostDate(
  locked: boolean,
  savedDate: string,
  postTypeId: string,
  weekNumber: number,
  leagueWeek1MondayIso: string,
  tierWeekday: number
): string {
  if (locked && savedDate.trim()) return savedDate;
  return computeScheduleDate(
    postTypeId,
    weekNumber,
    leagueWeek1MondayIso,
    tierWeekday
  );
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
