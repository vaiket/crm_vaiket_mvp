import { CallHistoryTable } from "@/components/telecalling/call-history-table";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CallHistoryPage() {
  const profile = await getCurrentProfile();
  const rows = profile
    ? await prisma.callLog.findMany({
        include: { lead: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        where: { userId: profile.authUserId }
      })
    : [];

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Call History</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">My Calls</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Only your calls for assigned leads.</p>
      </section>
      <CallHistoryTable rows={rows} />
    </div>
  );
}
