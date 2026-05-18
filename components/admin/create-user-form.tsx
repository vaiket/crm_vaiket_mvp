"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Plus, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roles } from "@/data/crm";

export function CreateUserForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "Admin"),
      staffCode: String(formData.get("staffCode") ?? "")
    };

    startTransition(async () => {
      const response = await fetch("/api/admin/users", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "User create nahi ho paya.");
        return;
      }

      setMessage("Login ID create ho gaya.");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
          <UserRound size={14} /> Staff Name
        </span>
        <Input defaultValue="Neha Verma" name="name" placeholder="Staff name" />
      </label>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
          <Mail size={14} /> Login ID / Email
        </span>
        <Input defaultValue="neha@teamforce.in" name="email" placeholder="name@company.in" type="email" />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
            <ShieldCheck size={14} /> Role
          </span>
          <select className="h-10 w-full rounded-xl border border-input bg-white/[0.025] px-3 text-sm text-slate-100 transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15" name="role">
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
            <KeyRound size={14} /> Staff Code
          </span>
          <Input defaultValue="TF-ADM-0249" name="staffCode" />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
          <KeyRound size={14} /> Temporary Password
        </span>
        <Input defaultValue="Welcome@123" name="password" type="text" />
      </label>
      <div className="grid gap-3 rounded-lg border border-border bg-white/[0.025] p-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Demo ID</p>
          <p className="mt-1 font-bold text-white">neha@teamforce.in</p>
        </div>
        <div>
          <p className="text-muted-foreground">Demo Password</p>
          <p className="mt-1 font-bold text-white">Welcome@123</p>
        </div>
      </div>
      {message ? <p className="rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="reset">Reset</Button>
        <Button disabled={isPending} type="submit">
          <Plus size={16} /> {isPending ? "Creating..." : "Create ID"}
        </Button>
      </div>
    </form>
  );
}
