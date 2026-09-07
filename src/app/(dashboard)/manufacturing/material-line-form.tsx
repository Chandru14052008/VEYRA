"use client";

import { useState } from "react";
import { addBomLineAction } from "@/lib/actions/manufacturing";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function MaterialLineForm({
  boms, rawMaterials,
}: { boms: { id: string; name: string }[]; rawMaterials: { id: string; name: string; unit: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await addBomLineAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (boms.length === 0 || rawMaterials.length === 0) {
    return (
      <Card className="mb-4 text-sm text-[#5B6472]">
        Add at least one recipe and one "raw material" product to add material lines.
      </Card>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 border border-[#E4E8EF] bg-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> Add material to a recipe
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <form action={handleSubmit}>
        <Field label="Recipe">
          <select name="bomId" required className={inputClass}>
            {boms.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Raw material">
          <select name="productId" required className={inputClass}>
            {rawMaterials.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
          </select>
        </Field>
        <Field label="Quantity per finished unit">
          <input name="qtyPerUnit" type="number" step="any" required className={inputClass} />
        </Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Add material</SubmitButton>
      </form>
    </Card>
  );
}
