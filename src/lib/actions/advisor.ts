"use server";

import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { askVeyra, AdvisorResponse } from "@/lib/advisor";

export async function askVeyraAction(question: string): Promise<AdvisorResponse> {
  const business = await requireBusiness();

  const [products, suppliers, customers] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id } }),
    prisma.supplier.findMany({ where: { businessId: business.id } }),
    prisma.customer.findMany({ where: { businessId: business.id } }),
  ]);
  const quotes = await prisma.supplierQuote.findMany({
    where: { supplier: { businessId: business.id } },
  });

  // If AI_API_KEY is set, you could swap this for a real LLM call here,
  // passing only this business's own data as context. Without a key,
  // the rule-based engine below still gives complete, useful answers.
  return askVeyra(question, { products, suppliers, quotes, customers });
}
