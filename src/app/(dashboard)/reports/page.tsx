import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle } from "@/components/ui";
import { FileText } from "lucide-react";

export default async function ReportsPage() {
  const business = await requireBusiness();
  const [sales, products, expenses, customers, purchases] = await Promise.all([
    prisma.sale.findMany({ where: { businessId: business.id } }),
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.expense.findMany({ where: { businessId: business.id } }),
    prisma.customer.findMany({ where: { businessId: business.id } }),
    prisma.purchase.findMany({ where: { businessId: business.id } }),
  ]);

  const reports = [
    { label: "Sales report", value: fmtINR(sales.reduce((a, s) => a + s.total, 0)) + ` (${sales.length} transactions)` },
    { label: "Purchase report", value: fmtINR(purchases.reduce((a, p) => a + p.total, 0)) + ` (${purchases.length} orders)` },
    { label: "Inventory report", value: `${products.length} products, ${fmtINR(products.reduce((a, p) => a + p.stock * p.cost, 0))} value` },
    { label: "Expense report", value: fmtINR(expenses.reduce((a, e) => a + e.amount, 0)) },
    { label: "Receivables report", value: fmtINR(customers.reduce((a, c) => a + c.amount, 0)) },
  ];

  return (
    <div>
      <SectionTitle>Reports</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {reports.map((r) => (
          <Card key={r.label} className="flex justify-between items-center">
            <div>
              <div className="text-sm font-bold">{r.label}</div>
              <div className="text-xs text-[#5B6472] mt-0.5">{r.value}</div>
            </div>
            <FileText size={17} className="text-[#5B6472]" />
          </Card>
        ))}
      </div>
    </div>
  );
}
