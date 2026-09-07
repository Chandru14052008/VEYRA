import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { fmtINR } from "@/lib/calculations";
import { Card, SectionTitle, EmptyState, KPI } from "@/components/ui";
import AddExpenseForm from "./add-expense-form";

export default async function ExpensesPage() {
  const business = await requireBusiness();
  const expenses = await prisma.expense.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } });
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <SectionTitle>Expenses</SectionTitle>
      <div className="mb-4"><KPI label="Total (shown)" value={fmtINR(total)} /></div>
      <AddExpenseForm />

      {expenses.length === 0 ? (
        <EmptyState title="No expenses logged" sub="Add an expense to track where your money is going." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {expenses.map((e) => (
            <Card key={e.id} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{e.category}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">
                  {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div className="text-sm font-bold">{fmtINR(e.amount)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
