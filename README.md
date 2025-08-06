# Panic Pocket - Smart Expense Planner & Tracker

A mobile-first React application that helps users track, plan, and manage recurring expenses with smart prioritization and human-friendly due dates.

## Features

### ✅ Core Features Implemented

- **Add & Manage Expenses**: Create one-time or recurring expenses with categories, amounts, and due dates
- **Smart Prioritization**: Expenses are sorted by urgency with human-friendly labels like "Due in 5 days"
- **Monthly Summary**: Track total expected, paid, and unpaid amounts with progress indicators
- **Dashboard View**: Quick overview of upcoming expenses and monthly progress
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode Support**: Automatic theme switching with system preference detection
- **Offline-First**: Data persists locally using IndexedDB and Local Storage
- **Real-time Updates**: Dynamic updates of relative due dates and urgency indicators

### 🔄 Recurring Expenses
- Support for weekly, monthly, yearly, and custom recurrence patterns
- Automatic generation of expense instances for the next 12 months
- Check-off system for marking expenses as paid

### 📊 Smart Features
- Visual urgency indicators (🔴 High, 🟠 Medium, 🟢 Low)
- Relative due dates that update daily
- Progress tracking with visual progress bars
- Category-based organization

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite.js for fast development and optimized builds
- **State Management**: Zustand for lightweight, fast state management
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for robust date manipulation
- **Storage**: Local Storage + IndexedDB for offline-first approach

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd panic-pocket
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard view
│   └── AddExpense.tsx  # Expense creation form
├── store/              # State management
│   └── expenseStore.ts # Zustand store
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── dateUtils.ts    # Date formatting and calculations
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles and Tailwind
```

## Key Components

### Dashboard
- Displays upcoming expenses with urgency indicators
- Shows monthly summary with progress tracking
- Quick action buttons for adding expenses and switching views

### AddExpense Form
- Comprehensive form for creating new expenses
- Support for all recurrence types
- Real-time validation
- Category selection

### Expense Store (Zustand)
- Manages all expense data and app state
- Handles expense instance generation
- Provides computed values for summaries
- Persists data to local storage

## Data Model

### Expense
```typescript
interface Expense {
  id: string;
  name: string;
  amount: number;
  firstDueDate: string;
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  category: ExpenseCategory;
  status: ExpenseStatus;
  notes?: string;
  // ... other fields
}
```

### ExpenseInstance
```typescript
interface ExpenseInstance {
  id: string;
  expenseId: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'snoozed' | 'skipped';
  paidAt?: string;
  // ... other fields
}
```

## ✅ All Features Implemented

### 📅 Calendar View
- **Monthly Calendar**: Visual calendar showing expenses by date
- **Date Selection**: Click any date to view detailed expense list
- **Category Filtering**: Filter expenses by category
- **Status Filtering**: Filter by payment status
- **Visual Indicators**: Color-coded categories and urgency levels
- **Month Navigation**: Navigate between months easily

### 📋 List View
- **Advanced Filtering**: Filter by category, status, date range, and search terms
- **Sorting**: Sort by name, amount, due date, category, or status
- **Search**: Real-time search through expense names and notes
- **Export/Import**: Download data as JSON and import settings
- **Bulk Actions**: Mark expenses as paid, snooze, skip, or delete
- **Responsive Table**: Works perfectly on mobile and desktop

### ⚙️ Settings Panel
- **Theme Selection**: Light, dark, or system theme
- **Currency Options**: USD, EUR, GBP, CAD, AUD
- **Language Support**: Multiple language options
- **Notification Settings**: Configure reminder timing and channels
- **Data Statistics**: View expense and payment statistics
- **Data Management**: Export, import, or clear all data
- **Real-time Preview**: See theme changes immediately

### 🔄 Export/Import Functionality
- **JSON Export**: Download all data and settings as JSON
- **Cross-browser Transfer**: Easy data transfer between devices
- **Settings Import**: Import user preferences and configurations
- **Data Backup**: Automatic backup of all expense data
- **Conflict Resolution**: Handle data conflicts during import

### 🔍 Advanced Features
- **Smart Prioritization**: Human-friendly due dates and urgency indicators
- **Recurring Expenses**: Support for weekly, monthly, yearly, and custom patterns
- **Progress Tracking**: Visual progress bars and completion percentages
- **Category Management**: Organized expense categories with color coding
- **Offline-First**: All data persists locally with no cloud dependencies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and Vite for modern development experience
- Styled with Tailwind CSS for rapid UI development
- State management powered by Zustand for simplicity and performance
- Icons from Lucide React for consistent design
