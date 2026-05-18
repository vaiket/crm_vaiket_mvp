import {
  Activity,
  BarChart3,
  BellRing,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  FileText,
  Headphones,
  Home,
  ListChecks,
  Mail,
  MessageSquareText,
  PhoneCall,
  PieChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound
} from "lucide-react";
import type { Lead, LeadStage, ModulePageConfig, Role } from "@/types/crm";

export const roles: Role[] = [
  "super_admin",
  "admin",
  "finance",
  "telecaller",
  "Super Admin",
  "Admin",
  "Sales Manager",
  "Sales Executive",
  "Telecaller",
  "Appointment Setter",
  "Support Agent",
  "Finance",
  "HR"
];

export const leadStages: LeadStage[] = [
  "New",
  "Assigned",
  "Contacted",
  "Interested",
  "Follow-up",
  "Appointment Booked",
  "Demo Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Payment Pending",
  "Won",
  "Lost"
];

export const navigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/user-management", label: "User Management", icon: ShieldCheck },
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/finance/dashboard", label: "Finance", icon: CircleDollarSign },
  { href: "/lead-distribution", label: "Lead Distribution", icon: ListChecks },
  { href: "/telecallers", label: "Telecallers", icon: Headphones },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/call-logs", label: "Call Logs", icon: PhoneCall },
  { href: "/followups", label: "Followups", icon: CalendarDays },
  { href: "/telecaller/dashboard", label: "Dashboard", icon: Home },
  { href: "/telecaller/leads", label: "My Leads", icon: ContactRound },
  { href: "/telecaller/followups", label: "Followups", icon: CalendarDays },
  { href: "/telecaller/call-history", label: "Call History", icon: PhoneCall },
  { href: "/telecaller/performance", label: "My Performance", icon: BarChart3 },
  { href: "/telecaller/profile", label: "Profile", icon: UserRound },
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/leads", label: "Leads", icon: ContactRound },
  { href: "/clients", label: "Clients", icon: BriefcaseBusiness },
  { href: "/sales", label: "Sales", icon: CircleDollarSign },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/roles", label: "Staff Access", icon: ShieldCheck },
  { href: "/call-center", label: "Call Center", icon: PhoneCall },
  { href: "/whatsapp", label: "WhatsApp CRM", icon: MessageSquareText },
  { href: "/email", label: "Email Campaigns", icon: Mail },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: PieChart },
  { href: "/documents", label: "Files", icon: FileText },
  { href: "/support", label: "Support", icon: Headphones },
  { href: "/notifications", label: "Notifications", icon: BellRing },
  { href: "/chat", label: "Team Chat", icon: MessageSquareText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/super-admin", label: "Admin Control", icon: Sparkles }
];

export const leads: Lead[] = [
  {
    city: "Bengaluru",
    company: "Astra Finserv",
    email: "meera@astrafinserv.in",
    id: "LF-1007",
    lastActivity: "WhatsApp reply 12m ago",
    name: "Meera Nair",
    nextFollowUp: "Today, 4:30 PM",
    owner: "Priya Sharma",
    phone: "+91 98765 21031",
    priority: "Critical",
    score: 94,
    source: "LinkedIn Ads",
    stage: "Negotiation",
    value: 1850000
  },
  {
    city: "Mumbai",
    company: "Northstar Logistics",
    email: "vikram@northstar.co",
    id: "LF-1011",
    lastActivity: "Call connected 24m ago",
    name: "Vikram Desai",
    nextFollowUp: "Tomorrow, 11:00 AM",
    owner: "Rajesh Kumar",
    phone: "+91 99882 11106",
    priority: "High",
    score: 87,
    source: "Website",
    stage: "Proposal Sent",
    value: 1240000
  },
  {
    city: "Delhi",
    company: "Urban Clinic Group",
    email: "ananya@urbanclinic.in",
    id: "LF-1018",
    lastActivity: "Demo scheduled",
    name: "Ananya Kapoor",
    nextFollowUp: "May 18, 2:00 PM",
    owner: "Amit Patel",
    phone: "+91 90155 77109",
    priority: "High",
    score: 82,
    source: "Referral",
    stage: "Demo Scheduled",
    value: 920000
  },
  {
    city: "Hyderabad",
    company: "Kriya EduTech",
    email: "sahil@kriyaedutech.com",
    id: "LF-1022",
    lastActivity: "Missed call alert",
    name: "Sahil Reddy",
    nextFollowUp: "Overdue by 2h",
    owner: "Sneha Gupta",
    phone: "+91 90909 44481",
    priority: "Medium",
    score: 71,
    source: "Webinar",
    stage: "Follow-up",
    value: 610000
  },
  {
    city: "Pune",
    company: "Mintleaf Retail",
    email: "karan@mintleafretail.in",
    id: "LF-1030",
    lastActivity: "New lead assigned",
    name: "Karan Malhotra",
    nextFollowUp: "Today, 6:00 PM",
    owner: "Rohit Mehta",
    phone: "+91 98888 67021",
    priority: "Low",
    score: 48,
    source: "Cold Calling",
    stage: "Assigned",
    value: 340000
  },
  {
    city: "Chennai",
    company: "BluePeak SaaS",
    email: "lakshmi@bluepeak.io",
    id: "LF-1038",
    lastActivity: "Payment link sent",
    name: "Lakshmi Iyer",
    nextFollowUp: "Today, 5:15 PM",
    owner: "Priya Sharma",
    phone: "+91 90030 11842",
    priority: "Critical",
    score: 91,
    source: "Partner",
    stage: "Payment Pending",
    value: 2100000
  }
];

export const dashboardMetrics = [
  { label: "Total Leads", value: "12,842", delta: "+18.4%", tone: "mint", icon: ContactRound },
  { label: "New Leads", value: "428", delta: "+42 today", tone: "blue", icon: Sparkles },
  { label: "Working Leads", value: "3,906", delta: "+9.2%", tone: "violet", icon: Activity },
  { label: "Hot Leads", value: "316", delta: "+24.8%", tone: "amber", icon: Target },
  { label: "Calls Done", value: "1,284", delta: "+132", tone: "mint", icon: PhoneCall },
  { label: "Missed Calls", value: "72", delta: "-8.1%", tone: "danger", icon: BellRing },
  { label: "Connected Calls", value: "842", delta: "65.5%", tone: "blue", icon: PhoneCall },
  { label: "Appointments", value: "146", delta: "+31", tone: "mint", icon: CalendarDays },
  { label: "Deals Closed", value: "58", delta: "+11", tone: "amber", icon: CircleDollarSign },
  { label: "Monthly Sale", value: "₹82.4L", delta: "+21.6%", tone: "mint", icon: BarChart3 },
  { label: "Target Done", value: "87%", delta: "₹12L left", tone: "violet", icon: Target },
  { label: "Conversion", value: "14.8%", delta: "+2.4%", tone: "blue", icon: PieChart }
] as const;

export const chartData = [
  { name: "Jan", revenue: 42, calls: 820, leads: 420, won: 18 },
  { name: "Feb", revenue: 48, calls: 910, leads: 510, won: 22 },
  { name: "Mar", revenue: 57, calls: 1080, leads: 620, won: 27 },
  { name: "Apr", revenue: 69, calls: 1240, leads: 740, won: 34 },
  { name: "May", revenue: 82, calls: 1410, leads: 830, won: 42 },
  { name: "Jun", revenue: 91, calls: 1560, leads: 910, won: 49 }
];

export const funnelData = [
  { name: "New", value: 420 },
  { name: "Contacted", value: 312 },
  { name: "Demo", value: 168 },
  { name: "Proposal", value: 94 },
  { name: "Won", value: 58 }
];

export const sourceData = [
  { name: "Website", value: 35 },
  { name: "LinkedIn", value: 24 },
  { name: "Referral", value: 18 },
  { name: "WhatsApp", value: 13 },
  { name: "Events", value: 10 }
];

export const activities = [
  { detail: "Astra Finserv negotiation stage me gaya", time: "2 min ago", title: "Deal update", type: "deal" },
  { detail: "Lakshmi Iyer ko payment reminder bheja", time: "8 min ago", title: "WhatsApp sent", type: "whatsapp" },
  { detail: "Vikram Desai ke saath 12 min call complete", time: "24 min ago", title: "Call connected", type: "call" },
  { detail: "Q2 proposal manager ne approve kiya", time: "42 min ago", title: "Proposal approved", type: "system" },
  { detail: "Kriya EduTech ka follow-up overdue hai", time: "1h ago", title: "Follow-up alert", type: "task" }
] as const;

export const moduleConfigs: Record<string, ModulePageConfig> = {
  appointments: {
    badge: "Meeting calendar",
    description: "Appointments, reminders, reschedule, meeting notes aur completed meetings ka simple view.",
    metrics: [
      { delta: "+16 today", label: "Upcoming", tone: "mint", value: "84", icon: CalendarDays },
      { delta: "92% show rate", label: "Completed", tone: "blue", value: "316", icon: Target },
      { delta: "12 urgent", label: "Reminders", tone: "amber", value: "48", icon: BellRing },
      { delta: "-6%", label: "No-shows", tone: "danger", value: "19", icon: Activity }
    ],
    primaryAction: "Book meeting",
    secondaryAction: "Sync calendar",
    tabs: ["Calendar", "List", "Meeting Detail"],
    title: "Appointments"
  },
  "call-center": {
    badge: "Calling team",
    description: "Dialer, call queue, missed/connected calls, recordings aur agent availability.",
    metrics: [
      { delta: "18 waiting", label: "Call Queue", tone: "amber", value: "64", icon: PhoneCall },
      { delta: "67% rate", label: "Connected", tone: "mint", value: "842", icon: Target },
      { delta: "-8.1%", label: "Missed", tone: "danger", value: "72", icon: BellRing },
      { delta: "+12m", label: "Avg Talk Time", tone: "blue", value: "6:42", icon: Activity }
    ],
    primaryAction: "Open dialer",
    secondaryAction: "Call rules",
    tabs: ["Dialer", "Queue", "Recordings", "Leaderboard"],
    title: "Call Center"
  },
  chat: {
    badge: "Team messages",
    description: "Channels, direct message, mentions, file sharing aur team discussion.",
    metrics: [
      { delta: "9 active", label: "Channels", tone: "blue", value: "28", icon: MessageSquareText },
      { delta: "41 unread", label: "Mentions", tone: "amber", value: "126", icon: BellRing },
      { delta: "+19", label: "Files Shared", tone: "mint", value: "312", icon: FileText },
      { delta: "Live", label: "Online Staff", tone: "violet", value: "68", icon: UsersRound }
    ],
    primaryAction: "New group",
    secondaryAction: "Browse files",
    tabs: ["Channels", "Direct Messages", "Mentions", "Files"],
    title: "Team Chat"
  },
  clients: {
    badge: "Client accounts",
    description: "Client profile, onboarding, contract, invoice, payment history aur renewal reminder.",
    metrics: [
      { delta: "+22 this month", label: "Clients", tone: "mint", value: "1,482", icon: BriefcaseBusiness },
      { delta: "9 at risk", label: "Healthy Accounts", tone: "blue", value: "91%", icon: Target },
      { delta: "₹18.2L due", label: "Invoices", tone: "amber", value: "128", icon: FileText },
      { delta: "31 days avg", label: "Renewals", tone: "violet", value: "54", icon: CalendarDays }
    ],
    primaryAction: "Add client",
    secondaryAction: "Export clients",
    tabs: ["Clients", "Profiles", "Invoices", "Renewals"],
    title: "Client Management"
  },
  documents: {
    badge: "Files center",
    description: "Proposal, invoice, contract, upload, folder aur preview ka clean UI.",
    metrics: [
      { delta: "+18 drafts", label: "Proposals", tone: "blue", value: "246", icon: FileText },
      { delta: "₹24L billed", label: "Invoices", tone: "mint", value: "189", icon: CircleDollarSign },
      { delta: "12 expiring", label: "Contracts", tone: "amber", value: "73", icon: BriefcaseBusiness },
      { delta: "4 pending", label: "Approvals", tone: "danger", value: "17", icon: BellRing }
    ],
    primaryAction: "Upload document",
    secondaryAction: "Create folder",
    tabs: ["Proposals", "Invoices", "Contracts", "Uploads"],
    title: "Files"
  },
  email: {
    badge: "Email marketing",
    description: "Email campaigns, templates, builder, auto follow-up aur open/click report.",
    metrics: [
      { delta: "+4 active", label: "Campaigns", tone: "mint", value: "38", icon: Mail },
      { delta: "41.8%", label: "Open Rate", tone: "blue", value: "42%", icon: Activity },
      { delta: "9.6%", label: "Click Rate", tone: "violet", value: "9.8%", icon: Target },
      { delta: "14 paused", label: "Automations", tone: "amber", value: "72", icon: Bot }
    ],
    primaryAction: "New campaign",
    secondaryAction: "Template gallery",
    tabs: ["Campaigns", "Templates", "Automation Builder", "Analytics"],
    title: "Email Campaigns"
  },
  notifications: {
    badge: "Alert center",
    description: "Unread alerts, follow-up reminder, assignment aur important notifications.",
    metrics: [
      { delta: "18 critical", label: "Unread", tone: "danger", value: "86", icon: BellRing },
      { delta: "+31", label: "Follow-ups", tone: "amber", value: "124", icon: CalendarDays },
      { delta: "9 approvals", label: "System", tone: "blue", value: "42", icon: ShieldCheck },
      { delta: "Live", label: "Routing", tone: "mint", value: "99.9%", icon: Activity }
    ],
    primaryAction: "Mark reviewed",
    secondaryAction: "Alert rules",
    tabs: ["All", "Unread", "Critical", "System"],
    title: "Notification Center"
  },
  reports: {
    badge: "Business reports",
    description: "Sales, calls, conversion, lead source, team productivity aur campaign reports.",
    metrics: [
      { delta: "+21.6%", label: "Revenue", tone: "mint", value: "₹82.4L", icon: CircleDollarSign },
      { delta: "+2.4%", label: "Conversion", tone: "blue", value: "14.8%", icon: PieChart },
      { delta: "₹412 CPL", label: "Source ROI", tone: "violet", value: "3.8x", icon: Target },
      { delta: "+18%", label: "Productivity", tone: "amber", value: "87%", icon: UsersRound }
    ],
    primaryAction: "Create report",
    secondaryAction: "Schedule export",
    tabs: ["Revenue", "Sales", "Calls", "Campaigns"],
    title: "Reports & Analytics"
  },
  roles: {
    badge: "Staff access",
    description: "Role wise permission: kaun staff kaun sa module access karega.",
    metrics: [
      { delta: "9 roles", label: "Roles", tone: "blue", value: "9", icon: ShieldCheck },
      { delta: "312 grants", label: "Permissions", tone: "mint", value: "184", icon: ClipboardList },
      { delta: "4 reviews", label: "Sensitive Access", tone: "amber", value: "18", icon: BellRing },
      { delta: "Clean", label: "Policy Health", tone: "violet", value: "96%", icon: Target }
    ],
    primaryAction: "Create role",
    secondaryAction: "Audit access",
    tabs: ["Matrix", "Role Editor", "Permission Groups", "Audit"],
    title: "Staff Access"
  },
  sales: {
    badge: "Sales pipeline",
    description: "Deals, quote, proposal, payment tracker, revenue, target aur commission view.",
    metrics: [
      { delta: "+₹14L", label: "Open Pipeline", tone: "mint", value: "₹7.8Cr", icon: CircleDollarSign },
      { delta: "₹2.1Cr", label: "Weighted Forecast", tone: "blue", value: "₹4.2Cr", icon: BarChart3 },
      { delta: "87%", label: "Target Tracking", tone: "violet", value: "87%", icon: Target },
      { delta: "₹8.6L", label: "Commission", tone: "amber", value: "₹31L", icon: Activity }
    ],
    primaryAction: "New quote",
    secondaryAction: "View proposal",
    tabs: ["Deal Kanban", "Quote Builder", "Payments", "Commission"],
    title: "Sales"
  },
  settings: {
    badge: "Setup",
    description: "Company profile, branding, email, WhatsApp, notification, timezone aur theme settings.",
    metrics: [
      { delta: "Verified", label: "Company Profile", tone: "mint", value: "100%", icon: BriefcaseBusiness },
      { delta: "6 enabled", label: "Integrations", tone: "blue", value: "12", icon: Settings },
      { delta: "2 warnings", label: "Channels", tone: "amber", value: "8", icon: MessageSquareText },
      { delta: "Dark", label: "Appearance", tone: "violet", value: "Premium", icon: Sparkles }
    ],
    primaryAction: "Save settings",
    secondaryAction: "Test channels",
    tabs: ["Company", "Branding", "Integrations", "Preferences"],
    title: "Settings"
  },
  "super-admin": {
    badge: "Admin control",
    description: "Company overview, users, modules, logs, system health aur control settings.",
    metrics: [
      { delta: "All modules", label: "System Health", tone: "mint", value: "99.98%", icon: Activity },
      { delta: "+18", label: "Users", tone: "blue", value: "248", icon: UsersRound },
      { delta: "12 enabled", label: "Modules", tone: "violet", value: "19", icon: Sparkles },
      { delta: "6 flagged", label: "Audit Events", tone: "amber", value: "1,284", icon: ShieldCheck }
    ],
    primaryAction: "Add user",
    secondaryAction: "Audit logs",
    tabs: ["Overview", "Users", "Modules", "System Health"],
    title: "Admin Control"
  },
  support: {
    badge: "Support tickets",
    description: "Customer tickets, priority, status, assignment aur support history.",
    metrics: [
      { delta: "18 urgent", label: "Open Tickets", tone: "amber", value: "142", icon: Headphones },
      { delta: "2h 14m", label: "First Response", tone: "mint", value: "94%", icon: Target },
      { delta: "31 waiting", label: "Pending", tone: "danger", value: "48", icon: BellRing },
      { delta: "+12", label: "Resolved", tone: "blue", value: "316", icon: ClipboardList }
    ],
    primaryAction: "Create ticket",
    secondaryAction: "SLA rules",
    tabs: ["Tickets", "Detail", "Pipeline", "SLA"],
    title: "Support & Tickets"
  },
  tasks: {
    badge: "Task board",
    description: "Task board, list, deadline, reminder, assignee, progress aur comments.",
    metrics: [
      { delta: "22 overdue", label: "Open Tasks", tone: "amber", value: "286", icon: ClipboardList },
      { delta: "+34", label: "Completed", tone: "mint", value: "1,104", icon: Target },
      { delta: "8 blocked", label: "Deadlines", tone: "danger", value: "48", icon: BellRing },
      { delta: "76%", label: "Progress", tone: "blue", value: "76%", icon: BarChart3 }
    ],
    primaryAction: "New task",
    secondaryAction: "Board settings",
    tabs: ["Kanban", "List", "Deadlines", "Comments"],
    title: "Task Management"
  },
  team: {
    badge: "Team management",
    description: "Employee cards, directory, performance, attendance, role badges aur leaderboard.",
    metrics: [
      { delta: "68 online", label: "Employees", tone: "blue", value: "248", icon: UsersRound },
      { delta: "92% today", label: "Attendance", tone: "mint", value: "92%", icon: CalendarDays },
      { delta: "+18%", label: "Performance", tone: "violet", value: "87%", icon: Target },
      { delta: "12 coaching", label: "Alerts", tone: "amber", value: "26", icon: BellRing }
    ],
    primaryAction: "Add employee",
    secondaryAction: "Export directory",
    tabs: ["Directory", "Performance", "Attendance", "Leaderboard"],
    title: "Team Management"
  },
  whatsapp: {
    badge: "WhatsApp inbox",
    description: "Customer chats, quick replies, templates, campaign, notes, labels aur assignment.",
    metrics: [
      { delta: "38 unassigned", label: "Conversations", tone: "mint", value: "1,286", icon: MessageSquareText },
      { delta: "1m 42s", label: "Response Time", tone: "blue", value: "96%", icon: Target },
      { delta: "+8 active", label: "Campaigns", tone: "violet", value: "24", icon: Bot },
      { delta: "12 escalated", label: "Needs Review", tone: "amber", value: "43", icon: BellRing }
    ],
    primaryAction: "New campaign",
    secondaryAction: "Quick replies",
    tabs: ["Inbox", "Templates", "Campaign Composer", "Automation Builder"],
    title: "WhatsApp CRM"
  }
};

export const tableRows = leads.map((lead) => ({
  account: lead.company,
  amount: `₹${Math.round(lead.value / 100000)}L`,
  owner: lead.owner,
  priority: lead.priority,
  stage: lead.stage,
  status: lead.score > 85 ? "Executive review" : lead.score > 70 ? "In motion" : "Needs nurture"
}));
