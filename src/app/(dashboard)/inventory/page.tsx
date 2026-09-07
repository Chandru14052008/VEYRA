import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcStockStatus, calcDaysRemaining } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, Pill } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import AddProductForm from "./add-product-form";

export default async function InventoryPage() {
  const business = await requireBusiness();
  const products = await prisma.product.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } });

  return (
    <div>
      <SectionTitle>Stock</SectionTitle>
      <AddProductForm businessType={business.businessType} />

      {products.length === 0 ? (
        <EmptyState title="No products yet" sub="Add your first product to start tracking stock." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {products.map((p) => {
            const status = calcStockStatus(p);
            const days = calcDaysRemaining(p);
            return (
              <Link href={`/inventory/${p.id}`} key={p.id}>
                <Card className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-xs text-[#5B6472] mt-0.5">
                      {p.stock} {p.unit}s · ~{days.toFixed(1)} days left
                    </div>
                    <div className="mt-1.5"><Pill color={status.color}>{status.label}</Pill></div>
                  </div>
                  <ChevronRight size={17} className="text-[#5B6472]" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
