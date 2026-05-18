"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Search, XCircle } from "lucide-react";
import type { AppointmentRow } from "@/types/telecalling";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type StaffOption = {
  authUserId: string;
  name: string;
};

const statuses = ["scheduled", "confirmed", "completed", "cancelled", "rescheduled", "no_show"] as const;

function statusTone(status: string) {
  if (status === "completed") return "mint";
  if (status === "cancelled" || status === "no_show") return "danger";
  if (status === "confirmed") return "blue";
  if (status === "rescheduled") return "amber";
  return "default";
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export function AppointmentTable({ appointments, staff }: { appointments: AppointmentRow[]; staff: StaffOption[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [telecallerId, setTelecallerId] = useState("all");

  const filtered = useMemo(() => {
    return appointments
      .filter((item) => `${item.customerName} ${item.customerPhone} ${item.assigneeName} ${item.status}`.toLowerCase().includes(query.toLowerCase()))
      .filter((item) => status === "all" || item.status === status)
      .filter((item) => telecallerId === "all" || item.assignedTo === telecallerId);
  }, [appointments, query, status, telecallerId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white/[0.025] p-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3">
          <Search className="text-muted-foreground" size={16} />
          <Input className="border-0 bg-transparent" placeholder="Search appointment, phone, assignee..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <select className="h-10 rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All status</option>
          {statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
        </select>
        <select className="h-10 rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={telecallerId} onChange={(event) => setTelecallerId(event.target.value)}>
          <option value="all">All telecallers</option>
          {staff.map((member) => <option key={member.authUserId} value={member.authUserId}>{member.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>{["Customer", "Phone", "Date", "Time", "Type", "Mode", "Assignee", "Status", "Actions"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((appointment) => (
              <tr className="border-t border-border/70 transition hover:bg-white/[0.035]" key={appointment.id}>
                <td className="px-4 py-3 font-semibold text-white">{appointment.customerName}</td>
                <td className="px-4 py-3 text-slate-300">{appointment.customerPhone}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(appointment.appointmentDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{appointment.appointmentTime}</td>
                <td className="px-4 py-3 text-slate-300">{appointment.appointmentType}</td>
                <td className="px-4 py-3 text-muted-foreground">{appointment.meetingMode}</td>
                <td className="px-4 py-3 text-slate-300">{appointment.assigneeName}</td>
                <td className="px-4 py-3"><Badge variant={statusTone(appointment.status)}>{appointment.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3"><AppointmentActions appointment={appointment} /></td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={9}>Koi appointment nahi mila.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AppointmentActions({ appointment }: { appointment: AppointmentRow }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(payload: Record<string, unknown>) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      setMessage(response.ok ? "Updated." : ((await response.json().catch(() => ({}))) as { error?: string }).error ?? "Update failed.");
      if (response.ok) router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm" variant="outline">Manage</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Manage Appointment</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">{appointment.customerName} with {appointment.assigneeName}</DialogDescription>
        <div className="mt-5 grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button disabled={isPending} variant="outline" onClick={() => update({ status: "completed" })}><CheckCircle2 size={15} /> Complete</Button>
            <Button disabled={isPending} variant="outline" onClick={() => update({ status: "no_show" })}><XCircle size={15} /> No show</Button>
          </div>
          <RescheduleForm disabled={isPending} onSubmit={update} />
          <CancelForm disabled={isPending} onSubmit={update} />
          {message ? <p className="rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (payload: Record<string, unknown>) => void }) {
  return (
    <form
      className="grid gap-2 rounded-lg border border-border bg-white/[0.025] p-3 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit({
          appointmentDate: String(formData.get("appointmentDate") ?? ""),
          appointmentTime: String(formData.get("appointmentTime") ?? ""),
          status: "rescheduled"
        });
      }}
    >
      <Input name="appointmentDate" required type="date" />
      <Input name="appointmentTime" required type="time" />
      <Button disabled={disabled} type="submit"><CalendarClock size={15} /> Reschedule</Button>
    </form>
  );
}

function CancelForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (payload: Record<string, unknown>) => void }) {
  return (
    <form
      className="grid gap-2 rounded-lg border border-border bg-white/[0.025] p-3 sm:grid-cols-[1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit({ cancellationReason: String(formData.get("cancellationReason") ?? ""), status: "cancelled" });
      }}
    >
      <Input name="cancellationReason" placeholder="Cancellation reason" required />
      <Button disabled={disabled} type="submit" variant="outline"><XCircle size={15} /> Cancel</Button>
    </form>
  );
}
