/**
 * CUCASO Audit Logger
 * Append-only structured audit log — PRD §5.11
 * 
 * Logs: logins, votes, tier changes, adjustments, fee locks,
 *       payment entries/edits, exports, role changes.
 * 
 * NEVER include personal data in logs (KDPA compliance).
 * Logs include: who (actor/userId), when, what (action), which entity, before/after state.
 */

import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_ROLE_CHANGED"
  | "USER_DEACTIVATED"
  | "TOTP_ENABLED"
  | "TOTP_VERIFIED"
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_VOTED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "APPLICATION_CHANGES_REQUESTED"
  | "CHAPTER_TIER_ASSIGNED"
  | "CHAPTER_TIER_CHANGED"
  | "CHAPTER_SUSPENDED"
  | "RALLY_CREATED"
  | "RALLY_STATE_CHANGED"
  | "FEES_LOCKED"
  | "FEE_ADJUSTMENT_CREATED"
  | "FEE_ADJUSTMENT_APPROVED"
  | "INVOICE_GENERATED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_MATCHED"
  | "PAYMENT_UNMATCHED"
  | "PAYMENT_DISPUTED"
  | "ATTENDEES_UPLOADED"
  | "ATTENDEE_EDITED"
  | "ATTENDEE_REMOVED"
  | "REPORT_EXPORTED"
  | "CMS_POST_PUBLISHED"
  | "DOCUMENT_UPLOADED"
  | "SYSTEM_SETTING_CHANGED"
  | "DATA_EXPORT_REQUESTED"    // KDPA Subject Access Request
  | "DATA_DELETION_REQUESTED"; // KDPA Right to Erasure

export interface AuditEntry {
  userId?: string;
  actor: string;           // email address or "SYSTEM"
  action: AuditAction;
  entityType: string;      // "Chapter", "Invoice", "Payment", "Rally", etc.
  entityId?: string;
  before?: Record<string, unknown>;   // State before change (no PII)
  after?: Record<string, unknown>;    // State after change (no PII)
  ipAddress?: string;
}

/**
 * Write an audit log entry.
 * This is fire-and-forget from the caller's perspective — awaitable but non-blocking.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        actor: entry.actor,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        beforeJson: entry.before ? JSON.stringify(entry.before) : null,
        afterJson: entry.after ? JSON.stringify(entry.after) : null,
        ipAddress: entry.ipAddress,
      },
    });
  } catch (error) {
    // Audit failures must never break the main operation
    // Log to stderr (structured) so monitoring can alert
    console.error(
      JSON.stringify({
        level: "error",
        context: "audit",
        message: "Failed to write audit log",
        action: entry.action,
        actor: entry.actor,
        entityType: entry.entityType,
        error: error instanceof Error ? error.message : String(error),
      })
    );
  }
}

/**
 * Utility: Sanitize an object before writing to audit log.
 * Removes fields that may contain personal data.
 */
export function sanitizeForAudit<T extends Record<string, unknown>>(
  obj: T,
  omitFields: string[] = ["passwordHash", "totpSecret", "phone", "email", "resetToken"]
): Partial<T> {
  const sanitized = { ...obj };
  for (const field of omitFields) {
    delete sanitized[field];
  }
  return sanitized;
}

/**
 * Alias for audit() for backward compatibility
 */
export const logAudit = audit;

