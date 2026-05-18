import { Headphones, UserRoundCheck } from "lucide-react";
import { TelecallerTable } from "@/components/telecalling/telecaller-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/current-user";
import { getTelecallerManagementRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function TelecallersPage() {
  const [profile, telecallers] = await Promise.all([getCurrentProfile(), getTelecallerManagementRows()]);
  const active = telecallers.filter((item) => item.isActive).length;

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="mint">Staff Access</Badge>
              <Badge variant="blue">Telecallers</Badge>
              <Badge variant="violet">Supabase Auth</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Telecaller Management</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Create, edit, activate/deactivate aur password reset for telecaller accounts.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Telecallers</p><p className="mt-2 text-2xl font-semibold text-white">{telecallers.length}</p></div><Headphones className="text-primary" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active</p><p className="mt-2 text-2xl font-semibold text-white">{active}</p></div><UserRoundCheck className="text-mint" /></CardContent></Card>
      </section>

      <TelecallerTable canImpersonate={profile?.role === "super_admin"} telecallers={telecallers} />
    </div>
  );
}
