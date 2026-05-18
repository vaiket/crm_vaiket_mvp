import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { appointmentTypes, canManageOperations, meetingModes } from "@/lib/telecalling";

export async function POST(request: NextRequest) {
  const current = await getCurrentProfile();
  if (!current || (current.role !== "telecaller" && !canManageOperations(current.role))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentType?: string;
    assignedTo?: string;
    customerName?: string;
    customerPhone?: string;
    leadId?: string;
    meetingMode?: string;
    notes?: string;
    reminderEnabled?: boolean;
  };

  if (!body.leadId || !body.customerName?.trim() || !body.customerPhone?.trim() || !body.appointmentDate || !body.appointmentTime) {
    return NextResponse.json({ error: "Required appointment fields missing hain." }, { status: 400 });
  }

  if (!appointmentTypes.includes(body.appointmentType as never) || !meetingModes.includes(body.meetingMode as never)) {
    return NextResponse.json({ error: "Valid appointment type aur meeting mode select karein." }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: body.leadId } });
  const assignment = await prisma.leadAssignment.findFirst({
    where: { assignedTo: current.authUserId, leadId: body.leadId }
  });

  if (!lead || (!canManageOperations(current.role) && !assignment)) {
    return NextResponse.json({ error: canManageOperations(current.role) ? "Lead nahi mila." : "Lead assigned nahi hai." }, { status: 403 });
  }

  const assignedTo = body.assignedTo || current.authUserId;
  const assignee = await prisma.profile.findUnique({ where: { authUserId: assignedTo } });
  if (!assignee || !assignee.isActive) return NextResponse.json({ error: "Assigned staff valid nahi hai." }, { status: 400 });

  const appointment = await prisma.$transaction(async (tx) => {
    const created = await tx.appointment.create({
      data: {
        appointmentDate: new Date(body.appointmentDate!),
        appointmentTime: body.appointmentTime!,
        appointmentType: body.appointmentType!,
        assignedTo,
        createdBy: current.authUserId,
        customerName: body.customerName!.trim(),
        customerPhone: body.customerPhone!.trim(),
        leadId: body.leadId!,
        meetingMode: body.meetingMode!,
        notes: body.notes?.trim() || null,
        reminderEnabled: body.reminderEnabled ?? true,
        status: "scheduled"
      }
    });

    await tx.appointmentActivityLog.create({
      data: {
        action: "created",
        actorId: current.authUserId,
        appointmentId: created.id,
        metadata: { appointmentType: created.appointmentType, meetingMode: created.meetingMode }
      }
    });

    await tx.statusHistory.create({
      data: {
        fromStatus: lead.status,
        leadId: body.leadId!,
        note: "Appointment booked",
        toStatus: "appointment_booked",
        userId: current.authUserId
      }
    });

    await tx.lead.update({
      data: { status: "appointment_booked" },
      where: { id: body.leadId! }
    });

    return created;
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
