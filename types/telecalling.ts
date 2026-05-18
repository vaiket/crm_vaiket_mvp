export type AppRole = "super_admin" | "admin" | "finance" | "telecaller";

export type Profile = {
  authUserId: string;
  createdAt: Date;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  role: AppRole;
};

export type LeadStatus = "new" | "assigned" | "interested" | "not_interested" | "callback" | "followup" | "appointment_booked" | "converted";
export type LeadPriority = "HOT" | "WARM" | "COLD" | "URGENT" | "PAYMENT FOLLOWUP";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type AppointmentType = "Demo" | "Callback" | "Consultation" | "Payment Discussion" | "Followup Meeting" | "Site Visit";
export type MeetingMode = "Phone Call" | "Google Meet" | "Zoom" | "WhatsApp Call" | "In Person";

export type TelecallingLead = {
  assignedAt: Date | null;
  assignedTo: string | null;
  email: string | null;
  followupDate: Date | null;
  id: string;
  lastContactAt: Date | null;
  name: string;
  notes: string | null;
  notesCount: number;
  phone: string;
  priority: LeadPriority;
  source: string | null;
  status: LeadStatus;
  callLogs: Array<{
    createdAt: Date;
    durationSeconds: number | null;
    id: string;
    notes: string | null;
    outcome: string;
  }>;
  followups: Array<{
    completedAt: Date | null;
    followupDate: Date;
    followupType: string;
    id: string;
    note: string | null;
    status: string;
  }>;
  noteTimeline: Array<{
    createdAt: Date;
    id: string;
    note: string;
  }>;
  statusHistory: Array<{
    createdAt: Date;
    fromStatus: string | null;
    id: string;
    note: string | null;
    toStatus: string;
  }>;
};

export type AppointmentRow = {
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: AppointmentType;
  assignedTo: string;
  assigneeName: string;
  cancellationReason: string | null;
  createdAt: Date;
  createdBy: string;
  creatorName: string;
  customerName: string;
  customerPhone: string;
  id: string;
  leadId: string;
  meetingMode: MeetingMode;
  notes: string | null;
  reminderEnabled: boolean;
  status: AppointmentStatus;
  updatedAt: Date;
};

export type TelecallerPerformance = {
  assignedLeads: number;
  callsDone: number;
  conversionRate: number;
  converted: number;
  interested: number;
  pendingFollowups: number;
  telecallerId: string;
  telecallerName: string;
};
