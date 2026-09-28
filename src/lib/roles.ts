/**
 * Shared role groups — single source of truth for authorization.
 * Kept free of server-only imports (no iron-session / prisma / otplib)
 * so middleware (edge runtime) and API route handlers can both use it.
 */

/** Council officers that must complete TOTP 2FA */
export const TOTP_ROLES = [
  "SUPER_ADMIN",
  "COUNCIL_MEMBER",
  "CENTRAL_TREASURER",
  "SECRETARY",
] as const;

/** All council/staff roles allowed into the admin portal (read access) */
export const STAFF_ROLES = [
  ...TOTP_ROLES,
  "CHAPLAIN",
  "COMMUNICATIONS_DIRECTOR",
  "OBSERVER",
] as const;

/** Staff roles allowed to mutate data — OBSERVER is read-only */
export const STAFF_WRITE_ROLES = [
  "SUPER_ADMIN",
  "COUNCIL_MEMBER",
  "CENTRAL_TREASURER",
  "SECRETARY",
  "CHAPLAIN",
  "COMMUNICATIONS_DIRECTOR",
] as const;

/** Financial operations: cost engine, invoices, payment reconciliation */
export const TREASURY_ROLES = ["SUPER_ADMIN", "CENTRAL_TREASURER"] as const;

/** Chapter-level roles — must be scoped to their own chapterId */
export const CHAPTER_ROLES = ["CHAPTER_REP", "CHAPTER_TREASURER"] as const;

export function isStaffRole(role?: string | null): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

export function isChapterRole(role?: string | null): boolean {
  return !!role && (CHAPTER_ROLES as readonly string[]).includes(role);
}
