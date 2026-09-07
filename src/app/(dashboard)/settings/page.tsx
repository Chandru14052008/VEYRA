import { requireBusiness } from "@/lib/auth";
import { Card, SectionTitle, Row } from "@/components/ui";
import ThemeToggle from "./theme-toggle";

export default async function SettingsPage() {
  const business = await requireBusiness();

  return (
    <div>
      <SectionTitle>Settings</SectionTitle>
      <div className="flex flex-col gap-3">
        <Card>
          <div className="text-sm font-bold mb-3">Appearance</div>
          <ThemeToggle currentTheme={business.theme as "light" | "dark"} />
        </Card>
        <Card>
          <Row label="Business name" value={business.name} />
          <Row label="Business type" value={business.businessType} />
          <Row label="Currency" value={business.currency} />
          <Row label="GST registered" value={business.gstRegistered ? "Yes" : "No"} />
        </Card>
      </div>
    </div>
  );
}
