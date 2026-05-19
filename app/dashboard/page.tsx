import { DashboardPage, type SuperAdminDashboardData } from "@/components/dashboard-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfToday() {
  const value = new Date();
  value.setHours(23, 59, 59, 999);
  return value;
}

function monthKey(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(value);
}

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { end: next, key: monthKey(date), start: date };
  });
}

function countByMonth<T extends { createdAt: Date }>(rows: T[], months: ReturnType<typeof lastSixMonths>) {
  return months.map((month) => rows.filter((row) => row.createdAt >= month.start && row.createdAt < month.end).length);
}

async function getLiveDashboardData(): Promise<SuperAdminDashboardData> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const months = lastSixMonths();
  const firstMonthStart = months[0].start;

  const [
    totalLeads,
    todaysLeads,
    workingLeads,
    hotLeads,
    todaysCalls,
    connectedCalls,
    appointmentsToday,
    conversions,
    pendingFollowups,
    overdueFollowups,
    activeStaff,
    activeTelecallers,
    admins,
    profiles,
    recentLeads,
    recentActivity,
    leadsForCharts,
    callsForCharts
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.lead.count({ where: { status: { in: ["assigned", "interested", "callback", "followup", "appointment_booked"] } } }),
    prisma.lead.count({ where: { priority: { in: ["HOT", "URGENT", "PAYMENT FOLLOWUP"] } } }),
    prisma.callLog.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.callLog.count({ where: { createdAt: { gte: todayStart, lte: todayEnd }, outcome: { in: ["Connected", "Interested", "Converted"] } } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.lead.count({ where: { status: "converted" } }),
    prisma.followup.count({ where: { status: "pending" } }),
    prisma.followup.count({ where: { followupDate: { lt: new Date() }, status: "pending" } }),
    prisma.profile.count({ where: { isActive: true } }),
    prisma.profile.count({ where: { isActive: true, role: "telecaller" } }),
    prisma.profile.count({ where: { isActive: true, role: "admin" } }),
    prisma.profile.groupBy({ by: ["role"], _count: { role: true }, where: { isActive: true } }),
    prisma.lead.findMany({
      include: { assignments: { include: { telecaller: { select: { name: true } } }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.lead.findMany({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, source: true, status: true },
      where: { createdAt: { gte: firstMonthStart } }
    }),
    prisma.callLog.findMany({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, outcome: true },
      where: { createdAt: { gte: firstMonthStart } }
    })
  ]);

  const leadCounts = countByMonth(leadsForCharts, months);
  const callCounts = countByMonth(callsForCharts, months);
  const wonCounts = months.map((month) => leadsForCharts.filter((lead) => lead.status === "converted" && lead.createdAt >= month.start && lead.createdAt < month.end).length);

  const leadTrend = months.map((month, index) => ({
    calls: callCounts[index] ?? 0,
    leads: leadCounts[index] ?? 0,
    name: month.key,
    won: wonCounts[index] ?? 0
  }));

  const statusLabels = ["new", "assigned", "interested", "followup", "appointment_booked", "converted"];
  const funnelData = statusLabels.map((status) => ({
    name: status.replace("_", " "),
    value: leadsForCharts.filter((lead) => lead.status === status).length
  }));

  const sourceMap = new Map<string, number>();
  for (const lead of leadsForCharts) {
    const source = lead.source?.trim() || "Unknown";
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
  }

  const roleLabels: Record<string, string> = {
    admin: "Admins",
    super_admin: "Super Admins",
    telecaller: "Telecallers"
  };

  return {
    activeStaff,
    activeTelecallers,
    admins,
    appointmentsToday,
    connectedCalls,
    conversions,
    funnelData,
    hotLeads,
    leadTrend,
    pendingFollowups,
    overdueFollowups,
    recentActivity: recentActivity.map((item) => ({
      detail: `${item.entityType}${item.entityId ? ` · ${item.entityId}` : ""}`,
      time: item.createdAt.toISOString(),
      title: item.action.replaceAll("_", " ")
    })),
    recentLeads: recentLeads.map((lead) => ({
      company: lead.source ?? "No source",
      id: lead.id,
      name: lead.name,
      owner: lead.assignments[0]?.telecaller.name ?? "Unassigned",
      status: lead.status.replace("_", " ")
    })),
    sourceData: Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value })),
    teamBreakdown: profiles.map((profile) => ({
      active: profile._count.role,
      label: roleLabels[profile.role] ?? profile.role
    })),
    todaysCalls,
    todaysLeads,
    totalLeads,
    workingLeads
  };
}

function getEmptyDashboardData(): SuperAdminDashboardData {
  return {
    activeStaff: 0,
    activeTelecallers: 0,
    admins: 0,
    appointmentsToday: 0,
    connectedCalls: 0,
    conversions: 0,
    funnelData: [],
    hotLeads: 0,
    leadTrend: lastSixMonths().map((month) => ({
      calls: 0,
      leads: 0,
      name: month.key,
      won: 0
    })),
    pendingFollowups: 0,
    overdueFollowups: 0,
    recentActivity: [],
    recentLeads: [],
    sourceData: [],
    teamBreakdown: [],
    todaysCalls: 0,
    todaysLeads: 0,
    totalLeads: 0,
    workingLeads: 0
  };
}

export default async function Page() {
  const liveData = await getLiveDashboardData().catch((error) => {
    console.error("Dashboard live data failed", error);
    return getEmptyDashboardData();
  });

  return <DashboardPage liveData={liveData} />;
}
