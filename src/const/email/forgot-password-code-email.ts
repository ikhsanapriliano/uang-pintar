import type { TMailTemplate } from "@/server/api/types/global-type";

export const generateForgetPasswordCodeEmail = (
  code: string,
): TMailTemplate => ({
  subject: "Ubah Kata Sandi - Uang Pintar",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="margin-top: 0;">Ubah Kata Sandi</h2>
      <p>Gunakan kode verifikasi berikut untuk mengubah kata sandi Anda:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #1f2937; margin: 16px 0;">${code}</p>
      <p>Kode berlaku selama 10 menit. Jika Anda tidak meminta ini, abaikan email ini.</p>
    </div>
  `,
});
