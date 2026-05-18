import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentProfile();
  if (!current || current.role !== "telecaller") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const followup = await prisma.followup.findFirst({
    where: { id, userId: current.authUserId }
  });

  if (!followup) {
    return NextResponse.json({ error: "Followup nahi mila." }, { status: 404 });
  }

  const updated = await prisma.followup.update({
    data: {
      completedAt: new Date(),
      status: "completed"
    },
    where: { id }
  });

  return NextResponse.json({ followup: updated });
}
