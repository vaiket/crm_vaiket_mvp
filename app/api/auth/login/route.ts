import { NextResponse, type NextRequest } from "next/server";
import { activityCookieName, impersonationCookieName } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getDefaultPath } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  if (!email || !password) {
    return NextResponse.json({ error: "Email aur password required hai." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await prisma.auditLog.create({
      data: {
        action: "login_failed",
        entityType: "auth",
        metadata: { email, ipAddress, userAgent }
      }
    }).catch(() => null);

    return NextResponse.json({ error: "Invalid login ID ya password." }, { status: 401 });
  }

  const profileByAuthId = await prisma.profile.findUnique({ where: { authUserId: data.user.id } }).catch((error) => {
    console.error("Login profile lookup by auth id failed", error);
    return null;
  });
  const profile = profileByAuthId ?? await prisma.profile.findUnique({ where: { email } }).catch((error) => {
    console.error("Login profile lookup by email failed", error);
    return null;
  });

  if (!profile || !profile.isActive) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Account inactive hai ya profile missing hai." }, { status: 403 });
  }

  await prisma.auditLog.create({
    data: {
      action: "login_success",
      actorId: profile.authUserId,
      entityId: profile.id,
      entityType: "profile",
      metadata: { email: profile.email, ipAddress, role: profile.role, userAgent }
    }
  }).catch((error) => {
    console.error("Login audit write failed", error);
  });

  const response = NextResponse.json({ ok: true, redirectTo: getDefaultPath(profile.role) });
  response.cookies.delete(impersonationCookieName);
  response.cookies.delete(activityCookieName);
  return response;
}
