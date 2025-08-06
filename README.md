# Panic Pocket -  Smart Expense Planner & Tracker

1. Objective

Build a mobile-first app that helps users track, plan, and act on upcoming expenses across the next 12 months. The app should prioritize timely visibility, support recurring checklists, and display human-friendly due dates like “Due in 5 days” to prevent financial surprises.


---

2. Target Audience

Individuals with recurring personal/household expenses (rent, subscriptions, bills)

Freelancers or solopreneurs with irregular incomes

Budget-conscious users who prefer proactive financial planning

People overwhelmed by last-minute expenses and financial surprises



---

3. Core Features

🔁 A. Add & Manage Upcoming Expenses

Add one-time or recurring expenses

Fields:

Expense Name
Amount
First Due Date
Recurrence: none, weekly, monthly, yearly, or custom
Notes (optional)
Category (bills, subscriptions, rent, insurance, etc.)
Attach receipts/documents (optional)



---

✅ B. Recurring Expenses as Actionable Checklists

Each recurring expense for the current period becomes a checklist item

Users can check off expenses as "Paid" for the current month

Progress bar shows completion status (e.g., “4 of 7 expenses paid”)

Option to “Skip this cycle” or “Snooze” a recurring expense



---

📆 C. 12-Month Planner View

Calendar-style planner showing upcoming expenses by month

Monthly summaries with:

Total expected expenses

Number of upcoming items

Paid/unpaid checklist status


Filter by: category, status (paid/unpaid), one-time vs recurring



---

🔔 D. Reminders & Notifications

Notification types:

Customizable: X days before, day of, follow-up if unpaid

Optional summary notifications each week or month


Channels: Push, Email, or both

Snooze and dismiss logic for reminders



---

🧠 E. Smart Prioritization with Relative Due Dates

Expenses are sorted by urgency, not just date

Labels show human-friendly time remaining:

“Due in 5 days”

“Due in 3 weeks”

“Due in 2 months”

“Overdue by 3 days”


Relative dates dynamically update each day

Visual urgency indicators:

🔴 Due within 7 days

🟠 Due within 30 days

🟢 Due after 30 days




---

🔒 F. Data Export/Import & Backup

Cross-browser data transfer via JSON export/import

Encrypted export option for sensitive financial data

Import validation with conflict resolution

One-click transfer between browsers and devices

Local IndexedDB storage with automatic backup

Offline-first approach with no cloud dependencies



---

4. User Flow Summary

1. User opens app


2. Dashboard displays:

Next 5 upcoming expenses (sorted by urgency)

This month’s checklist with progress bar

Monthly summary (total upcoming, paid, unpaid)



3. User adds or reviews expenses


4. User checks off paid items, receives reminders


5. System updates relative due dates, planner view, and notifications




---

5. Design & UX Requirements

Clean, minimal UI with large tappable elements

Color-coded urgency indicators

Toggle views:

Checklist (to-do)

Calendar (planner)

Timeline (roadmap)


Light and dark mode

Animations on check-off for satisfaction effect



---

6. Platform & Tech Stack

Frontend: React with Vite.js (PWA)
- Progressive Web App with offline-first approach
- Mobile-first responsive design
- shadcn/ui components for consistent design system
- Service Workers for offline functionality and caching

State Management: Zustand
- Lightweight, fast state management
- Perfect for offline-first applications
- Simple API with TypeScript support
- Persists state to IndexedDB automatically

Data Storage: IndexedDB + Local Storage
- IndexedDB for complex data structures (expenses, categories, settings)
- Local Storage for user preferences and app state
- Offline-first data persistence
- No external dependencies on cloud services

Browser Workers:
- Service Workers for caching and offline functionality
- Web Workers for data processing and export/import operations
- Background sync for data operations

Data Export/Import:
- JSON format for cross-browser compatibility
- Encrypted export option for sensitive data
- Import validation and conflict resolution
- One-click transfer between browsers/devices

Design Principles:
- Mobile-first responsive design
- Progressive enhancement
- Accessibility-first approach
- Dark/light mode support
- Smooth animations and transitions
- Intuitive gesture-based interactions

Analytics: Privacy-friendly local analytics (no external tracking)



---

7. Success Metrics

80%+ expenses marked as reviewed or paid each month

4.5+ average rating on app stores

30%+ of users enable reminders

Retention: 50% of users still active after 90 days



---

8. Out of Scope (for MVP)

Budgeting or income tracking

Bank or account integrations

Multi-user accounts or household sharing



---

9. Future Enhancements

AI-based expense predictions and categorization

Smart recommendations (e.g., "Your insurance is due next month")

Calendar app integrations (Google, Outlook)

Import receipts from email/SMS

Shared expenses / household planning
