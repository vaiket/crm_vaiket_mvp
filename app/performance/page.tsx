import { Badge } from "@/components/ui/badge";
import { getPerformanceRows } from "@/lib/telecalling";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const rows = await getPerformanceRows();

  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <Badge variant="mint">Performance</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Telecaller Performance</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Assigned leads, calls, interested, converted aur pending followups ka MVP view.
        </p>
      </section>
      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>
              {["Telecaller Name", "Assigned Leads", "Calls Done", "Interested", "Converted", "Pending Followups", "Conversion %"].map((head) => (
                <th className="px-4 py-3" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-border/70 transition hover:bg-white/[0.035]" key={row.telecallerId}>
                <td className="px-4 py-3 font-semibold text-white">{row.telecallerName}</td>
                <td className="px-4 py-3 text-slate-300">{row.assignedLeads}</td>
                <td className="px-4 py-3 text-slate-300">{row.callsDone}</td>
                <td className="px-4 py-3 text-slate-300">{row.interested}</td>
                <td className="px-4 py-3 text-slate-300">{row.converted}</td>
                <td className="px-4 py-3 text-slate-300">{row.pendingFollowups}</td>
                <td className="px-4 py-3 font-semibold text-white">{row.conversionRate}%</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>Koi telecaller data nahi mila.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
