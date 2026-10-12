import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { fail, ok, signMobileToken, str } from "@/lib/mobile-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = str(body?.email).trim().toLowerCase();
  const password = str(body?.password);

  if (!email || !password) {
    return fail("Email dan password harus diisi", 400);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.password) {
    return fail("Email atau password salah", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return fail("Email atau password salah", 401);
  }

  const token = await signMobileToken({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
  });

  return ok({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    },
  });
}
