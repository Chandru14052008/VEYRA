"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";
import { calcMargin } from "@/lib/calculations";

const saleSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().positive(),
  payment: z.enum(["Cash", "UPI", "Card", "Bank transfer", "Credit"]),
});

export async function createSaleAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = saleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the sale details." };

  const { productId, qty, payment } = parsed.data;
  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  if (!product) return { error: "Product not found." };
  if (qty > product.stock) {
    return { error: `Only ${product.stock} ${product.unit}${product.stock === 1 ? "" : "s"} in stock — cannot sell ${qty}.` };
  }

  const total = product.price * qty;
  const margin = calcMargin(product);

  // A real sale touches two tables together - do it as one transaction so
  // inventory and the sales ledger can never drift apart.
  await prisma.$transaction([
    prisma.sale.create({
      data: { businessId: business.id, productId, qty, total, margin, payment },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    }),
  ]);

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return { ok: true };
}
