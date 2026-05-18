import type { AppointmentStatus } from "@/types/telecalling";
import { Badge } from "@/components/ui/badge";

export function appointmentStatusTone(status: AppointmentStatus) {
  if (status === "completed") return "mint";
  if (status === "confirmed") return "blue";
  if (status === "cancelled" || status === "no_show") return "danger";
  if (status === "rescheduled") return "amber";
  return "default";
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={appointmentStatusTone(status)}>{status.replace("_", " ")}</Badge>;
}
