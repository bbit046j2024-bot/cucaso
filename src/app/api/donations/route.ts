import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { error } = await guardApi(STAFF_ROLES);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const donations = await prisma.payment.findMany({
      where: {
        channel: "MPESA_STK",
      },
      orderBy: {
        transactionTime: "desc",
      },
      take: limit,
    });

    const totalDonationsKes = donations.reduce((sum, d) => sum + (d.amountKes || 0), 0);

    return NextResponse.json({
      success: true,
      data: donations,
      totalCount: donations.length,
      totalDonationsKes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
