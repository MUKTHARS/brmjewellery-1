export const formatUKDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/London',
  });

export const formatUKDateTime = (date: string | Date): string =>
  new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  });

export const formatRelative = (date: string | Date): string => {
  const diff = Date.now() - new Date(date).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatUKDate(date);
};
