import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import NavLinks from "./nav-links";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F5F7FA] max-w-[460px] mx-auto pb-20 relative">
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <div>
          <div className="text-xl font-extrabold tracking-tight">VEYRA</div>
          <div className="text-xs text-[#5B6472] mt-0.5">
            {business.name} · {business.businessType}
          </div>
        </div>
        <form action={logoutAction}>
          <button className="text-xs font-semibold text-[#5B6472] border border-[#E4E8EF] bg-white rounded-lg px-3 py-1.5">
            Log out
          </button>
        </form>
      </div>

      <div className="px-4">{children}</div>

      <NavLinks businessType={business.businessType} />
    </div>
  );
}
