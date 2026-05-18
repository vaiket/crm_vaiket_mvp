import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { sessionCookieName, sessionMaxAgeSeconds } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  await prisma.session.create({
    data: {
      expiresAt,
      tokenHash: hashSessionToken(token),
      userId
    }
  });

  await prisma.user.update({
    data: { lastLoginAt: new Date() },
    where: { id: userId }
  });

  return { expiresAt, token };
}

export async function getCurrentUserFromToken(token?: string) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    include: { user: true },
    where: { tokenHash: hashSessionToken(token) }
  });

  if (!session || session.expiresAt < new Date() || session.user.status !== "Active") {
    return null;
  }

  return session.user;
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  return getCurrentUserFromToken(request.cookies.get(sessionCookieName)?.value);
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  return getCurrentUserFromToken(cookieStore.get(sessionCookieName)?.value);
}

export async function deleteSession(token: string) {
  await prisma.session.deleteMany({
    where: { tokenHash: hashSessionToken(token) }
  });
}

export async function recordLoginAudit(input: {
  email: string;
  ipAddress?: string | null;
  role?: string | null;
  status: "SUCCESS" | "FAILED";
  userAgent?: string | null;
  userId?: string | null;
}) {
  await prisma.loginAudit.create({
    data: {
      email: input.email,
      ipAddress: input.ipAddress || null,
      role: input.role || null,
      status: input.status,
      userAgent: input.userAgent || null,
      userId: input.userId || null
    }
  });
}
