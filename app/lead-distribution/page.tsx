import { ListChecks, UsersRound } from "lucide-react";
import { AssignmentPanel } from "@/components/telecalling/assignment-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLeadRows, getTelecallers } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function LeadDistributionPage() {
  const [leads, telecallers] = await Promise.all([getLeadRows(), getTelecallers()]);
  const unassigned = leads.filter((lead) => !lead.assignedTo).length;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Operations</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Lead Distribution</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Manual assignment, bulk assignment, reassignment aur simple equal distribution.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Leads</p><p className="mt-2 text-2xl font-semibold text-white">{leads.length}</p></div><ListChecks className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unassigned</p><p className="mt-2 text-2xl font-semibold text-white">{unassigned}</p></div><UsersRound className="text-amber" /></CardContent></Card>
      </section>
      <AssignmentPanel leads={leads} telecallers={telecallers} />
    </div>
  );
}
