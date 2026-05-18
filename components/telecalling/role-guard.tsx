import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { getDefaultPath } from "@/lib/rbac";
import type { AppRole } from "@/types/telecalling";

export async function RoleGuard({ children, roles }: { children: React.ReactNode; roles: AppRole[] }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!roles.includes(profile.role)) {
    redirect(getDefaultPath(profile.role));
  }

  return children;
}
