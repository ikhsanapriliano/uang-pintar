import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { fail, ok, str } from "@/lib/mobile-auth";
import { sendRegisterCode } from "@/server/services/verification-service";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = str(body?.email).trim().toLowerCase();

  if (!email) {
    return fail("Email harus diisi", 400);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return fail("User tidak ditemukan", 404);
  }

  await sendRegisterCode(email);
  return ok({ message: "Kode verifikasi baru telah dikirim" });
}
