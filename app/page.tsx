import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { getDefaultPath } from "@/lib/rbac";

export default async function Page() {
  const currentUser = await getCurrentProfile();
  redirect(currentUser ? getDefaultPath(currentUser.role) : "/login");
}
