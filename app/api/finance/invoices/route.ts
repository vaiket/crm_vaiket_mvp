import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";
import { canManageFinance, createFinanceInvoice } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const current = await getCurrentProfile();
  if (!current || !canManageFinance(current.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    amount?: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    dueDate?: string;
    taxAmount?: string;
  };

  const amount = Number(body.amount ?? 0);
  const taxAmount = Number(body.taxAmount ?? 0);
  const customerName = body.customerName?.trim();

  if (!customerName || !body.dueDate || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Customer, due date aur valid amount required hai." }, { status: 400 });
  }

  const invoice = await createFinanceInvoice({
    amount,
    createdBy: current.authUserId,
    customerEmail: body.customerEmail?.trim() || null,
    customerName,
    customerPhone: body.customerPhone?.trim() || null,
    dueDate: body.dueDate,
    taxAmount: Number.isFinite(taxAmount) ? taxAmount : 0
  });

  await prisma.auditLog.create({
    data: {
      action: "finance_invoice_created",
      actorId: current.authUserId,
      entityId: invoice.id,
      entityType: "finance_invoice",
      metadata: { amount: invoice.totalAmount, invoiceNumber: invoice.invoiceNumber }
    }
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
