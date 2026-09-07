import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("bg-white rounded-2xl border border-[#E4E8EF] shadow-sm p-4", className)}>
      {children}
    </div>
  );
}

const pillColors: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
};

export function Pill({ color = "success", children }: { color?: string; children: ReactNode }) {
  return (
    <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full", pillColors[color] || pillColors.success)}>
      {children}
    </span>
  );
}

export function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="flex-1 min-w-[140px]">
      <div className="text-xs font-semibold text-[#5B6472]">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-[#5B6472] mt-1">{sub}</div>}
    </Card>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2.5">
      <h2 className="text-sm font-bold text-[#0B1324]">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <Card className="text-center py-9 px-5">
      <div className="text-sm font-bold">{title}</div>
      <div className="text-xs text-[#5B6472] mt-1.5">{sub}</div>
    </Card>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <div className="text-xs font-semibold text-[#5B6472] mb-1">{label}</div>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-[#E4E8EF] bg-[#F9FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5B7]";

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-[#E4E8EF] last:border-0">
      <span className="text-xs text-[#5B6472]">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-2 bg-[#12213E] text-white rounded-lg px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
    >
      {children}
    </button>
  );
}
