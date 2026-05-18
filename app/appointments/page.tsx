import { AppointmentDashboardCards } from "@/components/telecalling/appointment-dashboard-cards";
import { AppointmentTable } from "@/components/telecalling/appointment-table";
import { Badge } from "@/components/ui/badge";
import { getAppointmentMetrics, getAppointmentRows, getTelecallers } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [appointments, metrics, telecallers] = await Promise.all([getAppointmentRows(), getAppointmentMetrics(), getTelecallers()]);

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Appointments</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Appointment Management</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          All-team appointment view with telecaller filters, reschedule, cancellation, completion and no-show tracking.
        </p>
      </section>
      <AppointmentDashboardCards {...metrics} />
      <AppointmentTable appointments={appointments} staff={telecallers} />
    </div>
  );
}
