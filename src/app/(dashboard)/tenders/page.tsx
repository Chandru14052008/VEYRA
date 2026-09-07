import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, Row } from "@/components/ui";
import AddTenderForm from "./add-tender-form";

export default async function TendersPage() {
  const business = await requireBusiness();
  const tenders = await prisma.tender.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <SectionTitle>Tenders: Go / No-Go</SectionTitle>
      <AddTenderForm />

      {tenders.length === 0 ? (
        <EmptyState title="No tenders yet" sub="Add a tender to get an estimated profit and a go/no-go score." />
      ) : (
        <div className="flex flex-col gap-3">
          {tenders.map((t) => {
            const revenue = t.quantity * t.sellingPrice;
            const totalCost = t.quantity * t.unitCost + t.otherCosts;
            const profit = revenue - totalCost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
            const score = Math.max(0, Math.min(100, Math.round(50 + margin * 2)));
            const verdict = score >= 65 ? "Potentially attractive" : score >= 45 ? "Marginal — proceed carefully" : "Not recommended";
            const color = score >= 65 ? "text-emerald-600" : score >= 45 ? "text-amber-600" : "text-red-600";
            return (
              <Card key={t.id}>
                <div className="text-sm font-bold">{t.name}</div>
                <div className={`text-xs font-bold mt-1 ${color}`}>Score {score}/100 · {verdict}</div>
                <div className="mt-2.5">
                  <Row label="Expected revenue" value={fmtINR(revenue)} />
                  <Row label="Total estimated cost" value={fmtINR(totalCost)} />
                  <Row label="Expected profit" value={fmtINR(profit)} />
                  <Row label="Profit margin" value={margin.toFixed(1) + "%"} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
