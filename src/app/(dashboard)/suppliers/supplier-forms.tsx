"use client";

import { useState } from "react";
import { createSupplierAction, createQuoteAction } from "@/lib/actions/suppliers";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function SupplierForms({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const [tab, setTab] = useState<null | "supplier" | "quote">(null);
  const [error, setError] = useState<string | null>(null);

  async function submitSupplier(formData: FormData) {
    const res = await createSupplierAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setTab(null); }
  }

  async function submitQuote(formData: FormData) {
    const res = await createQuoteAction(formData);
    if (res?.error) setError(res.error);
    else { setError(null); setTab(null); }
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab(tab === "supplier" ? null : "supplier")} className="inline-flex items-center gap-1.5 bg-[#12213E] text-white rounded-lg px-3.5 py-2 text-sm font-semibold">
          <Plus size={14} /> Add supplier
        </button>
        {suppliers.length > 0 && (
          <button onClick={() => setTab(tab === "quote" ? null : "quote")} className="inline-flex items-center gap-1.5 border border-[#E4E8EF] bg-white rounded-lg px-3.5 py-2 text-sm font-semibold">
            <Plus size={14} /> Add quotation
          </button>
        )}
      </div>

      {tab === "supplier" && (
        <Card>
          <form action={submitSupplier}>
            <Field label="Supplier name"><input name="name" required className={inputClass} /></Field>
            <Field label="On-time delivery %"><input name="onTime" type="number" defaultValue={90} className={inputClass} /></Field>
            <Field label="Notes"><input name="notes" className={inputClass} /></Field>
            {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
            <SubmitButton>Save supplier</SubmitButton>
          </form>
        </Card>
      )}

      {tab === "quote" && (
        <Card>
          <form action={submitQuote}>
            <Field label="Supplier">
              <select name="supplierId" required className={inputClass}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Product name (for comparison)"><input name="productName" required className={inputClass} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unit price"><input name="unitPrice" type="number" step="any" required className={inputClass} /></Field>
              <Field label="MOQ"><input name="moq" type="number" defaultValue={1} className={inputClass} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Delivery (days)"><input name="delivery" type="number" defaultValue={3} className={inputClass} /></Field>
              <Field label="Credit (days)"><input name="credit" type="number" defaultValue={0} className={inputClass} /></Field>
            </div>
            {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
            <SubmitButton>Save quotation</SubmitButton>
          </form>
        </Card>
      )}
    </div>
  );
}
