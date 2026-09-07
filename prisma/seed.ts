import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@veyra.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Ananya",
      business: {
        create: {
          name: "Ananya Stores",
          businessType: "retailer",
          currency: "INR",
          gstRegistered: true,
          openingCash: 62000,
        },
      },
    },
    include: { business: true },
  });

  const businessId = user.business!.id;

  const products = await Promise.all(
    [
      { name: "Rice (25kg)", sku: "RIC-025", unit: "bag", cost: 1180, price: 1350, stock: 18, avgDaily: 5, leadTime: 4, safety: 8 },
      { name: "Cooking Oil (15L)", sku: "OIL-015", unit: "tin", cost: 2150, price: 2450, stock: 14, avgDaily: 4, leadTime: 5, safety: 10 },
      { name: "Biscuits (carton)", sku: "BIS-100", unit: "carton", cost: 620, price: 780, stock: 62, avgDaily: 9, leadTime: 3, safety: 12 },
      { name: "Sugar (50kg)", sku: "SUG-050", unit: "bag", cost: 2380, price: 2600, stock: 30, avgDaily: 3, leadTime: 5, safety: 6 },
      { name: "Soap (box)", sku: "SOP-072", unit: "box", cost: 840, price: 1020, stock: 4, avgDaily: 2, leadTime: 6, safety: 5 },
      { name: "Shampoo (box)", sku: "SHM-048", unit: "box", cost: 1460, price: 1720, stock: 21, avgDaily: 1, leadTime: 7, safety: 3 },
      { name: "Milk Powder (24pk)", sku: "MLK-024", unit: "carton", cost: 1980, price: 2180, stock: 9, avgDaily: 3, leadTime: 4, safety: 6 },
    ].map((p) => prisma.product.create({ data: { ...p, businessId } }))
  );

  const oil = products.find((p) => p.sku === "OIL-015")!;

  const suppliers = await Promise.all(
    [
      { name: "Supplier A", onTime: 92, notes: "Cash on delivery, lowest headline price." },
      { name: "Supplier B", onTime: 97, notes: "Slightly higher price, reliable, 30-day credit." },
      { name: "Supplier C", onTime: 78, notes: "Cheapest, but frequent delivery delays." },
    ].map((s) => prisma.supplier.create({ data: { ...s, businessId } }))
  );

  await prisma.supplierQuote.createMany({
    data: [
      { supplierId: suppliers[0].id, productName: oil.name, unitPrice: 2150, moq: 10, delivery: 5, credit: 0 },
      { supplierId: suppliers[1].id, productName: oil.name, unitPrice: 2165, moq: 10, delivery: 3, credit: 30 },
      { supplierId: suppliers[2].id, productName: oil.name, unitPrice: 2095, moq: 20, delivery: 8, credit: 15 },
    ],
  });

  await prisma.sale.createMany({
    data: [
      { businessId, productId: oil.id, qty: 6, total: 14700, margin: 12.2, payment: "UPI" },
      { businessId, productId: products[0].id, qty: 3, total: 4050, margin: 12.6, payment: "Cash" },
      { businessId, productId: products[2].id, qty: 10, total: 7800, margin: 20.5, payment: "Credit" },
      { businessId, productId: products[4].id, qty: 4, total: 4080, margin: 17.6, payment: "Cash" },
    ],
  });

  await prisma.purchase.createMany({
    data: [
      { businessId, productId: oil.id, supplierId: suppliers[1].id, qty: 20, total: 43300, status: "Received" },
      { businessId, productId: products[0].id, supplierId: suppliers[0].id, qty: 30, total: 35400, status: "Pending" },
    ],
  });

  await prisma.customer.createMany({
    data: [
      { businessId, name: "Ravi Traders", amount: 8400, days: 42 },
      { businessId, name: "Meena Kirana", amount: 2200, days: 12 },
      { businessId, name: "Corner Mart", amount: 5600, days: 71 },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { businessId, category: "Rent", amount: 18000 },
      { businessId, category: "Electricity", amount: 4200 },
      { businessId, category: "Transport", amount: 1600 },
    ],
  });

  console.log("Seeded demo account -> email: demo@veyra.app / password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
