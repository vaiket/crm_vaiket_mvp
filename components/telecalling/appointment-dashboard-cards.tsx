import { CalendarCheck, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AppointmentDashboardCards({
  completed,
  missed,
  noShow,
  todayBookings,
  total,
  upcoming
}: {
  completed: number;
  missed?: number;
  noShow?: number;
  todayBookings: number;
  total: number;
  upcoming: number;
}) {
  const cards = [
    { icon: CalendarCheck, label: "Total Appointments", value: total, tone: "text-primary" },
    { icon: CalendarClock, label: "Today Bookings", value: todayBookings, tone: "text-skyline" },
    { icon: CheckCircle2, label: "Completed", value: completed, tone: "text-mint" },
    { icon: XCircle, label: noShow !== undefined ? "No Show Count" : "Missed Appointments", value: noShow ?? missed ?? 0, tone: "text-danger" },
    { icon: CalendarClock, label: "Upcoming", value: upcoming, tone: "text-amber" }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
            </div>
            <card.icon className={card.tone} size={24} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
