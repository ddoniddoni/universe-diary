import { getDaysInMonth } from "@/lib/date";

export function isMonthComplete(
  diaryCount: number,
  year: number,
  month: number,
): boolean {
  return diaryCount === getDaysInMonth(year, month);
}
