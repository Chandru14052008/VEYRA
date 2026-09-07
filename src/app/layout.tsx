import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEYRA — Know. Decide. Grow.",
  description: "AI-powered business decision assistant for small and growing businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#0B1324] antialiased">{children}</body>
    </html>
  );
}
