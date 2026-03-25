"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  type AppState,
  type SocialAccount,
  type Division,
  type PostType,
  type PostingAccount,
  type CdnManifest,
  DEFAULT_CDN_BASE_URL,
  DEFAULT_POST_TYPES,
  DEFAULT_POSTING_ACCOUNTS,
  mergeBuiltInPostTypeDefaults,
  reorderPostTypesLikeDefaults,
} from "./types";
const STORAGE_KEY = "social-bulk-poster-state";

/** League week 1 starts this Monday (YYYY-MM-DD). Week 0 upcoming games = 5 days before. */
const DEFAULT_LEAGUE_WEEK1_MONDAY = "2026-03-30";

interface SavedSettings {
  accounts: SocialAccount[];
  divisions: Division[];
  postingAccounts: PostingAccount[];
  postTypes: PostType[];
  leagueName: string;
  leagueWeek1Monday?: string;
}

function getInitialState(): AppState {
  return {
    leagueName: "NBHL",
    cdnBaseUrl: DEFAULT_CDN_BASE_URL,
    weekNumber: 1,
    leagueWeek1Monday: DEFAULT_LEAGUE_WEEK1_MONDAY,
    accounts: [],
    divisions: [],
    postingAccounts: DEFAULT_POSTING_ACCOUNTS,
    postTypes: DEFAULT_POST_TYPES,
  };
}

function buildDivisionsMap(
  accounts: PostingAccount[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const pa of accounts) map[pa.id] = [...pa.divisionAbbs];
  return map;
}

function settingsSnapshot(state: AppState): string {
  const s: SavedSettings = {
    accounts: state.accounts,
    divisions: state.divisions,
    postingAccounts: state.postingAccounts,
    postTypes: state.postTypes,
    leagueName: state.leagueName,
    leagueWeek1Monday: state.leagueWeek1Monday,
  };
  return JSON.stringify(s);
}

interface StoreContextValue {
  state: AppState;
  hasUnsavedChanges: boolean;
  saving: boolean;
  selectedDivisionAbbs: string[];
  setSelectedDivisionAbbs: (abbs: string[] | ((prev: string[]) => string[])) => void;
  savedDivisionsMap: Record<string, string[]>;
  cdnManifest: CdnManifest | null;
  cdnScanning: boolean;
  scanCdn: () => Promise<CdnManifest | null>;
  saveSettings: () => void;
  setLeagueName: (name: string) => void;
  setCdnBaseUrl: (url: string) => void;
  setWeekNumber: (week: number) => void;
  setLeagueWeek1Monday: (iso: string) => void;
  setAccounts: (accounts: SocialAccount[]) => void;
  setDivisions: (divisions: Division[]) => void;
  addPostingAccount: () => void;
  removePostingAccount: (id: string) => void;
  updatePostingAccount: (id: string, updates: Partial<PostingAccount>) => void;
  togglePostingAccount: (id: string) => void;
  toggleAllPostingAccounts: (checked: boolean) => void;
  toggleDivisionAbb: (accountId: string, abb: string) => void;
  movePostingAccount: (id: string, direction: "up" | "down") => void;
  assignDivision: (accountId: string, divAbb: string) => void;
  unassignDivision: (accountId: string, divAbb: string) => void;
  toggleDivisionOnAccount: (accountId: string) => void;
  setPostTypes: (types: PostType[]) => void;
  updatePostType: (id: string, updates: Partial<PostType>) => void;
  addPostType: () => void;
  removePostType: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const initialLoadDone = useRef(false);

  useEffect(() => {
    async function hydrate() {
      let base = getInitialState();

      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const saved = (await res.json()) as SavedSettings & {
            cdnBaseUrl?: string;
            // legacy fields for migration
            tierAccounts?: Record<
              string,
              { fbAccountId: string; igAccountId: string }
            >;
          };
          if (saved.cdnBaseUrl) {
            base = { ...base, cdnBaseUrl: saved.cdnBaseUrl };
          }
          if (saved.leagueWeek1Monday?.trim()) {
            base = {
              ...base,
              leagueWeek1Monday: saved.leagueWeek1Monday.trim(),
            };
          }
          if (
            saved.accounts?.length ||
            saved.divisions?.length ||
            saved.postingAccounts?.length
          ) {
            base = {
              ...base,
              accounts: saved.accounts || [],
              divisions: (saved.divisions || []).map((d) => ({
                conf: d.conf,
                div: d.div,
                abb: d.abb,
                color1: d.color1,
              })),
              postingAccounts: (saved.postingAccounts || []).map((pa) => ({
                ...pa,
                disabledDivisionAbbs: pa.disabledDivisionAbbs ?? [],
              })),
              postTypes: saved.postTypes?.length
                ? saved.postTypes
                : base.postTypes,
              leagueName: saved.leagueName || base.leagueName,
              leagueWeek1Monday:
                saved.leagueWeek1Monday?.trim() ||
                base.leagueWeek1Monday,
            };
          }
        }
      } catch {
        // API not available, fall through
      }

      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local) as Partial<AppState>;
          if (
            base.accounts.length === 0 &&
            base.divisions.length === 0 &&
            base.postingAccounts.length === 0
          ) {
            base = { ...base, ...parsed };
          } else {
            base = {
              ...base,
              weekNumber: parsed.weekNumber ?? base.weekNumber,
              leagueWeek1Monday:
                parsed.leagueWeek1Monday?.trim() ||
                base.leagueWeek1Monday,
              postTypes: parsed.postTypes ?? base.postTypes,
            };
          }
        }
      } catch {
        // ignore corrupt localStorage
      }

      base = {
        ...base,
        postTypes: reorderPostTypesLikeDefaults(
          mergeBuiltInPostTypeDefaults(
            base.postTypes.map((pt) => ({
              ...pt,
              tierCaptionTemplate:
                pt.tierCaptionTemplate ??
                (DEFAULT_POST_TYPES.find((d) => d.id === pt.id)
                  ?.tierCaptionTemplate || pt.captionTemplate),
            }))
          )
        ),
      };

      setState(base);
      setSavedSnapshot(settingsSnapshot(base));
      setSavedDivisionsMap(buildDivisionsMap(base.postingAccounts));
      initialLoadDone.current = true;
      setHydrated(true);
    }

    hydrate();
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated]);

  const hasData =
    state.divisions.length > 0 ||
    state.accounts.length > 0 ||
    state.postingAccounts.length > 0;
  const hasUnsavedChanges =
    hydrated && hasData && settingsSnapshot(state) !== savedSnapshot;

  const [saving, setSaving] = useState(false);
  const [selectedDivisionAbbs, setSelectedDivisionAbbs] = useState<string[]>(
    []
  );
  const [savedDivisionsMap, setSavedDivisionsMap] = useState<
    Record<string, string[]>
  >({});

  const [cdnManifest, setCdnManifest] = useState<CdnManifest | null>(null);
  const [cdnScanning, setCdnScanning] = useState(false);
  const cdnScanKeyRef = useRef("");

  const scanCdn = useCallback(async (): Promise<CdnManifest | null> => {
    const key = `${state.leagueName}::${state.weekNumber}`;
    if (cdnManifest && cdnScanKeyRef.current === key) return cdnManifest;

    setCdnScanning(true);
    try {
      const params = new URLSearchParams({
        league: state.leagueName,
        week: String(state.weekNumber),
      });
      const res = await fetch(`/api/cdn-files?${params}`);
      if (!res.ok) throw new Error(`CDN scan failed: ${res.status}`);
      const data = (await res.json()) as { files: CdnManifest };
      setCdnManifest(data.files);
      cdnScanKeyRef.current = key;
      return data.files;
    } catch (err) {
      console.error("CDN scan error:", err);
      return null;
    } finally {
      setCdnScanning(false);
    }
  }, [state.leagueName, state.weekNumber, cdnManifest]);

  const saveSettings = useCallback(async () => {
    const s: SavedSettings = {
      accounts: state.accounts,
      divisions: state.divisions,
      postingAccounts: state.postingAccounts,
      postTypes: state.postTypes,
      leagueName: state.leagueName,
      leagueWeek1Monday: state.leagueWeek1Monday,
    };
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (res.ok) {
        setSavedSnapshot(settingsSnapshot(state));
        setSavedDivisionsMap(buildDivisionsMap(state.postingAccounts));
      }
    } catch {
      // silently fail for now
    } finally {
      setSaving(false);
    }
  }, [state]);

  const setLeagueName = useCallback(
    (name: string) => {
      setState((s) => ({ ...s, leagueName: name }));
      setCdnManifest(null);
    },
    []
  );
  const setCdnBaseUrl = useCallback(
    (url: string) => setState((s) => ({ ...s, cdnBaseUrl: url })),
    []
  );
  const setWeekNumber = useCallback(
    (week: number) => {
      setState((s) => ({ ...s, weekNumber: week }));
      setCdnManifest(null);
    },
    []
  );
  const setLeagueWeek1Monday = useCallback((iso: string) => {
    setState((s) => ({ ...s, leagueWeek1Monday: iso }));
  }, []);
  const setAccounts = useCallback(
    (accounts: SocialAccount[]) => setState((s) => ({ ...s, accounts })),
    []
  );
  const setDivisions = useCallback(
    (divisions: Division[]) => setState((s) => ({ ...s, divisions })),
    []
  );

  // --- Posting Account actions ---

  const addPostingAccount = useCallback(
    () =>
      setState((s) => ({
        ...s,
        postingAccounts: [
          ...s.postingAccounts,
          {
            id: crypto.randomUUID(),
            name: "",
            type: "location" as const,
            fbAccountId: "",
            igAccountId: "",
            divisionAbbs: [],
            disabledDivisionAbbs: [],
            checked: true,
          },
        ],
      })),
    []
  );

  const removePostingAccount = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.filter((pa) => pa.id !== id),
      })),
    []
  );

  const updatePostingAccount = useCallback(
    (id: string, updates: Partial<PostingAccount>) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) =>
          pa.id === id ? { ...pa, ...updates } : pa
        ),
      })),
    []
  );

  const togglePostingAccount = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) => {
          if (pa.id !== id) return pa;
          const willCheck = !pa.checked;
          return {
            ...pa,
            checked: willCheck,
            disabledDivisionAbbs: willCheck ? [] : [...pa.divisionAbbs],
          };
        }),
      })),
    []
  );

  const toggleAllPostingAccounts = useCallback(
    (checked: boolean) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) => ({
          ...pa,
          checked,
          disabledDivisionAbbs: checked ? [] : [...pa.divisionAbbs],
        })),
      })),
    []
  );

  const toggleDivisionAbb = useCallback(
    (accountId: string, abb: string) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) => {
          if (pa.id !== accountId) return pa;
          const isDisabled = pa.disabledDivisionAbbs.includes(abb);
          const newDisabled = isDisabled
            ? pa.disabledDivisionAbbs.filter((a) => a !== abb)
            : [...pa.disabledDivisionAbbs, abb];
          const allDisabled =
            newDisabled.length >= pa.divisionAbbs.length &&
            pa.divisionAbbs.every((a) => newDisabled.includes(a));
          return {
            ...pa,
            disabledDivisionAbbs: newDisabled,
            checked: !allDisabled,
          };
        }),
      })),
    []
  );

  const movePostingAccount = useCallback(
    (id: string, direction: "up" | "down") =>
      setState((s) => {
        const idx = s.postingAccounts.findIndex((pa) => pa.id === id);
        if (idx === -1) return s;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= s.postingAccounts.length) return s;
        const arr = [...s.postingAccounts];
        [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
        return { ...s, postingAccounts: arr };
      }),
    []
  );

  const assignDivision = useCallback(
    (accountId: string, divAbb: string) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) =>
          pa.id === accountId && !pa.divisionAbbs.includes(divAbb)
            ? { ...pa, divisionAbbs: [...pa.divisionAbbs, divAbb] }
            : pa
        ),
      })),
    []
  );

  const unassignDivision = useCallback(
    (accountId: string, divAbb: string) =>
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) =>
          pa.id === accountId
            ? {
                ...pa,
                divisionAbbs: pa.divisionAbbs.filter((a) => a !== divAbb),
              }
            : pa
        ),
      })),
    []
  );

  const toggleDivisionOnAccount = useCallback(
    (accountId: string) => {
      if (selectedDivisionAbbs.length === 0) return;
      setState((s) => ({
        ...s,
        postingAccounts: s.postingAccounts.map((pa) => {
          if (pa.id !== accountId) return pa;
          let divisionAbbs = [...pa.divisionAbbs];
          for (const abb of selectedDivisionAbbs) {
            const has = divisionAbbs.includes(abb);
            divisionAbbs = has
              ? divisionAbbs.filter((a) => a !== abb)
              : [...divisionAbbs, abb];
          }
          return { ...pa, divisionAbbs };
        }),
      }));
      setSelectedDivisionAbbs([]);
    },
    [selectedDivisionAbbs]
  );

  // --- Post type actions ---

  const setPostTypes = useCallback(
    (types: PostType[]) => setState((s) => ({ ...s, postTypes: types })),
    []
  );
  const updatePostType = useCallback(
    (id: string, updates: Partial<PostType>) =>
      setState((s) => ({
        ...s,
        postTypes: s.postTypes.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),
    []
  );
  const addPostType = useCallback(
    () =>
      setState((s) => ({
        ...s,
        postTypes: [
          ...s.postTypes,
          {
            id: crypto.randomUUID(),
            label: "Custom",
            captionTemplate: "",
            tierCaptionTemplate: "",
            defaultDate: "",
            defaultTime: "12:00",
            defaultDateLocked: false,
            tierDefaultDate: "",
            tierDefaultTime: "12:00",
            tierDefaultDateLocked: false,
            cdnFolder: "",
            filenamePattern: "",
            enabled: true,
            isBuiltIn: false,
          },
        ],
      })),
    []
  );
  const removePostType = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        postTypes: s.postTypes.filter((p) => p.id !== id),
      })),
    []
  );

  if (!hydrated) return null;

  return (
    <StoreContext.Provider
      value={{
        state,
        hasUnsavedChanges,
        saving,
        selectedDivisionAbbs,
        setSelectedDivisionAbbs,
        savedDivisionsMap,
        cdnManifest,
        cdnScanning,
        scanCdn,
        saveSettings,
        setLeagueName,
        setCdnBaseUrl,
        setWeekNumber,
        setLeagueWeek1Monday,
        setAccounts,
        setDivisions,
        addPostingAccount,
        removePostingAccount,
        updatePostingAccount,
        togglePostingAccount,
        toggleAllPostingAccounts,
        toggleDivisionAbb,
        movePostingAccount,
        assignDivision,
        unassignDivision,
        toggleDivisionOnAccount,
        setPostTypes,
        updatePostType,
        addPostType,
        removePostType,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
