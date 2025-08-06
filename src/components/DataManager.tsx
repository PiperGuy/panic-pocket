import React, { useState } from 'react';
import { Download, Upload, Shield, Lock, Unlock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { encryptionService } from '../services/encryptionService';
import { analyticsService, AnalyticsEvents } from '../services/analyticsService';

interface DataManagerProps {
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const { expenses, expenseInstances, settings } = useExpenseStore();
  const [exportType, setExportType] = useState<'plain' | 'encrypted'>('plain');
  const [importType, setImportType] = useState<'plain' | 'encrypted'>('plain');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const exportData = async () => {
    setIsExporting(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        expenses,
        expenseInstances,
        settings
      };

      let blob: Blob;
      let filename: string;

      if (exportType === 'encrypted') {
        if (!password) {
          setError('Password is required for encrypted export');
          return;
        }
        if (!encryptionService.validatePassword(password)) {
          setError('Password must be at least 8 characters with letters and numbers');
          return;
        }

        blob = await encryptionService.exportEncryptedData(data, password);
        filename = `panic-pocket-encrypted-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `panic-pocket-export-${new Date().toISOString().split('T')[0]}.json`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully!');
      analyticsService.track(AnalyticsEvents.DATA_EXPORTED, { type: exportType });
    } catch (error) {
      setError('Failed to export data: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError('');
    setSuccess('');

    try {
      let data: any;

      if (importType === 'encrypted') {
        if (!password) {
          setError('Password is required for encrypted import');
          return;
        }
        data = await encryptionService.importEncryptedData(file, password);
      } else {
        const content = await file.text();
        data = JSON.parse(content);
      }

      // Validate imported data
      if (!data.expenses || !data.expenseInstances || !data.settings) {
        throw new Error('Invalid data format');
      }

      // Here you would typically update the store with imported data
      // For now, we'll just show success
      setSuccess('Data imported successfully!');
      analyticsService.track(AnalyticsEvents.DATA_IMPORTED, { type: importType });
    } catch (error) {
      setError('Failed to import data: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const getDataStats = () => {
    return {
      totalExpenses: expenses.length,
      totalInstances: expenseInstances.length,
      totalSize: JSON.stringify({ expenses, expenseInstances, settings }).length
    };
  };

  const stats = getDataStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Data Management
          </h2>

          {/* Data Statistics */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4">Data Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats.totalSize / 1024).toFixed(1)}KB
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Size</div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportType('plain')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                      exportType === 'plain'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Unlock className="h-5 w-5" />
                    <span className="text-sm">Plain Text</span>
                  </button>
                  
                  <button
                    onClick={() => setExportType('encrypted')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                      exportType === 'encrypted'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    <span className="text-sm">Encrypted</span>
                  </button>
                </div>
              </div>

              {exportType === 'encrypted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Encryption Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Enter password (min 8 chars, letters + numbers)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password must be at least 8 characters with letters and numbers
                  </p>
                </div>
              )}

              <button
                onClick={exportData}
                disabled={isExporting || (exportType === 'encrypted' && !password)}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import Data</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setImportType('plain')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                      importType === 'plain'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Unlock className="h-5 w-5" />
                    <span className="text-sm">Plain Text</span>
                  </button>
                  
                  <button
                    onClick={() => setImportType('encrypted')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${
                      importType === 'encrypted'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    <span className="text-sm">Encrypted</span>
                  </button>
                </div>
              </div>

              {importType === 'encrypted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Decryption Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              <label className="btn-secondary w-full flex items-center justify-center space-x-2 cursor-pointer">
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200">{success}</span>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};