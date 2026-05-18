"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type CallRow = {
  createdAt: Date;
  durationSeconds: number | null;
  id: string;
  lead: { name: string; phone: string };
  notes: string | null;
  outcome: string;
};

export function CallHistoryTable({ rows }: { rows: CallRow[] }) {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");
  const filtered = useMemo(() => rows.filter((row) => `${row.lead.name} ${row.lead.phone} ${row.outcome}`.toLowerCase().includes(query.toLowerCase())).filter((row) => outcome === "all" || row.outcome === outcome), [outcome, query, rows]);
  const outcomes = Array.from(new Set(rows.map((row) => row.outcome)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white/[0.025] p-3 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3">
          <Search className="text-muted-foreground" size={16} />
          <Input className="border-0 bg-transparent" placeholder="Search lead, phone, outcome..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <select className="h-10 rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={outcome} onChange={(event) => setOutcome(event.target.value)}>
          <option value="all">All outcomes</option>
          {outcomes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>{["Lead", "Phone", "Outcome", "Duration", "Timestamp", "Notes"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr className="border-t border-border/70" key={row.id}>
                <td className="px-4 py-3 font-semibold text-white">{row.lead.name}</td>
                <td className="px-4 py-3 text-slate-300">{row.lead.phone}</td>
                <td className="px-4 py-3"><Badge variant="blue">{row.outcome}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{row.durationSeconds ? `${Math.round(row.durationSeconds / 60)}m` : "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(row.createdAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.notes ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
