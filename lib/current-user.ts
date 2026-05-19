import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { impersonationCookieName } from "@/lib/auth-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/telecalling";

export type CurrentProfile = {
  authUserId: string;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  role: AppRole;
};

function normalizeRole(role: string): AppRole {
  const value = role.trim().toLowerCase().replaceAll(" ", "_");

  if (value === "super_admin") return "super_admin";
  if (value === "admin") return "admin";
  if (value === "finance") return "finance";
  if (value === "telecaller") return "telecaller";

  return "telecaller";
}

function toCurrentProfile(profile: {
  authUserId: string;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  role: string;
}): CurrentProfile {
  return {
    authUserId: profile.authUserId,
    email: profile.email,
    id: profile.id,
    isActive: profile.isActive,
    name: profile.name,
    phone: profile.phone,
    role: normalizeRole(profile.role)
  };
}

export async function getAuthenticatedProfile(): Promise<CurrentProfile | null> {
  const supabase = await createSupabaseServerClient({ readOnly: true }).catch((error) => {
    console.error("Supabase server client creation failed", error);
    return null;
  });

  if (!supabase) return null;

  const {
    data: { user },
    error
  } = await supabase.auth.getUser().catch((error) => {
    console.error("Supabase user lookup failed", error);
    return { data: { user: null }, error };
  });

  if (error || !user) return null;

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } }).catch((error) => {
    console.error("Profile lookup failed", error);
    return null;
  });

  if (!profile || !profile.isActive) return null;

  return toCurrentProfile(profile);
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const profile = await getAuthenticatedProfile().catch((error) => {
    console.error("Authenticated profile lookup failed", error);
    return null;
  });
  if (!profile) return null;

  const cookieStore = await cookies();
  const impersonatedAuthUserId = cookieStore.get(impersonationCookieName)?.value;

  if (profile.role !== "super_admin" || !impersonatedAuthUserId) {
    return profile;
  }

  const impersonatedProfile = await prisma.profile.findUnique({ where: { authUserId: impersonatedAuthUserId } }).catch((error) => {
    console.error("Impersonated profile lookup failed", error);
    return null;
  });

  if (!impersonatedProfile || !impersonatedProfile.isActive || impersonatedProfile.role !== "telecaller") {
    return profile;
  }

  return toCurrentProfile(impersonatedProfile);
}

export function requireRole(profile: CurrentProfile | null, roles: AppRole[]) {
  return Boolean(profile && roles.includes(profile.role));
}
