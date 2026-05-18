import { PerformanceCards } from "@/components/telecalling/performance-cards";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getTelecallerLeadRows, getTelecallerMetrics, startOfToday } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function MyPerformancePage() {
  const profile = await getCurrentProfile();
  const leads = profile ? await getTelecallerLeadRows(profile.authUserId) : [];
  const metrics = profile ? await getTelecallerMetrics(profile.authUserId) : null;
  const [completedFollowups, totalFollowups] = profile
    ? await Promise.all([
        prisma.followup.count({ where: { completedAt: { gte: startOfToday() }, status: "completed", userId: profile.authUserId } }),
        prisma.followup.count({ where: { followupDate: { gte: startOfToday() }, userId: profile.authUserId } })
      ])
    : [0, 0];
  const connectedPercent = metrics?.callsToday ? Math.round(((metrics.connectedToday ?? 0) / metrics.callsToday) * 100) : 0;
  const interestedPercent = leads.length ? Math.round(((metrics?.interested ?? 0) / leads.length) * 100) : 0;
  const followupCompletion = totalFollowups ? Math.round((completedFollowups / totalFollowups) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">My Performance</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Performance</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Calls, conversion aur followups ka simple personal view.</p>
      </section>
      <PerformanceCards
        metrics={[
          { label: "Today's Calls", value: metrics?.callsToday ?? 0 },
          { label: "Connected %", value: `${connectedPercent}%` },
          { label: "Interested %", value: `${interestedPercent}%` },
          { label: "Converted %", value: `${metrics?.conversionRate ?? 0}%` },
          { label: "Pending Followups", value: metrics?.pendingFollowups ?? 0 },
          { label: "Followup Completion %", value: `${followupCompletion}%` },
          { label: "Weekly Trend", value: "Live" }
        ]}
      />
    </div>
  );
}
