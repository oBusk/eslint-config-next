/**
 * Formats a count for display, abbreviating anything past a thousand.
 */
export function formatCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }

  return `${(count / 1000).toFixed(1)}k`;
}

export type Tone = "neutral" | "positive" | "warning";

export interface BadgeData {
  label: string;
  count: number;
  tone: Tone;
}
