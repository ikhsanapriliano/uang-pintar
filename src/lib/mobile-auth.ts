import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export type MobileClaims = {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
};

const secret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function signMobileToken(claims: MobileClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("9d")
    .sign(secret());
}

export async function verifyBearerToken(
  req: NextRequest,
): Promise<MobileClaims | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: payload.userId as string | undefined,
      email: payload.email as string | undefined,
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      role: payload.role as string | undefined,
      status: payload.status as string | undefined,
    };
  } catch {
    return null;
  }
}

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ data }, { status });

export const fail = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

export const str = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
};
