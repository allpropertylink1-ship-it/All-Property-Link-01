import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      contactPerson,
      phone,
      category,
      specialties,
      website,
      location,
      estateSubLocation,
      aplRepName,
      aplRepPhone,
      refereeName,
      refereePhone,
      refereeLocation,
      onboardingComplete,
    } = body;

    await prisma.user.update({
      where: { id: userId },
      data: {
        companyName: companyName || null,
        contactPerson: contactPerson || null,
        phone: phone || undefined,
        category: category || null,
        specialties: specialties || [],
        website: website || null,
        location: location || null,
        estateSubLocation: estateSubLocation || null,
        aplRepName: aplRepName || null,
        aplRepPhone: aplRepPhone || null,
        refereeName: refereeName || null,
        refereePhone: refereePhone || null,
        refereeLocation: refereeLocation || null,
        onboardingComplete: onboardingComplete || false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[onboarding] Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
