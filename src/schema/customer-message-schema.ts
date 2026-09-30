import { z } from "zod";

export const customerMessageCreateSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  contact: z.string().min(1, "Kontak harus diisi"),
  message: z.string().min(1, "Pesan harus diisi"),
});

export type CustomerMessageCreateSchema = z.infer<
  typeof customerMessageCreateSchema
>;
