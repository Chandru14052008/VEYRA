"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  unit: z.string().min(1),
  kind: z.enum(["finished", "raw"]).default("finished"),
  cost: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  avgDaily: z.coerce.number().min(0),
  leadTime: z.coerce.number().min(0),
  safety: z.coerce.number().min(0),
});

export async function createProductAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the product details." };

  await prisma.product.create({ data: { ...parsed.data, businessId: business.id } });
  revalidatePath("/inventory");
  return { ok: true };
}

export async function updateProductAction(id: string, formData: FormData) {
  const business = await requireBusiness();
  const parsed = productSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the product details." };

  // Ensure the product belongs to this business before updating.
  const existing = await prisma.product.findFirst({ where: { id, businessId: business.id } });
  if (!existing) return { error: "Product not found." };

  await prisma.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  return { ok: true };
}

export async function deleteProductAction(id: string) {
  const business = await requireBusiness();
  await prisma.product.deleteMany({ where: { id, businessId: business.id } });
  revalidatePath("/inventory");
}
const adjustStockSchema = z.object({
  amount: z.coerce.number().refine((v) => v !== 0, "Enter a non-zero amount"),
});

export async function adjustStockAction(productId: string, formData: FormData) {
  const business = await requireBusiness();
  const parsed = adjustStockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please enter a valid quantity." };

  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  if (!product) return { error: "Product not found." };

  const newStock = product.stock + parsed.data.amount;
  if (newStock < 0) return { error: "That would make stock negative." };

  await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${productId}`);
  return { ok: true };
}
