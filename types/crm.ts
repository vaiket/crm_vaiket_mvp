import type { LucideIcon } from "lucide-react";

export type Role =
  | "super_admin"
  | "admin"
  | "finance"
  | "telecaller"
  | "Super Admin"
  | "Admin"
  | "Sales Manager"
  | "Sales Executive"
  | "Telecaller"
  | "Appointment Setter"
  | "Support Agent"
  | "Finance"
  | "HR";

export type LeadStage =
  | "New"
  | "Assigned"
  | "Contacted"
  | "Interested"
  | "Follow-up"
  | "Appointment Booked"
  | "Demo Scheduled"
  | "Proposal Sent"
  | "Negotiation"
  | "Payment Pending"
  | "Won"
  | "Lost";

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  owner: string;
  source: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  stage: LeadStage;
  score: number;
  value: number;
  city: string;
  lastActivity: string;
  nextFollowUp: string;
};

export type ModuleMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "mint" | "blue" | "amber" | "danger" | "violet";
  icon?: LucideIcon;
};

export type Activity = {
  title: string;
  detail: string;
  time: string;
  type: "call" | "email" | "whatsapp" | "task" | "deal" | "system";
};

export type ModulePageConfig = {
  title: string;
  description: string;
  badge: string;
  metrics: ModuleMetric[];
  tabs: string[];
  primaryAction: string;
  secondaryAction: string;
};
