import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function TelecallerProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Profile</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">My Profile</h2>
      </section>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Info label="Name" value={profile?.name ?? "-"} />
          <Info label="Email" value={profile?.email ?? "-"} />
          <Info label="Phone" value={profile?.phone ?? "-"} />
          <Info label="Role" value={profile?.role ?? "-"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.025] p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
