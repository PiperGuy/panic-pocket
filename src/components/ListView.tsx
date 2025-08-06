import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, SortAsc, SortDesc, Download, Upload } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency, formatDate, formatRelativeDate, getUrgencyLevel, getUrgencyIcon } from '../utils/dateUtils';
import type { ExpenseInstance, ExpenseCategory, ExpenseStatus, FilterOptions } from '../types';

interface ListViewProps {
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

type SortField = 'name' | 'amount' | 'dueDate' | 'category' | 'status';
type SortDirection = 'asc' | 'desc';

export const ListView: React.FC<ListViewProps> = ({ onBack }) => {
  const { 
    expenseInstances, 
    expenses, 
    markExpenseAsPaid, 
    snoozeExpense, 
    skipExpense,
    deleteExpense 
  } = useExpenseStore();

  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);


  const getExpenseName = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.name || 'Unknown Expense';
  };

  const getExpenseAmount = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.amount || 0;
  };

  const getExpenseCategory = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.category || 'other';
  };

  const getExpenseNotes = (instance: ExpenseInstance) => {
    return expenses.find(e => e.id === instance.expenseId)?.notes || '';
  };

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenseInstances;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(instance => {
        const name = getExpenseName(instance).toLowerCase();
        const notes = getExpenseNotes(instance).toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || notes.includes(searchTerm.toLowerCase());
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(instance => getExpenseCategory(instance) === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(instance => instance.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(instance => {
        const dueDate = new Date(instance.dueDate);
        const start = new Date(filters.dateRange!.start!);
        const end = new Date(filters.dateRange!.end!);
        return dueDate >= start && dueDate <= end;
      });
    }

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = getExpenseName(a);
          bValue = getExpenseName(b);
          break;
        case 'amount':
          aValue = getExpenseAmount(a);
          bValue = getExpenseAmount(b);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'category':
          aValue = getExpenseCategory(a);
          bValue = getExpenseCategory(b);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [expenseInstances, expenses, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

  const handleDelete = (instanceId: string) => {
    const instance = expenseInstances.find(i => i.id === instanceId);
    if (instance) {
      deleteExpense(instance.expenseId);
    }
  };

  const exportData = () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      expenses: expenses,
      expenseInstances: expenseInstances,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panic-pocket-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Here you would typically validate and import the data
        console.log('Import data:', data);
        alert('Import functionality will be implemented in the next version');
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'snoozed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusLabel = (status: ExpenseStatus) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'snoozed':
        return 'Snoozed';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Pending';
    }
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
                List View
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportData}
                className="btn-secondary text-sm flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              <label className="btn-secondary text-sm flex items-center space-x-1 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as ExpenseCategory || undefined }))}
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
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ExpenseStatus || undefined }))}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { 
                          ...prev.dateRange, 
                          start: e.target.value 
                        } 
                      }))}
                      className="input text-sm"
                    />
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { 
                          ...prev.dateRange, 
                          end: e.target.value 
                        } 
                      }))}
                      className="input text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedExpenses.length} of {expenseInstances.length} expenses
          </p>
        </div>

        {/* Expenses List */}
        <div className="card">
          {filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No expenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-primary-600"
                      >
                        <span>Name</span>
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center space-x-1 hover:text-primary-600"
                      >
                        <span>Amount</span>
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('dueDate')}
                        className="flex items-center space-x-1 hover:text-primary-600"
                      >
                        <span>Due Date</span>
                        {sortField === 'dueDate' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center space-x-1 hover:text-primary-600"
                      >
                        <span>Category</span>
                        {sortField === 'category' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-primary-600"
                      >
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedExpenses.map((instance) => {
                    const urgency = getUrgencyLevel(instance.dueDate);
                    const urgencyIcon = getUrgencyIcon(urgency);
                    const category = getExpenseCategory(instance);
                    const categoryConfig = EXPENSE_CATEGORIES.find(c => c.value === category);
                    
                    return (
                      <tr key={instance.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{urgencyIcon}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {getExpenseName(instance)}
                              </div>
                              {getExpenseNotes(instance) && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {getExpenseNotes(instance)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(getExpenseAmount(instance))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatDate(instance.dueDate)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeDate(instance.dueDate)}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                            {categoryConfig?.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(instance.status)}`}>
                            {getStatusLabel(instance.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {instance.status === 'pending' && (
                              <>
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
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(instance.id)}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};