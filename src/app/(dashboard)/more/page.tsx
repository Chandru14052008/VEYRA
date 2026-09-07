import Link from "next/link";
import { SectionTitle } from "@/components/ui";
import { Truck, Users, Gavel, Receipt, Wallet, FileText, Bell, Settings as SettingsIcon } from "lucide-react";

const ITEMS = [
  { href: "/purchases", label: "Purchases", icon: Truck },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/tenders", label: "Tenders", icon: Gavel },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function MorePage() {
  return (
    <div>
      <SectionTitle>More</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-start gap-2 bg-white border border-[#E4E8EF] rounded-2xl p-3.5"
          >
            <item.icon size={18} className="text-[#0EA5B7]" />
            <span className="text-sm font-bold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
