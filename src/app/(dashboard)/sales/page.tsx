import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, KPI } from "@/components/ui";
import AddSaleForm from "./add-sale-form";

export default async function SalesPage() {
  const business = await requireBusiness();
  const [products, sales] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } }),
    prisma.sale.findMany({ where: { businessId: business.id }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  const total = sales.reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <SectionTitle>Sales</SectionTitle>
      <div className="flex gap-2.5 mb-4">
        <KPI label="Total (shown)" value={fmtINR(total)} />
        <KPI label="Transactions" value={String(sales.length)} />
      </div>

      <AddSaleForm products={products.map((p) => ({ id: p.id, name: p.name, price: p.price, stock: p.stock }))} />

      {sales.length === 0 ? (
        <EmptyState title="No sales yet" sub="Record your first sale to start tracking revenue and margin." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sales.map((s) => (
            <Card key={s.id} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{s.product.name}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">
                  Qty {s.qty} · {s.payment} · {new Date(s.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{fmtINR(s.total)}</div>
                <div className="text-xs text-emerald-600">{s.margin.toFixed(1)}% margin</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
