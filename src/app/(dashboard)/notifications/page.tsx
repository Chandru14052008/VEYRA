import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcStockStatus, calcDaysRemaining, fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export default async function NotificationsPage() {
  const business = await requireBusiness();
  const [products, customers] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.customer.findMany({ where: { businessId: business.id } }),
  ]);

  const notifications: { id: string; title: string; detail: string; color: "danger" | "warn" }[] = [];
  products.forEach((p) => {
    const status = calcStockStatus(p);
    if (status.color === "danger" || status.color === "warn") {
      notifications.push({
        id: "stock-" + p.id,
        title: `${p.name} ${status.label.toLowerCase()}`,
        detail: `Estimated ${calcDaysRemaining(p).toFixed(1)} days of stock left at current sales pace.`,
        color: status.color,
      });
    }
  });
  customers.filter((c) => c.days > 30).forEach((c) => {
    notifications.push({
      id: "cust-" + c.id,
      title: `${fmtINR(c.amount)} overdue from ${c.name}`,
      detail: `Payment pending for ${c.days} days.`,
      color: "warn",
    });
  });

  return (
    <div>
      <SectionTitle>Notifications</SectionTitle>
      {notifications.length === 0 ? (
        <EmptyState title="All caught up" sub="No alerts right now." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <Card key={n.id} className="flex gap-2.5">
              <AlertTriangle size={16} className={n.color === "danger" ? "text-red-600 mt-0.5" : "text-amber-600 mt-0.5"} />
              <div>
                <div className="text-sm font-bold">{n.title}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">{n.detail}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
