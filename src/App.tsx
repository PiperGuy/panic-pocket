import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { CalendarView } from './components/CalendarView';
import { ListView } from './components/ListView';
import { Settings } from './components/Settings';
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
        return <CalendarView onBack={handleCloseModal} />;
      case 'list':
        return <ListView onBack={handleCloseModal} />;
      case 'settings':
        return <Settings onBack={handleCloseModal} />;
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