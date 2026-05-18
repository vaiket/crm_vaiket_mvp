import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { canManageFinance, updateFinanceInvoice, type FinanceInvoiceStatus } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

const statuses: FinanceInvoiceStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentProfile();
  if (!current || !canManageFinance(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { method?: string; reference?: string; status?: FinanceInvoiceStatus };

  if (!body.status || !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Valid invoice status required hai." }, { status: 400 });
  }

  const invoice = await updateFinanceInvoice({
    actorId: current.authUserId,
    invoiceId: id,
    method: body.method,
    reference: body.reference,
    status: body.status
  });

  if (!invoice) return NextResponse.json({ error: "Invoice nahi mila." }, { status: 404 });

  await prisma.auditLog.create({
    data: {
      action: `finance_invoice_${body.status}`,
      actorId: current.authUserId,
      entityId: invoice.id,
      entityType: "finance_invoice",
      metadata: { invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount }
    }
  });

  return NextResponse.json({ invoice });
}
