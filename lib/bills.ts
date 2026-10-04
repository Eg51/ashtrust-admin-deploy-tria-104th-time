// lib/bills.ts
//
// Single source of truth for the "which bills block a withdrawal?" question.

export const BILL_BLOCKING_STATUSES = ['pending', 'unpaid', 'overdue'] as const;
export const BILL_PAID_STATUS = 'paid';

export type BillStatus = 'pending' | 'paid' | 'unpaid' | 'overdue';

export interface BillLike {
  status?: string | null;
}

function normalizeStatus(bill: BillLike | null | undefined): string {
  return String(bill?.status || '').trim().toLowerCase();
}

/** True when a bill should block a withdrawal. */
export function isBillBlocking(bill: BillLike | null | undefined): boolean {
  return (BILL_BLOCKING_STATUSES as readonly string[]).includes(
    normalizeStatus(bill)
  );
}

// Loose-typed on purpose: accepts any array, returns any[]. Assignable
// everywhere. If you want to tighten later, add a generic constraint.
export function filterBlockingBills(bills: any): any[] {
  if (!Array.isArray(bills)) return [];
  return bills.filter((b: any) => isBillBlocking(b as BillLike));
}

export function filterPaidBills(bills: any): any[] {
  if (!Array.isArray(bills)) return [];
  return bills.filter(
    (b: any) => normalizeStatus(b as BillLike) === BILL_PAID_STATUS
  );
}