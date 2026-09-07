"use client";

import { useState } from "react";
import { createCustomerAction } from "@/lib/actions/misc";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function AddCustomerForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await createCustomerAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> Add customer
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <form action={handleSubmit}>
        <Field label="Customer name"><input name="name" required className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount owed"><input name="amount" type="number" step="any" required className={inputClass} /></Field>
          <Field label="Days outstanding"><input name="days" type="number" defaultValue={0} required className={inputClass} /></Field>
        </div>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Save customer</SubmitButton>
      </form>
    </Card>
  );
}
