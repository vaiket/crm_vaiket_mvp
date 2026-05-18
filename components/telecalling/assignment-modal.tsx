"use client";

import { useMemo, useState, useTransition } from "react";
import type { TelecallingLead } from "@/types/telecalling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Telecaller = {
  authUserId: string;
  id: string;
  isActive: boolean;
  name: string;
};

export function AssignmentPanel({ leads, telecallers }: { leads: TelecallingLead[]; telecallers: Telecaller[] }) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [telecallerId, setTelecallerId] = useState("");
  const [mode, setMode] = useState<"manual" | "equal">("manual");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeTelecallers = telecallers.filter((item) => item.isActive);
  const unassigned = useMemo(() => leads.filter((lead) => !lead.assignedTo), [leads]);

  function toggleLead(id: string) {
    setSelectedLeadIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function assign() {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/lead-assignments", {
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          mode,
          telecallerId,
          telecallerIds: activeTelecallers.map((item) => item.authUserId)
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      setMessage(response.ok ? "Assignment complete. Page refresh karein." : ((await response.json()) as { error?: string }).error ?? "Assignment failed.");
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>
              {["Select", "Lead", "Phone", "Source", "Status"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr className="border-t border-border/70" key={lead.id}>
                <td className="px-4 py-3">
                  <input checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLead(lead.id)} type="checkbox" />
                </td>
                <td className="px-4 py-3 font-semibold text-white">{lead.name}</td>
                <td className="px-4 py-3 text-slate-300">{lead.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.source ?? "-"}</td>
                <td className="px-4 py-3"><Badge variant={lead.assignedTo ? "mint" : "amber"}>{lead.assignedTo ? "Assigned" : "Unassigned"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="rounded-xl border border-border bg-white/[0.025] p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Lead Distribution</h3>
          <Badge variant="blue">{unassigned.length} unassigned</Badge>
        </div>
        <div className="mt-4 space-y-3">
          <select className="h-10 w-full rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={mode} onChange={(event) => setMode(event.target.value as "manual" | "equal")}>
            <option value="manual">Manual assignment</option>
            <option value="equal">Equal distribution</option>
          </select>
          {mode === "manual" ? (
            <select className="h-10 w-full rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={telecallerId} onChange={(event) => setTelecallerId(event.target.value)}>
              <option value="">Select telecaller</option>
              {activeTelecallers.map((telecaller) => (
                <option key={telecaller.authUserId} value={telecaller.authUserId}>{telecaller.name}</option>
              ))}
            </select>
          ) : (
            <div className="rounded-xl border border-border bg-white/[0.025] p-3 text-sm text-muted-foreground">
              {selectedLeadIds.length || 0} leads will be split across {activeTelecallers.length} active telecallers.
            </div>
          )}
          <Button className="w-full" disabled={isPending || !selectedLeadIds.length} onClick={assign}>Assign Leads</Button>
          {message ? <p className="rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
        </div>
      </aside>
    </div>
  );
}
