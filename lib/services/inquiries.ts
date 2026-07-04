import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { InquiryInput } from "@/lib/validations";
import { sendEmail } from "@/lib/resend";
import { newInquiryEmail, inquiryResponseEmail } from "@/lib/emails/templates";

export async function sendInquiry(
  propertyId: string,
  data: InquiryInput,
  userId: string | null,
) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, agentId: true, title: true },
  });
  if (!property) return { success: false, error: "Property not found" } as const;

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      userId,
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

    const agent = await prisma.user.findUnique({
      where: { id: property.agentId },
      select: { email: true, firstName: true },
    });
    if (agent?.email) {
      await sendEmail(
        agent.email,
        `New inquiry about ${property.title}`,
        newInquiryEmail({ propertyTitle: property.title, name: data.name, email: data.email, phone: data.phone, message: data.message }),
      );
    }
  }

  return { success: true } as const;
}

export async function respondToInquiry(
  id: string,
  responseMessage: string,
  responseType: string,
  userId: string,
) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { property: { select: { agentId: true, title: true } } },
  });
  if (!inquiry) return { success: false, error: "Inquiry not found" } as const;
  if (!inquiry.property || inquiry.property.agentId !== userId) {
    return { success: false, error: "Unauthorized" } as const;
  }

  await prisma.inquiry.update({
    where: { id },
    data: {
      responseMessage,
      responseType: responseType as "EMAIL" | "WHATSAPP" | "PHONE",
      status: "RESPONDED",
      respondedAt: new Date(),
    },
  });

  if (inquiry.userId) {
    await prisma.notification.create({
      data: {
        userId: inquiry.userId,
        title: "Inquiry Response",
        message: "You received a response to your inquiry",
        type: "INQUIRY",
        link: `/properties/${inquiry.propertyId}`,
      } as Prisma.NotificationUncheckedCreateInput,
    });

    const inquirer = await prisma.user.findUnique({
      where: { id: inquiry.userId },
      select: { email: true },
    });
    if (inquirer?.email) {
      await sendEmail(
        inquirer.email,
        `Response to your inquiry about ${inquiry.property.title}`,
        inquiryResponseEmail({ propertyTitle: inquiry.property.title, responseMessage }),
      );
    }
  }

  return { success: true } as const;
}

export async function closeInquiry(id: string, userId: string) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { property: { select: { agentId: true } } },
  });
  if (!inquiry) return { success: false, error: "Inquiry not found" } as const;
  if (!inquiry.property || inquiry.property.agentId !== userId) {
    return { success: false, error: "Unauthorized" } as const;
  }

  await prisma.inquiry.update({ where: { id }, data: { status: "CLOSED" } });
  return { success: true } as const;
}
