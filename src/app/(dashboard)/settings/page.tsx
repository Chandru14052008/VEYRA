import { requireBusiness } from "@/lib/auth";
import { SectionTitle } from "@/components/ui";
import ThemeToggle from "./theme-toggle";
import BusinessProfileForm from "./business-profile-form";

export default async function SettingsPage() {
  const business = await requireBusiness();

  return (
    <div>
      <SectionTitle>Settings</SectionTitle>
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-[#E4E8EF] p-4">
          <div className="text-sm font-bold mb-3">Appearance</div>
          <ThemeToggle currentTheme={business.theme as "light" | "dark"} />
        </div>
        <BusinessProfileForm
          name={business.name}
          businessType={business.businessType}
          currency={business.currency}
          gstRegistered={business.gstRegistered}
        />
      </div>
    </div>
  );
}