import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { useExpenseStore } from './store/expenseStore';

type View = 'dashboard' | 'add-expense' | 'calendar' | 'list' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { generateExpenseInstances } = useExpenseStore();

  // Generate expense instances on app load
  useEffect(() => {
    generateExpenseInstances();
  }, [generateExpenseInstances]);

  const handleAddExpense = () => {
    setCurrentView('add-expense');
  };

  const handleViewCalendar = () => {
    setCurrentView('calendar');
  };

  const handleViewList = () => {
    setCurrentView('list');
  };

  const handleViewSettings = () => {
    setCurrentView('settings');
  };

  const handleCloseModal = () => {
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onAddExpense={handleAddExpense}
            onViewCalendar={handleViewCalendar}
            onViewList={handleViewList}
            onViewSettings={handleViewSettings}
          />
        );
      case 'add-expense':
        return <AddExpense onClose={handleCloseModal} />;
      case 'calendar':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Calendar View
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Calendar view coming soon!
              </p>
              <button
                onClick={handleCloseModal}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                List View
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                List view coming soon!
              </p>
              <button
                onClick={handleCloseModal}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Settings panel coming soon!
              </p>
              <button
                onClick={handleCloseModal}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;