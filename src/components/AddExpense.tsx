import React, { useState } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import type { ExpenseCategory, RecurrenceType } from '../types';

interface AddExpenseProps {
  onClose: () => void;
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'bills', label: 'Bills' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'rent', label: 'Rent' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export const AddExpense: React.FC<AddExpenseProps> = ({ onClose }) => {
  const { addExpense } = useExpenseStore();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    firstDueDate: '',
    recurrence: 'none' as RecurrenceType,
    customRecurrence: '',
    notes: '',
    category: 'bills' as ExpenseCategory,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.firstDueDate) {
      newErrors.firstDueDate = 'Due date is required';
    }

    if (formData.recurrence === 'custom' && (!formData.customRecurrence || parseInt(formData.customRecurrence) <= 0)) {
      newErrors.customRecurrence = 'Custom recurrence days is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const expenseData = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      firstDueDate: formData.firstDueDate,
      recurrence: formData.recurrence,
      customRecurrence: formData.recurrence === 'custom' ? parseInt(formData.customRecurrence) : undefined,
      notes: formData.notes.trim() || undefined,
      category: formData.category,
      status: 'pending' as const,
    };

    addExpense(expenseData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Expense
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Expense Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expense Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Netflix Subscription"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`input pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* First Due Date */}
          <div>
            <label htmlFor="firstDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Due Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                id="firstDueDate"
                value={formData.firstDueDate}
                onChange={(e) => handleInputChange('firstDueDate', e.target.value)}
                className={`input pl-10 ${errors.firstDueDate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.firstDueDate && <p className="text-red-500 text-sm mt-1">{errors.firstDueDate}</p>}
          </div>

          {/* Recurrence */}
          <div>
            <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recurrence
            </label>
            <select
              id="recurrence"
              value={formData.recurrence}
              onChange={(e) => handleInputChange('recurrence', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {RECURRENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Recurrence */}
          {formData.recurrence === 'custom' && (
            <div>
              <label htmlFor="customRecurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Every X Days
              </label>
              <input
                type="number"
                id="customRecurrence"
                value={formData.customRecurrence}
                onChange={(e) => handleInputChange('customRecurrence', e.target.value)}
                className={`input ${errors.customRecurrence ? 'border-red-500' : ''}`}
                placeholder="30"
                min="1"
              />
              {errors.customRecurrence && <p className="text-red-500 text-sm mt-1">{errors.customRecurrence}</p>}
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 flex-1 flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};