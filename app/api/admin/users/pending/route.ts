import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const users = await prisma.user.findMany({
      where: {
        accountStatus: "PENDING_APPROVAL",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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
        accountStatus: true,
        createdAt: true,
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            status: true,
            frontImage: true,
            backImage: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[pending-users] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
