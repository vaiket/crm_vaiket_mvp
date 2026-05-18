import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageOperations } from "@/lib/telecalling";

export async function POST(request: NextRequest) {
  const current = await getCurrentProfile();
  if (!current || !canManageOperations(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { leadIds?: string[]; mode?: "manual" | "equal"; telecallerId?: string; telecallerIds?: string[] };
  const leadIds = body.leadIds?.filter(Boolean) ?? [];

  if (!leadIds.length) return NextResponse.json({ error: "Lead select karein." }, { status: 400 });

  if (body.mode === "equal") {
    const telecallerIds = body.telecallerIds?.filter(Boolean) ?? [];
    if (!telecallerIds.length) return NextResponse.json({ error: "Telecaller select karein." }, { status: 400 });
    const activeTelecallers = await prisma.profile.count({
      where: { authUserId: { in: telecallerIds }, isActive: true, role: "telecaller" }
    });
    if (activeTelecallers !== telecallerIds.length) return NextResponse.json({ error: "Only active telecallers ko assignment mil sakta hai." }, { status: 400 });

    await Promise.all(
      leadIds.map((leadId, index) =>
        prisma.leadAssignment.upsert({
          create: {
            assignedBy: current.authUserId,
            assignedTo: telecallerIds[index % telecallerIds.length],
            leadId
          },
          update: {
            assignedBy: current.authUserId,
            assignedTo: telecallerIds[index % telecallerIds.length],
            assignedAt: new Date()
          },
          where: { leadId }
        })
      )
    );
  } else {
    if (!body.telecallerId) return NextResponse.json({ error: "Telecaller select karein." }, { status: 400 });
    const telecaller = await prisma.profile.findUnique({ where: { authUserId: body.telecallerId } });
    if (!telecaller || telecaller.role !== "telecaller" || !telecaller.isActive) {
      return NextResponse.json({ error: "Active telecaller select karein." }, { status: 400 });
    }

    await Promise.all(
      leadIds.map((leadId) =>
        prisma.leadAssignment.upsert({
          create: {
            assignedBy: current.authUserId,
            assignedTo: body.telecallerId!,
            leadId
          },
          update: {
            assignedBy: current.authUserId,
            assignedTo: body.telecallerId!,
            assignedAt: new Date()
          },
          where: { leadId }
        })
      )
    );
  }

  await prisma.lead.updateMany({
    data: { status: "assigned" },
    where: { id: { in: leadIds } }
  });

  await prisma.auditLog.create({
    data: {
      action: body.mode === "equal" ? "leads_equal_distributed" : "leads_assigned",
      actorId: current.authUserId,
      entityType: "lead_assignment",
      metadata: { count: leadIds.length, mode: body.mode ?? "manual" }
    }
  });

  return NextResponse.json({ ok: true });
}
