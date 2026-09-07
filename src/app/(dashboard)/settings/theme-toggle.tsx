"use client";

import { useState } from "react";
import { updateThemeAction } from "@/lib/actions/auth";
import { Sun, Moon } from "lucide-react";
import clsx from "clsx";

export default function ThemeToggle({ currentTheme }: { currentTheme: "light" | "dark" }) {
  const [theme, setTheme] = useState(currentTheme);

  async function choose(t: "light" | "dark") {
    setTheme(t);
    await updateThemeAction(t);
  }

  return (
    <div className="flex gap-2">
      {[{ id: "light" as const, label: "Light", Icon: Sun }, { id: "dark" as const, label: "Dark", Icon: Moon }].map((opt) => (
        <button
          key={opt.id}
          onClick={() => choose(opt.id)}
          className={clsx(
            "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border",
            theme === opt.id ? "border-[#0EA5B7] bg-[#E3F6F8]" : "border-[#E4E8EF]"
          )}
        >
          <opt.Icon size={16} className={theme === opt.id ? "text-[#0EA5B7]" : "text-[#5B6472]"} />
          <span className="text-xs font-semibold">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
