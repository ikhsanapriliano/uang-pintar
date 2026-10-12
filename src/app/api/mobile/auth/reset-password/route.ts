import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { fail, ok, str } from "@/lib/mobile-auth";
import {
  deleteVerificationCode,
  getVerificationCode,
  verificationKey,
} from "@/lib/redis";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = str(body?.email).trim().toLowerCase();
  const code = str(body?.code);
  const newPassword = str(body?.new_password);

  if (!email || !code || !newPassword) {
    return fail("Email, kode, dan password baru harus diisi", 400);
  }
  if (!/^\d{6}$/.test(code)) {
    return fail("Kode harus 6 digit", 400);
  }
  if (newPassword.length < 8 || newPassword.length > 100) {
    return fail("Password baru minimal 8 karakter", 400);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return fail("User tidak ditemukan", 404);
  }

  const saved = await getVerificationCode(
    verificationKey("change_password", user.id),
  );
  if (!saved || saved !== code) {
    return fail("Kode verifikasi tidak valid atau kedaluwarsa", 400);
  }
  await deleteVerificationCode(verificationKey("change_password", user.id));

  const hash = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id: user.id }, data: { password: hash } });

  return ok({ message: "Kata sandi berhasil diubah" });
}
