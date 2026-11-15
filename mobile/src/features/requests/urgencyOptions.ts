import type { IconName } from '@/components/ui/Icon';
import type { Urgency } from '@/types/request';

// The design offers three levels; the database has four (low is not offered).
export const URGENCY_OPTIONS: Array<{
  value: Urgency;
  label: string;
  description: string;
  icon: IconName;
}> = [
  { value: 'medium', label: 'Standard', description: 'Scheduled visit within 24-48 hours', icon: 'calendar-today' },
  { value: 'high', label: 'Urgent', description: 'Under 4 hrs · priority dispatch', icon: 'bolt' },
  { value: 'emergency', label: 'Emergency', description: 'Immediate response needed', icon: 'emergency' },
];

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: 'Flexible',
  medium: 'Standard',
  high: 'Urgent',
  emergency: 'Emergency',
};