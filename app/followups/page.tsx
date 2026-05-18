import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";
import { FollowupBoard } from "@/components/telecalling/followup-board";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLeadRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function FollowupsPage() {
  const leads = await getLeadRows();
  const now = new Date();
  const followups = leads.flatMap((lead) => lead.followups);
  const pending = followups.filter((followup) => followup.status === "pending").length;
  const overdue = followups.filter((followup) => followup.status === "pending" && followup.followupDate < now).length;
  const completed = followups.filter((followup) => followup.status === "completed").length;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="amber">Followups</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Followup Management</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          All pending, overdue, upcoming and completed followups across the calling team.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pending</p><p className="mt-2 text-2xl font-semibold text-white">{pending}</p></div><CalendarClock className="text-amber" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Overdue</p><p className="mt-2 text-2xl font-semibold text-white">{overdue}</p></div><AlertTriangle className="text-danger" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Completed</p><p className="mt-2 text-2xl font-semibold text-white">{completed}</p></div><CheckCircle2 className="text-mint" /></CardContent></Card>
      </section>
      <FollowupBoard leads={leads} />
    </div>
  );
}
