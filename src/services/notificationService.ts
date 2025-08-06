import { useExpenseStore } from '../store/expenseStore';
import { formatRelativeDate } from '../utils/dateUtils';

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  async sendNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'expense-reminder',
      requireInteraction: true,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  async checkUpcomingExpenses(): Promise<void> {
    const { expenseInstances, expenses, settings } = useExpenseStore.getState();
    
    if (!settings.notifications.enabled) return;

    const now = new Date();
    const reminderDate = new Date(now.getTime() + settings.notifications.daysBefore * 24 * 60 * 60 * 1000);

    const upcomingExpenses = expenseInstances.filter(instance => {
      const dueDate = new Date(instance.dueDate);
      return instance.status === 'pending' && 
             dueDate <= reminderDate && 
             dueDate >= now;
    });

    for (const instance of upcomingExpenses) {
      const expense = expenses.find(e => e.id === instance.expenseId);
      if (!expense) continue;

      const dueDate = new Date(instance.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let title: string;
      let body: string;

      if (daysUntilDue === 0) {
        title = '💰 Expense Due Today!';
        body = `${expense.name} is due today. Amount: $${expense.amount.toFixed(2)}`;
      } else if (daysUntilDue === 1) {
        title = '⚠️ Expense Due Tomorrow!';
        body = `${expense.name} is due tomorrow. Amount: $${expense.amount.toFixed(2)}`;
      } else {
        title = '📅 Upcoming Expense Reminder';
        body = `${expense.name} is due in ${daysUntilDue} days. Amount: $${expense.amount.toFixed(2)}`;
      }

      await this.sendNotification(title, {
        body,
        data: {
          expenseId: expense.id,
          instanceId: instance.id,
          dueDate: instance.dueDate
        }
      });
    }
  }

  async sendWeeklySummary(): Promise<void> {
    const { getMonthlySummary, settings } = useExpenseStore.getState();
    
    if (!settings.notifications.enabled) return;

    const summary = getMonthlySummary();
    const pendingCount = summary.totalExpected - summary.totalPaid;

    if (pendingCount > 0) {
      await this.sendNotification('📊 Weekly Expense Summary', {
        body: `You have ${pendingCount} expenses pending this month. Total remaining: $${summary.totalUnpaid.toFixed(2)}`,
        tag: 'weekly-summary'
      });
    }
  }
}

export const notificationService = NotificationService.getInstance();