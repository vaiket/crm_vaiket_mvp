"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Banknote, CheckCircle2, FilePlus2, ReceiptText, Search, WalletCards } from "lucide-react";
import type { FinanceInvoiceRow, FinancePaymentRow } from "@/lib/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function statusTone(status: string) {
  if (status === "paid") return "mint";
  if (status === "overdue" || status === "cancelled") return "danger";
  if (status === "sent") return "blue";
  return "amber";
}

function formatDate(value: Date | string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export function FinanceDashboard({
  collected,
  invoices,
  outstanding,
  overdueAmount,
  overdueCount,
  payments,
  totalBilled
}: {
  collected: number;
  invoices: FinanceInvoiceRow[];
  outstanding: number;
  overdueAmount: number;
  overdueCount: number;
  payments: FinancePaymentRow[];
  totalBilled: number;
}) {
  return (
    <div className="space-y-6">
      <section className="premium-surface rounded-xl p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="mint">Finance</Badge>
              <Badge variant="blue">Billing control</Badge>
              <Badge variant="violet">Live invoices</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-[32px]">Finance Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Invoices, payments, outstanding collections aur overdue billing ka operational view.
            </p>
          </div>
          <CreateInvoiceDialog />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<ReceiptText />} label="Total Billed" tone="mint" value={currency(totalBilled)} />
        <Metric icon={<CheckCircle2 />} label="Collected" tone="blue" value={currency(collected)} />
        <Metric icon={<WalletCards />} label="Outstanding" tone="amber" value={currency(outstanding)} />
        <Metric icon={<AlertTriangle />} label="Overdue" tone="danger" value={`${currency(overdueAmount)} · ${overdueCount}`} />
      </section>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4" value="invoices">
          <InvoiceTable invoices={invoices} />
        </TabsContent>
        <TabsContent className="mt-4" value="payments">
          <PaymentTable payments={payments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ icon, label, tone, value }: { icon: React.ReactNode; label: string; tone: "amber" | "blue" | "danger" | "mint"; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/[0.04] text-primary">{icon}</div>
        <Badge className="hidden" variant={tone}>{tone}</Badge>
      </CardContent>
    </Card>
  );
}

function CreateInvoiceDialog() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    startTransition(async () => {
      const response = await fetch("/api/finance/invoices", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(response.ok ? "Invoice create ho gaya." : result.error ?? "Invoice create failed.");
      if (response.ok) router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild><Button><FilePlus2 size={16} /> New Invoice</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-white">Create Invoice</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">Customer billing ke liye invoice generate karein.</DialogDescription>
        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input name="customerName" placeholder="Customer name" required />
          <Input name="customerEmail" placeholder="Email" type="email" />
          <Input name="customerPhone" placeholder="Phone" />
          <Input name="dueDate" required type="date" />
          <Input name="amount" placeholder="Amount" required type="number" />
          <Input name="taxAmount" placeholder="Tax amount" type="number" />
          {message ? <p className="md:col-span-2 rounded-xl border border-border bg-white/[0.025] px-3 py-2 text-sm text-slate-200">{message}</p> : null}
          <div className="md:col-span-2 flex justify-end"><Button disabled={isPending} type="submit">Create Invoice</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceTable({ invoices }: { invoices: FinanceInvoiceRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => invoices.filter((invoice) => `${invoice.invoiceNumber} ${invoice.customerName} ${invoice.status}`.toLowerCase().includes(query.toLowerCase())),
    [invoices, query]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.025] px-3 md:max-w-md">
        <Search className="text-muted-foreground" size={16} />
        <Input className="border-0 bg-transparent" placeholder="Search invoice..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-white/[0.025]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>{["Invoice", "Customer", "Due Date", "Amount", "Tax", "Total", "Status", "Actions"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr className="border-t border-border/70 transition hover:bg-white/[0.035]" key={invoice.id}>
                <td className="px-4 py-3 font-semibold text-white">{invoice.invoiceNumber}</td>
                <td className="px-4 py-3"><p className="font-semibold text-white">{invoice.customerName}</p><p className="text-xs text-muted-foreground">{invoice.customerEmail ?? invoice.customerPhone ?? "-"}</p></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                <td className="px-4 py-3 text-slate-300">{currency(invoice.amount)}</td>
                <td className="px-4 py-3 text-slate-300">{currency(invoice.taxAmount)}</td>
                <td className="px-4 py-3 font-semibold text-white">{currency(invoice.totalAmount)}</td>
                <td className="px-4 py-3"><Badge variant={statusTone(invoice.status)}>{invoice.status}</Badge></td>
                <td className="px-4 py-3"><InvoiceActions invoice={invoice} /></td>
              </tr>
            ))}
            {!filtered.length ? <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={8}>Abhi invoice data nahi hai.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceActions({ invoice }: { invoice: FinanceInvoiceRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function update(status: string) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/finance/invoices/${invoice.id}`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setMessage(response.ok ? "Updated." : result.error ?? "Update failed.");
      if (response.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {invoice.status !== "paid" ? <Button disabled={isPending} size="sm" variant="outline" onClick={() => update("paid")}><Banknote size={14} /> Mark paid</Button> : null}
      {invoice.status !== "cancelled" ? <Button disabled={isPending} size="sm" variant="outline" onClick={() => update("cancelled")}>Cancel</Button> : null}
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}

function PaymentTable({ payments }: { payments: FinancePaymentRow[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.035] text-[11px] uppercase tracking-widest text-blue-200/70">
            <tr>{["Amount", "Method", "Reference", "Invoice ID", "Date"].map((head) => <th className="px-4 py-3" key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr className="border-t border-border/70" key={payment.id}>
                <td className="px-4 py-3 font-semibold text-white">{currency(payment.amount)}</td>
                <td className="px-4 py-3 text-slate-300">{payment.method}</td>
                <td className="px-4 py-3 text-muted-foreground">{payment.reference ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{payment.invoiceId}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
            {!payments.length ? <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>Abhi payment data nahi hai.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
