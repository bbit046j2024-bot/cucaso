import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES, STAFF_WRITE_ROLES, CHAPTER_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const PORTAL_ROLES = [...STAFF_ROLES, ...CHAPTER_ROLES];

// Dynamic notifications store (new broadcasts created during runtime)
let IN_MEMORY_NOTIFICATIONS: any[] = [];

export async function GET(request: Request) {
  const { error } = await guardApi(PORTAL_ROLES);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    // Fetch from database Notification table
    let dbNotifications: any[] = [];
    try {
      dbNotifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch {
      dbNotifications = [];
    }

    const mapped = dbNotifications.map((n) => ({
      id: n.id,
      title: n.subject || n.templateKey?.replace(/_/g, " ") || "Notification",
      body: n.body,
      time: new Date(n.createdAt).toLocaleDateString(),
      type: n.status === "FAILED" ? "URGENT" : "SUCCESS",
      read: n.status === "READ" || n.status === "DELIVERED",
      channel: n.channel,
    }));

    let combined = [...mapped, ...IN_MEMORY_NOTIFICATIONS];

    if (unreadOnly) {
      combined = combined.filter((n) => !n.read);
    }

    const unreadCount = combined.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      data: combined,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { error } = await guardApi(PORTAL_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      IN_MEMORY_NOTIFICATIONS = IN_MEMORY_NOTIFICATIONS.map((n) => ({ ...n, read: true }));
      try {
        await prisma.notification.updateMany({
          data: { status: "READ" },
        });
      } catch {}
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      IN_MEMORY_NOTIFICATIONS = IN_MEMORY_NOTIFICATIONS.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: "READ" },
        });
      } catch {}
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Broadcast composer — staff only
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const { title, body: textBody, type = "INFO", channel = "IN_APP" } = body;

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: title || "System Announcement",
      body: textBody || "",
      time: "Just now",
      type,
      read: false,
      channel,
    };

    IN_MEMORY_NOTIFICATIONS.unshift(newNotif);

    return NextResponse.json({ success: true, data: newNotif }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Clearing/deleting affects the shared notification store — staff only
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");
    let id = idFromQuery;
    let clearAll = false;

    if (!id) {
      try {
        const body = await request.json();
        id = body?.notificationId;
        clearAll = body?.clearAll === true;
      } catch {}
    }

    if (clearAll) {
      IN_MEMORY_NOTIFICATIONS = [];
      try {
        await prisma.notification.deleteMany({});
      } catch {}
      return NextResponse.json({ success: true, message: "All notifications cleared." });
    }

    if (id) {
      IN_MEMORY_NOTIFICATIONS = IN_MEMORY_NOTIFICATIONS.filter((n) => n.id !== id);
      try {
        await prisma.notification.delete({
          where: { id },
        });
      } catch {}
      return NextResponse.json({ success: true, message: "Notification deleted." });
    }

    return NextResponse.json({ success: false, error: "Missing notification ID" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
