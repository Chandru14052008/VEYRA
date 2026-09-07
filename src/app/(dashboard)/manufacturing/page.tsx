import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR, calcBomUnitCost } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, Pill, Row } from "@/components/ui";
import BomForm from "./bom-form";
import MaterialLineForm from "./material-line-form";
import WorkOrderForm from "./work-order-form";
import CompleteButton from "./complete-button";

export default async function ManufacturingPage() {
  const business = await requireBusiness();
  const [products, boms, workOrders] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.bom.findMany({ where: { businessId: business.id }, include: { lines: { include: { product: true } } } }),
    prisma.workOrder.findMany({ where: { businessId: business.id }, include: { bom: { include: { lines: { include: { product: true } } } } }, orderBy: { createdAt: "desc" } }),
  ]);
  const outputName = (bomId: string) => {
    const bom = boms.find((b) => b.id === bomId);
    return products.find((p) => p.id === bom?.outputProductId)?.name || "—";
  };

  return (
    <div>
      <SectionTitle>Recipes (Bill of Materials)</SectionTitle>
      <BomForm products={products.map((p) => ({ id: p.id, name: p.name, kind: p.kind }))} />

      {boms.length === 0 ? (
        <EmptyState title="No recipes yet" sub="Create a recipe: a finished good made from raw materials." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {boms.map((b) => {
            const output = products.find((p) => p.id === b.outputProductId);
            const unitCost = calcBomUnitCost(b.lines);
            return (
              <Card key={b.id}>
                <div className="text-sm font-bold">{b.name}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">Produces: {output?.name || "—"}</div>
                <div className="text-xs text-[#5B6472] mt-1.5">
                  Materials: {b.lines.length === 0 ? "none added yet" : b.lines.map((l) => `${l.qtyPerUnit} ${l.product.unit} ${l.product.name}`).join(", ")}
                </div>
                {b.lines.length > 0 && <div className="text-xs font-semibold mt-1.5">Material cost per unit: {fmtINR(unitCost)}</div>}
              </Card>
            );
          })}
        </div>
      )}

      <MaterialLineForm
        boms={boms.map((b) => ({ id: b.id, name: b.name }))}
        rawMaterials={products.filter((p) => p.kind === "raw").map((p) => ({ id: p.id, name: p.name, unit: p.unit }))}
      />

      <SectionTitle>Work orders</SectionTitle>
      <WorkOrderForm boms={boms.map((b) => ({ id: b.id, name: b.name }))} />

      {workOrders.length === 0 ? (
        <EmptyState title="No work orders yet" sub="Plan a production batch against one of your recipes." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {workOrders.map((wo) => (
            <Card key={wo.id}>
              <div className="flex justify-between items-center">
                <div className="text-sm font-bold">{wo.bom.name} × {wo.quantity}</div>
                <Pill color={wo.status === "Completed" ? "success" : wo.status === "In Progress" ? "warn" : "blue"}>{wo.status}</Pill>
              </div>
              <div className="text-xs text-[#5B6472] mt-1">Produces: {outputName(wo.bomId)}</div>
              {wo.status !== "Completed" && <div className="mt-2"><CompleteButton workOrderId={wo.id} /></div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
