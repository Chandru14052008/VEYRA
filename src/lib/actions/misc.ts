"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";

const customerSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().min(0),
  days: z.coerce.number().min(0),
});

export async function createCustomerAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the customer details." };

  await prisma.customer.create({ data: { ...parsed.data, businessId: business.id } });
  revalidatePath("/customers");
  return { ok: true };
}

const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export async function createExpenseAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the expense details." };

  await prisma.expense.create({ data: { ...parsed.data, businessId: business.id } });
  revalidatePath("/expenses");
  return { ok: true };
}

const tenderSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().positive(),
  sellingPrice: z.coerce.number().positive(),
  unitCost: z.coerce.number().positive(),
  otherCosts: z.coerce.number().min(0).default(0),
});

export async function createTenderAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = tenderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the tender details." };

  await prisma.tender.create({ data: { ...parsed.data, businessId: business.id } });
  revalidatePath("/tenders");
  return { ok: true };
}
