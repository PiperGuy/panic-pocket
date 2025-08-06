import React, { useState } from 'react';
import { ArrowLeft, Download, Upload, Trash2, Moon, Sun, Monitor, Bell, Shield, Database } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import type { AppSettings } from '../types';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSettings, expenses, expenseInstances } = useExpenseStore();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...localSettings };
    
    if (key === 'notifications') {
      newSettings.notifications = { ...newSettings.notifications, ...value };
    } else {
      (newSettings as any)[key] = value;
    }
    
    setLocalSettings(newSettings);
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    // Apply theme immediately
    if (localSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (localSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleClearData = () => {
    // Clear all data from localStorage
    localStorage.clear();
    // Reload the page to reset the app
    window.location.reload();
  };

  const exportData = () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: localSettings,
      expenses: expenses,
      expenseInstances: expenseInstances,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panic-pocket-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          setLocalSettings(data.settings);
          alert('Settings imported successfully! Click Save to apply.');
        } else {
          alert('Invalid settings file');
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const getDataStats = () => {
    const totalExpenses = expenses.length;
    const totalInstances = expenseInstances.length;
    const paidInstances = expenseInstances.filter(i => i.status === 'paid').length;
    const pendingInstances = expenseInstances.filter(i => i.status === 'pending').length;
    const overdueInstances = expenseInstances.filter(i => i.status === 'overdue').length;

    return {
      totalExpenses,
      totalInstances,
      paidInstances,
      pendingInstances,
      overdueInstances,
    };
  };

  const stats = getDataStats();

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
                Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Statistics */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Statistics</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalExpenses}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalInstances}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Instances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.paidInstances}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.pendingInstances}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.overdueInstances}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Overdue</div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <span>Appearance</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSettingChange('theme', 'light')}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                    localSettings.theme === 'light'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-sm">Light</span>
                </button>
                
                <button
                  onClick={() => handleSettingChange('theme', 'dark')}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                    localSettings.theme === 'dark'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-sm">Dark</span>
                </button>
                
                <button
                  onClick={() => handleSettingChange('theme', 'system')}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                    localSettings.theme === 'system'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="input"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Enable Notifications</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Receive reminders for upcoming expenses
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.enabled}
                  onChange={(e) => handleSettingChange('notifications', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {localSettings.notifications.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remind me X days before due date
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={localSettings.notifications.daysBefore}
                    onChange={(e) => handleSettingChange('notifications', { daysBefore: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Channels
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={localSettings.notifications.channels.includes('push')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...localSettings.notifications.channels, 'push']
                            : localSettings.notifications.channels.filter(c => c !== 'push');
                          handleSettingChange('notifications', { channels });
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={localSettings.notifications.channels.includes('email')}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...localSettings.notifications.channels, 'email']
                            : localSettings.notifications.channels.filter(c => c !== 'email');
                          handleSettingChange('notifications', { channels });
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Data Management</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Export Settings</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Download your settings and data as JSON
                </div>
              </div>
              <button
                onClick={exportData}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Import Settings</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Import settings from a JSON file
                </div>
              </div>
              <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Clear All Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete all expenses and settings
                </div>
              </div>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Confirm Clear Data Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Clear All Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action will permanently delete all your expenses, settings, and data. This cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleClearData();
                  setShowConfirmClear(false);
                }}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};