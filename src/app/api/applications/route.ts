import { NextResponse } from "next/server";
import { getApplications, createApplication, updateApplication } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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
