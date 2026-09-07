"use client";

import { useState } from "react";
import { createSaleAction } from "@/lib/actions/sales";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function AddSaleForm({ products }: { products: { id: string; name: string; price: number; stock: number }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await createSaleAction(formData);
    setPending(false);
    if (res?.error) setError(res.error);
    else setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold"
      >
        <Plus size={14} /> Add sale
      </button>
    );
  }

  if (products.length === 0) {
    return <Card className="mb-4 text-sm text-[#5B6472]">Add a product under Stock before recording a sale.</Card>;
  }

  return (
    <Card className="mb-4">
      <div className="text-sm font-bold mb-3">New sale</div>
      <form action={handleSubmit}>
        <Field label="Product">
          <select name="productId" className={inputClass} required>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (₹{p.price}, {p.stock} in stock)</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input name="qty" type="number" min={1} step="any" defaultValue={1} required className={inputClass} />
          </Field>
          <Field label="Payment">
            <select name="payment" className={inputClass}>
              {["Cash", "UPI", "Card", "Bank transfer", "Credit"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>{pending ? "Saving..." : "Save sale"}</SubmitButton>
      </form>
    </Card>
  );
}
