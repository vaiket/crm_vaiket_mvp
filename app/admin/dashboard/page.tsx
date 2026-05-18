import { AlertTriangle, CalendarDays, CheckCircle2, ContactRound, Headphones, ListChecks, PhoneCall, Target } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardMetrics, getLeadRows, getPerformanceRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [metrics, leads, performance] = await Promise.all([getAdminDashboardMetrics(), getLeadRows(), getPerformanceRows()]);
  const metricCards = [
    { delta: "all teams", icon: ContactRound, label: "Total Leads", tone: "mint", value: String(metrics.totalLeads) },
    { delta: "need assignment", icon: ListChecks, label: "Unassigned Leads", tone: "amber", value: String(metrics.unassignedLeads) },
    { delta: "active", icon: Headphones, label: "Telecallers Active", tone: "blue", value: String(metrics.activeTelecallers) },
    { delta: "today", icon: PhoneCall, label: "Today's Calls", tone: "mint", value: String(metrics.todaysCalls) },
    { delta: "today", icon: CalendarDays, label: "Appointments", tone: "violet", value: String(metrics.appointments) },
    { delta: "won leads", icon: Target, label: "Conversions", tone: "mint", value: String(metrics.conversions) },
    { delta: "open", icon: CheckCircle2, label: "Pending Followups", tone: "blue", value: String(metrics.pendingFollowups) },
    { delta: "attention", icon: AlertTriangle, label: "Overdue Followups", tone: "danger", value: String(metrics.overdueFollowups) }
  ] as const;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Admin Dashboard</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Operational Control Center</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Leads, telecallers, appointments and followups ka all-team view.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader><CardTitle>Recent Leads</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {leads.slice(0, 6).map((lead) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.025] p-3" key={lead.id}>
                <div><p className="font-semibold text-white">{lead.name}</p><p className="text-sm text-muted-foreground">{lead.phone} · {lead.source ?? "Unknown"}</p></div>
                <Badge variant={lead.assignedTo ? "mint" : "amber"}>{lead.assignedTo ? "Assigned" : "Unassigned"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Telecaller Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {performance.slice(0, 6).map((row) => (
              <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={row.telecallerId}>
                <div className="flex items-center justify-between"><p className="font-semibold text-white">{row.telecallerName}</p><Badge variant="blue">{row.conversionRate}%</Badge></div>
                <p className="mt-1 text-sm text-muted-foreground">{row.assignedLeads} leads · {row.callsDone} calls · {row.pendingFollowups} followups</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
