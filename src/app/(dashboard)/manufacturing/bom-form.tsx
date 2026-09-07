"use client";

import { useState } from "react";
import { createBomAction } from "@/lib/actions/manufacturing";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function BomForm({ products }: { products: { id: string; name: string; kind: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finished = products.filter((p) => p.kind === "finished");

  async function handleSubmit(formData: FormData) {
    const res = await createBomAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (finished.length === 0) {
    return <Card className="mb-4 text-sm text-[#5B6472]">Add a "finished good" product under Stock first, then create a recipe for it here.</Card>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> New recipe
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <form action={handleSubmit}>
        <Field label="Recipe name"><input name="name" required className={inputClass} placeholder="e.g. Standard batch" /></Field>
        <Field label="Produces (finished good)">
          <select name="outputProductId" required className={inputClass}>
            {finished.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Save recipe</SubmitButton>
        <div className="text-[11px] text-[#5B6472] mt-2">Add raw material lines to it below once saved.</div>
      </form>
    </Card>
  );
}
