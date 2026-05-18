import { prisma } from "@/lib/prisma";
import type { AppRole, AppointmentRow, AppointmentStatus, AppointmentType, LeadPriority, LeadStatus, MeetingMode, TelecallerPerformance, TelecallingLead } from "@/types/telecalling";

export const leadStatuses: LeadStatus[] = ["new", "assigned", "interested", "not_interested", "callback", "followup", "appointment_booked", "converted"];
export const leadPriorities: LeadPriority[] = ["HOT", "WARM", "COLD", "URGENT", "PAYMENT FOLLOWUP"];
export const callOutcomes = ["Connected", "No Answer", "Busy", "Wrong Number", "Interested", "Not Interested", "Callback Requested", "Converted"] as const;
export const appointmentStatuses: AppointmentStatus[] = ["scheduled", "confirmed", "completed", "cancelled", "rescheduled", "no_show"];
export const appointmentTypes: AppointmentType[] = ["Demo", "Callback", "Consultation", "Payment Discussion", "Followup Meeting", "Site Visit"];
export const meetingModes: MeetingMode[] = ["Phone Call", "Google Meet", "Zoom", "WhatsApp Call", "In Person"];

export function formatRole(role: string) {
  return role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : role === "telecaller" ? "Telecaller" : role;
}

export function normalizeRole(role: string): AppRole {
  if (role === "super_admin" || role === "Super Admin") return "super_admin";
  if (role === "admin" || role === "Admin") return "admin";
  if (role === "finance" || role === "Finance") return "finance";
  return "telecaller";
}

export async function ensureProfileRoleConstraint() {
  await prisma.$executeRawUnsafe("alter table public.profiles drop constraint if exists profiles_role_check");
  await prisma.$executeRawUnsafe("alter table public.profiles add constraint profiles_role_check check (role in ('super_admin', 'admin', 'finance', 'telecaller'))");
}

export function canManageOperations(role: string) {
  return role === "super_admin" || role === "admin";
}

export function canManageTelecallers(role: string) {
  return role === "super_admin" || role === "admin";
}

export function canManageAdmins(role: string) {
  return role === "super_admin";
}

export async function getAdmins() {
  return prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    where: { role: "admin" }
  });
}

export async function getTelecallers() {
  return prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    where: { role: "telecaller" }
  });
}

export async function getTelecallerManagementRows() {
  const telecallers = await getTelecallers();
  return Promise.all(
    telecallers.map(async (telecaller) => {
      const [assignedLeadsCount, appointmentsCount] = await Promise.all([
        prisma.leadAssignment.count({ where: { assignedTo: telecaller.authUserId } }),
        prisma.appointment.count({ where: { OR: [{ assignedTo: telecaller.authUserId }, { createdBy: telecaller.authUserId }] } })
      ]);

      return { ...telecaller, appointmentsCount, assignedLeadsCount };
    })
  );
}

export async function getLeadRows() {
  const rows = await prisma.lead.findMany({
    include: {
      callLogs: {
        orderBy: { createdAt: "desc" },
        take: 20
      },
      assignments: {
        include: { telecaller: true }
      },
      followups: {
        orderBy: { followupDate: "asc" },
        take: 20
      },
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 20
      },
      _count: { select: { notes: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return rows.map((lead): TelecallingLead => {
    const assignment = lead.assignments[0];
    const pendingFollowup = lead.followups.find((followup) => followup.status === "pending") ?? null;

    return {
      assignedAt: assignment?.assignedAt ?? null,
      assignedTo: assignment?.assignedTo ?? null,
      email: lead.email,
      followupDate: pendingFollowup?.followupDate ?? null,
      id: lead.id,
      lastContactAt: lead.callLogs[0]?.createdAt ?? null,
      name: lead.name,
      notes: lead.notes[0]?.note ?? null,
      notesCount: lead._count.notes,
      phone: lead.phone,
      priority: lead.priority as LeadPriority,
      source: lead.source,
      status: lead.status as LeadStatus,
      callLogs: lead.callLogs.map((call) => ({
        createdAt: call.createdAt,
        durationSeconds: call.durationSeconds,
        id: call.id,
        notes: call.notes,
        outcome: call.outcome
      })),
      followups: lead.followups.map((followup) => ({
        completedAt: followup.completedAt,
        followupDate: followup.followupDate,
        followupType: followup.followupType,
        id: followup.id,
        note: followup.note,
        status: followup.status
      })),
      noteTimeline: lead.notes.map((note) => ({
        createdAt: note.createdAt,
        id: note.id,
        note: note.note
      })),
      statusHistory: lead.statusHistory.map((entry) => ({
        createdAt: entry.createdAt,
        fromStatus: entry.fromStatus,
        id: entry.id,
        note: entry.note,
        toStatus: entry.toStatus
      }))
    };
  });
}

export async function getTelecallerLeadRows(authUserId: string) {
  const assignments = await prisma.leadAssignment.findMany({
    include: {
      lead: {
        include: {
          callLogs: {
            orderBy: { createdAt: "desc" },
            take: 20,
            where: { userId: authUserId }
          },
          followups: {
            orderBy: { followupDate: "asc" },
            where: { userId: authUserId }
          },
          notes: {
            orderBy: { createdAt: "desc" },
            where: { userId: authUserId }
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 20,
            where: { userId: authUserId }
          },
          _count: { select: { notes: true } }
        }
      }
    },
    orderBy: { assignedAt: "desc" },
    where: { assignedTo: authUserId }
  });

  return assignments.map(({ assignedAt, assignedTo, lead }): TelecallingLead => {
    const pendingFollowup = lead.followups.find((followup) => followup.status === "pending") ?? null;

    return {
      assignedAt,
      assignedTo,
      callLogs: lead.callLogs.map((call) => ({
        createdAt: call.createdAt,
        durationSeconds: call.durationSeconds,
        id: call.id,
        notes: call.notes,
        outcome: call.outcome
      })),
      email: lead.email,
      followupDate: pendingFollowup?.followupDate ?? null,
      followups: lead.followups.map((followup) => ({
        completedAt: followup.completedAt,
        followupDate: followup.followupDate,
        followupType: followup.followupType,
        id: followup.id,
        note: followup.note,
        status: followup.status
      })),
      id: lead.id,
      lastContactAt: lead.callLogs[0]?.createdAt ?? null,
      name: lead.name,
      noteTimeline: lead.notes.map((note) => ({
        createdAt: note.createdAt,
        id: note.id,
        note: note.note
      })),
      notes: lead.notes[0]?.note ?? null,
      notesCount: lead._count.notes,
      phone: lead.phone,
      priority: lead.priority as LeadPriority,
      source: lead.source,
      status: lead.status as LeadStatus,
      statusHistory: lead.statusHistory.map((entry) => ({
        createdAt: entry.createdAt,
        fromStatus: entry.fromStatus,
        id: entry.id,
        note: entry.note,
        toStatus: entry.toStatus
      }))
    };
  });
}

export function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfToday() {
  const value = new Date();
  value.setHours(23, 59, 59, 999);
  return value;
}

export async function getTelecallerMetrics(authUserId: string) {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const [todayAssigned, callsToday, connectedToday, pendingFollowups, overdueFollowups, interested, converted, totalAssigned] = await Promise.all([
    prisma.leadAssignment.count({ where: { assignedAt: { gte: todayStart, lte: todayEnd }, assignedTo: authUserId } }),
    prisma.callLog.count({ where: { createdAt: { gte: todayStart, lte: todayEnd }, userId: authUserId } }),
    prisma.callLog.count({ where: { createdAt: { gte: todayStart, lte: todayEnd }, outcome: { in: ["Connected", "Interested", "Converted"] }, userId: authUserId } }),
    prisma.followup.count({ where: { status: "pending", userId: authUserId } }),
    prisma.followup.count({ where: { followupDate: { lt: new Date() }, status: "pending", userId: authUserId } }),
    prisma.leadAssignment.count({ where: { assignedTo: authUserId, lead: { status: "interested" } } }),
    prisma.leadAssignment.count({ where: { assignedTo: authUserId, lead: { status: "converted" } } }),
    prisma.leadAssignment.count({ where: { assignedTo: authUserId } })
  ]);

  return {
    callsToday,
    connectedToday,
    conversionRate: totalAssigned ? Math.round((converted / totalAssigned) * 100) : 0,
    converted,
    interested,
    overdueFollowups,
    pendingFollowups,
    todayAssigned
  };
}

export async function getAdminDashboardMetrics() {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [totalLeads, unassignedLeads, activeTelecallers, todaysCalls, appointments, conversions, pendingFollowups, overdueFollowups] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { assignments: { none: {} } } }),
    prisma.profile.count({ where: { isActive: true, role: "telecaller" } }),
    prisma.callLog.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.lead.count({ where: { status: "converted" } }),
    prisma.followup.count({ where: { status: "pending" } }),
    prisma.followup.count({ where: { followupDate: { lt: new Date() }, status: "pending" } })
  ]);

  return {
    activeTelecallers,
    appointments,
    conversions,
    overdueFollowups,
    pendingFollowups,
    todaysCalls,
    totalLeads,
    unassignedLeads
  };
}

function toAppointmentRow(appointment: {
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: string;
  assignedTo: string;
  assignee: { name: string };
  cancellationReason: string | null;
  createdAt: Date;
  createdBy: string;
  creator: { name: string };
  customerName: string;
  customerPhone: string;
  id: string;
  leadId: string;
  meetingMode: string;
  notes: string | null;
  reminderEnabled: boolean;
  status: string;
  updatedAt: Date;
}): AppointmentRow {
  return {
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    appointmentType: appointment.appointmentType as AppointmentType,
    assignedTo: appointment.assignedTo,
    assigneeName: appointment.assignee.name,
    cancellationReason: appointment.cancellationReason,
    createdAt: appointment.createdAt,
    createdBy: appointment.createdBy,
    creatorName: appointment.creator.name,
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    id: appointment.id,
    leadId: appointment.leadId,
    meetingMode: appointment.meetingMode as MeetingMode,
    notes: appointment.notes,
    reminderEnabled: appointment.reminderEnabled,
    status: appointment.status as AppointmentStatus,
    updatedAt: appointment.updatedAt
  };
}

export async function getAppointmentRows(scope?: { authUserId?: string }) {
  const rows = await prisma.appointment.findMany({
    include: {
      assignee: { select: { name: true } },
      creator: { select: { name: true } }
    },
    orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    where: scope?.authUserId
      ? {
          OR: [{ createdBy: scope.authUserId }, { assignedTo: scope.authUserId }]
        }
      : undefined
  });

  return rows.map(toAppointmentRow);
}

export async function getAppointmentMetrics(scope?: { authUserId?: string }) {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const ownWhere = scope?.authUserId ? { OR: [{ createdBy: scope.authUserId }, { assignedTo: scope.authUserId }] } : {};

  const [total, todayBookings, completed, noShow, upcoming, missed] = await Promise.all([
    prisma.appointment.count({ where: ownWhere }),
    prisma.appointment.count({ where: { ...ownWhere, appointmentDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { ...ownWhere, status: "completed" } }),
    prisma.appointment.count({ where: { ...ownWhere, status: "no_show" } }),
    prisma.appointment.count({ where: { ...ownWhere, appointmentDate: { gt: todayEnd }, status: { in: ["scheduled", "confirmed", "rescheduled"] } } }),
    prisma.appointment.count({ where: { ...ownWhere, appointmentDate: { lt: todayStart }, status: { in: ["scheduled", "confirmed", "rescheduled"] } } })
  ]);

  return { completed, missed, noShow, todayBookings, total, upcoming };
}

export async function getPerformanceRows(): Promise<TelecallerPerformance[]> {
  const telecallers = await getTelecallers();

  return Promise.all(
    telecallers.map(async (telecaller) => {
      const [assignedLeads, callsDone, interested, converted, pendingFollowups] = await Promise.all([
        prisma.leadAssignment.count({ where: { assignedTo: telecaller.authUserId } }),
        prisma.callLog.count({ where: { userId: telecaller.authUserId } }),
        prisma.leadAssignment.count({
          where: { assignedTo: telecaller.authUserId, lead: { status: "interested" } }
        }),
        prisma.leadAssignment.count({
          where: { assignedTo: telecaller.authUserId, lead: { status: "converted" } }
        }),
        prisma.followup.count({ where: { status: "pending", userId: telecaller.authUserId } })
      ]);

      return {
        assignedLeads,
        callsDone,
        conversionRate: assignedLeads ? Math.round((converted / assignedLeads) * 100) : 0,
        converted,
        interested,
        pendingFollowups,
        telecallerId: telecaller.authUserId,
        telecallerName: telecaller.name
      };
    })
  );
}
