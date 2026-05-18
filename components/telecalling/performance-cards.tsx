import { CalendarClock, CheckCircle2, Gauge, PhoneCall, Target, TimerReset, TrendingUp, UserRoundCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Metric = {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  tone?: string;
  value: number | string;
};

type PerformanceCardsProps = {
  assignedLeads?: number;
  callsDone?: number;
  connectedCalls?: number;
  conversionRate?: number;
  converted?: number;
  interested?: number;
  metrics?: Metric[];
  overdueFollowups?: number;
  pendingFollowups?: number;
};

export function PerformanceCards({
  assignedLeads = 0,
  callsDone = 0,
  connectedCalls = 0,
  conversionRate = 0,
  converted = 0,
  interested = 0,
  metrics,
  overdueFollowups = 0,
  pendingFollowups = 0
}: PerformanceCardsProps) {
  const cards =
    metrics ??
    [
      { icon: Target, label: "Today's Assigned Leads", value: assignedLeads, tone: "text-primary" },
      { icon: PhoneCall, label: "Calls Completed Today", value: callsDone, tone: "text-skyline" },
      { icon: UserRoundCheck, label: "Connected Calls", value: connectedCalls, tone: "text-mint" },
      { icon: CalendarClock, label: "Pending Followups", value: pendingFollowups, tone: "text-amber" },
      { icon: TimerReset, label: "Overdue Followups", value: overdueFollowups, tone: "text-danger" },
      { icon: TrendingUp, label: "Interested Leads", value: interested, tone: "text-skyline" },
      { icon: CheckCircle2, label: "Converted Leads", value: converted, tone: "text-primary" },
      { icon: Gauge, label: "Conversion Rate", value: `${conversionRate}%`, tone: "text-violet-300" }
    ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon ?? Target;
        return (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
              </div>
              <Icon className={card.tone ?? "text-primary"} size={24} />
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
