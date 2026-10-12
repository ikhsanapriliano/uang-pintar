import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { fail, ok, str, verifyBearerToken } from "@/lib/mobile-auth";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  balance: true,
  packageStart: true,
  packageRnd: true,
  aiSessionCount: true,
  maxAISession: true,
};

export async function GET(req: NextRequest) {
  const claims = await verifyBearerToken(req);
  if (!claims?.userId) return fail("Unauthorized", 401);

  const user = await db.user.findUnique({
    where: { id: claims.userId },
    select: userSelect,
  });
  if (!user) return fail("User tidak ditemukan", 404);

  return ok({ user });
}

export async function PATCH(req: NextRequest) {
  const claims = await verifyBearerToken(req);
  if (!claims?.userId) return fail("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const firstName = str(body?.first_name).trim();
  const lastName = str(body?.last_name).trim();

  if (firstName.length < 1 || firstName.length > 30) {
    return fail("Nama depan harus 1-30 karakter", 400);
  }
  if (lastName.length < 1 || lastName.length > 30) {
    return fail("Nama belakang harus 1-30 karakter", 400);
  }

  const user = await db.user.update({
    where: { id: claims.userId },
    data: { firstName, lastName },
    select: userSelect,
  });

  return ok({ user });
}
