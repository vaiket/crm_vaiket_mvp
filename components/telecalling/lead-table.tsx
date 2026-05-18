"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Eye, FileText, History, MessageSquarePlus, MoreHorizontal, PhoneCall, Search, X } from "lucide-react";
import type { LeadPriority, TelecallingLead } from "@/types/telecalling";
import { callOutcomes, leadStatuses } from "@/lib/telecalling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppointmentBookingContent } from "@/components/telecalling/appointment-booking-modal";

type LeadFilter = "all" | "assigned" | "interested" | "callback" | "followup_today" | "converted" | "hot";
type LeadAction = "call" | "note" | "followup" | "appointment" | "status";
type SortKey = "assignedAt" | "followupDate" | "lastContactAt" | "priority";

const filters: Array<{ label: string; value: LeadFilter }> = [
  { label: "All", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "Interested", value: "interested" },
  { label: "Callback", value: "callback" },
  { label: "Followup Today", value: "followup_today" },
  { label: "Converted", value: "converted" },
  { label: "Hot", value: "hot" }
];

export function statusTone(status: string) {
  if (status === "converted") return "mint";
  if (status === "interested") return "blue";
  if (status === "appointment_booked") return "mint";
  if (status === "not_interested") return "danger";
  if (status === "callback" || status === "followup") return "amber";
  return "default";
}

export function priorityTone(priority: LeadPriority) {
  if (priority === "URGENT" || priority === "PAYMENT FOLLOWUP") return "danger";
  if (priority === "HOT") return "amber";
  if (priority === "WARM") return "blue";
  return "default";
}

export function formatDate(value: Date | string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function isToday(value: Date | string | null) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function sortValue(lead: TelecallingLead, sort: SortKey) {
  if (sort === "priority") return ["COLD", "WARM", "HOT", "PAYMENT FOLLOWUP", "URGENT"].indexOf(lead.priority);
  const value = lead[sort];
  return value ? new Date(value).getTime() : 0;
}

export function LeadTable({ leads, mode = "admin" }: { leads: TelecallingLead[]; mode?: "admin" | "telecaller" }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LeadFilter>("all");
  const [sort, setSort] = useState<SortKey>("followupDate");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<TelecallingLead | null>(null);
  const [openActionLeadId, setOpenActionLeadId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{ action: LeadAction; lead: TelecallingLead } | null>(null);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return leads
      .filter((lead) => `${lead.name} ${lead.phone} ${lead.email ?? ""}`.toLowerCase().includes(query.toLowerCase()))
      .filter((lead) => {
        if (filter === "all") return true;
        if (filter === "assigned") return lead.status === "assigned";
        if (filter === "interested") return lead.status === "interested";
        if (filter === "callback") return lead.status === "callback";
        if (filter === "followup_today") return isToday(lead.followupDate);
        if (filter === "converted") return lead.status === "converted";
        return lead.priority === "HOT" || lead.priority === "URGENT";
      })
      .sort((a, b) => sortValue(b, sort) - sortValue(a, sort));
  }, [filter, leads, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const tableHeaders = mode === "telecaller"
    ? ["Lead Name", "Phone", "Source", "Priority", "Status", "Assigned Date", "Last Contact", "Followup Date", "Notes"]
    : ["Lead Name", "Phone", "Source", "Priority", "Status", "Assigned Date", "Last Contact", "Followup Date", "Notes", "Actions"];

  return (
    <div className="space-y-4">
      {mode === "telecaller" ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white/[0.025] p-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3">
            <Search className="text-muted-foreground" size={16} />
            <Input className="border-0 bg-transparent" placeholder="Search by name, phone, email..." value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} />
          </div>
          <div className="dashboard-scrollbar flex gap-2 overflow-x-auto">
            {filters.map((item) => (
              <Button key={item.value} size="sm" variant={filter === item.value ? "default" : "outline"} onClick={() => { setFilter(item.value); setPage(1); }}>
                {item.label}
              </Button>
            ))}
          </div>
          <select className="h-9 rounded-xl border border-border bg-ink-900 px-3 text-xs font-semibold text-slate-200" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="followupDate">Sort followup</option>
            <option value="lastContactAt">Sort last contact</option>
            <option value="assignedAt">Sort assigned</option>
            <option value="priority">Sort priority</option>
          </select>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>
              {tableHeaders.map((head) => (
                <th className="px-4 py-3" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((lead) => (
              <tr className="cursor-pointer border-t border-border/70 transition hover:bg-white/[0.035]" key={lead.id} onClick={() => setSelectedLead(lead)}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.email ?? "No email"}</p>
                </td>
                <td className="min-w-[230px] px-4 py-3 font-semibold text-slate-300" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-between gap-3">
                    <span>{lead.phone}</span>
                    {mode === "telecaller" ? (
                      <Button
                        aria-label="Lead actions"
                        size="icon"
                        variant={openActionLeadId === lead.id ? "default" : "outline"}
                        onClick={() => setOpenActionLeadId((value) => value === lead.id ? null : lead.id)}
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    ) : null}
                  </div>
                  {mode === "telecaller" && openActionLeadId === lead.id ? (
                    <TelecallerActionPanel
                      lead={lead}
                      onAction={(action) => {
                        setActiveAction({ action, lead });
                        setOpenActionLeadId(null);
                      }}
                      onDetails={() => {
                        setSelectedLead(lead);
                        setOpenActionLeadId(null);
                      }}
                    />
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{lead.source ?? "-"}</td>
                <td className="px-4 py-3"><Badge variant={priorityTone(lead.priority)}>{lead.priority}</Badge></td>
                <td className="px-4 py-3"><Badge variant={statusTone(lead.status)}>{lead.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.assignedAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.lastContactAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.followupDate)}</td>
                <td className="px-4 py-3"><Badge variant="default">{lead.notesCount}</Badge></td>
                {mode === "admin" ? (
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <Badge variant={lead.assignedTo ? "mint" : "amber"}>{lead.assignedTo ? "Assigned" : "Unassigned"}</Badge>
                  </td>
                ) : null}
              </tr>
            ))}
            {!paged.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={tableHeaders.length}>Koi lead nahi mila.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {mode === "telecaller" ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {paged.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <Button disabled={page <= 1} size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</Button>
            <Button disabled={page >= totalPages} size="sm" variant="outline" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
          </div>
        </div>
      ) : null}

      <LeadDetailsDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
      <LeadActionDialog actionState={activeAction} onClose={() => setActiveAction(null)} />
    </div>
  );
}

function TelecallerActionPanel({ onAction, onDetails }: { lead: TelecallingLead; onAction: (action: LeadAction) => void; onDetails: () => void }) {
  return (
    <div className="mt-3 grid w-[210px] grid-cols-2 gap-2 rounded-lg border border-border bg-ink-950/95 p-2 shadow-panel">
      <ActionPanelButton icon={<PhoneCall size={14} />} label="Call" onClick={() => onAction("call")} />
      <ActionPanelButton icon={<MessageSquarePlus size={14} />} label="Add Note" onClick={() => onAction("note")} />
      <ActionPanelButton icon={<CalendarClock size={14} />} label="Followup" onClick={() => onAction("followup")} />
      <Button className="col-span-2 justify-center border-primary/70 text-white shadow-[0_0_0_1px_rgba(20,184,166,0.35)]" size="sm" variant="outline" onClick={() => onAction("appointment")}>
        <CalendarClock size={14} /> Book Appointment
      </Button>
      <ActionPanelButton icon={<CheckCircle2 size={14} />} label="Status" onClick={() => onAction("status")} />
      <Button size="sm" variant="outline" onClick={onDetails}><Eye size={14} /> Details</Button>
    </div>
  );
}

function ActionPanelButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <Button size="sm" variant="outline" onClick={onClick}>{icon} {label}</Button>;
}

function LeadActionDialog({ actionState, onClose }: { actionState: { action: LeadAction; lead: TelecallingLead } | null; onClose: () => void }) {
  const lead = actionState?.lead ?? null;

  return (
    <Dialog open={Boolean(actionState)} onOpenChange={(open) => { if (!open) onClose(); }}>
      {lead && actionState?.action === "call" ? <CallOutcomeContent lead={lead} /> : null}
      {lead && actionState?.action === "note" ? <TextActionContent action="Add Note" lead={lead} payloadKey="note" placeholder="Customer conversation note" /> : null}
      {lead && actionState?.action === "followup" ? <FollowupContent lead={lead} /> : null}
      {lead && actionState?.action === "appointment" ? <AppointmentBookingContent lead={lead} /> : null}
      {lead && actionState?.action === "status" ? <StatusContent lead={lead} /> : null}
    </Dialog>
  );
}

function saveLeadAction(leadId: string, payload: Record<string, unknown>) {
  return fetch(`/api/telecaller/leads/${leadId}`, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "PATCH"
  });
}

function CallOutcomeContent({ lead }: { lead: TelecallingLead }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(outcome: string) {
    setMessage("");
    startTransition(async () => {
      const response = await saveLeadAction(lead.id, {
        durationSeconds: 0,
        outcome,
        status: outcome === "Interested" ? "interested" : outcome === "Converted" ? "converted" : outcome === "Callback Requested" ? "callback" : outcome === "Not Interested" ? "not_interested" : lead.status
      });
      setMessage(response.ok ? "Call outcome saved." : "Save failed.");
    });
  }

  return (
    <DialogContent>
      <DialogTitle className="text-xl font-semibold text-white">Call Outcome</DialogTitle>
      <DialogDescription className="mt-1 text-sm text-muted-foreground">{lead.name} ke call ka result save karein.</DialogDescription>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {callOutcomes.map((outcome) => (
          <Button disabled={isPending} key={outcome} variant={outcome === "Converted" ? "default" : "outline"} onClick={() => submit(outcome)}>
            {outcome}
          </Button>
        ))}
      </div>
      {message ? <p className="mt-3 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
    </DialogContent>
  );
}

function FollowupContent({ lead }: { lead: TelecallingLead }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await saveLeadAction(lead.id, {
        followupDate: String(formData.get("followupDate") ?? ""),
        followupType: String(formData.get("followupType") ?? "call"),
        note: String(formData.get("note") ?? ""),
        status: "followup"
      });
      setMessage(response.ok ? "Followup scheduled." : "Schedule failed.");
    });
  }

  return (
    <DialogContent>
      <DialogTitle className="text-xl font-semibold text-white">Schedule Followup</DialogTitle>
      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <Input name="followupDate" required type="datetime-local" />
        <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" name="followupType">
          <option value="call">Call</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="payment">Payment followup</option>
          <option value="pricing">Pricing discussion</option>
        </select>
        <Input name="note" placeholder="Followup note" />
        {message ? <p className="rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
        <div className="flex justify-end"><Button disabled={isPending} type="submit">Schedule</Button></div>
      </form>
    </DialogContent>
  );
}

function StatusContent({ lead }: { lead: TelecallingLead }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await saveLeadAction(lead.id, {
        note: String(formData.get("note") ?? ""),
        status: String(formData.get("status") ?? lead.status)
      });
      setMessage(response.ok ? "Status updated." : "Update failed.");
    });
  }

  return (
    <DialogContent>
      <DialogTitle className="text-xl font-semibold text-white">Update Status</DialogTitle>
      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" defaultValue={lead.status} name="status">
          {leadStatuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
        </select>
        <Input name="note" placeholder="Status note optional" />
        {message ? <p className="rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
        <div className="flex justify-end"><Button disabled={isPending} type="submit">Save</Button></div>
      </form>
    </DialogContent>
  );
}

function TextActionContent({ action, lead, payloadKey, placeholder }: { action: string; lead: TelecallingLead; payloadKey: string; placeholder: string }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await saveLeadAction(lead.id, { [payloadKey]: String(formData.get("value") ?? "") });
      setMessage(response.ok ? "Saved." : "Save failed.");
    });
  }

  return (
    <DialogContent>
      <DialogTitle className="text-xl font-semibold text-white">{action}</DialogTitle>
      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <Input name="value" placeholder={placeholder} required />
        {message ? <p className="rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
        <div className="flex justify-end"><Button disabled={isPending} type="submit">Save</Button></div>
      </form>
    </DialogContent>
  );
}

export function LeadDetailsDrawer({ lead, onClose }: { lead: TelecallingLead | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {lead ? (
        <motion.aside
          animate={{ x: 0 }}
          className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-border bg-ink-950/96 p-5 shadow-panel backdrop-blur-xl"
          exit={{ x: "100%" }}
          initial={{ x: "100%" }}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <Badge variant={priorityTone(lead.priority)}>{lead.priority}</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-white">{lead.name}</h2>
              <p className="text-sm text-muted-foreground">{lead.phone} · {lead.email ?? "No email"}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}><X size={16} /></Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Source", lead.source ?? "-"],
              ["Status", lead.status.replace("_", " ")],
              ["Assigned", formatDate(lead.assignedAt)],
              ["Last Contact", formatDate(lead.lastContactAt)],
              ["Followup", formatDate(lead.followupDate)],
              ["Notes", String(lead.notesCount)]
            ].map(([label, value]) => (
              <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={label}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-1 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <section className="mt-5 space-y-4">
            <TimelineSection icon={<FileText size={16} />} items={lead.noteTimeline.map((note) => ({ detail: note.note, time: note.createdAt, title: "Note" }))} title="Notes Timeline" />
            <TimelineSection icon={<PhoneCall size={16} />} items={lead.callLogs.map((call) => ({ detail: `${call.outcome}${call.notes ? ` · ${call.notes}` : ""}`, time: call.createdAt, title: "Call" }))} title="Call History" />
            <TimelineSection icon={<History size={16} />} items={lead.statusHistory.map((entry) => ({ detail: `${entry.fromStatus ?? "new"} -> ${entry.toStatus}${entry.note ? ` · ${entry.note}` : ""}`, time: entry.createdAt, title: "Status Change" }))} title="Status History" />
          </section>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function TimelineSection({ icon, items, title }: { icon: React.ReactNode; items: Array<{ detail: string; time: Date | string; title: string }>; title: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.025] p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">{icon} {title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={`${title}-${index}`}>
            <p className="text-xs text-blue-200/70">{new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(item.time))} - {item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
        {!items.length ? <p className="text-sm text-muted-foreground">No records yet.</p> : null}
      </div>
    </div>
  );
}
