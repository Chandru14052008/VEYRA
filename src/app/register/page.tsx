"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { inputClass } from "@/components/ui";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await registerAction(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-xl font-extrabold text-center mb-1">VEYRA</div>
        <h1 className="text-lg font-bold text-center mb-6">Create your account</h1>
        <form action={handleSubmit} className="bg-white border border-[#E4E8EF] rounded-2xl p-5">
          <label className="block mb-3">
            <div className="text-xs font-semibold text-[#5B6472] mb-1">Your name</div>
            <input name="name" required className={inputClass} />
          </label>
          <label className="block mb-3">
            <div className="text-xs font-semibold text-[#5B6472] mb-1">Email</div>
            <input name="email" type="email" required className={inputClass} />
          </label>
          <label className="block mb-4">
            <div className="text-xs font-semibold text-[#5B6472] mb-1">Password</div>
            <input name="password" type="password" minLength={6} required className={inputClass} />
          </label>
          {error && <div className="text-xs text-red-600 mb-3">{error}</div>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#12213E] text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-xs text-[#5B6472] mt-4">
          Already have an account? <Link href="/login" className="font-semibold text-[#0EA5B7]">Log in</Link>
        </p>
      </div>
    </div>
  );
}
