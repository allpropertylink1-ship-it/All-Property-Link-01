import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = (session.user as { id: string }).id;
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const doc = await prisma.kycDocument.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.status !== "PENDING") {
      return NextResponse.json(
        { error: "Document has already been reviewed" },
        { status: 400 }
      );
    }

    const isApproved = action === "APPROVE";

    await prisma.kycDocument.update({
      where: { id },
      data: {
        status: isApproved ? "VERIFIED" : "REJECTED",
        verifiedAt: new Date(),
        verifiedBy: adminId,
        rejectionReason: isApproved ? null : (rejectionReason || null),
      },
    });

    await prisma.user.update({
      where: { id: doc.userId },
      data: { kycStatus: isApproved ? "VERIFIED" : "REJECTED" },
    });

    await prisma.notification.create({
      data: {
        userId: doc.userId,
        title: isApproved ? "KYC Verified" : "KYC Rejected",
        message: isApproved
          ? "Your identity documents have been verified successfully."
          : `Your KYC verification was rejected: ${rejectionReason || "Documents did not meet requirements"}`,
        type: isApproved ? "KYC_VERIFIED" : "KYC_REJECTED",
        link: "/dashboard/kyc",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
