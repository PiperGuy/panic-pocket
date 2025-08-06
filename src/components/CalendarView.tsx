import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency, formatDate, getUrgencyLevel, getUrgencyColor, getUrgencyIcon, getMonthName } from '../utils/dateUtils';
import type { ExpenseInstance, ExpenseCategory, ExpenseStatus } from '../types';

interface CalendarViewProps {
  onBack: () => void;
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; color: string }[] = [
  { value: 'bills', label: 'Bills', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'subscriptions', label: 'Subscriptions', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'rent', label: 'Rent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'insurance', label: 'Insurance', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'utilities', label: 'Utilities', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { value: 'transportation', label: 'Transportation', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { value: 'healthcare', label: 'Healthcare', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

export const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const { expenseInstances, expenses, markExpenseAsPaid, snoozeExpense, skipExpense } = useExpenseStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | ''>('');

  const getExpenseName = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.name || 'Unknown Expense';
  };

  const getExpenseAmount = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.amount || 0;
  };

  const getExpenseCategory = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.category || 'other';
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getExpensesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return expenseInstances.filter(instance => {
      const instanceDate = new Date(instance.dueDate);
      const instanceDateStr = instanceDate.toISOString().split('T')[0];
      return instanceDateStr === dateStr;
    });
  };

  const getFilteredExpensesForDate = (date: Date) => {
    let expenses = getExpensesForDate(date);
    
    if (filterCategory) {
      expenses = expenses.filter(instance => getExpenseCategory(instance) === filterCategory);
    }
    
    if (filterStatus) {
      expenses = expenses.filter(instance => instance.status === filterStatus);
    }
    
    return expenses;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMarkAsPaid = (instanceId: string) => {
    markExpenseAsPaid(instanceId);
  };

  const handleSnooze = (instanceId: string) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + 3);
    snoozeExpense(instanceId, snoozeDate.toISOString());
  };

  const handleSkip = (instanceId: string) => {
    skipExpense(instanceId);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 dark:bg-gray-800"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const expenses = getFilteredExpensesForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          } ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {day}
          </div>
          <div className="space-y-1">
            {expenses.slice(0, 3).map((instance) => {
              const urgency = getUrgencyLevel(instance.dueDate);
              const urgencyIcon = getUrgencyIcon(urgency);
              const category = getExpenseCategory(instance);
              const categoryConfig = EXPENSE_CATEGORIES.find(c => c.value === category);
              
              return (
                <div
                  key={instance.id}
                  className={`text-xs p-1 rounded truncate ${categoryConfig?.color || 'bg-gray-100 text-gray-800'}`}
                  title={`${getExpenseName(instance)} - ${formatCurrency(getExpenseAmount(instance))}`}
                >
                  <span className="mr-1">{urgencyIcon}</span>
                  {getExpenseName(instance)}
                </div>
              );
            })}
            {expenses.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{expenses.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderExpenseList = () => {
    if (!selectedDate) return null;

    const expenses = getFilteredExpensesForDate(selectedDate);
    const totalAmount = expenses.reduce((sum, instance) => sum + getExpenseAmount(instance), 0);

    return (
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Expenses for {formatDate(selectedDate)} ({expenses.length} items, {formatCurrency(totalAmount)})
        </h3>
        
        {expenses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No expenses for this date
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((instance) => {
              const urgency = getUrgencyLevel(instance.dueDate);
              const urgencyColor = getUrgencyColor(urgency);
              const urgencyIcon = getUrgencyIcon(urgency);
              const category = getExpenseCategory(instance);
              const categoryConfig = EXPENSE_CATEGORIES.find(c => c.value === category);
              
              return (
                <div
                  key={instance.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{urgencyIcon}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getExpenseName(instance)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${categoryConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                          {categoryConfig?.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${urgencyColor}`}>
                          {instance.status === 'paid' ? 'Paid' : instance.status === 'overdue' ? 'Overdue' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(getExpenseAmount(instance))}
                      </div>
                    </div>
                    
                    {instance.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleMarkAsPaid(instance.id)}
                          className="btn-primary text-xs px-2 py-1"
                        >
                          Paid
                        </button>
                        <button
                          onClick={() => handleSnooze(instance.id)}
                          className="btn-secondary text-xs px-2 py-1"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => handleSkip(instance.id)}
                          className="btn-secondary text-xs px-2 py-1"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Calendar View
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getMonthName(currentDate)}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
                className="input"
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ExpenseStatus | '')}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="snoozed">Snoozed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="card">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {renderCalendar()}
          </div>
        </div>

        {/* Selected Date Expenses */}
        {renderExpenseList()}
      </div>
    </div>
  );
};