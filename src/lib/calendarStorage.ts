export const APP_VERSION = "2024.09.01";

const STORAGE_NAMESPACE = "colleague-calendar";
const VERSION_KEY = `${STORAGE_NAMESPACE}:version`;
const STATE_KEY = `${STORAGE_NAMESPACE}:state`;

export type PersistentCalendarState = {
  colorPreferences: Record<string, string>;
  selectedColleagueIds: string[];
  closeColleagueIds: string[];
  deviations: Record<string, CalendarDeviation>;
  customShifts: CustomShift[];
};

export type CalendarDeviation = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  shiftId: string;
  note: string;
  severity: "info" | "warning" | "critical";
};

export type CustomShift = {
  id: string;
  date: string; // ISO date
  label: string;
  shiftType: string;
};

const DEFAULT_STATE: PersistentCalendarState = {
  colorPreferences: {
    day: "bg-shift-blue",
    evening: "bg-shift-purple",
    night: "bg-shift-teal",
    support: "bg-shift-green",
    custom: "bg-shift-orange",
  },
  selectedColleagueIds: ["self", "thomas", "fatima", "lars"],
  closeColleagueIds: ["thomas", "fatima"],
  deviations: {
    "thomas-2024-05-17": {
      id: "dev-thomas-2024-05-17",
      date: "2024-05-17",
      shiftId: "thomas-2024-05-17",
      note: "Byttet til morgenvakt på grunn av 17. mai-tog.",
      severity: "info",
    },
    "self-2024-07-14": {
      id: "dev-self-2024-07-14",
      date: "2024-07-14",
      shiftId: "self-2024-07-14",
      note: "Permisjon for bursdagsfeiring.",
      severity: "warning",
    },
  },
  customShifts: [
    {
      id: "custom-2024-06-05",
      date: "2024-06-05",
      label: "Vaktbytte med Fatima",
      shiftType: "custom",
    },
  ],
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type MemoryCache = {
  version: string | null;
  state: PersistentCalendarState | null;
};

const memoryCache: MemoryCache = {
  version: null,
  state: null,
};

function getLocalStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const { localStorage } = window;
    const testKey = `${STORAGE_NAMESPACE}:test`;
    localStorage.setItem(testKey, "ok");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (error) {
    console.warn("LocalStorage is not available, falling back to in-memory cache.", error);
    return null;
  }
}

function ensureVersion(storage: StorageLike | null) {
  if (storage) {
    const storedVersion = storage.getItem(VERSION_KEY);
    if (storedVersion !== APP_VERSION) {
      storage.removeItem(STATE_KEY);
      storage.setItem(VERSION_KEY, APP_VERSION);
    }
  } else if (memoryCache.version !== APP_VERSION) {
    memoryCache.state = null;
    memoryCache.version = APP_VERSION;
  }
}

export function loadPersistentCalendarState(): PersistentCalendarState {
  const storage = getLocalStorage();
  ensureVersion(storage);

  if (storage) {
    const raw = storage.getItem(STATE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<PersistentCalendarState>;
      return {
        ...DEFAULT_STATE,
        ...parsed,
        colorPreferences: {
          ...DEFAULT_STATE.colorPreferences,
          ...parsed.colorPreferences,
        },
        selectedColleagueIds:
          parsed.selectedColleagueIds ?? DEFAULT_STATE.selectedColleagueIds,
        closeColleagueIds: parsed.closeColleagueIds ?? DEFAULT_STATE.closeColleagueIds,
        deviations: parsed.deviations ?? DEFAULT_STATE.deviations,
        customShifts: parsed.customShifts ?? DEFAULT_STATE.customShifts,
      };
    } catch (error) {
      console.warn("Failed to parse calendar state from storage, resetting.", error);
      storage.removeItem(STATE_KEY);
      return DEFAULT_STATE;
    }
  }

  if (!memoryCache.state) {
    memoryCache.state = DEFAULT_STATE;
    memoryCache.version = APP_VERSION;
  }

  return memoryCache.state;
}

export function savePersistentCalendarState(state: PersistentCalendarState) {
  const storage = getLocalStorage();
  ensureVersion(storage);

  const payload = JSON.stringify({
    colorPreferences: state.colorPreferences,
    selectedColleagueIds: state.selectedColleagueIds,
    closeColleagueIds: state.closeColleagueIds,
    deviations: state.deviations,
    customShifts: state.customShifts,
  });

  if (storage) {
    storage.setItem(STATE_KEY, payload);
  } else {
    memoryCache.state = JSON.parse(payload) as PersistentCalendarState;
    memoryCache.version = APP_VERSION;
  }
}

export function resetPersistentCalendarState() {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(STATE_KEY);
    storage.setItem(VERSION_KEY, APP_VERSION);
  }
  memoryCache.state = null;
  memoryCache.version = APP_VERSION;
}

export type PersistentStateSnapshot = PersistentCalendarState;
