"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Filter, Import, Mail, MessageSquareText, MoreHorizontal, PhoneCall, Plus, Search, SlidersHorizontal, UserPlus, X } from "lucide-react";
import { leads as seedLeads, leadStages } from "@/data/crm";
import type { Lead, LeadStage } from "@/types/crm";
import { formatCurrency, initials } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LeadForm = {
  company: string;
  email: string;
  name: string;
  phone: string;
};

function priorityTone(priority: Lead["priority"]) {
  return priority === "Critical" ? "danger" : priority === "High" ? "amber" : priority === "Medium" ? "blue" : "mint";
}

export function LeadsPage() {
  const [leads, setLeads] = useState(seedLeads);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"score" | "value" | "activity">("score");
  const { leadDrawerOpen, selectedLeadId, openLeadDrawer, closeLeadDrawer } = useUIStore();
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];

  const filtered = useMemo(() => {
    return leads
      .filter((lead) => `${lead.name} ${lead.company} ${lead.owner} ${lead.stage}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (sort === "score" ? b.score - a.score : sort === "value" ? b.value - a.value : a.lastActivity.localeCompare(b.lastActivity)));
  }, [leads, query, sort]);

  function moveLead(id: string, stage: LeadStage) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, stage } : lead)));
  }

  return (
    <div className="space-y-6">
      <section className="premium-surface flex flex-col justify-between gap-4 rounded-xl p-5 md:flex-row md:items-center md:p-6">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="mint">Leads command center</Badge>
            <Badge variant="blue">12 stages</Badge>
            <Badge variant="violet">AI score view</Badge>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px] md:leading-tight">Pipeline, qualification, follow-ups, and activity intelligence</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Manage kanban stages, advanced tables, split detail views, owner assignment, timelines, call history, WhatsApp, email, import/export, and bulk actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Import size={16} /> Import</Button>
          <Button variant="outline"><Download size={16} /> Export</Button>
          <LeadCreateDialog />
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white/[0.025] p-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3">
          <Search className="text-muted-foreground" size={16} />
          <Input className="border-0 bg-transparent" placeholder="Search leads, company, owner, stage..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter size={16} /> Filters</Button>
          <Button variant="outline"><UserPlus size={16} /> Assign owner</Button>
          <select className="h-10 rounded-xl border border-border bg-ink-900 px-3 text-sm text-slate-200" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
            <option value="score">Sort by score</option>
            <option value="value">Sort by value</option>
            <option value="activity">Sort by activity</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Pipeline</TabsTrigger>
          <TabsTrigger value="table">Advanced Table</TabsTrigger>
          <TabsTrigger value="split">Split Detail View</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="kanban">
          <div className="dashboard-scrollbar flex gap-4 overflow-x-auto pb-2">
            {leadStages.map((stage) => {
              const stageLeads = filtered.filter((lead) => lead.stage === stage);
              return (
                <div
                  className="min-h-[520px] w-[310px] shrink-0 rounded-xl border border-border bg-white/[0.025] p-3"
                  key={stage}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => moveLead(event.dataTransfer.getData("leadId"), stage)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{stage}</h3>
                    <Badge variant={stageLeads.length ? "blue" : "default"}>{stageLeads.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.length ? (
                      stageLeads.map((lead) => (
                        <article
                          className="cursor-grab rounded-lg border border-border bg-white/[0.025] p-3 transition hover:border-white/12 hover:bg-white/[0.04]"
                          draggable
                          key={lead.id}
                          onClick={() => openLeadDrawer(lead.id)}
                          onDragStart={(event) => event.dataTransfer.setData("leadId", lead.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.company}</p>
                            </div>
                            <Badge variant={priorityTone(lead.priority)}>{lead.priority}</Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="blue">{lead.source}</Badge>
                            <Badge variant="mint">Score {lead.score}</Badge>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{lead.owner}</span>
                            <span className="font-semibold text-white">{formatCurrency(lead.value)}</span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="grid h-40 place-items-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                        Empty stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="table">
          <LeadsTable leads={filtered} onOpen={openLeadDrawer} />
        </TabsContent>

        <TabsContent className="mt-4" value="split">
          <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <LeadsTable leads={filtered} onOpen={openLeadDrawer} />
            <LeadInspector lead={selectedLead} />
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {leadDrawerOpen ? (
          <motion.aside
            animate={{ x: 0 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-xl overflow-y-auto border-l border-border bg-ink-950/96 p-5 shadow-panel backdrop-blur-xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Badge variant="mint">Lead Detail Drawer</Badge>
                <h2 className="mt-2 text-xl font-semibold text-white">{selectedLead.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedLead.company}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={closeLeadDrawer}><X size={16} /></Button>
            </div>
            <LeadInspector lead={selectedLead} />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LeadsTable({ leads, onOpen }: { leads: Lead[]; onOpen: (id: string) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Lead Data Table</CardTitle>
          <CardDescription>Bulk actions, sorting, pagination, owner assignment, and pipeline status.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><SlidersHorizontal size={14} /> Columns</Button>
          <Button size="sm" variant="outline"><MoreHorizontal size={14} /> Bulk</Button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>
              {["Lead", "Stage", "Owner", "Score", "Value", "Next Follow-up", "Channels", "Action"].map((head) => (
                <th className="px-4 py-3" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr className="border-t border-border/70 transition hover:bg-white/[0.035]" key={lead.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">{initials(lead.name)}</div>
                    <div>
                      <Link className="font-semibold text-white hover:text-primary" href="/leads/LF-1007">{lead.name}</Link>
                      <p className="text-xs text-muted-foreground">{lead.company} · {lead.city}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="blue">{lead.stage}</Badge></td>
                <td className="px-4 py-3 text-slate-300">{lead.owner}</td>
                <td className="px-4 py-3"><Badge variant={lead.score > 85 ? "mint" : "amber"}>{lead.score}</Badge></td>
                <td className="px-4 py-3 font-semibold text-white">{formatCurrency(lead.value)}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.nextFollowUp}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-muted-foreground"><PhoneCall size={16} /><MessageSquareText size={16} /><Mail size={16} /></div>
                </td>
                <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => onOpen(lead.id)}>Open</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>Showing 1-6 of 12,842 leads</span>
        <div className="flex gap-2"><Button size="sm" variant="outline">Prev</Button><Button size="sm" variant="outline">Next</Button></div>
      </div>
    </Card>
  );
}

export function LeadInspector({ lead }: { lead: Lead }) {
  const timeline = [
    ["Call History", "Connected call with decision maker. Budget confirmed.", PhoneCall],
    ["WhatsApp History", "Template sent: enterprise demo reminder.", MessageSquareText],
    ["Email History", "Proposal deck opened twice from Mumbai IP.", Mail],
    ["Internal Note", "Finance approval needed before discounting.", MoreHorizontal]
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Customer profile</p>
              <h3 className="text-xl font-semibold text-white">{lead.name}</h3>
              <p className="text-sm text-muted-foreground">{lead.email} · {lead.phone}</p>
            </div>
            <Badge variant={priorityTone(lead.priority)}>{lead.priority}</Badge>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-primary" style={{ width: `${lead.score}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-white/[0.025] p-3"><p className="text-muted-foreground">Stage</p><p className="font-semibold text-white">{lead.stage}</p></div>
            <div className="rounded-lg border border-border bg-white/[0.025] p-3"><p className="text-muted-foreground">Value</p><p className="font-semibold text-white">{formatCurrency(lead.value)}</p></div>
            <div className="rounded-lg border border-border bg-white/[0.025] p-3"><p className="text-muted-foreground">Owner</p><p className="font-semibold text-white">{lead.owner}</p></div>
            <div className="rounded-lg border border-border bg-white/[0.025] p-3"><p className="text-muted-foreground">Follow-up</p><p className="font-semibold text-white">{lead.nextFollowUp}</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Activity Timeline</CardTitle><CardDescription>Notes, calls, WhatsApp, emails, tasks, logs, appointments, and assigned staff.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {timeline.map(([title, detail, Icon]) => (
            <div className="flex gap-3 rounded-lg border border-border bg-white/[0.025] p-3" key={String(title)}>
              <Icon className="text-primary" size={17} />
              <div><p className="font-semibold text-white">{String(title)}</p><p className="text-sm text-muted-foreground">{String(detail)}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LeadCreateDialog() {
  const { register, handleSubmit, reset } = useForm<LeadForm>();
  const [submitted, setSubmitted] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><Plus size={16} /> New lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Create Lead</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">UI-only React Hook Form flow for enterprise lead capture.</DialogDescription>
        <form
          className="mt-5 grid gap-3 md:grid-cols-2"
          onSubmit={handleSubmit(() => {
            setSubmitted(true);
            reset();
          })}
        >
          <Input placeholder="Customer name" {...register("name", { required: true })} />
          <Input placeholder="Company" {...register("company", { required: true })} />
          <Input placeholder="Email" {...register("email")} />
          <Input placeholder="Phone" {...register("phone")} />
          <div className="md:col-span-2 flex justify-end gap-2">
            {submitted ? <Badge variant="mint">Lead draft captured</Badge> : null}
            <Button type="submit">Save lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
