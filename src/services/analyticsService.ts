interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private readonly STORAGE_KEY = 'panic-pocket-analytics';

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics events:', error);
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  track(event: string, data?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      data
    };

    this.events.push(analyticsEvent);
    
    // Keep only last 1000 events to prevent storage bloat
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    this.saveEvents();
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventCount(eventName: string): number {
    return this.events.filter(e => e.event === eventName).length;
  }

  getRecentEvents(hours: number = 24): AnalyticsEvent[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.events.filter(e => e.timestamp > cutoff);
  }

  getPopularEvents(): { event: string; count: number }[] {
    const eventCounts: Record<string, number> = {};
    
    this.events.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count);
  }

  clearEvents(): void {
    this.events = [];
    this.saveEvents();
  }

  exportAnalytics(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      totalEvents: this.events.length,
      events: this.events
    }, null, 2);
  }
}

export const analyticsService = AnalyticsService.getInstance();

// Predefined tracking events
export const AnalyticsEvents = {
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_PAID: 'expense_paid',
  EXPENSE_SNOOZED: 'expense_snoozed',
  EXPENSE_SKIPPED: 'expense_skipped',
  EXPENSE_DELETED: 'expense_deleted',
  VIEW_CHANGED: 'view_changed',
  SETTINGS_UPDATED: 'settings_updated',
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported',
  NOTIFICATION_ENABLED: 'notification_enabled',
  NOTIFICATION_DISABLED: 'notification_disabled',
  THEME_CHANGED: 'theme_changed',
  CURRENCY_CHANGED: 'currency_changed',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SORT_CHANGED: 'sort_changed'
} as const;