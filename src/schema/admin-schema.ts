import { z } from "zod";
import { paginationSchema } from "./pagination-schema";

export const adminCreateSchema = z.object({
  username: z
    .string()
    .min(1, "Username harus diisi")
    .max(50, "Username max 50 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

export type AdminCreateSchema = z.infer<typeof adminCreateSchema>;

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

export type AdminLoginSchema = z.infer<typeof adminLoginSchema>;

export const adminUpdateSchema = z.object({
  id: z.string().min(1, "ID harus diisi"),
  username: z
    .string()
    .min(1, "Username harus diisi")
    .max(50, "Username max 50 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .optional(),
});

export type AdminUpdateSchema = z.infer<typeof adminUpdateSchema>;

export const adminFilterSchema = paginationSchema.extend({
  username: z.string().optional().nullable(),
});

export type AdminFilterSchema = z.infer<typeof adminFilterSchema>;
