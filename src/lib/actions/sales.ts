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
  customerName: z.string().optional(),
});

export async function createSaleAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = saleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the sale details." };

  const { productId, qty, payment, customerName } = parsed.data;

  if (payment === "Credit" && (!customerName || customerName.trim().length === 0)) {
    return { error: "Please enter the customer's name for a credit sale." };
  }

  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  if (!product) return { error: "Product not found." };
  if (qty > product.stock) {
    return { error: `Only ${product.stock} ${product.unit}${product.stock === 1 ? "" : "s"} in stock — cannot sell ${qty}.` };
  }

  const total = product.price * qty;
  const margin = calcMargin(product);

  // For a credit sale, find or create the customer's receivable record first,
  // then run the sale + stock + receivable update together.
  let existingCustomer = null;
  if (payment === "Credit" && customerName) {
    existingCustomer = await prisma.customer.findFirst({
      where: { businessId: business.id, name: { equals: customerName.trim(), mode: "insensitive" } },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.sale.create({
      data: { businessId: business.id, productId, qty, total, margin, payment },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    });
    if (payment === "Credit" && customerName) {
      if (existingCustomer) {
        await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { amount: { increment: total }, days: 0 },
        });
      } else {
        await tx.customer.create({
          data: { businessId: business.id, name: customerName.trim(), amount: total, days: 0 },
        });
      }
    }
  });

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  return { ok: true };
}