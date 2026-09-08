import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/auth";

export default async function LandingPage() {
  const userId = await getUserIdFromSession();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0B1324] text-white flex flex-col items-center justify-center px-6 text-center">
      <img src="/logo.png" alt="VEYRA" className="h-14 w-14 rounded-2xl object-cover mb-3" />
      <div className="text-3xl font-extrabold tracking-tight mb-2">VEYRA</div>
      <div className="text-[#8D96A8] mb-8">Know. Decide. Grow.</div>
      <h1 className="text-2xl font-bold max-w-sm leading-snug">
        Your business. One clear decision ahead.
      </h1>
      <p className="text-[#8D96A8] mt-3 max-w-xs text-sm">
        VEYRA turns your sales, stock, costs and supplier data into simple business decisions.
      </p>
      <div className="flex gap-3 mt-8">
        <Link href="/register" className="bg-[#0EA5B7] text-[#0B1324] font-semibold px-5 py-2.5 rounded-lg text-sm">
          Start for free
        </Link>
        <Link href="/login" className="border border-white/20 px-5 py-2.5 rounded-lg text-sm font-semibold">
          Log in
        </Link>
      </div>
      <p className="text-[#5B6472] text-xs mt-10">Demo account: demo@veyra.app / demo1234</p>
    </div>
  );
}