/**
 * /portal/chapter — Chapter representative dashboard entry point.
 *
 * Access is enforced by middleware.ts for CHAPTER_REP, CHAPTER_TREASURER,
 * and all admin roles (admins can view chapter portals too).
 *
 * Redirects into the unified portal shell in CHAPTER mode so the
 * chapter sidebar and tabs are rendered by default.
 */
import { redirect } from "next/navigation";

export default function ChapterPortalEntry() {
  // Redirect to the main portal shell in CHAPTER mode.
  redirect("/portal?mode=CHAPTER");
}
