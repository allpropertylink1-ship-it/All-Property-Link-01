import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, ...formData } = body;

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    const parsed = inquirySchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId, deletedAt: null, isPublished: true },
      select: { id: true, agentId: true, title: true },
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const data = parsed.data;

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: property.id,
        userId: null,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    });

    if (property.agentId) {
      await prisma.notification.create({
        data: {
          userId: property.agentId,
          title: "New Inquiry",
          message: `${data.name} sent an inquiry about "${property.title}"`,
          type: "INQUIRY",
          link: `/dashboard/inquiries/${inquiry.id}`,
        } as Prisma.NotificationUncheckedCreateInput,
      });
    }

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
