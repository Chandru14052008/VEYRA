import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, Pill } from "@/components/ui";
import AddPurchaseForm from "./add-purchase-form";
import ReceiveButton from "./receive-button";

export default async function PurchasesPage() {
  const business = await requireBusiness();
  const [products, suppliers, purchases] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.supplier.findMany({ where: { businessId: business.id } }),
    prisma.purchase.findMany({ where: { businessId: business.id }, include: { product: true, supplier: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <SectionTitle>Purchases</SectionTitle>
      <AddPurchaseForm
        products={products.map((p) => ({ id: p.id, name: p.name, cost: p.cost }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />

      {purchases.length === 0 ? (
        <EmptyState title="No purchases yet" sub="Record a purchase to track supplier spend and update stock." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {purchases.map((p) => (
            <Card key={p.id} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{p.product.name}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">{p.supplier.name} · Qty {p.qty}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{fmtINR(p.total)}</div>
                {p.status === "Received" ? (
                  <Pill color="success">Received</Pill>
                ) : (
                  <ReceiveButton purchaseId={p.id} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
