"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home, ShoppingCart, Package, Sparkles, Grid3x3,
} from "lucide-react";

export default function NavLinks({ businessType }: { businessType: string }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/sales", label: "Sales", icon: ShoppingCart },
    { href: businessType === "manufacturer" ? "/manufacturing" : "/inventory", label: businessType === "manufacturer" ? "Produce" : "Stock", icon: Package },
    { href: "/advisor", label: "Ask VEYRA", icon: Sparkles },
    { href: "/more", label: "More", icon: Grid3x3 },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] bg-white border-t border-[#E4E8EF] flex px-1 pt-2 pb-3 z-20">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex-1 flex flex-col items-center gap-1 py-1",
              active ? "text-[#0EA5B7]" : "text-[#5B6472]"
            )}
          >
            <Icon size={19} strokeWidth={active ? 2.4 : 2} />
            <span className={clsx("text-[10.5px]", active ? "font-bold" : "font-medium")}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
