"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";

const purchaseSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  qty: z.coerce.number().positive(),
  unitCost: z.coerce.number().positive(),
  status: z.enum(["Pending", "Received"]).default("Pending"),
});

export async function createPurchaseAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the purchase details." };

  const { productId, supplierId, qty, unitCost, status } = parsed.data;
  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  if (!product) return { error: "Product not found." };

  const total = qty * unitCost;

  const ops = [
    prisma.purchase.create({
      data: { businessId: business.id, productId, supplierId, qty, total, status },
    }),
  ];

  // Only add to stock once the goods are actually received.
  if (status === "Received") {
    ops.push(
      prisma.product.update({ where: { id: productId }, data: { stock: { increment: qty }, cost: unitCost } })
    );
  }

  await prisma.$transaction(ops);
  revalidatePath("/purchases");
  revalidatePath("/inventory");
  return { ok: true };
}

export async function markPurchaseReceivedAction(purchaseId: string) {
  const business = await requireBusiness();
  const purchase = await prisma.purchase.findFirst({ where: { id: purchaseId, businessId: business.id } });
  if (!purchase || purchase.status === "Received") return { error: "Not found or already received." };

  await prisma.$transaction([
    prisma.purchase.update({ where: { id: purchaseId }, data: { status: "Received" } }),
    prisma.product.update({ where: { id: purchase.productId }, data: { stock: { increment: purchase.qty } } }),
  ]);
  revalidatePath("/purchases");
  revalidatePath("/inventory");
}
