import { NextResponse, type NextRequest } from "next/server";
import { activityCookieName, impersonationCookieName, inactiveSessionMaxAgeSeconds } from "@/lib/auth-config";
import { getAuthenticatedProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getAuthenticatedProfile();
  if (!current || current.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const telecaller = await prisma.profile.findUnique({ where: { id } });

  if (!telecaller || telecaller.role !== "telecaller" || !telecaller.isActive) {
    return NextResponse.json({ error: "Active telecaller nahi mila." }, { status: 404 });
  }

  await prisma.auditLog.create({
    data: {
      action: "telecaller_impersonation_started",
      actorId: current.authUserId,
      entityId: telecaller.id,
      entityType: "profile",
      metadata: { email: telecaller.email, name: telecaller.name, ttlSeconds: inactiveSessionMaxAgeSeconds }
    }
  });

  const response = NextResponse.json({ ok: true, redirectTo: "/telecaller/dashboard" });
  response.cookies.set(impersonationCookieName, telecaller.authUserId, {
    httpOnly: true,
    maxAge: inactiveSessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  response.cookies.set(activityCookieName, String(Date.now()), {
    httpOnly: true,
    maxAge: inactiveSessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
