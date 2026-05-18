import { ContactRound, ListChecks, UserCheck } from "lucide-react";
import { LeadTable } from "@/components/telecalling/lead-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLeadRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function Page() {
  const leads = await getLeadRows();
  const assigned = leads.filter((lead) => lead.assignedTo).length;
  const followups = leads.filter((lead) => lead.followupDate).length;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Lead Management</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">All Leads</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Admin and super admin operational view for all leads, assignment status, notes, calls and followups.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Leads</p><p className="mt-2 text-2xl font-semibold text-white">{leads.length}</p></div><ContactRound className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned</p><p className="mt-2 text-2xl font-semibold text-white">{assigned}</p></div><UserCheck className="text-mint" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Followups</p><p className="mt-2 text-2xl font-semibold text-white">{followups}</p></div><ListChecks className="text-amber" /></CardContent></Card>
      </section>
      <LeadTable leads={leads} mode="admin" />
    </div>
  );
}
