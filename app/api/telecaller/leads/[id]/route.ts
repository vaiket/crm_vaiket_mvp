import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { leadStatuses } from "@/lib/telecalling";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentProfile();
  if (!current || current.role !== "telecaller") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assignment = await prisma.leadAssignment.findFirst({
    where: { assignedTo: current.authUserId, leadId: id }
  });

  if (!assignment) return NextResponse.json({ error: "Lead assigned nahi hai." }, { status: 403 });

  const body = (await request.json()) as {
    durationSeconds?: number;
    followupDate?: string;
    followupType?: string;
    note?: string;
    outcome?: string;
    status?: string;
  };
  const status = body.status && leadStatuses.includes(body.status as never) ? body.status : undefined;

  const lead = await prisma.$transaction(async (tx) => {
    const currentLead = await tx.lead.findUniqueOrThrow({ where: { id } });
    const updatedLead = status
      ? await tx.lead.update({
          data: { status },
          where: { id }
        })
      : currentLead;

    if (body.note?.trim()) {
      await tx.leadNote.create({
        data: {
          leadId: id,
          note: body.note.trim(),
          userId: current.authUserId
        }
      });
    }

    if (body.followupDate) {
      await tx.followup.create({
        data: {
          followupDate: new Date(body.followupDate),
          followupType: body.followupType || "call",
          leadId: id,
          note: body.note?.trim() || null,
          status: "pending",
          userId: current.authUserId
        }
      });
    }

    if (body.outcome) {
      await tx.callLog.create({
        data: {
          durationSeconds: body.durationSeconds ?? null,
          leadId: id,
          notes: body.note?.trim() || null,
          outcome: body.outcome,
          userId: current.authUserId
        }
      });
    }

    if (status && status !== currentLead.status) {
      await tx.statusHistory.create({
        data: {
          fromStatus: currentLead.status,
          leadId: id,
          note: body.note?.trim() || null,
          toStatus: status,
          userId: current.authUserId
        }
      });
    }

    return updatedLead;
  });

  return NextResponse.json({ lead });
}
