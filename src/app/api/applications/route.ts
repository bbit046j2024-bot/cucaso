import { NextResponse } from "next/server";
import { getApplications, createApplication, updateApplication } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await guardApi(STAFF_ROLES);
  if (error) return error;
  try {
    const applications = await getApplications();
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// Public: chapter accreditation applications are submitted without an account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newApp = await createApplication(body);
    return NextResponse.json({ success: true, data: newApp }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { error } = await guardApi(["SUPER_ADMIN", "COUNCIL_MEMBER"]);
  if (error) return error;
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing application id" }, { status: 400 });
    }
    const updated = await updateApplication(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
