const SEOUL_TIME_ZONE = "Asia/Seoul";

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SEOUL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getSeoulCalendarDate(date = new Date()): CalendarDate {
  const parts = seoulDateFormatter.formatToParts(date);
  const values = new Map(parts.map(({ type, value }) => [type, value]));

  return {
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
  };
}

export function toDiaryDate({ year, month, day }: CalendarDate): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function getTodayDiaryDate(date = new Date()): Date {
  return toDiaryDate(getSeoulCalendarDate(date));
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
