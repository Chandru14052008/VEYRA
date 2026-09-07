import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, Row } from "@/components/ui";
import BreakEvenCalculator from "./break-even-calculator";

export default async function FinancePage() {
  const business = await requireBusiness();
  const [sales, purchases, expenses] = await Promise.all([
    prisma.sale.findMany({ where: { businessId: business.id } }),
    prisma.purchase.findMany({ where: { businessId: business.id } }),
    prisma.expense.findMany({ where: { businessId: business.id } }),
  ]);

  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const cogs = sales.reduce((a, s) => a + s.total * (1 - s.margin / 100), 0);
  const gross = revenue - cogs;
  const opex = expenses.reduce((a, e) => a + e.amount, 0);
  const net = gross - opex;

  return (
    <div>
      <SectionTitle>P&L snapshot</SectionTitle>
      <Card>
        <Row label="Revenue" value={fmtINR(revenue)} />
        <Row label="Cost of goods sold" value={fmtINR(cogs)} />
        <Row label="Gross profit" value={fmtINR(gross)} />
        <Row label="Operating expenses" value={fmtINR(opex)} />
        <Row label="Net profit (estimate)" value={fmtINR(net)} />
      </Card>

      <SectionTitle>Break-even calculator</SectionTitle>
      <BreakEvenCalculator />
    </div>
  );
}
