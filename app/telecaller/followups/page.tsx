import { FollowupBoard } from "@/components/telecalling/followup-board";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/current-user";
import { getTelecallerLeadRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function FollowupsPage() {
  const profile = await getCurrentProfile();
  const leads = profile ? await getTelecallerLeadRows(profile.authUserId) : [];

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="amber">Pending Followups</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Followups</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Scheduled followups for your assigned leads.</p>
      </section>
      <FollowupBoard leads={leads} />
    </div>
  );
}
