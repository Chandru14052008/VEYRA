export type ProductLike = {
  cost: number;
  price: number;
  stock: number;
  avgDaily: number;
  leadTime: number;
  safety: number;
};

export function calcReorderLevel(p: ProductLike) {
  return Math.round(p.avgDaily * p.leadTime + p.safety);
}

export function calcDaysRemaining(p: ProductLike) {
  return p.avgDaily > 0 ? p.stock / p.avgDaily : 999;
}

export function calcMargin(p: { cost: number; price: number }) {
  if (p.price <= 0) return 0;
  return ((p.price - p.cost) / p.price) * 100;
}

export function calcStockStatus(p: ProductLike): { label: string; color: "success" | "warn" | "danger" | "blue" } {
  const rol = calcReorderLevel(p);
  if (p.stock <= rol * 0.5) return { label: "Reorder now", color: "danger" };
  if (p.stock <= rol) return { label: "Low stock", color: "warn" };
  if (p.stock > rol * 3) return { label: "Overstocked", color: "blue" };
  return { label: "Healthy", color: "success" };
}

// EOQ = sqrt(2 * annual demand * ordering cost / holding cost per unit)
export function calcEOQ(annualDemand: number, orderingCost: number, holdingCost: number) {
  return Math.round(Math.sqrt((2 * annualDemand * Math.max(orderingCost, 1)) / Math.max(holdingCost, 1)));
}

export function calcBreakEven(fixedCosts: number, price: number, variableCost: number) {
  const contribution = price - variableCost;
  if (contribution <= 0) return { units: Infinity, revenue: Infinity, contribution };
  const units = Math.ceil(fixedCosts / contribution);
  return { units, revenue: units * price, contribution };
}

export type QuoteLike = { unitPrice: number; delivery: number; credit: number; moq: number };
export type SupplierLike = { onTime: number };

export function calcSupplierScore(
  quote: QuoteLike,
  supplier: SupplierLike,
  allQuotes: QuoteLike[],
  weights = { price: 0.4, delivery: 0.2, credit: 0.15, reliability: 0.15, moq: 0.1 }
) {
  const prices = allQuotes.map((q) => q.unitPrice);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const priceScore = maxP === minP ? 100 : 100 - ((quote.unitPrice - minP) / (maxP - minP)) * 100;

  const deliveries = allQuotes.map((q) => q.delivery);
  const minD = Math.min(...deliveries), maxD = Math.max(...deliveries);
  const deliveryScore = maxD === minD ? 100 : 100 - ((quote.delivery - minD) / (maxD - minD)) * 100;

  const creditScore = Math.min(100, quote.credit * 3);
  const reliabilityScore = supplier.onTime;
  const moqScore = quote.moq <= 15 ? 100 : 60;

  const total =
    priceScore * weights.price +
    deliveryScore * weights.delivery +
    creditScore * weights.credit +
    reliabilityScore * weights.reliability +
    moqScore * weights.moq;

  return Math.round(total);
}

export function calcBusinessHealth(
  products: ProductLike[],
  customers: { amount: number; days: number }[],
  salesWeekTotal: { thisWeek: number; lastWeek: number }
) {
  const avgMargin = products.length ? products.reduce((a, p) => a + calcMargin(p), 0) / products.length : 0;
  const profitScore = Math.min(100, avgMargin * 4.2);

  const lowStockCount = products.filter((p) => calcStockStatus(p).color !== "success").length;
  const inventoryScore = Math.max(0, 100 - lowStockCount * 12);

  const overdue = customers.filter((c) => c.days > 30).reduce((a, c) => a + c.amount, 0);
  const totalReceivable = customers.reduce((a, c) => a + c.amount, 0) || 1;
  const receivableScore = Math.max(0, 100 - (overdue / totalReceivable) * 100);

  const growth = salesWeekTotal.lastWeek > 0 ? ((salesWeekTotal.thisWeek - salesWeekTotal.lastWeek) / salesWeekTotal.lastWeek) * 100 : 0;
  const salesScore = Math.max(0, Math.min(100, 60 + growth));

  const cashScore = 78; // placeholder until real cash-ledger tracking is wired in

  const score = Math.round(
    profitScore * 0.25 + cashScore * 0.2 + inventoryScore * 0.2 + salesScore * 0.2 + receivableScore * 0.15
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    profitScore: Math.round(profitScore),
    inventoryScore: Math.round(inventoryScore),
    salesScore: Math.round(salesScore),
    receivableScore: Math.round(receivableScore),
    cashScore,
  };
}

// Manufacturer: cost to produce one unit of a finished good from its BOM
export function calcBomUnitCost(lines: { qtyPerUnit: number; product: { cost: number } }[]) {
  return lines.reduce((sum, l) => sum + l.qtyPerUnit * l.product.cost, 0);
}

export function fmtINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
