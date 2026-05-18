import { Activity, CheckCircle2, Copy, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatLastLogin(value: Date | null) {
  if (!value) return "Not logged in";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      id: true,
      lastLoginAt: true,
      name: true,
      role: true,
      status: true
    },
    take: 20
  });
}

async function getLoginAudits() {
  return prisma.loginAudit.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      email: true,
      id: true,
      ipAddress: true,
      role: true,
      status: true
    },
    take: 12
  });
}

export default async function SuperAdminPage() {
  const [users, loginAudits] = await Promise.all([getUsers(), getLoginAudits()]);

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
            <Badge variant="mint">Super admin</Badge>
            <Badge variant="blue">Login ID control</Badge>
              <Badge variant="violet">Database backed</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px] md:leading-tight">Admin Control</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground md:text-base">
              New staff login ID create karne, role assign karne aur temporary password save karne ka Prisma-backed flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Copy size={16} /> Copy demo access
            </Button>
            <Button>
              <Plus size={16} /> New Login ID
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
          { icon: UsersRound, label: "Total Users", value: String(users.length), tone: "text-primary" },
          { icon: ShieldCheck, label: "Admin Roles", value: String(users.filter((user) => user.role.includes("Admin")).length), tone: "text-skyline" },
          { icon: Activity, label: "Active Sessions", value: "68", tone: "text-violet-300" },
          { icon: CheckCircle2, label: "System Health", value: "99.98%", tone: "text-primary" }
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
              <metric.icon className={metric.tone} size={24} />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[430px_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Create New Login ID</CardTitle>
              <CardDescription>Form submit karne par user database me create hoga.</CardDescription>
            </div>
            <Badge variant="mint">Ready</Badge>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Created Login IDs</CardTitle>
              <CardDescription>Database se latest staff login accounts.</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <ShieldCheck size={14} /> Permissions
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
                <tr>
                  {["User", "Role", "Login ID", "Last Login", "Status"].map((head) => (
                    <th className="px-4 py-3" key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr className="border-t border-border transition hover:bg-white/[0.035]" key={user.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">
                          {initials(user.name)}
                        </div>
                        <span className="font-bold text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="blue">{user.role}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatLastLogin(user.lastLoginAt)}</td>
                    <td className="px-4 py-3"><Badge variant={user.status === "Active" ? "mint" : "amber"}>{user.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Login Records</CardTitle>
            <CardDescription>Har successful aur failed login attempt database me save ho raha hai.</CardDescription>
          </div>
          <Badge variant="blue">Audit trail</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
              <tr>
                {["Login ID", "Role", "Status", "IP", "Time"].map((head) => (
                  <th className="px-4 py-3" key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loginAudits.map((audit) => (
                <tr className="border-t border-border transition hover:bg-white/[0.035]" key={audit.id}>
                  <td className="px-4 py-3 font-semibold text-slate-300">{audit.email}</td>
                  <td className="px-4 py-3"><Badge variant="blue">{audit.role ?? "Unknown"}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={audit.status === "SUCCESS" ? "mint" : "danger"}>{audit.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{audit.ipAddress ?? "Not captured"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatLastLogin(audit.createdAt)}</td>
                </tr>
              ))}
              {!loginAudits.length ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>Abhi koi login record nahi mila.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
