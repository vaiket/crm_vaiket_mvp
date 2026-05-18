import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { canManageTelecallers, getTelecallers } from "@/lib/telecalling";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !canManageTelecallers(profile.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const telecallers = await getTelecallers();
  return NextResponse.json({ telecallers });
}

export async function POST(request: NextRequest) {
  const current = await getCurrentProfile();
  if (!current || !canManageTelecallers(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { email?: string; name?: string; password?: string; phone?: string; role?: string; isActive?: boolean };
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const password = body.password ?? "";

  if (!email || !name || password.length < 6) {
    return NextResponse.json({ error: "Name, email aur 6+ character password required hai." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "telecaller" }
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Telecaller create nahi ho paya." }, { status: 400 });
  }

  const telecaller = await prisma.profile.create({
    data: {
      authUserId: data.user.id,
      email,
      isActive: body.isActive ?? true,
      name,
      phone: body.phone?.trim() || null,
      role: "telecaller"
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "telecaller_created",
      actorId: current.authUserId,
      entityId: telecaller.id,
      entityType: "profile",
      metadata: { email, name }
    }
  });

  return NextResponse.json({ telecaller }, { status: 201 });
}
