"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  ContactRound,
  Gauge,
  Headphones,
  ListChecks,
  PhoneCall,
  ShieldCheck,
  Target,
  UserRoundCheck,
  UsersRound,
  Workflow
} from "lucide-react";
import { activities, chartData, dashboardMetrics, funnelData, leads, sourceData } from "@/data/crm";
import type { ChartSlice, TrendPoint } from "@/components/crm-charts";
import { MetricCard } from "@/components/metric-card";
import { CallAnalyticsChart, FunnelAnalyticsChart, RevenueTrendChart, SourcePieChart } from "@/components/crm-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

export type SuperAdminDashboardData = {
  activeStaff: number;
  activeTelecallers: number;
  admins: number;
  appointmentsToday: number;
  connectedCalls: number;
  conversions: number;
  funnelData: ChartSlice[];
  hotLeads: number;
  leadTrend: TrendPoint[];
  pendingFollowups: number;
  overdueFollowups: number;
  recentActivity: Array<{ detail: string; time: string; title: string }>;
  recentLeads: Array<{ company: string; id: string; name: string; owner: string; status: string }>;
  sourceData: ChartSlice[];
  teamBreakdown: Array<{ active: number; label: string }>;
  todaysCalls: number;
  todaysLeads: number;
  totalLeads: number;
  workingLeads: number;
};

type DashboardPageProps = {
  liveData: SuperAdminDashboardData;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function EmptyState({ label }: { label: string }) {
  return <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">{label}</div>;
}

export function DashboardPage({ liveData }: DashboardPageProps) {
  const [mode, setMode] = useState<"live" | "dummy">("live");
  const isLive = mode === "live";

  const metrics = useMemo(() => {
    if (!isLive) return dashboardMetrics;

    return [
      { label: "Total Leads", value: String(liveData.totalLeads), delta: "database", tone: "mint", icon: ContactRound },
      { label: "New Leads", value: String(liveData.todaysLeads), delta: "today", tone: "blue", icon: Gauge },
      { label: "Working Leads", value: String(liveData.workingLeads), delta: "active pipeline", tone: "violet", icon: Workflow },
      { label: "Hot Leads", value: String(liveData.hotLeads), delta: "HOT + URGENT", tone: "amber", icon: Target },
      { label: "Calls Done", value: String(liveData.todaysCalls), delta: "today", tone: "mint", icon: PhoneCall },
      { label: "Connected Calls", value: String(liveData.connectedCalls), delta: "positive outcomes", tone: "blue", icon: PhoneCall },
      { label: "Appointments", value: String(liveData.appointmentsToday), delta: "today", tone: "violet", icon: CalendarClock },
      { label: "Conversions", value: String(liveData.conversions), delta: "converted leads", tone: "mint", icon: Target },
      { label: "Pending Followups", value: String(liveData.pendingFollowups), delta: "open", tone: "blue", icon: ListChecks },
      { label: "Overdue Followups", value: String(liveData.overdueFollowups), delta: "attention", tone: "danger", icon: AlertTriangle },
      { label: "Active Staff", value: String(liveData.activeStaff), delta: "enabled users", tone: "mint", icon: UsersRound },
      { label: "Admins", value: String(liveData.admins), delta: "operational", tone: "blue", icon: ShieldCheck }
    ] as const;
  }, [isLive, liveData]);

  const trend = isLive ? liveData.leadTrend : chartData;
  const funnel = isLive ? liveData.funnelData : funnelData;
  const sources = isLive ? liveData.sourceData : sourceData;
  const activity = isLive ? liveData.recentActivity : activities;
  const teamBreakdown = isLive
    ? liveData.teamBreakdown
    : [
        { label: "Sales", active: 24 },
        { label: "Telecalling", active: 18 },
        { label: "Support", active: 17 },
        { label: "Finance", active: 9 }
      ];

  return (
    <div className="space-y-6">
      <section className="premium-surface overflow-hidden rounded-xl p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isLive ? "mint" : "blue"}><Gauge size={12} /> {isLive ? "Live database view" : "Dummy preview"}</Badge>
                  <Badge variant="blue">{isLive ? "Supabase PostgreSQL" : "Demo data"}</Badge>
                  <Badge variant="violet">{isLive ? "No dummy values" : "Static CRM preview"}</Badge>
                </div>
                <div className="flex rounded-xl border border-border bg-white/[0.025] p-1">
                  <Button size="sm" variant={isLive ? "default" : "ghost"} onClick={() => setMode("live")}>Live mode</Button>
                  <Button size="sm" variant={!isLive ? "default" : "ghost"} onClick={() => setMode("dummy")}>Dummy mode</Button>
                </div>
              </div>
              <h2 className="mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-white md:text-[32px] md:leading-tight">
                {isLive ? "Super admin live control center." : "Sales, calling, follow-up aur payment ka simple control center."}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                {isLive
                  ? "Yeh view profiles, leads, calls, appointments, followups aur audit logs se directly data read karta hai."
                  : "Yahan staff ko clear dikhega: kitne leads aaye, kisko call karna hai, kaunsa payment pending hai, appointment kab hai, aur team ka performance kaisa chal raha hai."}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["Active Staff", isLive ? String(liveData.activeStaff) : "68", "Enabled staff accounts", ShieldCheck],
                ["Active Telecallers", isLive ? String(liveData.activeTelecallers) : "18", "Calling team available", Headphones],
                ["Operational Health", isLive ? (liveData.overdueFollowups ? "Needs review" : "Clear") : "96.4%", "Followups and activity status", CheckCircle2]
              ].map(([label, value, detail, Icon]) => (
                <div className="rounded-lg border border-border bg-white/[0.025] p-4 transition hover:bg-white/[0.04]" key={String(label)}>
                  <div className="flex items-center justify-between">
                    <Icon className="text-primary" size={18} />
                    <ArrowUpRight className="text-muted-foreground" size={16} />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{String(label)}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{String(value)}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(detail)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{isLive ? "Pipeline Completion" : "Monthly Target"}</p>
                <p className="text-xs text-muted-foreground">{isLive ? `${liveData.conversions} converted / ${liveData.totalLeads} total leads` : "₹82.4L / ₹95L target"}</p>
              </div>
              <Badge variant="mint">{isLive ? `${liveData.totalLeads ? Math.round((liveData.conversions / liveData.totalLeads) * 100) : 0}%` : "87%"}</Badge>
            </div>
            <div className="mt-5 grid place-items-center">
              <div
                className="relative grid h-40 w-40 place-items-center rounded-full p-3"
                style={{
                  background: `conic-gradient(#14B8A6 0 ${isLive ? (liveData.totalLeads ? Math.round((liveData.conversions / liveData.totalLeads) * 360) : 0) : 313}deg, rgba(255,255,255,0.08) ${isLive ? (liveData.totalLeads ? Math.round((liveData.conversions / liveData.totalLeads) * 360) : 0) : 313}deg 360deg)`
                }}
              >
                <div className="grid h-full w-full place-items-center rounded-full bg-ink-950">
                  <div className="text-center">
                    <p className="text-4xl font-semibold text-white">{isLive ? (liveData.totalLeads ? Math.round((liveData.conversions / liveData.totalLeads) * 100) : 0) : 87}%</p>
                    <p className="text-xs text-muted-foreground">{isLive ? "Converted" : "Target done"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-white/[0.025] p-3"><p className="text-xs text-muted-foreground">{isLive ? "Working Leads" : "Expected Sale"}</p><p className="mt-1 font-semibold text-white">{isLive ? liveData.workingLeads : "₹1.08Cr"}</p></div>
              <div className="rounded-lg border border-border bg-white/[0.025] p-3"><p className="text-xs text-muted-foreground">{isLive ? "Overdue" : "Pending Gap"}</p><p className="mt-1 font-semibold text-amber">{isLive ? liveData.overdueFollowups : "₹12L"}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        {metrics.map((metric, index) => (
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }} key={metric.label} transition={{ delay: index * 0.025 }}>
            <MetricCard metric={metric} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{isLive ? "Lead Trend" : "Monthly Sales Trend"}</CardTitle>
              <CardDescription>{isLive ? "Last 6 months lead volume from database." : "Har month ki sale aur growth ka clear view."}</CardDescription>
            </div>
            <Badge variant="mint">{isLive ? "Live" : "+21.6% MoM"}</Badge>
          </CardHeader>
          <CardContent>{trend.some((item) => item.leads) ? <RevenueTrendChart data={trend} /> : <EmptyState label="No lead trend data yet." />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lead Funnel</CardTitle>
              <CardDescription>{isLive ? "Live status distribution." : "Lead se payment tak ka journey."}</CardDescription>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </CardHeader>
          <CardContent>{funnel.some((item) => item.value) ? <FunnelAnalyticsChart data={funnel} /> : <EmptyState label="No funnel data yet." />}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
        <Card>
          <CardHeader><div><CardTitle>Call Report</CardTitle><CardDescription>{isLive ? "Monthly calls and conversions." : "Connected, missed aur successful calls."}</CardDescription></div></CardHeader>
          <CardContent>{trend.some((item) => item.calls || item.won) ? <CallAnalyticsChart data={trend} /> : <EmptyState label="No call data yet." />}</CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Lead Sources</CardTitle><CardDescription>{isLive ? "Source breakup from leads table." : "Website, WhatsApp, referral aur ads ka breakup."}</CardDescription></div></CardHeader>
          <CardContent>{sources.some((item) => item.value) ? <SourcePieChart data={sources} /> : <EmptyState label="No source data yet." />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div><CardTitle>{isLive ? "Active Staff" : "Team Online"}</CardTitle><CardDescription>{isLive ? "Active accounts by role." : "Kaun staff abhi available hai."}</CardDescription></div>
            <Badge variant="mint">{isLive ? liveData.activeStaff : 68} active</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamBreakdown.map((team) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.025] p-3" key={team.label}>
                <div className="flex items-center gap-3">
                  <UserRoundCheck className="text-primary" size={18} />
                  <span className="font-medium text-white">{team.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{team.active} active</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr_0.9fr]">
        <Card>
          <CardHeader><div><CardTitle>{isLive ? "Recent Leads" : "Top Staff"}</CardTitle><CardDescription>{isLive ? "Latest leads created in database." : "Sale aur follow-up performance ke basis par."}</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">
            {(isLive ? liveData.recentLeads : leads.slice(0, 5).map((lead, index) => ({ company: lead.company, id: lead.id, name: lead.owner, owner: `#${index + 1}`, status: lead.stage }))).map((lead, index) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.025] p-3" key={lead.id}>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">{initials(lead.name)}</div>
                  <div>
                    <p className="font-semibold text-white">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company || lead.owner}</p>
                  </div>
                </div>
                <Badge variant={index < 2 ? "mint" : "blue"}>{lead.status}</Badge>
              </div>
            ))}
            {isLive && !liveData.recentLeads.length ? <EmptyState label="No leads created yet." /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Recent Activity</CardTitle><CardDescription>{isLive ? "Latest audit log entries." : "Team ne abhi kya update kiya."}</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">
            {activity.map((item) => (
              <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={`${item.title}-${item.time}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary" size={15} />
                  <p className="font-medium text-white">{item.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                <p className="mt-2 text-xs text-blue-200/60">{isLive ? formatDateTime(item.time) : item.time}</p>
              </div>
            ))}
            {isLive && !activity.length ? <EmptyState label="No audit activity yet." /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Important Reminders</CardTitle><CardDescription>{isLive ? "Database-backed operational alerts." : "Missed follow-up, appointment aur finance alerts."}</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Follow-up overdue", `${isLive ? liveData.overdueFollowups : 12} leads overdue hain`, AlertTriangle, "danger"],
              ["Appointments today", `${isLive ? liveData.appointmentsToday : 9} appointments scheduled hain`, CalendarClock, "amber"],
              ["Calls today", `${isLive ? liveData.todaysCalls : 18} calls logged hain`, PhoneCall, "blue"],
              ["Pending followups", `${isLive ? liveData.pendingFollowups : 42} followups pending hain`, Clock, "violet"]
            ].map(([title, detail, Icon, tone]) => (
              <div className="flex gap-3 rounded-lg border border-border bg-white/[0.025] p-3" key={String(title)}>
                <Icon className="mt-0.5 text-primary" size={17} />
                <div>
                  <p className="font-semibold text-white">{String(title)}</p>
                  <p className="text-sm text-muted-foreground">{String(detail)}</p>
                  <Badge className="mt-2" variant={tone as "mint"}>Check</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
