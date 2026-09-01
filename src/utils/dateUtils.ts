import type { LogEntryWithFood } from "../types/food";

export const timeFormatter = (date: Date) => {
  const hours = date.getHours();
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 || 12;
  return `${hour12} ${period}`;
}

export const groupFoodByHour = (logs: LogEntryWithFood[]) => {
  return logs.reduce((acc, { food, entry }) => {
    const hour = timeFormatter(new Date(entry.timestamp));

    if(!acc[hour]) {
      acc[hour] = [];
    }

    acc[hour].push({ food, entry });

    return acc;
  }, {} as Record<string, LogEntryWithFood[]>);
}

/** 12 AM -> 0, 1 PM -> 13, matching Date#getHours() */
export const hourLabelToHours24 = (label: string): number => {
  const [rawHour, period] = label.split(/\s+/);
  const hour12 = Number(rawHour);
  const isPm = period?.toUpperCase() === 'PM';
  return (hour12 % 12) + (isPm ? 12 : 0);
}

/**
 * same calendar day as "day", snapped to "hourLabel"
 * if that slot is the current hour on today, keep clock time so "log now" stays precise
 */
export const dateAtHourLabel = (day: Date, hourLabel: string, now = new Date()): Date => {
  const hours24 = hourLabelToHours24(hourLabel);
  const sameDay = day.toDateString() === now.toDateString();
  if (sameDay && now.getHours() === hours24) {
    return new Date(now);
  }
  const result = new Date(day);
  result.setHours(hours24, 0, 0, 0);
  return result;
}

export type HourSection = {
  hour: string;
  foodEntries: LogEntryWithFood[];
  isCurrent: boolean;
};

/** 12 AM -> 11 PM, matching timeFormatter / Date#getHours() */
export const HOUR_LABELS = Array.from({ length: 24 }, (_, hours24) =>
  timeFormatter(new Date(2000, 0, 1, hours24)),
);

/** all 24 hours for the selected day, today's clock hour is marked current */
export const getHourSections = (
  logs: LogEntryWithFood[],
  selectedDate: Date,
  now = new Date(),
): HourSection[] => {
  const grouped = groupFoodByHour(logs);
  const viewingToday = selectedDate.toDateString() === now.toDateString();
  const currentHour = timeFormatter(now);

  return HOUR_LABELS.map((hour) => ({
    hour,
    foodEntries: grouped[hour] ?? [],
    isCurrent: viewingToday && hour === currentHour,
  }));
}

export const generateDateRange = () => {
  const dates = [];
  for (let i = -14; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}