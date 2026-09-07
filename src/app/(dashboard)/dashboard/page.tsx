import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcStockStatus, calcDaysRemaining, calcBusinessHealth, calcMargin, fmtINR } from "@/lib/calculations";
import { Card, KPI, SectionTitle, EmptyState, Pill } from "@/components/ui";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import SalesChart from "./sales-chart";

export default async function DashboardPage() {
  const business = await requireBusiness();

  const [products, customers, sales, expenses] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.customer.findMany({ where: { businessId: business.id } }),
    prisma.sale.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.expense.findMany({ where: { businessId: business.id } }),
  ]);

  const todaySales = sales.slice(0, 10);
  const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
  const avgMargin = todaySales.length ? todaySales.reduce((a, s) => a + s.margin, 0) / todaySales.length : 0;
  const stockValue = products.reduce((a, p) => a + p.stock * p.cost, 0);
  const receivables = customers.reduce((a, c) => a + c.amount, 0);
  const overdueCount = customers.filter((c) => c.days > 30).length;
  const lowStockCount = products.filter((p) => calcStockStatus(p).color !== "success").length;

  const thisWeekTotal = sales.reduce((a, s) => a + s.total, 0);
  const health = calcBusinessHealth(products, customers, { thisWeek: thisWeekTotal, lastWeek: thisWeekTotal * 0.9 });

  const actions: { id: string; color: "danger" | "warn" | "success"; title: string; detail: string }[] = [];
  products.forEach((p) => {
    const status = calcStockStatus(p);
    if (status.color === "danger" || status.color === "warn") {
      actions.push({
        id: "stock-" + p.id,
        color: status.color,
        title: `${p.name} ${status.label.toLowerCase()}`,
        detail: `Estimated ${calcDaysRemaining(p).toFixed(1)} days of stock left at current sales pace.`,
      });
    }
  });
  customers.filter((c) => c.days > 30).forEach((c) => {
    actions.push({
      id: "cust-" + c.id,
      color: "warn",
      title: `${fmtINR(c.amount)} overdue from ${c.name}`,
      detail: `Payment pending for ${c.days} days.`,
    });
  });

  // Build a simple 7-point trend from the sales list we have (real data, not fabricated).
  const chartData = buildWeeklyTrend(sales);

  return (
    <div>
      <SectionTitle>Today's actions</SectionTitle>
      {actions.length === 0 ? (
        <EmptyState title="All clear" sub="Nothing needs your attention right now." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {actions.slice(0, 4).map((a) => (
            <Card key={a.id} className="flex items-start gap-2.5">
              {a.color === "success" ? <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" /> : <AlertTriangle size={16} className={a.color === "danger" ? "text-red-600 mt-0.5" : "text-amber-600 mt-0.5"} />}
              <div>
                <div className="text-sm font-bold">{a.title}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">{a.detail}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle>Overview</SectionTitle>
      <div className="flex gap-2.5 flex-wrap">
        <KPI label="Recent sales" value={fmtINR(todayTotal)} sub={`${todaySales.length} transactions`} />
        <KPI label="Avg. margin" value={avgMargin.toFixed(1) + "%"} />
        <KPI label="Stock value" value={fmtINR(stockValue)} sub={`${lowStockCount} items need attention`} />
        <KPI label="Receivables" value={fmtINR(receivables)} sub={`${overdueCount} overdue`} />
      </div>

      <SectionTitle>Business Health</SectionTitle>
      <Card>
        <div className="flex items-center gap-3.5">
          <div className="w-[62px] h-[62px] rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: `conic-gradient(#0EA5B7 ${health.score * 3.6}deg, #EEF1F6 0deg)` }}>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sm font-extrabold">
              {health.score}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold">
              {health.score >= 75 ? "Performing well" : health.score >= 55 ? "Stable, a few things to watch" : "Needs attention"}
            </div>
            <div className="text-xs text-[#5B6472] mt-0.5">VEYRA Business Health Estimate</div>
          </div>
        </div>
      </Card>

      <SectionTitle>Sales trend</SectionTitle>
      <Card className="h-[180px] px-2 py-3">
        <SalesChart data={chartData} />
      </Card>
    </div>
  );
}

function buildWeeklyTrend(sales: { total: number; createdAt: Date }[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.set(d.toDateString(), 0);
  }
  sales.forEach((s) => {
    const key = new Date(s.createdAt).toDateString();
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + s.total);
  });
  return Array.from(buckets.entries()).map(([key, total]) => ({
    day: days[new Date(key).getDay()],
    sales: total,
  }));
}
