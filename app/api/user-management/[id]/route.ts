import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { canManageAdmins, ensureProfileRoleConstraint, normalizeRole } from "@/lib/telecalling";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentProfile();
  if (!current || !canManageAdmins(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { email?: string; isActive?: boolean; name?: string; password?: string; phone?: string; role?: string };
  const existing = await prisma.profile.findUnique({ where: { id } });

  if (!existing || !["admin", "finance", "telecaller"].includes(existing.role)) return NextResponse.json({ error: "Editable user nahi mila." }, { status: 404 });

  const nextRole = body.role ? normalizeRole(body.role) : existing.role;
  if (nextRole === "super_admin") return NextResponse.json({ error: "Super admin role assign nahi kar sakte." }, { status: 403 });
  await ensureProfileRoleConstraint();

  const user = await prisma.profile.update({
    data: {
      email: body.email?.trim().toLowerCase() || undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
      name: body.name?.trim() || undefined,
      phone: body.phone?.trim() || null,
      role: nextRole
    },
    where: { id }
  });

  const supabaseAdmin = createSupabaseAdminClient();
  const updatePayload: { ban_duration?: string; email?: string; password?: string; user_metadata?: { name?: string; role?: string } } = {};
  if (body.email?.trim()) updatePayload.email = body.email.trim().toLowerCase();
  if (body.password && body.password.length >= 6) updatePayload.password = body.password;
  if (body.name || body.role) updatePayload.user_metadata = { name: user.name, role: user.role };
  if (typeof body.isActive === "boolean") updatePayload.ban_duration = body.isActive ? "none" : "876000h";
  if (Object.keys(updatePayload).length) await supabaseAdmin.auth.admin.updateUserById(existing.authUserId, updatePayload);

  await prisma.auditLog.create({
    data: {
      action: "profile_updated",
      actorId: current.authUserId,
      entityId: user.id,
      entityType: "profile",
      metadata: { isActive: user.isActive, role: user.role }
    }
  });

  return NextResponse.json({ user });
}
