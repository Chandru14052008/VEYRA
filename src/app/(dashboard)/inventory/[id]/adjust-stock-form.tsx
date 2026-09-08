"use client";

import { useState } from "react";
import { adjustStockAction } from "@/lib/actions/products";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function AdjustStockForm({ productId, unit }: { productId: string; unit: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await adjustStockAction(productId, formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> Add / adjust stock
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <div className="text-sm font-bold mb-2">Add or adjust stock</div>
      <form action={handleSubmit}>
        <Field label={`Quantity (${unit}s) — use a negative number to reduce`}>
          <input name="amount" type="number" step="any" required className={inputClass} placeholder="e.g. 20 or -5" />
        </Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Save</SubmitButton>
      </form>
    </Card>
  );
}