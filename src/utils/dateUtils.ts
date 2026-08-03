import type { LogEntryWithFood } from "../types/food";

// Organizes day's food array into buckets by the hour
// Reduce function goes through array, expecting objects with
// the types string (the hour) and Food[] (foods logged in that hour)
// 1. We get the hour using hourFormatter via Intl.DateTimeFormat
// 2. Check if a bucket has been made for the Food's logged hour,
//    if not, make it
// 3. Push that food to that hour's bucket
// 4. Return and continue until done
export const groupFoodByHour = (logs: LogEntryWithFood[]) => {
  // Formatter for DateTimeFormat
  // Preferred choice to initializing Date() several times
  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true,
  });

  return logs.reduce((acc, { food, entry }) => {
    const hour = hourFormatter.format(entry.timestamp);

    if(!acc[hour]) {
      acc[hour] = [];
    }

    acc[hour].push({ food, entry });

    return acc;
  }, {} as Record<string, LogEntryWithFood[]>);
}

export const timeFormatter = (date: Date) => {
  const hours = date.getHours();
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 || 12;
  return `${hour12} ${period}`;
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