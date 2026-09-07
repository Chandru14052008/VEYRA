"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBusiness } from "@/lib/auth";

const bomSchema = z.object({
  name: z.string().min(1),
  outputProductId: z.string().min(1),
});

export async function createBomAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = bomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the recipe details." };

  await prisma.bom.create({ data: { ...parsed.data, businessId: business.id } });
  revalidatePath("/manufacturing");
  return { ok: true };
}

const bomLineSchema = z.object({
  bomId: z.string().min(1),
  productId: z.string().min(1),
  qtyPerUnit: z.coerce.number().positive(),
});

export async function addBomLineAction(formData: FormData) {
  await requireBusiness();
  const parsed = bomLineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the material line." };

  await prisma.bomLine.create({ data: parsed.data });
  revalidatePath("/manufacturing");
  return { ok: true };
}

const workOrderSchema = z.object({
  bomId: z.string().min(1),
  quantity: z.coerce.number().positive(),
});

export async function createWorkOrderAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = workOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the work order details." };

  const bom = await prisma.bom.findFirst({
    where: { id: parsed.data.bomId, businessId: business.id },
    include: { lines: { include: { product: true } } },
  });
  if (!bom) return { error: "Recipe not found." };

  // Check raw-material availability before creating the order.
  const shortages = bom.lines.filter((l) => l.product.stock < l.qtyPerUnit * parsed.data.quantity);
  if (shortages.length > 0) {
    return {
      error: `Not enough stock: ${shortages.map((s) => s.product.name).join(", ")}. Reduce the batch size or restock first.`,
    };
  }

  await prisma.workOrder.create({
    data: { businessId: business.id, bomId: bom.id, quantity: parsed.data.quantity, status: "Planned" },
  });
  revalidatePath("/manufacturing");
  return { ok: true };
}

export async function completeWorkOrderAction(workOrderId: string) {
  const business = await requireBusiness();
  const wo = await prisma.workOrder.findFirst({
    where: { id: workOrderId, businessId: business.id },
    include: { bom: { include: { lines: { include: { product: true } } } } },
  });
  if (!wo || wo.status === "Completed") return { error: "Not found or already completed." };

  const ops = [
    prisma.workOrder.update({ where: { id: wo.id }, data: { status: "Completed" } }),
    // Consume raw materials...
    ...wo.bom.lines.map((line) =>
      prisma.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.qtyPerUnit * wo.quantity } },
      })
    ),
    // ...and add the finished goods to stock.
    prisma.product.update({
      where: { id: wo.bom.outputProductId },
      data: { stock: { increment: wo.quantity } },
    }),
  ];

  await prisma.$transaction(ops);
  revalidatePath("/manufacturing");
  revalidatePath("/inventory");
  return { ok: true };
}
