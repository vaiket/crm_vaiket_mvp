import { prisma } from "@/lib/prisma";

export type FinanceInvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type FinanceInvoiceRow = {
  amount: number;
  createdAt: Date;
  customerEmail: string | null;
  customerName: string;
  customerPhone: string | null;
  dueDate: Date;
  id: string;
  invoiceNumber: string;
  paidAt: Date | null;
  status: FinanceInvoiceStatus;
  taxAmount: number;
  totalAmount: number;
};

export type FinancePaymentRow = {
  amount: number;
  createdAt: Date;
  id: string;
  invoiceId: string;
  method: string;
  reference: string | null;
};

type RawInvoice = {
  amount: unknown;
  created_at: Date;
  customer_email: string | null;
  customer_name: string;
  customer_phone: string | null;
  due_date: Date;
  id: string;
  invoice_number: string;
  paid_at: Date | null;
  status: string;
  tax_amount: unknown;
  total_amount: unknown;
};

type RawPayment = {
  amount: unknown;
  created_at: Date;
  id: string;
  invoice_id: string;
  method: string;
  reference: string | null;
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return 0;
}

function toInvoice(row: RawInvoice): FinanceInvoiceRow {
  return {
    amount: toNumber(row.amount),
    createdAt: row.created_at,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    dueDate: row.due_date,
    id: row.id,
    invoiceNumber: row.invoice_number,
    paidAt: row.paid_at,
    status: row.status as FinanceInvoiceStatus,
    taxAmount: toNumber(row.tax_amount),
    totalAmount: toNumber(row.total_amount)
  };
}

function toPayment(row: RawPayment): FinancePaymentRow {
  return {
    amount: toNumber(row.amount),
    createdAt: row.created_at,
    id: row.id,
    invoiceId: row.invoice_id,
    method: row.method,
    reference: row.reference
  };
}

export function canManageFinance(role: string) {
  return role === "super_admin" || role === "finance";
}

export async function ensureFinanceSchema() {
  await prisma.$executeRawUnsafe("create extension if not exists pgcrypto");
  await prisma.$executeRawUnsafe(`
    create table if not exists public.finance_invoices (
      id uuid primary key default gen_random_uuid(),
      invoice_number text not null unique,
      customer_name text not null,
      customer_email text,
      customer_phone text,
      amount numeric(12,2) not null check (amount >= 0),
      tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
      total_amount numeric(12,2) generated always as (amount + tax_amount) stored,
      status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
      due_date date not null,
      paid_at timestamptz,
      created_by uuid references public.profiles(auth_user_id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await prisma.$executeRawUnsafe(`
    create table if not exists public.finance_payments (
      id uuid primary key default gen_random_uuid(),
      invoice_id uuid not null references public.finance_invoices(id) on delete cascade,
      amount numeric(12,2) not null check (amount > 0),
      method text not null default 'manual',
      reference text,
      recorded_by uuid references public.profiles(auth_user_id),
      created_at timestamptz not null default now()
    )
  `);
  await prisma.$executeRawUnsafe("create index if not exists finance_invoices_status_idx on public.finance_invoices(status)");
  await prisma.$executeRawUnsafe("create index if not exists finance_invoices_due_date_idx on public.finance_invoices(due_date)");
  await prisma.$executeRawUnsafe("create index if not exists finance_payments_invoice_id_idx on public.finance_payments(invoice_id)");
}

export async function getFinanceDashboardData() {
  await ensureFinanceSchema();

  const [invoicesRaw, paymentsRaw] = await Promise.all([
    prisma.$queryRawUnsafe<RawInvoice[]>("select * from public.finance_invoices order by created_at desc limit 100"),
    prisma.$queryRawUnsafe<RawPayment[]>("select * from public.finance_payments order by created_at desc limit 100")
  ]);

  const invoices = invoicesRaw.map(toInvoice);
  const payments = paymentsRaw.map(toPayment);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status)).reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const overdue = invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status) && invoice.dueDate < today);
  const overdueAmount = overdue.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return {
    collected,
    invoices,
    overdueAmount,
    overdueCount: overdue.length,
    payments,
    totalBilled,
    outstanding
  };
}

export async function createFinanceInvoice(input: {
  amount: number;
  createdBy: string;
  customerEmail?: string | null;
  customerName: string;
  customerPhone?: string | null;
  dueDate: string;
  taxAmount: number;
}) {
  await ensureFinanceSchema();
  const invoiceNumber = `VK-${Date.now()}`;
  const rows = await prisma.$queryRawUnsafe<RawInvoice[]>(
    `
      insert into public.finance_invoices
        (invoice_number, customer_name, customer_email, customer_phone, amount, tax_amount, due_date, created_by, status)
      values
        ($1, $2, $3, $4, $5, $6, $7::date, $8::uuid, 'sent')
      returning *
    `,
    invoiceNumber,
    input.customerName,
    input.customerEmail || null,
    input.customerPhone || null,
    input.amount,
    input.taxAmount,
    input.dueDate,
    input.createdBy
  );

  return toInvoice(rows[0]);
}

export async function updateFinanceInvoice(input: {
  actorId: string;
  invoiceId: string;
  method?: string;
  reference?: string;
  status: FinanceInvoiceStatus;
}) {
  await ensureFinanceSchema();

  const rows = await prisma.$queryRawUnsafe<RawInvoice[]>(
    `
      update public.finance_invoices
      set status = $1,
          paid_at = case when $1 = 'paid' then coalesce(paid_at, now()) else paid_at end,
          updated_at = now()
      where id = $2::uuid
      returning *
    `,
    input.status,
    input.invoiceId
  );

  const invoice = rows[0] ? toInvoice(rows[0]) : null;
  if (invoice && input.status === "paid") {
    await prisma.$executeRawUnsafe(
      `
        insert into public.finance_payments (invoice_id, amount, method, reference, recorded_by)
        values ($1::uuid, $2, $3, $4, $5::uuid)
      `,
      invoice.id,
      invoice.totalAmount,
      input.method || "manual",
      input.reference || null,
      input.actorId
    );
  }

  return invoice;
}
