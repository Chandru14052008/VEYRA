"use client";

import { useState } from "react";
import { createTenderAction } from "@/lib/actions/misc";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function AddTenderForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await createTenderAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> Add tender
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <form action={handleSubmit}>
        <Field label="Tender name"><input name="name" required className={inputClass} /></Field>
        <Field label="Estimated quantity"><input name="quantity" type="number" step="any" required className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Selling price/unit"><input name="sellingPrice" type="number" step="any" required className={inputClass} /></Field>
          <Field label="Cost/unit"><input name="unitCost" type="number" step="any" required className={inputClass} /></Field>
        </div>
        <Field label="Other costs (transport, labour)"><input name="otherCosts" type="number" step="any" defaultValue={0} className={inputClass} /></Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Save tender</SubmitButton>
      </form>
    </Card>
  );
}
