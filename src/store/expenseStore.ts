import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, addWeeks, addMonths, addYears, isAfter, isBefore, differenceInDays } from 'date-fns';
import type { 
  Expense, 
  ExpenseInstance, 
  ExpenseStatus, 
  RecurrenceType, 
  AppSettings, 
  FilterOptions 
} from '../types';

interface ExpenseState {
  expenses: Expense[];
  expenseInstances: ExpenseInstance[];
  settings: AppSettings;
  filters: FilterOptions;
  
  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  markExpenseAsPaid: (instanceId: string) => void;
  snoozeExpense: (instanceId: string, snoozeUntil: string) => void;
  skipExpense: (instanceId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setFilters: (filters: FilterOptions) => void;
  
  // Computed
  getUpcomingExpenses: (limit?: number) => ExpenseInstance[];
  getMonthlySummary: () => {
    totalExpected: number;
    totalPaid: number;
    totalUnpaid: number;
    progressPercentage: number;
  };
  getFilteredExpenses: () => ExpenseInstance[];
  generateExpenseInstances: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    daysBefore: 3,
    channels: ['push']
  },
  currency: 'USD',
  language: 'en'
};

// Sample data for demonstration
const sampleExpenses: Expense[] = [
  {
    id: '1',
    name: 'Netflix Subscription',
    amount: 15.99,
    firstDueDate: new Date().toISOString().split('T')[0],
    recurrence: 'monthly',
    category: 'subscriptions',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Premium plan'
  },
  {
    id: '2',
    name: 'Rent Payment',
    amount: 1200,
    firstDueDate: new Date().toISOString().split('T')[0],
    recurrence: 'monthly',
    category: 'rent',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Monthly rent payment'
  },
  {
    id: '3',
    name: 'Electric Bill',
    amount: 85.50,
    firstDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurrence: 'monthly',
    category: 'utilities',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Monthly electricity bill'
  },
  {
    id: '4',
    name: 'Car Insurance',
    amount: 150,
    firstDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurrence: 'monthly',
    category: 'insurance',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Auto insurance premium'
  },
  {
    id: '5',
    name: 'Gym Membership',
    amount: 45,
    firstDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recurrence: 'monthly',
    category: 'entertainment',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Fitness center membership'
  }
];

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: sampleExpenses,
      expenseInstances: [],
      settings: defaultSettings,
      filters: {},

      addExpense: (expenseData) => {
        const now = new Date().toISOString();
        const newExpense: Expense = {
          ...expenseData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          expenses: [...state.expenses, newExpense]
        }));

        // Generate instances for the new expense
        get().generateExpenseInstances();
      },

      updateExpense: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          expenses: state.expenses.map(expense =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: now }
              : expense
          )
        }));
        get().generateExpenseInstances();
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== id),
          expenseInstances: state.expenseInstances.filter(instance => instance.expenseId !== id)
        }));
      },

      markExpenseAsPaid: (instanceId) => {
        const now = new Date().toISOString();
        set((state) => ({
          expenseInstances: state.expenseInstances.map(instance =>
            instance.id === instanceId
              ? { ...instance, status: 'paid' as ExpenseStatus, paidAt: now }
              : instance
          )
        }));
      },

      snoozeExpense: (instanceId, snoozeUntil) => {
        set((state) => ({
          expenseInstances: state.expenseInstances.map(instance =>
            instance.id === instanceId
              ? { ...instance, status: 'snoozed' as ExpenseStatus, snoozedUntil }
              : instance
          )
        }));
      },

      skipExpense: (instanceId) => {
        set((state) => ({
          expenseInstances: state.expenseInstances.map(instance =>
            instance.id === instanceId
              ? { ...instance, status: 'skipped' as ExpenseStatus, skipped: true }
              : instance
          )
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setFilters: (filters) => {
        set({ filters });
      },

      getUpcomingExpenses: (limit = 5) => {
        const { expenseInstances } = get();
        const now = new Date();
        
        return expenseInstances
          .filter(instance => 
            instance.status === 'pending' && 
            isAfter(new Date(instance.dueDate), now)
          )
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, limit);
      },

      getMonthlySummary: () => {
        const { expenseInstances } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyInstances = expenseInstances.filter(instance => {
          const dueDate = new Date(instance.dueDate);
          return dueDate >= startOfMonth && dueDate <= endOfMonth;
        });

        const totalExpected = monthlyInstances.reduce((sum, instance) => {
          const expense = get().expenses.find(e => e.id === instance.expenseId);
          return sum + (expense?.amount || 0);
        }, 0);

        const paidInstances = monthlyInstances.filter(instance => instance.status === 'paid');
        const totalPaid = paidInstances.reduce((sum, instance) => {
          const expense = get().expenses.find(e => e.id === instance.expenseId);
          return sum + (expense?.amount || 0);
        }, 0);

        const totalUnpaid = totalExpected - totalPaid;
        const progressPercentage = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;

        return {
          totalExpected,
          totalPaid,
          totalUnpaid,
          progressPercentage
        };
      },

      getFilteredExpenses: () => {
        const { expenseInstances, expenses, filters } = get();
        
        let filtered = expenseInstances;

        if (filters.category) {
          filtered = filtered.filter(instance => {
            const expense = expenses.find(e => e.id === instance.expenseId);
            return expense?.category === filters.category;
          });
        }

        if (filters.status) {
          filtered = filtered.filter(instance => instance.status === filters.status);
        }

        if (filters.dateRange) {
          filtered = filtered.filter(instance => {
            const dueDate = new Date(instance.dueDate);
            const start = new Date(filters.dateRange!.start);
            const end = new Date(filters.dateRange!.end);
            return dueDate >= start && dueDate <= end;
          });
        }

        if (filters.search) {
          filtered = filtered.filter(instance => {
            const expense = expenses.find(e => e.id === instance.expenseId);
            return expense?.name.toLowerCase().includes(filters.search!.toLowerCase());
          });
        }

        return filtered;
      },

      generateExpenseInstances: () => {
        const { expenses } = get();
        const now = new Date();
        const endDate = addYears(now, 1); // Generate instances for next 12 months
        const newInstances: ExpenseInstance[] = [];

        expenses.forEach(expense => {
          let currentDate = new Date(expense.firstDueDate);
          
          while (isBefore(currentDate, endDate)) {
            // Check if instance already exists
            const existingInstance = get().expenseInstances.find(
              instance => 
                instance.expenseId === expense.id && 
                format(new Date(instance.dueDate), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
            );

            if (!existingInstance) {
              newInstances.push({
                id: uuidv4(),
                expenseId: expense.id,
                dueDate: currentDate.toISOString(),
                status: 'pending' as ExpenseStatus
              });
            }

            // Calculate next due date based on recurrence
            switch (expense.recurrence) {
              case 'weekly':
                currentDate = addWeeks(currentDate, 1);
                break;
              case 'monthly':
                currentDate = addMonths(currentDate, 1);
                break;
              case 'yearly':
                currentDate = addYears(currentDate, 1);
                break;
              case 'custom':
                currentDate = addDays(currentDate, expense.customRecurrence || 30);
                break;
              default:
                break; // One-time expense
            }

            if (expense.recurrence === 'none') break;
          }
        });

        if (newInstances.length > 0) {
          set((state) => ({
            expenseInstances: [...state.expenseInstances, ...newInstances]
          }));
        }
      }
    }),
    {
      name: 'panic-pocket-storage',
      partialize: (state) => ({
        expenses: state.expenses,
        expenseInstances: state.expenseInstances,
        settings: state.settings
      })
    }
  )
);