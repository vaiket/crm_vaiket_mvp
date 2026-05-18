import type { ModuleMetric } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ metric }: { metric: ModuleMetric }) {
  const Icon = metric.icon;

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5">
      <CardContent className="relative p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">{metric.value}</p>
          </div>
          {Icon ? (
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/[0.04] text-primary ring-1 ring-white/8 transition group-hover:bg-primary/10">
              <Icon size={18} />
            </div>
          ) : null}
        </div>
        <Badge className="mt-5" variant={metric.tone}>
          {metric.delta}
        </Badge>
      </CardContent>
    </Card>
  );
}
