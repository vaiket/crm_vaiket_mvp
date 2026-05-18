import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { getFinanceDashboardData } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function FinanceDashboardPage() {
  const data = await getFinanceDashboardData();
  return <FinanceDashboard {...data} />;
}
