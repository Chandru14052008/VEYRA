import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcSupplierScore, fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, Pill } from "@/components/ui";
import SupplierForms from "./supplier-forms";

export default async function SuppliersPage() {
  const business = await requireBusiness();
  const suppliers = await prisma.supplier.findMany({ where: { businessId: business.id }, include: { quotes: true } });
  const allQuotes = suppliers.flatMap((s) => s.quotes.map((q) => ({ ...q, supplierName: s.name, onTime: s.onTime })));

  // Group quotes by product to compare apples to apples.
  const byProduct = new Map<string, typeof allQuotes>();
  allQuotes.forEach((q) => {
    const list = byProduct.get(q.productName) || [];
    list.push(q);
    byProduct.set(q.productName, list);
  });

  return (
    <div>
      <SectionTitle>Suppliers</SectionTitle>
      <SupplierForms suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />

      {suppliers.length === 0 ? (
        <EmptyState title="No suppliers yet" sub="Add a supplier, then a quotation, to get a comparison." />
      ) : (
        <div className="flex flex-col gap-2.5 mt-2">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <div className="text-sm font-bold">{s.name}</div>
              <div className="text-xs text-[#5B6472] mt-0.5">On-time delivery: {s.onTime}%{s.notes ? ` · ${s.notes}` : ""}</div>
            </Card>
          ))}
        </div>
      )}

      {Array.from(byProduct.entries()).map(([productName, quotes]) => {
        if (quotes.length < 2) return null;
        const scored = quotes
          .map((q) => ({ q, score: calcSupplierScore(q, { onTime: q.onTime }, quotes) }))
          .sort((a, b) => b.score - a.score);
        const best = scored[0];
        const cheapest = [...quotes].sort((a, b) => a.unitPrice - b.unitPrice)[0];

        return (
          <div key={productName}>
            <SectionTitle>Compare: {productName}</SectionTitle>
            <Card className="bg-[#E3F6F8] border-[#0EA5B7]/20 mb-3">
              <div className="text-[11px] font-bold text-[#0EA5B7] uppercase tracking-wide">Veyra recommendation</div>
              <div className="text-sm font-bold mt-1">{best.q.supplierName} is the best overall option.</div>
              <div className="text-xs text-[#5B6472] mt-1.5">
                {cheapest.supplierName !== best.q.supplierName
                  ? `${cheapest.supplierName} is cheaper per unit, but ${best.q.supplierName} offers ${best.q.credit}-day credit and a ${best.q.delivery}-day delivery with strong reliability, reducing cash pressure.`
                  : `${best.q.supplierName} scores highest on price, delivery and reliability together.`}
              </div>
            </Card>
            <div className="flex flex-col gap-2.5">
              {scored.map(({ q, score }) => (
                <Card key={q.id}>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold">{q.supplierName}</div>
                    <Pill color={score >= 80 ? "success" : score >= 60 ? "warn" : "danger"}>{score}/100</Pill>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <MiniStat label="Unit price" value={fmtINR(q.unitPrice)} />
                    <MiniStat label="Delivery" value={`${q.delivery} days`} />
                    <MiniStat label="Credit" value={`${q.credit} days`} />
                    <MiniStat label="On-time" value={`${q.onTime}%`} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] text-[#5B6472]">{label}</div>
      <div className="text-xs font-bold">{value}</div>
    </div>
  );
}
