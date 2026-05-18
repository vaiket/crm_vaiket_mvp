import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { appointmentStatuses, appointmentTypes, canManageOperations, meetingModes } from "@/lib/telecalling";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentProfile();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Appointment nahi mila." }, { status: 404 });

  const isOwner = existing.createdBy === current.authUserId || existing.assignedTo === current.authUserId;
  if (!canManageOperations(current.role) && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as {
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentType?: string;
    cancellationReason?: string;
    meetingMode?: string;
    notes?: string;
    reminderEnabled?: boolean;
    status?: string;
  };

  if (body.status && !appointmentStatuses.includes(body.status as never)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  if (body.appointmentType && !appointmentTypes.includes(body.appointmentType as never)) return NextResponse.json({ error: "Invalid appointment type." }, { status: 400 });
  if (body.meetingMode && !meetingModes.includes(body.meetingMode as never)) return NextResponse.json({ error: "Invalid meeting mode." }, { status: 400 });
  if (body.status === "cancelled" && !body.cancellationReason?.trim()) return NextResponse.json({ error: "Cancellation reason required hai." }, { status: 400 });

  const appointment = await prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      data: {
        appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : undefined,
        appointmentTime: body.appointmentTime || undefined,
        appointmentType: body.appointmentType || undefined,
        cancellationReason: body.cancellationReason?.trim() || undefined,
        meetingMode: body.meetingMode || undefined,
        notes: body.notes?.trim() || undefined,
        reminderEnabled: typeof body.reminderEnabled === "boolean" ? body.reminderEnabled : undefined,
        status: body.status || undefined
      },
      where: { id }
    });

    await tx.appointmentActivityLog.create({
      data: {
        action: body.status ? `status_${body.status}` : "updated",
        actorId: current.authUserId,
        appointmentId: id,
        metadata: body
      }
    });

    return updated;
  });

  return NextResponse.json({ appointment });
}
