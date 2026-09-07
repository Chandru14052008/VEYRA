import type { Metadata } from "next";
import "./globals.css";
import { getCurrentBusiness } from "@/lib/auth";

export const metadata: Metadata = {
  title: "VEYRA — Know. Decide. Grow.",
  description: "AI-powered business decision assistant for small and growing businesses.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  const dark = business?.theme === "dark";

  return (
    <html lang="en" className={dark ? "dark" : ""}>
      <body className="min-h-screen text-[#0B1324] antialiased">{children}</body>
    </html>
  );
}