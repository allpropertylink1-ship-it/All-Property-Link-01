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

    const userId = (session.user as { id: string }).id;

    const [user, documents] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { kycStatus: true, firstName: true, lastName: true },
      }),
      prisma.kycDocument.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ user, documents });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { documentType, documentNumber, frontImage, backImage } = body;

    if (!documentType || !frontImage) {
      return NextResponse.json(
        { error: "Document type and front image are required" },
        { status: 400 }
      );
    }

    const validTypes = ["NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    const doc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType,
        documentNumber: documentNumber || null,
        frontImage,
        backImage: backImage || null,
        status: "PENDING",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: "PENDING" },
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
