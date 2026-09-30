/**
 * /portal/admin — Admin-only dashboard entry point.
 *
 * Access is enforced by middleware.ts for SUPER_ADMIN, COUNCIL_MEMBER,
 * CENTRAL_TREASURER, SECRETARY, and COMMUNICATIONS_DIRECTOR roles.
 *
 * This page redirects to the unified portal with ?mode=ADMIN so all admin
 * sections are loaded correctly from within the portal shell.
 */
import { redirect } from "next/navigation";

export default function AdminPortalEntry() {
  // Redirect to the main portal shell in ADMIN mode.
  // The portal page reads the `mode` search param and switches the sidebar.
  redirect("/portal?mode=ADMIN");
}
