import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarDeviation,
  CustomShift,
  PersistentCalendarState,
  loadPersistentCalendarState,
  savePersistentCalendarState,
} from "@/lib/calendarStorage";
import {
  Colleague,
  DEFAULT_COLLEAGUES,
  SPECIAL_DATES,
  ServerShift,
  generateServerShifts,
} from "@/lib/calendarData";

const DEFAULT_SHIFT_TYPE = "custom";

export type CalendarAssignment = {
  id: string;
  date: string;
  shiftType: string;
  label: string;
  colorClass: string;
  pattern: string;
  colleagueId: string;
  colleague: Colleague;
  source: "server" | "custom";
  deviation?: CalendarDeviation;
  isOwn: boolean;
  isCloseColleague: boolean;
};

const serverShiftCache = new Map<number, ServerShift[]>();

async function fetchServerShifts(year: number): Promise<ServerShift[]> {
  // Simulated API latency to make the loading behaviour feel realistic
  await new Promise((resolve) => setTimeout(resolve, 30));
  const data = generateServerShifts(year);
  serverShiftCache.set(year, data);
  return data;
}

function createCustomShiftId(date: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom-${date}-${crypto.randomUUID()}`;
  }
  return `custom-${date}-${Date.now()}`;
}

type UseCalendarDataReturn = {
  colleagues: Colleague[];
  assignmentsByDate: Record<string, CalendarAssignment[]>;
  selectedColleagueIds: string[];
  closeColleagueIds: string[];
  colorPreferences: PersistentCalendarState["colorPreferences"];
  addCustomShift: (shift: Omit<CustomShift, "id"> & { id?: string }) => void;
  removeCustomShift: (id: string) => void;
  ensureYearLoaded: (year: number) => void;
  specialDates: typeof SPECIAL_DATES;
  getAssignmentsForDate: (isoDate: string, options?: { includeUnselected?: boolean }) => CalendarAssignment[];
};

export function useCalendarData(): UseCalendarDataReturn {
  const [persistentState, setPersistentState] = useState<PersistentCalendarState>(() =>
    loadPersistentCalendarState()
  );
  const [serverShiftState, setServerShiftState] = useState<Map<number, ServerShift[]>>(new Map());
  const pendingYearsRef = useRef<Set<number>>(new Set());

  const loadYear = useCallback(
    async (year: number) => {
      if (serverShiftCache.has(year)) {
        setServerShiftState(new Map(serverShiftCache));
        return;
      }

      if (pendingYearsRef.current.has(year)) {
        return;
      }

      pendingYearsRef.current.add(year);
      try {
        const data = await fetchServerShifts(year);
        serverShiftCache.set(year, data);
        setServerShiftState(new Map(serverShiftCache));
      } catch (error) {
        console.error("Kunne ikke hente turnuser fra API, bruker cache", error);
        const fallback = serverShiftCache.get(year) ?? generateServerShifts(year);
        serverShiftCache.set(year, fallback);
        setServerShiftState(new Map(serverShiftCache));
      } finally {
        pendingYearsRef.current.delete(year);
      }
    },
    []
  );

  const ensureYearLoaded = useCallback(
    (year: number) => {
      if (!serverShiftCache.has(year)) {
        void loadYear(year);
      }
    },
    [loadYear]
  );

  useEffect(() => {
    const now = new Date();
    ensureYearLoaded(now.getFullYear());
    ensureYearLoaded(now.getFullYear() - 1);
    ensureYearLoaded(now.getFullYear() + 1);
  }, [ensureYearLoaded]);

  useEffect(() => {
    savePersistentCalendarState(persistentState);
  }, [persistentState]);

  const allServerShifts = useMemo(() => {
    return Array.from(serverShiftState.values()).flat();
  }, [serverShiftState]);

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, CalendarAssignment[]> = {};

    const addAssignment = (assignment: CalendarAssignment) => {
      if (!map[assignment.date]) {
        map[assignment.date] = [];
      }
      map[assignment.date].push(assignment);
    };

    for (const shift of allServerShifts) {
      const colleague = DEFAULT_COLLEAGUES.find((c) => c.id === shift.colleagueId) ?? DEFAULT_COLLEAGUES[0];
      const colorClass =
        persistentState.colorPreferences[shift.shiftType] ?? persistentState.colorPreferences[DEFAULT_SHIFT_TYPE];
      const deviation = persistentState.deviations[shift.id];
      const isOwn = shift.colleagueId === "self";
      const isClose = isOwn || persistentState.closeColleagueIds.includes(shift.colleagueId);

      addAssignment({
        id: shift.id,
        date: shift.date,
        shiftType: shift.shiftType,
        label: shift.pattern,
        colorClass,
        pattern: shift.pattern,
        colleagueId: shift.colleagueId,
        colleague,
        source: "server",
        deviation,
        isOwn,
        isCloseColleague: isClose,
      });
    }

    for (const shift of persistentState.customShifts) {
      const colleague = DEFAULT_COLLEAGUES.find((c) => c.id === "self") ?? DEFAULT_COLLEAGUES[0];
      const colorClass =
        persistentState.colorPreferences[shift.shiftType] ??
        persistentState.colorPreferences[DEFAULT_SHIFT_TYPE];
      const deviation = persistentState.deviations[shift.id];

      addAssignment({
        id: shift.id,
        date: shift.date,
        shiftType: shift.shiftType,
        label: shift.label,
        colorClass,
        pattern: shift.label,
        colleagueId: "self",
        colleague,
        source: "custom",
        deviation,
        isOwn: true,
        isCloseColleague: true,
      });
    }

    return map;
  }, [allServerShifts, persistentState]);

  const getAssignmentsForDate = useCallback(
    (isoDate: string, options?: { includeUnselected?: boolean }) => {
      const assignments = assignmentsByDate[isoDate] ?? [];
      if (options?.includeUnselected) {
        return assignments;
      }

      return assignments.filter(
        (assignment) =>
          assignment.isOwn || persistentState.selectedColleagueIds.includes(assignment.colleagueId)
      );
    },
    [assignmentsByDate, persistentState.selectedColleagueIds]
  );

  const addCustomShift = useCallback(
    (shift: Omit<CustomShift, "id"> & { id?: string }) => {
      setPersistentState((prev) => {
        const id = shift.id ?? createCustomShiftId(shift.date);
        const nextShift: CustomShift = {
          id,
          date: shift.date,
          label: shift.label,
          shiftType: shift.shiftType ?? DEFAULT_SHIFT_TYPE,
        };
        const customShifts = prev.customShifts.filter((item) => item.id !== id).concat(nextShift);
        return {
          ...prev,
          customShifts,
        };
      });
    },
    []
  );

  const removeCustomShift = useCallback((id: string) => {
    setPersistentState((prev) => ({
      ...prev,
      customShifts: prev.customShifts.filter((shift) => shift.id !== id),
    }));
  }, []);

  return {
    colleagues: DEFAULT_COLLEAGUES,
    assignmentsByDate,
    selectedColleagueIds: persistentState.selectedColleagueIds,
    closeColleagueIds: persistentState.closeColleagueIds,
    colorPreferences: persistentState.colorPreferences,
    addCustomShift,
    removeCustomShift,
    ensureYearLoaded,
    specialDates: SPECIAL_DATES,
    getAssignmentsForDate,
  };
}
