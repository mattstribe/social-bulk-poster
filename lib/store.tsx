"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

function getInitialState(): AppState {
  return {
    leagueName: "",
    cdnBaseUrl: DEFAULT_CDN_BASE_URL,
    weekNumber: 1,
    accounts: [],
    divisions: [],
    tierAccounts: {},
    postTypes: DEFAULT_POST_TYPES,
  };
}

interface StoreContextValue {
  state: AppState;
  setLeagueName: (name: string) => void;
  setCdnBaseUrl: (url: string) => void;
  setWeekNumber: (week: number) => void;
  setAccounts: (accounts: SocialAccount[]) => void;
  setDivisions: (divisions: Division[]) => void;
  toggleDivision: (abb: string) => void;
  toggleAllDivisions: (checked: boolean) => void;
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated]);

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
        setLeagueName,
        setCdnBaseUrl,
        setWeekNumber,
        setAccounts,
        setDivisions,
        toggleDivision,
        toggleAllDivisions,
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
