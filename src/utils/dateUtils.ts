import { format, formatDistanceToNow, isAfter, isBefore, differenceInDays, parseISO } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatRelativeDate = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  if (isBefore(targetDate, now)) {
    const daysOverdue = differenceInDays(now, targetDate);
    if (daysOverdue === 0) {
      return 'Due today';
    } else if (daysOverdue === 1) {
      return 'Overdue by 1 day';
    } else {
      return `Overdue by ${daysOverdue} days`;
    }
  } else {
    return formatDistanceToNow(targetDate, { addSuffix: true });
  }
};

export const getUrgencyLevel = (date: string | Date): 'high' | 'medium' | 'low' => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const daysUntilDue = differenceInDays(targetDate, now);
  
  if (daysUntilDue < 0) return 'high'; // Overdue
  if (daysUntilDue <= 7) return 'high';
  if (daysUntilDue <= 30) return 'medium';
  return 'low';
};

export const getUrgencyColor = (urgency: 'high' | 'medium' | 'low'): string => {
  switch (urgency) {
    case 'high':
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    case 'medium':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    case 'low':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20';
  }
};

export const getUrgencyIcon = (urgency: 'high' | 'medium' | 'low'): string => {
  switch (urgency) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟠';
    case 'low':
      return '🟢';
  }
};

export const formatDate = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  return format(targetDate, 'MMM dd, yyyy');
};

export const formatShortDate = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  return format(targetDate, 'MMM dd');
};

export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return { start, end };
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  return { start, end };
};