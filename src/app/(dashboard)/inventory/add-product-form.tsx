"use client";

import { useState } from "react";
import { createProductAction } from "@/lib/actions/products";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function AddProductForm({ businessType }: { businessType: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await createProductAction(formData);
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
        <Plus size={14} /> Add product
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <div className="text-sm font-bold mb-3">New product</div>
      <form action={handleSubmit}>
        <Field label="Name">
          <input name="name" required className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SKU">
            <input name="sku" required className={inputClass} />
          </Field>
          <Field label="Unit">
            <input name="unit" defaultValue="unit" required className={inputClass} />
          </Field>
        </div>
        {businessType === "manufacturer" && (
          <Field label="Type">
            <select name="kind" className={inputClass} defaultValue="finished">
              <option value="finished">Finished good</option>
              <option value="raw">Raw material</option>
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase cost">
            <input name="cost" type="number" step="any" required className={inputClass} />
          </Field>
          <Field label="Selling price">
            <input name="price" type="number" step="any" required className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Opening stock">
            <input name="stock" type="number" step="any" defaultValue={0} required className={inputClass} />
          </Field>
          <Field label="Avg daily usage">
            <input name="avgDaily" type="number" step="any" defaultValue={0} required className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lead time (days)">
            <input name="leadTime" type="number" defaultValue={3} required className={inputClass} />
          </Field>
          <Field label="Safety stock">
            <input name="safety" type="number" step="any" defaultValue={0} required className={inputClass} />
          </Field>
        </div>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <SubmitButton>{pending ? "Saving..." : "Save product"}</SubmitButton>
      </form>
    </Card>
  );
}
