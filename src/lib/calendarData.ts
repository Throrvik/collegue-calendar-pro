
export type Colleague = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
};

export type ServerShift = {
  id: string;
  colleagueId: string;
  date: string; // ISO date
  shiftType: string;
  pattern: string;
};

export type SpecialDate = {
  label: string;
  type: "holiday" | "event";
  description?: string;
};

export const DEFAULT_COLLEAGUES: Colleague[] = [
  { id: "self", firstName: "Kari", lastName: "Nordmann", title: "Sykepleier" },
  { id: "thomas", firstName: "Thomas", lastName: "Berg", title: "Fysioterapeut" },
  { id: "fatima", firstName: "Fatima", lastName: "Rahman", title: "Helsesekretær" },
  { id: "lars", firstName: "Lars", lastName: "Hansen", title: "Miljøterapeut" },
];

export const SPECIAL_DATES: Record<string, SpecialDate> = {
  "2024-01-01": { label: "Nyttårsdag", type: "holiday" },
  "2024-05-17": { label: "Grunnlovsdag", type: "holiday" },
  "2024-12-24": { label: "Julaften", type: "holiday" },
  "2024-12-25": { label: "1. juledag", type: "holiday" },
  "2024-07-14": { label: "Bursdag Thomas", type: "event", description: "Feiring i lunsjen" },
};

const SHIFT_PATTERNS: Record<string, string> = {
  day: "Dagvakt 07:00–15:00",
  evening: "Kveldsvakt 15:00–23:00",
  night: "Nattevakt 23:00–07:00",
  support: "Støttevakt 10:00–18:00",
};

export function getPatternLabel(shiftType: string): string {
  return SHIFT_PATTERNS[shiftType] ?? shiftType;
}

export function generateServerShifts(_: number): ServerShift[] {
  return [];
}
