"use client";

import { useState } from "react";
import { createExpenseAction } from "@/lib/actions/misc";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

const CATEGORIES = ["Rent", "Electricity", "Salaries", "Transport", "Packaging", "Marketing", "Maintenance", "Bank charges", "Other"];

export default function AddExpenseForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await createExpenseAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setOpen(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
        <Plus size={14} /> Add expense
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <form action={handleSubmit}>
        <Field label="Category">
          <select name="category" className={inputClass}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Amount"><input name="amount" type="number" step="any" required className={inputClass} /></Field>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>Save expense</SubmitButton>
      </form>
    </Card>
  );
}
