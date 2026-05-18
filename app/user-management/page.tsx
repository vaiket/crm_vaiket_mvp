import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    where: { role: { in: ["admin", "finance", "telecaller"] } }
  });
  const admins = users.filter((user) => user.role === "admin").length;
  const finance = users.filter((user) => user.role === "finance").length;
  const telecallers = users.filter((user) => user.role === "telecaller").length;
  const active = users.filter((user) => user.isActive).length;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Staff Access</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">User Management</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Super admin-only control for admin and telecaller access.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admins</p><p className="mt-2 text-2xl font-semibold text-white">{admins}</p></div><ShieldCheck className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Finance</p><p className="mt-2 text-2xl font-semibold text-white">{finance}</p></div><ShieldCheck className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Telecallers</p><p className="mt-2 text-2xl font-semibold text-white">{telecallers}</p></div><UsersRound className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Users</p><p className="mt-2 text-2xl font-semibold text-white">{active}</p></div><UserRound className="text-primary" /></CardContent></Card>
      </section>
      <UserManagementTable users={users} />
    </div>
  );
}
