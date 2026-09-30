import type { TMailTemplate } from "@/server/api/types/global-type";

export const generateForgetPasswordCodeEmail = (
  link: string,
): TMailTemplate => ({
  subject: "Ubah Kata Sandi - Uang Pintar",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="margin-top: 0;">Ubah Kata Sandi</h2>
      <p>Anda menerima permintaan untuk mengubah kata sandi. Klik tombol di bawah untuk melanjutkan:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #1f2937; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Ubah Kata Sandi</a>
      </p>
      <p>Link berlaku selama 10 menit. Jika Anda tidak meminta ini, abaikan email ini.</p>
    </div>
  `,
});
