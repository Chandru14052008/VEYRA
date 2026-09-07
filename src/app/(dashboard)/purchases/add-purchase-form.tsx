"use client";

import { useState } from "react";
import { createPurchaseAction } from "@/lib/actions/purchases";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function AddPurchaseForm({
  products, suppliers,
}: { products: { id: string; name: string; cost: number }[]; suppliers: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await createPurchaseAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (products.length === 0 || suppliers.length === 0) {
    return <Card className="mb-4 text-sm text-[#5B6472]">Add a product and a supplier first.</Card>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> Add purchase
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <form action={handleSubmit}>
        <Field label="Product">
          <select name="productId" required className={inputClass}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Supplier">
          <select name="supplierId" required className={inputClass}>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity"><input name="qty" type="number" step="any" defaultValue={1} required className={inputClass} /></Field>
          <Field label="Unit cost"><input name="unitCost" type="number" step="any" required className={inputClass} /></Field>
        </div>
        <Field label="Status">
          <select name="status" className={inputClass} defaultValue="Pending">
            <option value="Pending">Pending</option>
            <option value="Received">Received (adds to stock now)</option>
          </select>
        </Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Save purchase</SubmitButton>
      </form>
    </Card>
  );
}
