import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES, STAFF_WRITE_ROLES, CHAPTER_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const PORTAL_ROLES = [...STAFF_ROLES, ...CHAPTER_ROLES];

export async function GET(request: Request) {
  const { session, error } = await guardApi(PORTAL_ROLES);
  if (error || !session) return error;
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const whereConditions: any[] = [
      { recipientId: "BROADCAST" },
      { recipientId: "ALL" },
      { recipientId: "ALL_CHAPTERS" },
      { recipientId: session.userId },
    ];

    if (session.chapterId) {
      whereConditions.push({ recipientId: session.chapterId });
    }

    const dbNotifications = await prisma.notification.findMany({
      where: {
        OR: whereConditions,
        ...(unreadOnly ? { status: { notIn: ["READ", "DELIVERED_READ"] } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const mapped = dbNotifications.map((n) => {
      const isRead = n.status === "READ" || n.status === "DELIVERED_READ";
      const diffMs = Date.now() - new Date(n.createdAt).getTime();
      let timeStr = new Date(n.createdAt).toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      if (diffMs < 60000) {
        timeStr = "Just now";
      } else if (diffMs < 3600000) {
        timeStr = `${Math.floor(diffMs / 60000)}m ago`;
      } else if (diffMs < 86400000) {
        timeStr = `${Math.floor(diffMs / 3600000)}h ago`;
      }

      return {
        id: n.id,
        title: n.subject || "Council Announcement",
        body: n.body,
        time: timeStr,
        type: (n.templateKey as any) || "INFO",
        read: isRead,
        channel: n.channel || "IN_APP",
      };
    });

    const unreadCount = mapped.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      data: mapped,
      unreadCount,
    });
  } catch (error: any) {
    console.error("[NOTIFICATIONS/GET]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { session, error } = await guardApi(PORTAL_ROLES);
  if (error || !session) return error;
  try {
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { recipientId: "BROADCAST" },
            { recipientId: "ALL" },
            { recipientId: "ALL_CHAPTERS" },
            { recipientId: session.userId },
            ...(session.chapterId ? [{ recipientId: session.chapterId }] : []),
          ],
          status: { not: "READ" },
        },
        data: { status: "READ" },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "READ" },
      });
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("[NOTIFICATIONS/PATCH]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Broadcast composer — council / staff only
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const { title, body: textBody, type = "INFO", channel = "IN_APP" } = body;

    if (!title?.trim() || !textBody?.trim()) {
      return NextResponse.json(
        { success: false, error: "Both title and message body are required." },
        { status: 400 }
      );
    }

    // 1. Persist the broadcast in the database so all chapter and admin dashboards see it
    const created = await prisma.notification.create({
      data: {
        recipientId: "BROADCAST",
        channel,
        templateKey: type,
        subject: title.trim(),
        body: textBody.trim(),
        to: "ALL_CHAPTERS",
        status: "UNREAD",
        provider: channel === "SMS" ? "AFRICAS_TALKING" : channel === "EMAIL" ? "RESEND" : "CUCASO_CORE",
        sentAt: new Date(),
      },
    });

    // 2. Multi-channel dispatch: SMS
    if (channel === "SMS") {
      try {
        const { sendSms } = await import("@/lib/sms");
        const chapters = await prisma.chapter.findMany({
          select: { repPhone: true, patronPhone: true, institution: { select: { name: true } } },
        });
        const chapterUsers = await prisma.user.findMany({
          where: { role: "CHAPTER_REP", isActive: true },
          select: { phone: true },
        });

        const phoneNumbers = new Set<string>();
        for (const ch of chapters) {
          if (ch.repPhone?.trim()) phoneNumbers.add(ch.repPhone.trim());
          if (ch.patronPhone?.trim()) phoneNumbers.add(ch.patronPhone.trim());
        }
        for (const u of chapterUsers) {
          if (u.phone?.trim()) phoneNumbers.add(u.phone.trim());
        }

        const smsContent = `[CUCASO] ${title}: ${textBody}`.slice(0, 160);
        phoneNumbers.forEach((phone) => {
          sendSms({ to: phone, message: smsContent }).catch((err) =>
            console.warn(`[SMS BROADCAST] Failed to send to ${phone}:`, err)
          );
        });
      } catch (smsErr) {
        console.error("[SMS BROADCAST ERROR]", smsErr);
      }
    }

    // 3. Multi-channel dispatch: EMAIL
    if (channel === "EMAIL") {
      try {
        const { sendEmail } = await import("@/lib/email");
        const chapters = await prisma.chapter.findMany({
          select: { patronEmail: true, name: true, institution: { select: { name: true } } },
        });
        const chapterUsers = await prisma.user.findMany({
          where: { role: "CHAPTER_REP", isActive: true },
          select: { email: true },
        });

        const emails = new Set<string>();
        for (const ch of chapters) {
          if (ch.patronEmail?.trim()) emails.add(ch.patronEmail.trim());
        }
        for (const u of chapterUsers) {
          if (u.email?.trim()) emails.add(u.email.trim());
        }

        emails.forEach((recipientEmail) => {
          sendEmail({
            to: recipientEmail,
            subject: `[CUCASO Announcement] ${title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="background: linear-gradient(135deg, #0a2540 0%, #061826 100%); padding: 24px; border-radius: 12px; text-align: center; color: white;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 800;">CUCASO Official Announcement</h2>
                  <p style="margin: 6px 0 0 0; color: #38bdf8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Coastal Universities & Colleges Adventist Students Organization</p>
                </div>
                <div style="padding: 24px 8px; color: #334155; line-height: 1.6;">
                  <h3 style="color: #0a2540; font-size: 18px; margin-top: 0;">${title}</h3>
                  <div style="white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${textBody}</div>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;">
                  Central Administration Council • Seventh-day Adventist Student Ministries<br/>
                  Mombasa Coast Field Secretariat • <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cucaso.org"}/portal" style="color: #00a389;">Open Chapter Portal</a>
                </div>
              </div>
            `,
          }).catch((err) => console.warn(`[EMAIL BROADCAST] Failed to send to ${recipientEmail}:`, err));
        });
      } catch (emailErr) {
        console.error("[EMAIL BROADCAST ERROR]", emailErr);
      }
    }

    const clientNotif = {
      id: created.id,
      title: created.subject || "System Announcement",
      body: created.body,
      time: "Just now",
      type: created.templateKey,
      read: false,
      channel: created.channel,
    };

    return NextResponse.json({ success: true, data: clientNotif }, { status: 201 });
  } catch (error: any) {
    console.error("[NOTIFICATIONS/POST]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await guardApi(STAFF_WRITE_ROLES);
  if (error || !session) return error;
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
      await prisma.notification.deleteMany({
        where: {
          OR: [
            { recipientId: "BROADCAST" },
            { recipientId: "ALL" },
            { recipientId: "ALL_CHAPTERS" },
            { recipientId: session.userId },
            ...(session.chapterId ? [{ recipientId: session.chapterId }] : []),
          ],
        },
      });
      return NextResponse.json({ success: true, message: "All notifications cleared." });
    }

    if (id) {
      await prisma.notification.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Notification deleted." });
    }

    return NextResponse.json({ success: false, error: "Missing notification ID" }, { status: 400 });
  } catch (error: any) {
    console.error("[NOTIFICATIONS/DELETE]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
