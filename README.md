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

## Features in Development

- **Calendar View**: Monthly calendar with expense visualization
- **List View**: Detailed list with filtering and sorting
- **Settings Panel**: User preferences and app configuration
- **Export/Import**: Data backup and transfer functionality
- **Notifications**: Push notifications for upcoming expenses
- **Advanced Filtering**: Filter by category, status, date range

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
