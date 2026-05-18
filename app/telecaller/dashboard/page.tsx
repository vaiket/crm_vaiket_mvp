import { AlertTriangle, CalendarClock } from "lucide-react";
import { LeadTable } from "@/components/telecalling/lead-table";
import { PerformanceCards } from "@/components/telecalling/performance-cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/current-user";
import { getTelecallerLeadRows, getTelecallerMetrics } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function TelecallerDashboardPage() {
  const profile = await getCurrentProfile();
  const leads = profile ? await getTelecallerLeadRows(profile.authUserId) : [];
  const metrics = profile ? await getTelecallerMetrics(profile.authUserId) : null;
  const now = new Date();
  const todayFollowups = leads.flatMap((lead) => lead.followups.filter((followup) => followup.status === "pending" && followup.followupDate.toDateString() === now.toDateString()).map((followup) => ({ ...followup, lead }))).slice(0, 5);
  const overdueFollowups = leads.flatMap((lead) => lead.followups.filter((followup) => followup.status === "pending" && followup.followupDate < now).map((followup) => ({ ...followup, lead }))).slice(0, 4);
  const timeline = leads.flatMap((lead) => [
    ...lead.callLogs.slice(0, 2).map((call) => ({ detail: call.notes || call.outcome, time: call.createdAt, title: `${call.outcome} - ${lead.name}` })),
    ...lead.noteTimeline.slice(0, 2).map((note) => ({ detail: note.note, time: note.createdAt, title: `Note - ${lead.name}` }))
  ]).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">My Dashboard</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Telecalling Workspace</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Sirf aapko assigned leads aur aapka performance data.</p>
      </section>
      <PerformanceCards
        assignedLeads={metrics?.todayAssigned ?? 0}
        callsDone={metrics?.callsToday ?? 0}
        connectedCalls={metrics?.connectedToday ?? 0}
        conversionRate={metrics?.conversionRate ?? 0}
        converted={metrics?.converted ?? 0}
        interested={metrics?.interested ?? 0}
        overdueFollowups={metrics?.overdueFollowups ?? 0}
        pendingFollowups={metrics?.pendingFollowups ?? 0}
      />
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader><CardTitle>My Assigned Leads</CardTitle></CardHeader>
          <CardContent><LeadTable leads={leads} mode="telecaller" /></CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock size={18} /> Today Followups</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {todayFollowups.map((item) => (
                <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={item.id}>
                  <p className="font-semibold text-white">{item.lead.name}</p>
                  <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(item.followupDate)} · {item.note ?? item.followupType}</p>
                </div>
              ))}
              {!todayFollowups.length ? <p className="text-sm text-muted-foreground">Aaj ke liye followup clear hai.</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={18} /> Overdue Followups</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {overdueFollowups.map((item) => (
                <div className="rounded-lg border border-danger/20 bg-danger/10 p-3" key={item.id}>
                  <p className="font-semibold text-white">{item.lead.name}</p>
                  <p className="text-sm text-danger">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(item.followupDate)}</p>
                </div>
              ))}
              {!overdueFollowups.length ? <p className="text-sm text-muted-foreground">No overdue followups.</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((item, index) => (
                <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={`${item.title}-${index}`}>
                  <p className="text-xs text-blue-200/70">{new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(item.time)} - {item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
              {!timeline.length ? <p className="text-sm text-muted-foreground">Abhi activity nahi hai.</p> : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
