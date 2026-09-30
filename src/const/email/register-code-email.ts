import type { TMailTemplate } from "@/server/api/types/global-type";

export const generateRegisterCodeEmail = (code: string): TMailTemplate => ({
  subject: "Kode Verifikasi Pendaftaran - Uang Pintar",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="margin-top: 0;">Selamat datang di Uang Pintar!</h2>
      <p>Gunakan kode verifikasi berikut untuk menyelesaikan pendaftaran Anda:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #1f2937; margin: 16px 0;">${code}</p>
      <p>Kode berlaku selama 10 menit. Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>
    </div>
  `,
});
