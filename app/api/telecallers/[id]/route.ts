import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { canManageTelecallers } from "@/lib/telecalling";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentProfile();
  if (!current || !canManageTelecallers(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { email?: string; isActive?: boolean; name?: string; password?: string; phone?: string };

  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing || existing.role !== "telecaller") return NextResponse.json({ error: "Telecaller nahi mila." }, { status: 404 });

  const telecaller = await prisma.profile.update({
    data: {
      email: body.email?.trim().toLowerCase() || undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
      name: body.name?.trim() || undefined,
      phone: body.phone?.trim() || null
    },
    where: { id }
  });

  const supabaseAdmin = createSupabaseAdminClient();
  if (body.password && body.password.length >= 6) {
    await supabaseAdmin.auth.admin.updateUserById(existing.authUserId, { password: body.password });
  }

  if (typeof body.isActive === "boolean") {
    await supabaseAdmin.auth.admin.updateUserById(existing.authUserId, {
      ban_duration: body.isActive ? "none" : "876000h"
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "telecaller_updated",
      actorId: current.authUserId,
      entityId: telecaller.id,
      entityType: "profile",
      metadata: { isActive: telecaller.isActive }
    }
  });

  return NextResponse.json({ telecaller });
}
