"use client";

import { motion } from "framer-motion";
import { CalendarDays, Download, Filter, MoreHorizontal, Plus, Search, Send, Settings2 } from "lucide-react";
import { leads, moduleConfigs, roles, tableRows } from "@/data/crm";
import { MetricCard } from "@/components/metric-card";
import { CallAnalyticsChart, RevenueTrendChart, SourcePieChart } from "@/components/crm-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, initials } from "@/lib/utils";

export function ModulePage({ moduleKey }: { moduleKey: keyof typeof moduleConfigs }) {
  const config = moduleConfigs[moduleKey];

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="mint">{config.badge}</Badge>
              <Badge variant="blue">Simple team view</Badge>
              <Badge variant="violet">Advanced UI</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px] md:leading-tight">{config.title}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground md:text-base">{config.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline"><Download size={16} /> Export</Button>
            <DemoModal action={config.secondaryAction} title={config.title} />
            <Button><Plus size={16} /> {config.primaryAction}</Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Auto assignment ready", "Manager review view", "Daily work tracking"].map((item, index) => (
            <div className="rounded-lg border border-border bg-white/[0.025] p-4 transition hover:bg-white/[0.04]" key={item}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step {index + 1}</p>
              <p className="mt-1 font-semibold text-white">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric, index) => (
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }} key={metric.label} transition={{ delay: index * 0.04 }}>
            <MetricCard metric={metric} />
          </motion.div>
        ))}
      </section>

      <Tabs defaultValue={config.tabs[0]}>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <TabsList>
            {config.tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3 md:flex">
              <Search size={15} className="text-muted-foreground" />
              <Input className="h-9 border-0 bg-transparent" placeholder={`${config.title} search karein...`} />
            </div>
            <Button variant="outline"><Filter size={16} /> Filters</Button>
          </div>
        </div>

        {config.tabs.map((tab, index) => (
          <TabsContent className="mt-4" key={tab} value={tab}>
            {index === 0 ? <PrimaryModuleSurface moduleKey={moduleKey} /> : index === 1 ? <SecondaryModuleSurface moduleKey={moduleKey} /> : <AnalyticsSurface moduleKey={moduleKey} />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PrimaryModuleSurface({ moduleKey }: { moduleKey: keyof typeof moduleConfigs }) {
  if (moduleKey === "roles") return <PermissionsMatrix />;
  if (moduleKey === "whatsapp") return <WhatsappInbox />;
  if (moduleKey === "chat") return <InternalChat />;
  if (moduleKey === "appointments") return <CalendarSurface />;
  if (moduleKey === "tasks" || moduleKey === "sales" || moduleKey === "support") return <KanbanSurface moduleKey={moduleKey} />;
  if (moduleKey === "settings") return <SettingsSurface />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <EnterpriseTable title={moduleConfigs[moduleKey].title} />
      <OperationalPanel moduleKey={moduleKey} />
    </div>
  );
}

function SecondaryModuleSurface({ moduleKey }: { moduleKey: keyof typeof moduleConfigs }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{moduleConfigs[moduleKey].tabs[1]} View</CardTitle>
            <CardDescription>Details, assignment, comments aur quick action ek jagah.</CardDescription>
          </div>
          <Button size="sm" variant="outline"><MoreHorizontal size={14} /> Actions</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {leads.slice(0, 4).map((lead) => (
            <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={lead.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{lead.company}</p>
                  <p className="text-sm text-muted-foreground">{lead.name} · {lead.owner}</p>
                </div>
                <Badge variant={lead.score > 85 ? "mint" : "amber"}>{lead.score}%</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <OperationalPanel moduleKey={moduleKey} />
    </div>
  );
}

function AnalyticsSurface({ moduleKey }: { moduleKey: keyof typeof moduleConfigs }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader><CardTitle>{moduleConfigs[moduleKey].title} Report</CardTitle><CardDescription>Trend, conversion, team performance aur revenue view.</CardDescription></CardHeader>
        <CardContent><RevenueTrendChart /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Breakup</CardTitle><CardDescription>Source aur status ka simple breakup.</CardDescription></CardHeader>
        <CardContent><SourcePieChart /></CardContent>
      </Card>
      <Card className="xl:col-span-3">
        <CardHeader><CardTitle>Loading & Empty View</CardTitle><CardDescription>Data na ho ya load ho raha ho tab clean UI.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-4 h-24 w-full" /><Skeleton className="mt-4 h-4 w-1/2" /></div>
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">Is filter me koi record nahi mila</div>
          <div className="rounded-lg border border-border p-4"><CallAnalyticsChart /></div>
        </CardContent>
      </Card>
    </div>
  );
}

function EnterpriseTable({ title }: { title: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div><CardTitle>{title} List</CardTitle><CardDescription>Search, filter, page change, bulk action aur owner assignment.</CardDescription></div>
        <Button size="sm" variant="outline"><Settings2 size={14} /> Columns</Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>{["Client", "Stage", "Owner", "Priority", "Amount", "Status"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr className="border-t border-border transition hover:bg-white/[0.035]" key={`${row.account}-${title}`}>
                <td className="px-4 py-3 font-semibold text-white">{row.account}</td>
                <td className="px-4 py-3"><Badge variant="blue">{row.stage}</Badge></td>
                <td className="px-4 py-3 text-slate-300">{row.owner}</td>
                <td className="px-4 py-3"><Badge variant={row.priority === "Critical" ? "danger" : "amber"}>{row.priority}</Badge></td>
                <td className="px-4 py-3 font-semibold text-white">{row.amount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>Page 1 of 24</span>
        <div className="flex gap-2"><Button size="sm" variant="outline">Prev</Button><Button size="sm" variant="outline">Next</Button></div>
      </div>
    </Card>
  );
}

function OperationalPanel({ moduleKey }: { moduleKey: keyof typeof moduleConfigs }) {
  return (
    <Card>
      <CardHeader>
        <div><CardTitle>Work Detail</CardTitle><CardDescription>Reminder, history, assignment, comment aur approval status.</CardDescription></div>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.slice(0, 4).map((lead, index) => (
          <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={`${moduleKey}-${lead.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">{initials(lead.owner)}</div>
                <div>
                  <p className="font-semibold text-white">{lead.owner}</p>
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                </div>
              </div>
              <Badge variant={index % 2 ? "amber" : "mint"}>{index % 2 ? "Pending" : "On track"}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deal value</span>
              <span className="font-semibold text-white">{formatCurrency(lead.value)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function KanbanSurface({ moduleKey }: { moduleKey: keyof typeof moduleConfigs }) {
  const stages = moduleKey === "sales" ? ["Prospect", "Qualified", "Proposal", "Negotiation", "Payment Pending", "Closed Won", "Closed Lost"] : ["Backlog", "In Progress", "Review", "Blocked", "Done"];
  return (
    <div className="dashboard-scrollbar flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage, stageIndex) => (
        <div className="min-h-[460px] w-[310px] shrink-0 rounded-xl border border-border bg-white/[0.025] p-3" key={stage}>
          <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-white">{stage}</h3><Badge variant="blue">{stageIndex + 2}</Badge></div>
          <div className="space-y-3">
            {leads.slice(0, 3).map((lead) => (
              <div className="rounded-lg border border-border bg-white/[0.025] p-3 transition hover:border-white/12 hover:bg-white/[0.04]" key={`${stage}-${lead.id}`}>
                <p className="font-semibold text-white">{moduleKey === "tasks" ? `${lead.company} follow-up` : lead.company}</p>
                <p className="mt-1 text-sm text-muted-foreground">{lead.owner} · {lead.nextFollowUp}</p>
                <div className="mt-3 flex justify-between"><Badge variant="mint">{lead.score}%</Badge><span className="text-sm font-semibold text-white">{formatCurrency(lead.value)}</span></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarSurface() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader><CardTitle>Calendar View</CardTitle><CardDescription>Daily, weekly aur monthly appointment planning.</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
              <div className="min-h-24 rounded-lg border border-border bg-white/[0.025] p-2" key={index}>
              <p className="text-xs text-muted-foreground">{index + 1}</p>
              {index % 5 === 0 ? <Badge className="mt-3" variant="mint">Demo</Badge> : null}
              {index % 7 === 0 ? <Badge className="mt-2" variant="amber">Follow-up</Badge> : null}
            </div>
          ))}
        </CardContent>
      </Card>
      <OperationalPanel moduleKey="appointments" />
    </div>
  );
}

function PermissionsMatrix() {
  const modules = ["Dashboard", "Leads", "Clients", "Sales", "Calls", "WhatsApp", "Finance", "Reports", "Settings"];
  return (
    <Card className="overflow-hidden">
      <CardHeader><CardTitle>Role Permission Matrix</CardTitle><CardDescription>Kaun staff kaun sa module dekh sakta hai.</CardDescription></CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-white/[0.035] text-left text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr><th className="px-4 py-3">Role</th>{modules.map((module) => <th className="px-4 py-3" key={module}>{module}</th>)}</tr>
          </thead>
          <tbody>
            {roles.map((role, rowIndex) => (
              <tr className="border-t border-border" key={role}>
                <td className="px-4 py-3 font-semibold text-white">{role}</td>
                {modules.map((module, index) => (
                  <td className="px-4 py-3" key={module}><Switch defaultChecked={rowIndex < 2 || index < 4} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function WhatsappInbox() {
  return (
    <div className="grid min-h-[620px] gap-4 xl:grid-cols-[330px_1fr_320px]">
      <Card className="overflow-hidden">
        <CardHeader><CardTitle>Shared Inbox</CardTitle><CardDescription>Filter, label aur staff assignment.</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {leads.map((lead) => <div className="rounded-lg border border-border bg-white/[0.025] p-3" key={lead.id}><p className="font-semibold text-white">{lead.name}</p><p className="text-sm text-muted-foreground">{lead.company}</p><Badge className="mt-2" variant="mint">WhatsApp</Badge></div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle><CardDescription>Quick reply, template, note aur assignment.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {["Hi, pricing details share kar sakte ho?", "Sure, proposal aur demo time bhej raha hoon.", "Payment se pehle finance approval assign kar do."].map((message, index) => (
            <div className={`max-w-[80%] rounded-lg p-3 ${index % 2 ? "ml-auto bg-primary text-primary-foreground" : "border border-border bg-white/[0.035] text-slate-200"}`} key={message}>{message}</div>
          ))}
          <div className="mt-6 flex gap-2"><Input placeholder="Reply ya internal note likhein..." /><Button><Send size={16} /></Button></div>
        </CardContent>
      </Card>
      <OperationalPanel moduleKey="whatsapp" />
    </div>
  );
}

function InternalChat() {
  return (
    <div className="grid min-h-[620px] gap-4 xl:grid-cols-[280px_1fr]">
      <Card><CardHeader><CardTitle>Channels</CardTitle></CardHeader><CardContent className="space-y-2">{["# sales-war-room", "# support-escalations", "# finance-approvals", "# product-feedback"].map((channel) => <div className="rounded-xl border border-border bg-white/[0.025] p-3 font-semibold text-slate-200" key={channel}>{channel}</div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Team Conversation</CardTitle><CardDescription>Mentions, file share, direct message aur team notes.</CardDescription></CardHeader><CardContent className="space-y-3">{leads.slice(0, 5).map((lead) => <div className="flex gap-3 rounded-lg border border-border bg-white/[0.025] p-3" key={lead.id}><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">{initials(lead.owner)}</div><div><p className="font-semibold text-white">{lead.owner}</p><p className="text-sm text-muted-foreground">{lead.company} ka proposal update share kiya.</p></div></div>)}<div className="flex gap-2"><Input placeholder="Team message likhein" /><Button><Send size={16} /></Button></div></CardContent></Card>
    </div>
  );
}

function SettingsSurface() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {["Company Profile", "Branding", "SMTP Settings", "WhatsApp API", "Notification Preferences", "Timezone", "Appearance"].map((item, index) => (
        <Card key={item}>
          <CardHeader><CardTitle>{item}</CardTitle><CardDescription>Simple settings panel, advanced UI ke saath.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder={`${item} value`} defaultValue={index % 2 ? "" : "Vaiket Technologies Pvt Ltd"} />
            <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.025] p-3"><span className="text-sm text-slate-300">Enabled</span><Switch defaultChecked={index !== 2} /></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DemoModal({ action, title }: { action: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">{action}</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">{action}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">{title} ke liye simple action modal.</DialogDescription>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Input placeholder="Name" />
          <Input placeholder="Owner" />
          <Input className="md:col-span-2" placeholder="Description" />
          <div className="flex items-center gap-2 rounded-lg border border-border p-3"><Checkbox defaultChecked /><span className="text-sm text-slate-300">Assigned team ko notify karein</span></div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3"><CalendarDays size={16} /><span className="text-sm text-slate-300">Reminder add karein</span></div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline">Cancel</Button><Button>Save</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
