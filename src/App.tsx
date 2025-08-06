import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { CalendarView } from './components/CalendarView';
import { ListView } from './components/ListView';
import { Settings } from './components/Settings';
import { DataManager } from './components/DataManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { useExpenseStore } from './store/expenseStore';
import { analyticsService, AnalyticsEvents } from './services/analyticsService';
import { notificationService } from './services/notificationService';

type View = 'dashboard' | 'add-expense' | 'calendar' | 'list' | 'settings' | 'data-manager' | 'analytics';

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

  const handleViewDataManager = () => {
    setCurrentView('data-manager');
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
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
            onViewDataManager={handleViewDataManager}
            onViewAnalytics={handleViewAnalytics}
          />
        );
      case 'add-expense':
        return <AddExpense onClose={handleCloseModal} />;
      case 'calendar':
        return <CalendarView onBack={handleCloseModal} />;
      case 'list':
        return <ListView onBack={handleCloseModal} />;
      case 'settings':
        return <Settings onBack={handleCloseModal} />;
      case 'data-manager':
        return <DataManager onClose={handleCloseModal} />;
      case 'analytics':
        return <AnalyticsDashboard onBack={handleCloseModal} />;
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