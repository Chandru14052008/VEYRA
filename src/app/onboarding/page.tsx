"use client";

import { useState } from "react";
import { completeOnboardingAction } from "@/lib/actions/auth";
import { inputClass } from "@/components/ui";
import clsx from "clsx";

const TYPES = [
  { id: "vendor", label: "Local vendor", desc: "Street/market vendor, ultra-simple daily tracking" },
  { id: "retailer", label: "Shop / retailer", desc: "Grocery, pharmacy, hardware, clothing, etc." },
  { id: "manufacturer", label: "Manufacturer", desc: "Makes goods from raw materials — adds BOM & production" },
  { id: "medium", label: "Medium business", desc: "Multiple staff, more reporting" },
];

export default function OnboardingPage() {
  const [type, setType] = useState("retailer");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await completeOnboardingAction(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-xl font-extrabold text-center mb-1">VEYRA</div>
        <h1 className="text-lg font-bold text-center mb-6">Tell us about your business</h1>

        <form action={handleSubmit} className="bg-white border border-[#E4E8EF] rounded-2xl p-5">
          <div className="text-xs font-semibold text-[#5B6472] mb-2">What kind of business is this?</div>
          <input type="hidden" name="businessType" value={type} />
          <div className="grid grid-cols-1 gap-2 mb-4">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id)}
                className={clsx(
                  "text-left border rounded-xl px-3 py-2.5",
                  type === t.id ? "border-[#0EA5B7] bg-[#E3F6F8]" : "border-[#E4E8EF]"
                )}
              >
                <div className="text-sm font-bold">{t.label}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>

          <label className="block mb-3">
            <div className="text-xs font-semibold text-[#5B6472] mb-1">Business name</div>
            <input name="businessName" required className={inputClass} placeholder="e.g. Ananya Stores" />
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <div className="text-xs font-semibold text-[#5B6472] mb-1">Currency</div>
              <input name="currency" defaultValue="INR" className={inputClass} />
            </label>
            <label className="block">
              <div className="text-xs font-semibold text-[#5B6472] mb-1">Opening cash</div>
              <input name="openingCash" type="number" defaultValue={0} className={inputClass} />
            </label>
          </div>

          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" name="gstRegistered" />
            <span className="text-xs text-[#5B6472]">GST registered</span>
          </label>

          {error && <div className="text-xs text-red-600 mb-3">{error}</div>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#12213E] text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            {pending ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
