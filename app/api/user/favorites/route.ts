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

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            city: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            images: true,
            isPublished: true,
          },
        },
      },
    });

    return NextResponse.json({ favorites });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { favoriteId } = body;

    if (!favoriteId) {
      return NextResponse.json(
        { error: "favoriteId is required" },
        { status: 400 }
      );
    }

    const fav = await prisma.favorite.findUnique({
      where: { id: favoriteId },
      select: { userId: true },
    });

    if (!fav || fav.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.favorite.delete({ where: { id: favoriteId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
