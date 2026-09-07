import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcReorderLevel, calcDaysRemaining, calcMargin, calcStockStatus, calcEOQ, fmtINR } from "@/lib/calculations";
import { Card, KPI, SectionTitle, Pill, Row } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const business = await requireBusiness();
  const p = await prisma.product.findFirst({ where: { id: params.id, businessId: business.id } });
  if (!p) notFound();

  const rol = calcReorderLevel(p);
  const days = calcDaysRemaining(p);
  const eoq = calcEOQ(p.avgDaily * 365, 250, p.cost * 0.15);
  const status = calcStockStatus(p);

  return (
    <div>
      <Link href="/inventory" className="inline-flex items-center gap-1 text-[#5B6472] text-sm font-semibold py-2">
        <ChevronLeft size={16} /> Back to Stock
      </Link>
      <div className="text-lg font-extrabold">{p.name}</div>
      <div className="text-xs text-[#5B6472] mt-0.5">SKU {p.sku}</div>
      <div className="mt-2.5"><Pill color={status.color}>{status.label}</Pill></div>

      <div className="flex gap-2.5 flex-wrap mt-4">
        <KPI label="Current stock" value={`${p.stock} ${p.unit}s`} />
        <KPI label="Stock value" value={fmtINR(p.stock * p.cost)} />
        <KPI label="Days remaining" value={days.toFixed(1)} />
        <KPI label="Margin" value={calcMargin(p).toFixed(1) + "%"} />
      </div>

      <SectionTitle>Recommended order quantity</SectionTitle>
      <Card>
        <div className="text-2xl font-extrabold">{eoq} {p.unit}s</div>
        <div className="text-xs text-[#5B6472] mt-1">
          Ordering around this quantity at a time may balance ordering and holding costs, based on recent sales pace.
        </div>
        <details className="mt-2.5">
          <summary className="text-xs font-semibold text-[#0EA5B7] cursor-pointer">Show calculation (EOQ)</summary>
          <div className="text-xs text-[#5B6472] mt-1.5 leading-relaxed">
            EOQ = √(2 × annual demand × ordering cost ÷ holding cost)<br />
            Annual demand ≈ {Math.round(p.avgDaily * 365)} · Ordering cost ≈ ₹250 · Holding cost ≈ {fmtINR(p.cost * 0.15)}/unit/yr
          </div>
        </details>
      </Card>

      <SectionTitle>Reorder level</SectionTitle>
      <Card>
        <div className="text-2xl font-extrabold">{rol} {p.unit}s</div>
        <div className="text-xs text-[#5B6472] mt-1">
          {p.stock <= rol ? "Current stock is at or below this level — reordering is recommended." : "Current stock is comfortably above this level."}
        </div>
        <details className="mt-2.5">
          <summary className="text-xs font-semibold text-[#0EA5B7] cursor-pointer">Show calculation</summary>
          <div className="text-xs text-[#5B6472] mt-1.5 leading-relaxed">
            Reorder level = average daily usage × lead time + safety stock<br />
            {p.avgDaily} × {p.leadTime} + {p.safety} = {rol}
          </div>
        </details>
      </Card>

      <SectionTitle>Details</SectionTitle>
      <Card>
        <Row label="Purchase cost" value={fmtINR(p.cost)} />
        <Row label="Selling price" value={fmtINR(p.price)} />
        <Row label="Lead time" value={`${p.leadTime} days`} />
        <Row label="Safety stock" value={`${p.safety} ${p.unit}s`} />
      </Card>
    </div>
  );
}
