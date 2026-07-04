import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { reject, reason } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, accountStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.accountStatus !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: "User is not pending approval" },
        { status: 400 }
      );
    }

    if (reject) {
      await prisma.user.update({
        where: { id },
        data: {
          accountStatus: "REJECTED",
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId: id,
          title: "Account Rejected",
          message: `Your account registration was not approved. Reason: ${reason || "Documents did not meet requirements"}. Please contact support or resubmit.`,
          type: "SYSTEM",
          link: "/dashboard/onboarding",
        },
      });

      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    await prisma.user.update({
      where: { id },
      data: {
        accountStatus: "ACTIVE",
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        title: "Account Approved",
        message: "Your account has been approved. You can now fully use All Property Link.",
        type: "SYSTEM",
        link: "/dashboard",
      },
    });

    return NextResponse.json({ success: true, status: "ACTIVE" });
  } catch (error) {
    console.error("[approve] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        accountStatus: true,
        kycStatus: true,
        companyName: true,
        contactPerson: true,
        category: true,
        specialties: true,
        website: true,
        location: true,
        estateSubLocation: true,
        aplRepName: true,
        aplRepPhone: true,
        refereeName: true,
        refereePhone: true,
        refereeLocation: true,
        createdAt: true,
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            status: true,
            frontImage: true,
            backImage: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
