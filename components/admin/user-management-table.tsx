"use client";

import { useMemo, useState, useTransition } from "react";
import { KeyRound, Plus, Save, Search, UserRound } from "lucide-react";
import { formatRole } from "@/lib/telecalling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StaffUser = {
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  role: string;
};

export function UserManagementTable({ users }: { users: StaffUser[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    return users
      .filter((user) => `${user.name} ${user.email} ${user.phone ?? ""} ${user.role}`.toLowerCase().includes(query.toLowerCase()))
      .filter((user) => status === "all" || (status === "active" ? user.isActive : !user.isActive));
  }, [query, status, users]);

  return (
    <Tabs defaultValue="admin">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsList>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="telecaller">Telecallers</TabsTrigger>
        </TabsList>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3">
            <Search className="text-muted-foreground" size={16} />
            <Input className="border-0 bg-transparent" placeholder="Search users..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <select className="h-10 rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={status} onChange={(event) => setStatus(event.target.value as "all" | "active" | "inactive")}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <CreateUserDialog />
        </div>
      </div>

      {(["admin", "finance", "telecaller"] as const).map((role) => (
        <TabsContent className="mt-4" key={role} value={role}>
          <StaffTable users={filtered.filter((user) => user.role === role)} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StaffTable({ users }: { users: StaffUser[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
          <tr>{["Name", "Email", "Phone", "Role", "Status", "Actions"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}</tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr className="border-t border-border/70 transition hover:bg-white/[0.035]" key={user.id}>
              <td className="px-4 py-3 font-semibold text-white">{user.name}</td>
              <td className="px-4 py-3 text-slate-300">{user.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.phone ?? "-"}</td>
              <td className="px-4 py-3"><Badge variant={user.role === "admin" ? "mint" : "blue"}>{formatRole(user.role)}</Badge></td>
              <td className="px-4 py-3"><Badge variant={user.isActive ? "mint" : "amber"}>{user.isActive ? "Active" : "Inactive"}</Badge></td>
              <td className="px-4 py-3"><EditUserDialog user={user} /></td>
            </tr>
          ))}
          {!users.length ? <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>Koi user nahi mila.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function CreateUserDialog() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    startTransition(async () => {
      const response = await fetch("/api/user-management", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(response.ok ? "User create ho gaya. Page refresh karein." : result.error ?? "Create failed.");
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild><Button><Plus size={16} /> Create User</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Create Staff User</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">Admin ya telecaller account Supabase Auth me create hoga.</DialogDescription>
        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input name="name" placeholder="Name" required />
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="phone" placeholder="Phone" />
          <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" name="role" required>
            <option value="admin">Admin</option>
            <option value="finance">Finance</option>
            <option value="telecaller">Telecaller</option>
          </select>
          <Input className="md:col-span-2" name="password" placeholder="Temporary password" required type="text" />
          {message ? <p className="md:col-span-2 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
          <div className="md:col-span-2 flex justify-end"><Button disabled={isPending} type="submit"><UserRound size={16} /> Create</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ user }: { user: StaffUser }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      isActive: formData.get("isActive") === "on",
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      role: String(formData.get("role") ?? user.role)
    };

    startTransition(async () => {
      const response = await fetch(`/api/user-management/${user.id}`, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(response.ok ? "User update ho gaya. Page refresh karein." : result.error ?? "Update failed.");
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Save size={14} /> Edit</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Edit User</DialogTitle>
        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input defaultValue={user.name} name="name" required />
          <Input defaultValue={user.email} name="email" required type="email" />
          <Input defaultValue={user.phone ?? ""} name="phone" />
          <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" defaultValue={user.role} name="role">
            <option value="admin">Admin</option>
            <option value="finance">Finance</option>
            <option value="telecaller">Telecaller</option>
          </select>
          <Input className="md:col-span-2" name="password" placeholder="Reset password optional" type="text" />
          <label className="md:col-span-2 flex items-center gap-2 rounded-lg border border-border bg-white/[0.025] p-3 text-sm text-slate-300">
            <input defaultChecked={user.isActive} name="isActive" type="checkbox" />
            Active account
          </label>
          {message ? <p className="md:col-span-2 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
          <div className="md:col-span-2 flex justify-end"><Button disabled={isPending} type="submit"><KeyRound size={16} /> Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
