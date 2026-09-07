import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "veyra_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getUserIdFromSession(): Promise<string | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.userId as string) || null;
  } catch {
    return null;
  }
}

// Returns the logged-in user's business, or null. Every data-access function
// in this app should go through this so one user can never see another
// business's records.
export async function getCurrentBusiness() {
  const userId = await getUserIdFromSession();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { business: true } });
  return user?.business || null;
}

export async function requireBusiness() {
  const business = await getCurrentBusiness();
  if (!business) {
    throw new Error("UNAUTHENTICATED");
  }
  return business;
}
