"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const demoId = "superadmin@teamforce.in";
const demoPassword = "Admin@123";

export function LoginForm({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Login failed.");
        return;
      }

      const result = (await response.json()) as { redirectTo?: string };
      router.replace(result.redirectTo ?? nextPath ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
          <UserRound size={14} /> Demo ID
        </span>
        <Input defaultValue={demoId} name="email" type="email" />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
          <LockKeyhole size={14} /> Demo Password
        </span>
        <div className="relative">
          <Input className="pr-11" defaultValue={demoPassword} name="password" type="text" />
          <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        </div>
      </label>

      <div className="rounded-xl border border-border bg-white/[0.035] p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">ID</span>
          <span className="font-bold text-white">{demoId}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Password</span>
          <span className="font-bold text-white">{demoPassword}</span>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <Button className="h-11 w-full" disabled={isPending} type="submit">
        {isPending ? "Logging in..." : "Login"} <ArrowRight size={16} />
      </Button>
    </form>
  );
}
