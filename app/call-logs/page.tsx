import { PhoneCall, Target, Timer } from "lucide-react";
import { CallHistoryTable } from "@/components/telecalling/call-history-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CallLogsPage() {
  const rows = await prisma.callLog.findMany({
    include: { lead: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" }
  });
  const connected = rows.filter((row) => ["Connected", "Interested", "Converted"].includes(row.outcome)).length;
  const totalDuration = rows.reduce((sum, row) => sum + (row.durationSeconds ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Call Logs</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">All Team Calls</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Admin monitoring for call outcomes, duration, notes and lead context across telecallers.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Calls</p><p className="mt-2 text-2xl font-semibold text-white">{rows.length}</p></div><PhoneCall className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Connected</p><p className="mt-2 text-2xl font-semibold text-white">{connected}</p></div><Target className="text-mint" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Talk Time</p><p className="mt-2 text-2xl font-semibold text-white">{Math.round(totalDuration / 60)}m</p></div><Timer className="text-amber" /></CardContent></Card>
      </section>
      <CallHistoryTable rows={rows} />
    </div>
  );
}
