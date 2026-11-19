import type { JobStatus } from '@/types/booking';
import type { ReservationStatus } from '@/types/reservation';

type Transitions<S extends string> = Record<S, readonly S[]>;

// Allowed moves. Anything not listed is rejected, so a screen can never put a
// job or a reservation into a state the lifecycle does not allow.
export const JOB_TRANSITIONS: Transitions<JobStatus> = {
  requested: ['provider_selected', 'cancelled'],
  provider_selected: ['confirmed', 'cancelled'],
  confirmed: ['en_route', 'cancelled'],
  en_route: ['on_site', 'cancelled'],
  on_site: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const RESERVATION_TRANSITIONS: Transitions<ReservationStatus> = {
  pending: ['approved', 'declined', 'cancelled'],
  approved: ['active', 'cancelled'],
  declined: [],
  active: ['return_pending'],
  return_pending: ['completed'],
  completed: [],
  cancelled: [],
};

export function canTransition<S extends string>(map: Transitions<S>, from: S, to: S): boolean {
  return map[from].includes(to);
}

/** The next forward step (never "cancelled" or "declined"), or null when the flow has ended. */
export function nextStatus<S extends string>(map: Transitions<S>, from: S): S | null {
  const forward = map[from].filter((s) => s !== 'cancelled' && s !== 'declined');
  return forward[0] ?? null;
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  requested: 'Request Created',
  provider_selected: 'Provider Selected',
  confirmed: 'Confirmed',
  en_route: 'En Route',
  on_site: 'On Site',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  declined: 'Declined',
  active: 'In Rent',
  return_pending: 'Return Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};