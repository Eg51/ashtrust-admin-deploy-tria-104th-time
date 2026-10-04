// lib/format.ts
//
// Single source of truth for every formatter in the app.
// Never define formatCurrency / formatDueIn / formatPercent anywhere else.

export const formatCurrency = (
  value: string | number | undefined | null
): string => {
  if (value === undefined || value === null || value === '') return '0.00';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Hours/minutes countdown until a due date.
//   past due  -> "Overdue"
//   no date   -> "No due date"
//   else      -> "Xh Ym"
export const formatDueIn = (dueDate?: string | Date | null): string => {
  if (!dueDate) return 'No due date';
  const target = new Date(dueDate).getTime();
  if (isNaN(target)) return 'No due date';

  const diffMs = target - Date.now();
  if (diffMs <= 0) return 'Overdue';

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

export const formatPercent = (value: number, precision = 2): string => {
  if (!isFinite(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(precision)}%`;
};