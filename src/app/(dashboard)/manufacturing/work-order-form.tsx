"use client";

import { useState } from "react";
import { createWorkOrderAction } from "@/lib/actions/manufacturing";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function WorkOrderForm({ boms }: { boms: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await createWorkOrderAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (boms.length === 0) {
    return <Card className="mb-4 text-sm text-[#5B6472]">Create a recipe first.</Card>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> New work order
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
        <Field label="Batch quantity">
          <input name="quantity" type="number" step="any" required className={inputClass} />
        </Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Create work order</SubmitButton>
        <div className="text-[11px] text-[#5B6472] mt-2">Checked against current raw-material stock automatically.</div>
      </form>
    </Card>
  );
}
