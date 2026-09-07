"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword, createSession, destroySession, requireBusiness } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check your details and try again." };

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  await createSession(user.id);
  redirect("/onboarding");
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please enter a valid email and password." };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password." };

  await createSession(user.id);
  const business = await prisma.business.findUnique({ where: { ownerId: user.id } });
  redirect(business ? "/dashboard" : "/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

const onboardingSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.enum(["vendor", "retailer", "manufacturer", "medium"]),
  currency: z.string().default("INR"),
  gstRegistered: z.string().optional(),
  openingCash: z.coerce.number().default(0),
});

export async function completeOnboardingAction(formData: FormData) {
  const { getUserIdFromSession } = await import("@/lib/auth");
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/login");

  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fill in the required fields." };

  const { businessName, businessType, currency, gstRegistered, openingCash } = parsed.data;

  await prisma.business.upsert({
    where: { ownerId: userId as string },
    create: {
      ownerId: userId as string,
      name: businessName,
      businessType,
      currency,
      gstRegistered: gstRegistered === "on",
      openingCash,
    },
    update: {
      name: businessName,
      businessType,
      currency,
      gstRegistered: gstRegistered === "on",
      openingCash,
    },
  });

  redirect("/dashboard");
}

export async function updateThemeAction(theme: "light" | "dark") {
  const business = await requireBusiness();
  await prisma.business.update({ where: { id: business.id }, data: { theme } });
}
const businessProfileSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.enum(["vendor", "retailer", "manufacturer", "medium"]),
  currency: z.string().min(1),
  gstRegistered: z.string().optional(),
});

export async function updateBusinessProfileAction(formData: FormData) {
  const business = await requireBusiness();
  const parsed = businessProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the details." };

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: parsed.data.businessName,
      businessType: parsed.data.businessType,
      currency: parsed.data.currency,
      gstRegistered: parsed.data.gstRegistered === "on",
    },
  });
  revalidatePath("/settings");
  return { ok: true };
}
