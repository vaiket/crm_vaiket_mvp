import { LeadTable } from "@/components/telecalling/lead-table";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/current-user";
import { getTelecallerLeadRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function MyLeadsPage() {
  const profile = await getCurrentProfile();
  const leads = profile ? await getTelecallerLeadRows(profile.authUserId) : [];

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Restricted</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">My Leads</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">Yahan sirf aapko assigned rows visible hain.</p>
      </section>
      <LeadTable leads={leads} mode="telecaller" />
    </div>
  );
}
