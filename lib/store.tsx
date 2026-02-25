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
  type TierAccount,
  DEFAULT_CDN_BASE_URL,
  DEFAULT_POST_TYPES,
} from "./types";

const STORAGE_KEY = "social-bulk-poster-state";

interface SavedSettings {
  accounts: SocialAccount[];
  divisions: Division[];
  tierAccounts: Record<string, TierAccount>;
  leagueName: string;
}

function getInitialState(): AppState {
  return {
    leagueName: "NBHL",
    cdnBaseUrl: DEFAULT_CDN_BASE_URL,
    weekNumber: 1,
    accounts: [],
    divisions: [],
    tierAccounts: {},
    postTypes: DEFAULT_POST_TYPES,
  };
}

function settingsSnapshot(state: AppState): string {
  const s: SavedSettings = {
    accounts: state.accounts,
    divisions: state.divisions,
    tierAccounts: state.tierAccounts,
    leagueName: state.leagueName,
  };
  return JSON.stringify(s);
}

interface StoreContextValue {
  state: AppState;
  hasUnsavedChanges: boolean;
  saving: boolean;
  saveSettings: () => void;
  setLeagueName: (name: string) => void;
  setCdnBaseUrl: (url: string) => void;
  setWeekNumber: (week: number) => void;
  setAccounts: (accounts: SocialAccount[]) => void;
  setDivisions: (divisions: Division[]) => void;
  toggleDivision: (abb: string) => void;
  toggleAllDivisions: (checked: boolean) => void;
  addDivision: (conf: string, div: string, abb: string) => void;
  removeDivision: (abb: string) => void;
  removeTierDivisions: (conf: string) => void;
  updateDivisionAccount: (
    abb: string,
    field: "fbAccountId" | "igAccountId",
    accountId: string
  ) => void;
  updateTierAccount: (
    conf: string,
    field: "fbAccountId" | "igAccountId",
    accountId: string
  ) => void;
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
          const saved: SavedSettings = await res.json();
          if (saved.accounts?.length || saved.divisions?.length) {
            base = {
              ...base,
              accounts: saved.accounts || [],
              divisions: saved.divisions || [],
              tierAccounts: saved.tierAccounts || {},
              leagueName: saved.leagueName || "",
              cdnBaseUrl: saved.cdnBaseUrl || base.cdnBaseUrl,
            };
          }
        }
      } catch {
        // API not available (local dev without blob token), fall through
      }

      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local) as Partial<AppState>;
          if (base.accounts.length === 0 && base.divisions.length === 0) {
            base = { ...base, ...parsed };
          } else {
            base = {
              ...base,
              weekNumber: parsed.weekNumber ?? base.weekNumber,
              postTypes: parsed.postTypes ?? base.postTypes,
            };
          }
        }
      } catch {
        // ignore corrupt localStorage
      }

      setState(base);
      setSavedSnapshot(settingsSnapshot(base));
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
    state.divisions.length > 0 || state.accounts.length > 0;
  const hasUnsavedChanges =
    hydrated && hasData && settingsSnapshot(state) !== savedSnapshot;

  const [saving, setSaving] = useState(false);

  const saveSettings = useCallback(async () => {
    const s: SavedSettings = {
      accounts: state.accounts,
      divisions: state.divisions,
      tierAccounts: state.tierAccounts,
      leagueName: state.leagueName,
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
      }
    } catch {
      // silently fail for now
    } finally {
      setSaving(false);
    }
  }, [state]);

  const setLeagueName = useCallback(
    (name: string) => setState((s) => ({ ...s, leagueName: name })),
    []
  );
  const setCdnBaseUrl = useCallback(
    (url: string) => setState((s) => ({ ...s, cdnBaseUrl: url })),
    []
  );
  const setWeekNumber = useCallback(
    (week: number) => setState((s) => ({ ...s, weekNumber: week })),
    []
  );
  const setAccounts = useCallback(
    (accounts: SocialAccount[]) => setState((s) => ({ ...s, accounts })),
    []
  );
  const setDivisions = useCallback(
    (divisions: Division[]) => setState((s) => ({ ...s, divisions })),
    []
  );
  const toggleDivision = useCallback(
    (abb: string) =>
      setState((s) => ({
        ...s,
        divisions: s.divisions.map((d) =>
          d.abb === abb ? { ...d, checked: !d.checked } : d
        ),
      })),
    []
  );
  const toggleAllDivisions = useCallback(
    (checked: boolean) =>
      setState((s) => ({
        ...s,
        divisions: s.divisions.map((d) => ({ ...d, checked })),
      })),
    []
  );
  const addDivision = useCallback(
    (conf: string, div: string, abb: string) =>
      setState((s) => ({
        ...s,
        divisions: [
          ...s.divisions,
          { conf, div, abb, checked: true, fbAccountId: "", igAccountId: "" },
        ],
      })),
    []
  );
  const removeDivision = useCallback(
    (abb: string) =>
      setState((s) => ({
        ...s,
        divisions: s.divisions.filter((d) => d.abb !== abb),
      })),
    []
  );
  const removeTierDivisions = useCallback(
    (conf: string) =>
      setState((s) => {
        const { [conf]: _, ...rest } = s.tierAccounts;
        return {
          ...s,
          divisions: s.divisions.filter((d) => d.conf !== conf),
          tierAccounts: rest,
        };
      }),
    []
  );
  const updateDivisionAccount = useCallback(
    (abb: string, field: "fbAccountId" | "igAccountId", accountId: string) =>
      setState((s) => ({
        ...s,
        divisions: s.divisions.map((d) =>
          d.abb === abb ? { ...d, [field]: accountId } : d
        ),
      })),
    []
  );
  const updateTierAccount = useCallback(
    (conf: string, field: "fbAccountId" | "igAccountId", accountId: string) =>
      setState((s) => {
        const existing: TierAccount = s.tierAccounts[conf] || {
          fbAccountId: "",
          igAccountId: "",
        };
        return {
          ...s,
          tierAccounts: {
            ...s.tierAccounts,
            [conf]: { ...existing, [field]: accountId },
          },
        };
      }),
    []
  );
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
            defaultDate: "",
            defaultTime: "12:00",
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
        saveSettings,
        setLeagueName,
        setCdnBaseUrl,
        setWeekNumber,
        setAccounts,
        setDivisions,
        toggleDivision,
        toggleAllDivisions,
        addDivision,
        removeDivision,
        removeTierDivisions,
        updateDivisionAccount,
        updateTierAccount,
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
