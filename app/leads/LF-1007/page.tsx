import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail, MessageSquareText, PhoneCall, ShieldCheck } from "lucide-react";
import { LeadInspector } from "@/components/leads-page";
import { leads } from "@/data/crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  const lead = leads[0];

  return (
    <div className="space-y-6">
      <section className="premium-surface flex flex-col justify-between gap-4 rounded-xl p-5 md:flex-row md:items-center md:p-6">
        <div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/leads"><ArrowLeft size={15} /> Back to leads</Link>
          </Button>
          <div className="mt-4">
            <Badge variant="mint">Lead detail page</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-[32px]">{lead.name}</h2>
            <p className="text-sm text-muted-foreground">{lead.company} · assigned to {lead.owner}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><PhoneCall size={16} /> Call</Button>
          <Button variant="outline"><MessageSquareText size={16} /> WhatsApp</Button>
          <Button><CalendarDays size={16} /> Book appointment</Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <LeadInspector lead={lead} />
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Assigned Staff</CardTitle><CardDescription>Sales, telecaller, finance, and support ownership.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {["Priya Sharma · Sales Manager", "Rohit Mehta · Telecaller", "Anita Rao · Finance", "Neha Bose · Support"].map((staff) => (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.025] p-3" key={staff}>
                  <ShieldCheck className="text-primary" size={17} />
                  <span className="font-semibold text-slate-200">{staff}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Sales History</CardTitle><CardDescription>Proposal, appointment, invoice, and payment milestones.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {["Proposal v3 generated", "Enterprise demo completed", "Payment terms negotiated", "Invoice draft pending"].map((item) => (
                <div className="rounded-lg border border-border bg-white/[0.025] p-3 text-sm text-slate-300" key={item}>{item}</div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Communication</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <Badge variant="blue"><Mail size={13} /> Emails 8</Badge>
              <Badge variant="mint"><PhoneCall size={13} /> Calls 12</Badge>
              <Badge variant="amber"><MessageSquareText size={13} /> WhatsApp 19</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
