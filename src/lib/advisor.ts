import { calcReorderLevel, calcDaysRemaining, calcMargin, calcSupplierScore } from "./calculations";

export type AdvisorResponse = {
  recommendation: string;
  why: string;
  numbers: string;
  risk: string;
  action: string;
};

type Product = {
  id: string; name: string; unit: string; cost: number; price: number;
  stock: number; avgDaily: number; leadTime: number; safety: number;
};
type Supplier = { id: string; name: string; onTime: number };
type Quote = { supplierId: string; productName: string; unitPrice: number; delivery: number; credit: number; moq: number };
type Customer = { name: string; amount: number; days: number };

export function askVeyra(
  question: string,
  ctx: { products: Product[]; suppliers: Supplier[]; quotes: Quote[]; customers: Customer[] }
): AdvisorResponse {
  const q = question.toLowerCase();
  const { products, suppliers, quotes, customers } = ctx;

  if (q.includes("reorder") || q.includes("stock out") || q.includes("stock-out") || q.includes("buy")) {
    const candidates = products
      .map((p) => ({ p, rol: calcReorderLevel(p), days: calcDaysRemaining(p) }))
      .filter((x) => x.p.stock <= x.rol)
      .sort((a, b) => a.days - b.days);

    if (candidates.length === 0) {
      return {
        recommendation: "No products need reordering right now.",
        why: "All products are above their reorder level based on current stock and usage.",
        numbers: `Checked ${products.length} products.`,
        risk: "None significant.",
        action: "Check back in a few days, or review the Stock page for early warnings.",
      };
    }
    const top = candidates[0];
    return {
      recommendation: `Reorder ${top.p.name} within the next ${Math.max(1, Math.round(top.days - top.p.leadTime))} day(s).`,
      why: `Current stock is ${top.p.stock} ${top.p.unit}s and average usage is ${top.p.avgDaily}/day. Your supplier's lead time is ${top.p.leadTime} days.`,
      numbers: `Stock ${top.p.stock} ÷ usage ${top.p.avgDaily}/day ≈ ${top.days.toFixed(1)} days of stock left. Reorder level: ${top.rol} ${top.p.unit}s.`,
      risk: top.days <= top.p.leadTime ? "High chance of stock-out before the next delivery arrives." : "Moderate — order soon to stay safe.",
      action: `Request quotations for at least ${Math.max(20, top.rol)} ${top.p.unit}s and place the order today.`,
    };
  }

  if (q.includes("supplier") || q.includes("quotation") || q.includes("choose")) {
    if (quotes.length === 0) {
      return {
        recommendation: "No supplier quotations on file yet.",
        why: "Add quotations under Suppliers to get a comparison and recommendation.",
        numbers: "—", risk: "—", action: "Go to Suppliers → Add quotation.",
      };
    }
    const scored = quotes
      .map((quo) => ({ quo, supplier: suppliers.find((s) => s.id === quo.supplierId)!, score: calcSupplierScore(quo, suppliers.find((s) => s.id === quo.supplierId)!, quotes) }))
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    const cheapest = [...quotes].sort((a, b) => a.unitPrice - b.unitPrice)[0];
    const cheapSupplier = suppliers.find((s) => s.id === cheapest.supplierId)!;
    return {
      recommendation: `${best.supplier.name} is the best overall option for ${best.quo.productName}.`,
      why: cheapest.supplierId !== best.quo.supplierId
        ? `${cheapSupplier.name} is cheaper per unit, but ${best.supplier.name} offers ${best.quo.credit}-day credit and faster, more reliable delivery, reducing cash pressure.`
        : `${best.supplier.name} scores highest on price, delivery and reliability together.`,
      numbers: `Score — ${scored.map((s) => `${s.supplier.name}: ${s.score}/100`).join(", ")}.`,
      risk: "Scores are estimates based on price, delivery, credit terms and past reliability — confirm current terms before ordering.",
      action: `Place your next order with ${best.supplier.name}.`,
    };
  }

  if (q.includes("profit") || q.includes("margin") || q.includes("losing money")) {
    if (products.length === 0) {
      return { recommendation: "Add some products first.", why: "", numbers: "", risk: "", action: "Go to Inventory → Add product." };
    }
    const sorted = [...products].sort((a, b) => calcMargin(a) - calcMargin(b));
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];
    return {
      recommendation: `${worst.name} has your thinnest margin — review its pricing or purchase cost.`,
      why: `Selling at ₹${worst.price} against a cost of ₹${worst.cost} leaves a margin of only ${calcMargin(worst).toFixed(1)}%, well below ${best.name}'s ${calcMargin(best).toFixed(1)}%.`,
      numbers: `Margin range across products: ${calcMargin(worst).toFixed(1)}% – ${calcMargin(best).toFixed(1)}%.`,
      risk: "If purchase costs rise further, this product could become unprofitable.",
      action: `Consider a small price increase on ${worst.name} or renegotiate with your supplier.`,
    };
  }

  if (q.includes("afford") || q.includes("cash")) {
    return {
      recommendation: "Check any large purchase against your current cash balance before committing.",
      why: "A single large purchase can tighten cash for the following 1–2 weeks even if it's profitable long-term.",
      numbers: "See the Finance page for your current cash position.",
      risk: "Overcommitting cash can leave you short for rent, salaries or other fixed costs.",
      action: "Consider splitting the order, or ask the supplier for partial credit terms.",
    };
  }

  if (q.includes("how is my business") || q.includes("business doing") || q.includes("health")) {
    return {
      recommendation: "Check your Business Health score on the Dashboard for a full breakdown.",
      why: "It blends profitability, cash position, inventory health, sales trend and receivables into a single estimate.",
      numbers: "See Dashboard → Business Health.",
      risk: "—",
      action: "Review whichever factor is lowest and act on it first.",
    };
  }

  if (q.includes("produce") || q.includes("batch") || q.includes("work order") || q.includes("manufactur")) {
    return {
      recommendation: "Use the Manufacturing page to plan a production batch against your Bill of Materials.",
      why: "It checks raw-material stock against what a batch would consume before you commit.",
      numbers: "See Manufacturing → New Work Order.",
      risk: "Running a batch without enough raw material on hand will stall the line partway through.",
      action: "Create a work order and review the raw-material availability check before starting.",
    };
  }

  return {
    recommendation: "Here's what I can help with using your data.",
    why: "Try asking about reordering, suppliers, profit, cash, production, or your overall business health.",
    numbers: `Tracking ${products.length} products, ${suppliers.length} suppliers, ${customers.length} customers.`,
    risk: "—",
    action: "Ask a more specific question, or use one of the quick prompts.",
  };
}
