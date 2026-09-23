import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/contact
 * Admin: fetch all contact/feedback messages (newest first).
 */
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/contact
 * Public: submit a contact/feedback message.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, institution, subject, message } = body;

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        institution: institution?.trim() || null,
        subject: subject || "GENERAL_INQUIRY",
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/contact
 * Admin: mark a message as read.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(isRead !== undefined ? { isRead } : {}),
        ...(isRead ? { repliedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/contact error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/contact
 * Admin: delete a contact message by ID.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/contact error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
