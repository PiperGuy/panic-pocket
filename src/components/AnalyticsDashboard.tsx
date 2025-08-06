import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency } from '../utils/dateUtils';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  const { expenses, expenseInstances } = useExpenseStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    const events = analyticsService.getEvents();
    const recentEvents = timeRange === 'all' ? events : analyticsService.getRecentEvents(
      timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720
    );

    const eventCounts: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};
    const categorySpending: Record<string, number> = {};

    // Count events
    recentEvents.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      
      const date = new Date(event.timestamp).toDateString();
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    // Calculate category spending
    expenseInstances.forEach(instance => {
      const expense = expenses.find(e => e.id === instance.expenseId);
      if (expense && instance.status === 'paid') {
        categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
      }
    });

    setAnalytics({
      totalEvents: recentEvents.length,
      eventCounts,
      dailyActivity,
      categorySpending,
      popularEvents: analyticsService.getPopularEvents().slice(0, 5)
    });
  };

  const getEventLabel = (event: string): string => {
    const labels: Record<string, string> = {
      'expense_added': 'Expenses Added',
      'expense_paid': 'Expenses Paid',
      'expense_snoozed': 'Expenses Snoozed',
      'expense_skipped': 'Expenses Skipped',
      'expense_deleted': 'Expenses Deleted',
      'view_changed': 'View Changes',
      'settings_updated': 'Settings Updated',
      'data_exported': 'Data Exported',
      'data_imported': 'Data Imported',
      'notification_enabled': 'Notifications Enabled',
      'notification_disabled': 'Notifications Disabled',
      'theme_changed': 'Theme Changes',
      'currency_changed': 'Currency Changes',
      'search_performed': 'Searches',
      'filter_applied': 'Filters Applied',
      'sort_changed': 'Sort Changes'
    };
    return labels[event] || event;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'bills': 'Bills',
      'subscriptions': 'Subscriptions',
      'rent': 'Rent',
      'insurance': 'Insurance',
      'utilities': 'Utilities',
      'entertainment': 'Entertainment',
      'transportation': 'Transportation',
      'healthcare': 'Healthcare',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
                Analytics Dashboard
              </h1>
            </div>
            
            <div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="input text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalEvents}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Events</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expenses.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expenseInstances.filter(i => i.status === 'paid').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Paid Expenses</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(analytics.eventCounts).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Event Types</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Events */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Popular Events</span>
            </h3>
            
            <div className="space-y-3">
              {analytics.popularEvents.map((event: any) => (
                <div key={event.event} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getEventLabel(event.event)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Spending */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Category Spending</span>
            </h3>
            
            <div className="space-y-3">
              {Object.entries(analytics.categorySpending)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getCategoryLabel(category)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(amount as number)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
          
          <div className="space-y-2">
            {Object.entries(analytics.dailyActivity)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .slice(-7)
              .map(([date, count]) => (
                <div key={date} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(date).toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((count as number / Math.max(...Object.values(analytics.dailyActivity))) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-500 dark:text-gray-400 text-right">
                    {count}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Export Analytics */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold mb-4">Export Analytics</h3>
          
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const data = analyticsService.exportAnalytics();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `panic-pocket-analytics-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Export Analytics</span>
            </button>
            
            <button
              onClick={() => {
                analyticsService.clearEvents();
                loadAnalytics();
              }}
              className="btn-secondary text-red-600 hover:text-red-700"
            >
              Clear Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};