import type { ID, ISODate } from './common';

export type NotificationType =
  | 'quote_received'
  | 'provider_en_route'
  | 'job_completed'
  | 'review_prompt'
  | 'reservation_request'
  | 'reservation_update'
  | 'escrow_released'
  | 'system';

// Named AppNotification to avoid clashing with the global Notification type.
export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODate;
  read: boolean;
  /** Where tapping the notification should go. */
  target?: { screen: string; params?: Record<string, string> };
}