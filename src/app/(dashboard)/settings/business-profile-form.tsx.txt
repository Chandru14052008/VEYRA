"use client";

import { useState } from "react";
import { updateBusinessProfileAction } from "@/lib/actions/auth";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";

export default function BusinessProfileForm({
  name, businessType, currency, gstRegistered,
}: { name: string; businessType: string; currency: string; gstRegistered: boolean }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaved(false);
    setError(null);
    const res = await updateBusinessProfileAction(formData);
    if (res?.error) setError(res.error);
    else setSaved(true);
  }

  return (
    <Card>
      <div className="text-sm font-bold mb-3">Business profile</div>
      <form action={handleSubmit}>
        <Field label="Business name">
          <input name="businessName" defaultValue={name} required className={inputClass} />
        </Field>
        <Field label="Business type">
          <select name="businessType" defaultValue={businessType} className={inputClass}>
            <option value="vendor">Local vendor</option>
            <option value="retailer">Shop / retailer</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="medium">Medium business</option>
          </select>
        </Field>
        <Field label="Currency">
          <input name="currency" defaultValue={currency} required className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" name="gstRegistered" defaultChecked={gstRegistered} />
          <span className="text-xs text-[#5B6472]">GST registered</span>
        </label>
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        {saved && <div className="text-xs text-emerald-600 mb-2">Saved.</div>}
        <SubmitButton>Save changes</SubmitButton>
      </form>
    </Card>
  );
}