"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import type { TelecallingLead } from "@/types/telecalling";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FollowupItem = TelecallingLead["followups"][number] & { lead: TelecallingLead };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function FollowupCard({ item }: { item: FollowupItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{item.lead.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.lead.phone} · {formatDate(item.followupDate)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{item.note ?? item.followupType}</p>
        </div>
        <Badge variant={item.status === "completed" ? "mint" : "amber"}>{item.status}</Badge>
      </div>
      {item.status !== "completed" ? (
        <Button
          className="mt-3"
          disabled={isPending}
          size="sm"
          variant="outline"
          onClick={() => {
            startTransition(async () => {
              await fetch(`/api/telecaller/followups/${item.id}/complete`, { method: "PATCH" });
              window.location.reload();
            });
          }}
        >
          <CheckCircle2 size={14} /> Complete
        </Button>
      ) : null}
    </div>
  );
}

export function FollowupBoard({ leads }: { leads: TelecallingLead[] }) {
  const now = new Date();
  const items = leads.flatMap((lead) => lead.followups.map((followup) => ({ ...followup, lead })));
  const today = items.filter((item) => item.status === "pending" && item.followupDate.toDateString() === now.toDateString());
  const overdue = items.filter((item) => item.status === "pending" && item.followupDate < now);
  const upcoming = items.filter((item) => item.status === "pending" && item.followupDate > now && item.followupDate.toDateString() !== now.toDateString());
  const completed = items.filter((item) => item.status === "completed");

  const sections = [
    { items: today, title: "Today's Followups" },
    { items: overdue, title: "Overdue" },
    { items: upcoming, title: "Upcoming" },
    { items: completed, title: "Completed" }
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {sections.map((section) => (
        <section className="rounded-xl border border-border bg-white/[0.025] p-3" key={section.title}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">{section.title}</h3>
            <Badge variant="blue">{section.items.length}</Badge>
          </div>
          <div className="space-y-3">
            {section.items.map((item) => <FollowupCard item={item} key={item.id} />)}
            {!section.items.length ? <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No records.</p> : null}
          </div>
        </section>
      ))}
    </div>
  );
}
