export const TIMEZONE = 'Europe/London';

export const formatUKDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIMEZONE,
  });
};

export const formatUKDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const daysBetween = (date1: Date, date2: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / msPerDay);
};
