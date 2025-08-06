import React from 'react';
import { Plus, Calendar, List, Settings } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency, formatRelativeDate, getUrgencyLevel, getUrgencyColor, getUrgencyIcon } from '../utils/dateUtils';
import type { ExpenseInstance } from '../types';

interface DashboardProps {
  onAddExpense: () => void;
  onViewCalendar: () => void;
  onViewList: () => void;
  onViewSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAddExpense,
  onViewCalendar,
  onViewList,
  onViewSettings
}) => {
  const { getUpcomingExpenses, getMonthlySummary, markExpenseAsPaid } = useExpenseStore();
  
  const upcomingExpenses = getUpcomingExpenses(5);
  const monthlySummary = getMonthlySummary();

  const handleMarkAsPaid = (instanceId: string) => {
    markExpenseAsPaid(instanceId);
  };

  const getExpenseName = (instance: ExpenseInstance) => {
    const { expenses } = useExpenseStore.getState();
    return expenses.find(e => e.id === instance.expenseId)?.name || 'Unknown Expense';
  };

  const getExpenseAmount = (instance: ExpenseInstance) => {
    const { expenses } = useExpenseStore.getState();
    return expenses.find(e => e.id === instance.expenseId)?.amount || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Panic Pocket
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onViewSettings}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={onAddExpense}
            className="card hover:shadow-md transition-shadow flex items-center justify-center space-x-2"
          >
            <Plus className="h-6 w-6 text-primary-600" />
            <span className="font-medium">Add Expense</span>
          </button>
          
          <button
            onClick={onViewCalendar}
            className="card hover:shadow-md transition-shadow flex items-center justify-center space-x-2"
          >
            <Calendar className="h-6 w-6 text-primary-600" />
            <span className="font-medium">Calendar View</span>
          </button>
          
          <button
            onClick={onViewList}
            className="card hover:shadow-md transition-shadow flex items-center justify-center space-x-2"
          >
            <List className="h-6 w-6 text-primary-600" />
            <span className="font-medium">List View</span>
          </button>
        </div>

        {/* Monthly Summary */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">This Month's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(monthlySummary.totalExpected)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Expected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlySummary.totalPaid)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(monthlySummary.totalUnpaid)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Unpaid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round(monthlySummary.progressPercentage)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${monthlySummary.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Upcoming Expenses */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Upcoming Expenses</h2>
          {upcomingExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No upcoming expenses</p>
              <button
                onClick={onAddExpense}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Add your first expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExpenses.map((instance) => {
                const urgency = getUrgencyLevel(instance.dueDate);
                const urgencyColor = getUrgencyColor(urgency);
                const urgencyIcon = getUrgencyIcon(urgency);
                
                return (
                  <div
                    key={instance.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{urgencyIcon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getExpenseName(instance)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatRelativeDate(instance.dueDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(getExpenseAmount(instance))}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${urgencyColor}`}>
                          {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Soon' : 'Later'}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleMarkAsPaid(instance.id)}
                        className="btn-primary text-sm"
                      >
                        Mark Paid
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};