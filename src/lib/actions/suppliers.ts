"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";

const supplierSchema = z.object({
  name: z.string().min(1),
  onTime: z.coerce.number().min(0).max(100).default(90),
  notes: z.string().optional(),
});

export async function createSupplierAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = supplierSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the supplier details." };

  await prisma.supplier.create({ data: { ...parsed.data, businessId: business.id } });
  revalidatePath("/suppliers");
  return { ok: true };
}

const quoteSchema = z.object({
  supplierId: z.string().min(1),
  productName: z.string().min(1),
  unitPrice: z.coerce.number().positive(),
  moq: z.coerce.number().min(1).default(1),
  delivery: z.coerce.number().min(0).default(3),
  credit: z.coerce.number().min(0).default(0),
});

export async function createQuoteAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the quotation details." };

  const supplier = await prisma.supplier.findFirst({ where: { id: parsed.data.supplierId, businessId: business.id } });
  if (!supplier) return { error: "Supplier not found." };

  await prisma.supplierQuote.create({ data: parsed.data });
  revalidatePath("/suppliers");
  return { ok: true };
}
