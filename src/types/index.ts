export type RecurrenceType = 'none' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type ExpenseCategory = 
  | 'bills' 
  | 'subscriptions' 
  | 'rent' 
  | 'insurance' 
  | 'utilities' 
  | 'entertainment' 
  | 'transportation' 
  | 'healthcare' 
  | 'other';

export type ExpenseStatus = 'pending' | 'paid' | 'overdue' | 'snoozed' | 'skipped';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  firstDueDate: string; // ISO date string
  recurrence: RecurrenceType;
  customRecurrence?: number; // days for custom recurrence
  notes?: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
  attachments?: string[]; // URLs or file references
}

export interface ExpenseInstance {
  id: string;
  expenseId: string;
  dueDate: string;
  status: ExpenseStatus;
  paidAt?: string;
  snoozedUntil?: string;
  skipped?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    daysBefore: number;
    channels: ('push' | 'email')[];
  };
  currency: string;
  language: string;
}

export interface DashboardData {
  upcomingExpenses: ExpenseInstance[];
  monthlySummary: {
    totalExpected: number;
    totalPaid: number;
    totalUnpaid: number;
    progressPercentage: number;
  };
  recentActivity: {
    id: string;
    type: 'expense_added' | 'expense_paid' | 'expense_snoozed' | 'expense_skipped';
    expenseName: string;
    timestamp: string;
  }[];
}

export interface FilterOptions {
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  expenses: Expense[];
  settings: AppSettings;
}