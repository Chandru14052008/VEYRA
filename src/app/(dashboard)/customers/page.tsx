import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, KPI, Pill } from "@/components/ui";
import AddCustomerForm from "./add-customer-form";

export default async function CustomersPage() {
  const business = await requireBusiness();
  const customers = await prisma.customer.findMany({ where: { businessId: business.id }, orderBy: { days: "desc" } });
  const total = customers.reduce((a, c) => a + c.amount, 0);
  const overdue = customers.filter((c) => c.days > 30).reduce((a, c) => a + c.amount, 0);

  return (
    <div>
      <SectionTitle>Customers & credit</SectionTitle>
      <div className="flex gap-2.5 mb-4">
        <KPI label="Total receivable" value={fmtINR(total)} />
        <KPI label="Overdue (30+)" value={fmtINR(overdue)} />
      </div>
      <AddCustomerForm />

      {customers.length === 0 ? (
        <EmptyState title="No customer credit on file" sub="Add a customer to start tracking receivables." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {customers.map((c) => (
            <Card key={c.id} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{c.name}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">Outstanding {c.days} days</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{fmtINR(c.amount)}</div>
                <Pill color={c.days > 60 ? "danger" : c.days > 30 ? "warn" : "success"}>
                  {c.days > 60 ? "60+ days" : c.days > 30 ? "30+ days" : "Current"}
                </Pill>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
