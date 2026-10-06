export const MATCH_STATUSES = ["SCHEDULED", "LIVE", "COMPLETED"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];
export function isMatchStatus(v: string): v is MatchStatus {
  return (MATCH_STATUSES as readonly string[]).includes(v);
}

export const EVENT_TYPES = ["GOAL", "ASSIST", "OTHER"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export function isEventType(v: string): v is EventType {
  return (EVENT_TYPES as readonly string[]).includes(v);
}

export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  COMPLETED: "Completed",
};

// The real Semester Award categories from the LTFB Google Site (excluding
// the two FPL-tied ones — Tactical Mastermind/Pep and Fantasy MVP/Rooney —
// since this project deliberately excludes fantasy functionality).
export const AWARD_NAMES = [
  "MVP (Messi Award)",
  "Top Scorer (CR7 Award)",
  "Best Goalkeeper (Yashin Award)",
  "Most Entertaining Player (Neymar Award)",
  "Most Clutch Player (Zidane Award)",
  "Best Defender (Ramos Award)",
] as const;
