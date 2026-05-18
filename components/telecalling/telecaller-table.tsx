"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn, Plus, Save, Search, UserRound } from "lucide-react";
import { formatRole } from "@/lib/telecalling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Telecaller = {
  appointmentsCount?: number;
  assignedLeadsCount?: number;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  role: string;
};

export function TelecallerTable({ canImpersonate = false, telecallers }: { canImpersonate?: boolean; telecallers: Telecaller[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => telecallers.filter((item) => `${item.name} ${item.email} ${item.phone ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [query, telecallers]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3 md:max-w-md">
          <Search className="text-muted-foreground" size={16} />
          <Input className="border-0 bg-transparent" placeholder="Search telecaller..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <CreateTelecallerDialog />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>
              {["Name", "Email", "Phone", "Role", "Status", "Assigned", "Appointments", "Actions"].map((head) => (
                <th className="px-4 py-3" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((telecaller) => (
              <tr className="border-t border-border/70 transition hover:bg-white/[0.035]" key={telecaller.id}>
                <td className="px-4 py-3 font-semibold text-white">{telecaller.name}</td>
                <td className="px-4 py-3 text-slate-300">{telecaller.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{telecaller.phone ?? "-"}</td>
                <td className="px-4 py-3"><Badge variant="blue">{formatRole(telecaller.role)}</Badge></td>
                <td className="px-4 py-3"><Badge variant={telecaller.isActive ? "mint" : "amber"}>{telecaller.isActive ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3 text-slate-300">{telecaller.assignedLeadsCount ?? 0}</td>
                <td className="px-4 py-3 text-slate-300">{telecaller.appointmentsCount ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {canImpersonate ? <LoginAsTelecallerButton telecaller={telecaller} /> : null}
                    <EditTelecallerDialog telecaller={telecaller} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoginAsTelecallerButton({ telecaller }: { telecaller: Telecaller }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending || !telecaller.isActive}
      size="sm"
      variant="outline"
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(`/api/telecallers/${telecaller.id}/impersonate`, { method: "POST" });
          const result = (await response.json()) as { redirectTo?: string };
          if (response.ok) {
            router.replace(result.redirectTo ?? "/telecaller/dashboard");
            router.refresh();
          }
        });
      }}
    >
      <LogIn size={14} /> {isPending ? "Opening..." : "Login as"}
    </Button>
  );
}

function CreateTelecallerDialog() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    startTransition(async () => {
      const response = await fetch("/api/telecallers", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      setMessage(response.ok ? "Telecaller create ho gaya. Page refresh karein." : ((await response.json()) as { error?: string }).error ?? "Create failed.");
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><Plus size={16} /> Create Telecaller</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Create Telecaller</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">Supabase Auth user aur profile dono create honge.</DialogDescription>
        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input name="name" placeholder="Name" required />
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="phone" placeholder="Phone" />
          <Input name="password" placeholder="Temporary password" required type="text" />
          <input name="role" type="hidden" value="telecaller" />
          {message ? <p className="md:col-span-2 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
          <div className="md:col-span-2 flex justify-end">
            <Button disabled={isPending} type="submit"><UserRound size={16} /> Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTelecallerDialog({ telecaller }: { telecaller: Telecaller }) {
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
      phone: String(formData.get("phone") ?? "")
    };

    startTransition(async () => {
      const response = await fetch(`/api/telecallers/${telecaller.id}`, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });

      setMessage(response.ok ? "Telecaller update ho gaya. Page refresh karein." : "Update failed.");
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Save size={14} /> Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Edit Telecaller</DialogTitle>
        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input defaultValue={telecaller.name} name="name" required />
          <Input defaultValue={telecaller.email} name="email" required type="email" />
          <Input defaultValue={telecaller.phone ?? ""} name="phone" />
          <Input name="password" placeholder="Reset password optional" type="text" />
          <label className="md:col-span-2 flex items-center gap-2 rounded-lg border border-border bg-white/[0.025] p-3 text-sm text-slate-300">
            <input defaultChecked={telecaller.isActive} name="isActive" type="checkbox" />
            Active account
          </label>
          {message ? <p className="md:col-span-2 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
          <div className="md:col-span-2 flex justify-end">
            <Button disabled={isPending} type="submit"><KeyRound size={16} /> Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
