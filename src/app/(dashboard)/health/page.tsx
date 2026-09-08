import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcBusinessHealth, fmtINR } from "@/lib/calculations";
import { Card, SectionTitle } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

export default async function HealthPage() {
  const business = await requireBusiness();
  const [products, customers, sales] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.customer.findMany({ where: { businessId: business.id } }),
    prisma.sale.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const thisWeekTotal = sales.reduce((a, s) => a + s.total, 0);
  const health = calcBusinessHealth(products, customers, { thisWeek: thisWeekTotal, lastWeek: thisWeekTotal * 0.9 });

  const areas = [
    { label: "Sales", score: health.salesScore },
    { label: "Profitability", score: health.profitScore },
    { label: "Inventory", score: health.inventoryScore },
    { label: "Cash flow", score: health.cashScore },
    { label: "Receivables", score: health.receivableScore },
  ].sort((a, b) => a.score - b.score);

  const weakest = areas[0];
  const overdueAmount = customers.filter((c) => c.days > 30).reduce((a, c) => a + c.amount, 0);
  const lowStockCount = products.filter((p) => {
    const rol = p.avgDaily * p.leadTime + p.safety;
    return p.stock <= rol;
  }).length;

  let recommendation = "Keep monitoring — nothing urgent right now.";
  if (weakest.label === "Receivables" && overdueAmount > 0) {
    recommendation = `Collect ${fmtINR(overdueAmount)} in overdue customer payments.`;
  } else if (weakest.label === "Inventory" && lowStockCount > 0) {
    recommendation = `Reorder ${lowStockCount} low-stock product${lowStockCount === 1 ? "" : "s"} before they run out.`;
  } else if (weakest.label === "Profitability") {
    recommendation = "Review pricing or supplier costs on your thinnest-margin products.";
  } else if (weakest.label === "Cash flow") {
    recommendation = "Watch upcoming expenses against your current cash position.";
  } else if (weakest.label === "Sales") {
    recommendation = "Sales have slowed — consider a promotion or check in with regular customers.";
  }

  const colorFor = (score: number) => (score >= 70 ? "#178A4C" : score >= 45 ? "#B4740E" : "#C4342F");

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-[#5B6472] text-sm font-semibold py-2">
        <ChevronLeft size={16} /> Back to Home
      </Link>

      <div className="text-lg font-extrabold">VEYRA Business Health</div>
      <div className="text-3xl font-extrabold mt-2">{health.score} / 100</div>
      <div className="text-sm text-[#5B6472] mt-1">
        {health.score >= 75 ? "Performing well" : health.score >= 55 ? "Stable, a few things to watch" : "Needs attention"}
      </div>

      <SectionTitle>Breakdown</SectionTitle>
      <Card>
        {areas.map((a) => (
          <div key={a.label} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold">{a.label}</span>
              <span className="font-bold" style={{ color: colorFor(a.score) }}>{a.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#EEF1F6] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${a.score}%`, background: colorFor(a.score) }} />
            </div>
          </div>
        ))}
      </Card>

      <SectionTitle>Veyra recommends</SectionTitle>
      <Card className="bg-[#E3F6F8]">
        <div className="text-sm font-semibold">{recommendation}</div>
      </Card>
    </div>
  );
}