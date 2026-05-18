import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { canManageAdmins, ensureProfileRoleConstraint, normalizeRole } from "@/lib/telecalling";

export async function GET() {
  const current = await getCurrentProfile();
  if (!current || !canManageAdmins(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    where: { role: { in: ["admin", "finance", "telecaller"] } }
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const current = await getCurrentProfile();
  if (!current || !canManageAdmins(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { email?: string; isActive?: boolean; name?: string; password?: string; phone?: string; role?: string };
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const password = body.password ?? "";
  const role = normalizeRole(body.role ?? "telecaller");

  if (role === "super_admin") return NextResponse.json({ error: "Super admin yahan create nahi ho sakta." }, { status: 403 });
  if (!email || !name || password.length < 6) return NextResponse.json({ error: "Name, email aur 6+ character password required hai." }, { status: 400 });
  await ensureProfileRoleConstraint();

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });

  if (error || !data.user) return NextResponse.json({ error: error?.message ?? "User create nahi ho paya." }, { status: 400 });

  const user = await prisma.profile.create({
    data: {
      authUserId: data.user.id,
      email,
      isActive: body.isActive ?? true,
      name,
      phone: body.phone?.trim() || null,
      role
    }
  });

  await prisma.auditLog.create({
    data: {
      action: `${role}_created`,
      actorId: current.authUserId,
      entityId: user.id,
      entityType: "profile",
      metadata: { email, name, role }
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
