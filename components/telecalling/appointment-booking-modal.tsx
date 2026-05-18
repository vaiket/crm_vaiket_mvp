"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import type { TelecallingLead } from "@/types/telecalling";
import { appointmentTypes, meetingModes } from "@/lib/telecalling";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type StaffOption = {
  authUserId: string;
  name: string;
};

export function AppointmentBookingModal({ className, lead, staff = [] }: { className?: string; lead: TelecallingLead; staff?: StaffOption[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className} size="sm" variant="outline"><CalendarPlus size={14} /> Book Appointment</Button>
      </DialogTrigger>
      <AppointmentBookingContent lead={lead} staff={staff} />
    </Dialog>
  );
}

export function AppointmentBookingContent({ lead, staff = [] }: { lead: TelecallingLead; staff?: StaffOption[] }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      appointmentDate: String(formData.get("appointmentDate") ?? ""),
      appointmentTime: String(formData.get("appointmentTime") ?? ""),
      appointmentType: String(formData.get("appointmentType") ?? ""),
      assignedTo: String(formData.get("assignedTo") ?? "") || undefined,
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      leadId: lead.id,
      meetingMode: String(formData.get("meetingMode") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      reminderEnabled: formData.get("reminderEnabled") === "on"
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/appointments", {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });

        const result = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setMessage(result.error ?? "Booking failed. Database setup ya login check karein.");
          return;
        }

        setMessage("Appointment booked.");
        router.refresh();
      } catch {
        setMessage("Booking failed. Network ya server response check karein.");
      }
    });
  }

  return (
    <DialogContent>
      <DialogTitle className="text-xl font-semibold text-white">Book Appointment</DialogTitle>
      <DialogDescription className="mt-1 text-sm text-muted-foreground">Interested customer ke liye appointment schedule karein.</DialogDescription>
      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <Input defaultValue={lead.name} name="customerName" placeholder="Customer Name" required />
        <Input defaultValue={lead.phone} name="customerPhone" placeholder="Phone Number" required />
        <Input defaultValue={lead.id} name="leadIdDisplay" readOnly />
        <Input name="appointmentDate" required type="date" />
        <Input name="appointmentTime" required type="time" />
        <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" name="appointmentType" required>
          {appointmentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" name="meetingMode" required>
          {meetingModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
        <select className="h-10 rounded-xl border border-input bg-ink-900 px-3 text-sm text-slate-100" name="assignedTo">
          <option value="">Assign to me</option>
          {staff.map((member) => <option key={member.authUserId} value={member.authUserId}>{member.name}</option>)}
        </select>
        <Input className="md:col-span-2" name="notes" placeholder="Notes" />
        <label className="md:col-span-2 flex items-center gap-2 rounded-lg border border-border bg-white/[0.025] p-3 text-sm text-slate-300">
          <input defaultChecked name="reminderEnabled" type="checkbox" />
          Reminder enabled
        </label>
        {message ? <p className="md:col-span-2 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={isPending} type="submit">Book Appointment</Button>
        </div>
      </form>
    </DialogContent>
  );
}
