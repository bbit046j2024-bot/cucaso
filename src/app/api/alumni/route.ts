import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES, STAFF_WRITE_ROLES } from "@/lib/roles";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALUMNI_FILE = path.join(process.cwd(), "data", "alumni.json");

interface AlumniRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institutionGraduated: string;
  graduationYear?: string;
  profession?: string;
  areasOfInterest: string[];
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED";
  notes?: string;
  createdAt: string;
}

async function readAlumniFile(): Promise<AlumniRecord[]> {
  try {
    const raw = await fs.readFile(ALUMNI_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeAlumniFile(records: AlumniRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(ALUMNI_FILE), { recursive: true });
  await fs.writeFile(ALUMNI_FILE, JSON.stringify(records, null, 2), "utf-8");
}

/**
 * GET /api/alumni
 * Protected: Fetch all alumni registrations for Council / Secretariat review.
 */
export async function GET() {
  const { error } = await guardApi(STAFF_ROLES);
  if (error) return error;

  try {
    const fileRecords = await readAlumniFile();

    // Also pull any contact messages that were marked ALUMNI_REGISTRATION
    try {
      const dbAlumniMessages = await prisma.contactMessage.findMany({
        where: { subject: "ALUMNI_REGISTRATION" },
        orderBy: { createdAt: "desc" },
      });

      // Merge avoiding duplicates by email or phone
      const existingEmails = new Set(fileRecords.map((r) => r.email.toLowerCase()));
      for (const msg of dbAlumniMessages) {
        if (msg.email && !existingEmails.has(msg.email.toLowerCase())) {
          fileRecords.push({
            id: `msg-${msg.id}`,
            fullName: msg.name,
            email: msg.email,
            phone: msg.phone || "—",
            institutionGraduated: msg.institution || "Coastal Tertiary Institution",
            graduationYear: "2024",
            profession: "Alumni Member",
            areasOfInterest: ["Associate Membership"],
            status: msg.isRead ? "CONTACTED" : "PENDING",
            notes: msg.message,
            createdAt: msg.createdAt.toISOString(),
          });
          existingEmails.add(msg.email.toLowerCase());
        }
      }
    } catch (e) {
      // Prisma query fallback if table unavailable
    }

    // Sort newest first
    fileRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: fileRecords });
  } catch (error: any) {
    console.error("GET /api/alumni error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch alumni records" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alumni
 * Public: Submit a new alumni registration form.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      institutionGraduated,
      graduationYear,
      profession,
      areasOfInterest,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required." }, { status: 400 });
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }
    if (!institutionGraduated || !institutionGraduated.trim()) {
      return NextResponse.json({ success: false, error: "Institution graduated from is required." }, { status: 400 });
    }

    const newRecord: AlumniRecord = {
      id: `alum-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      institutionGraduated: institutionGraduated.trim(),
      graduationYear: graduationYear ? String(graduationYear).trim() : "2024",
      profession: profession ? profession.trim() : "Graduate / Professional",
      areasOfInterest: Array.isArray(areasOfInterest) ? areasOfInterest : [],
      status: "PENDING",
      notes: "Submitted via CUCASO Alumni Portal",
      createdAt: new Date().toISOString(),
    };

    // 1. Save to JSON store
    const fileRecords = await readAlumniFile();
    fileRecords.unshift(newRecord);
    await writeAlumniFile(fileRecords);

    // 2. Also record in ContactMessage for database persistence
    try {
      await prisma.contactMessage.create({
        data: {
          name: newRecord.fullName,
          email: newRecord.email,
          phone: newRecord.phone,
          institution: newRecord.institutionGraduated,
          subject: "ALUMNI_REGISTRATION",
          message: `Institution: ${newRecord.institutionGraduated}\nYear: ${newRecord.graduationYear}\nProfession: ${newRecord.profession}\nInterests: ${newRecord.areasOfInterest.join(", ")}`,
        },
      });
    } catch (e) {
      console.warn("Could not save to contactMessage:", e);
    }

    // 3. Dispatch in-app council notification
    try {
      await prisma.notification.create({
        data: {
          recipientId: "BROADCAST",
          channel: "IN_APP",
          templateKey: "ALUMNI_APPLICATION",
          subject: `New Alumni Registration: ${newRecord.fullName}`,
          body: `${newRecord.fullName} (${newRecord.profession}, ${newRecord.institutionGraduated} Class of ${newRecord.graduationYear}) has registered with the CUCASO Alumni Network. Contact: ${newRecord.phone}`,
          to: newRecord.email,
          status: "PENDING",
        },
      });
    } catch (e) {
      console.warn("Could not create notification:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Alumni registration received successfully!",
      data: newRecord,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/alumni error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process alumni registration" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alumni
 * Protected: Update status or notes of an alumni record (Council / Secretariat).
 */
export async function PATCH(request: Request) {
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Record ID is required." }, { status: 400 });
    }

    const records = await readAlumniFile();
    const index = records.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Alumni record not found." }, { status: 404 });
    }

    if (status) records[index].status = status;
    if (notes !== undefined) records[index].notes = notes;

    await writeAlumniFile(records);

    return NextResponse.json({ success: true, data: records[index] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update alumni record" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alumni
 * Protected: Remove an alumni record.
 */
export async function DELETE(request: Request) {
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }

    const records = await readAlumniFile();
    const filtered = records.filter((r) => r.id !== id);
    await writeAlumniFile(filtered);

    return NextResponse.json({ success: true, message: "Alumni record removed." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete alumni record" },
      { status: 500 }
    );
  }
}
