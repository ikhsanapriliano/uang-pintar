import { z } from "zod";
import { paginationSchema } from "./pagination-schema";

export const transactionCreateSchema = z.object({
  product_name: z.string().min(1, "Product name harus diisi"),
  amount: z.string().min(1, "Jumlah harus diisi"),
  price: z.union([
    z.string().min(1, "Harga harus diisi"),
    z.number().positive("Harga harus diisi"),
  ]),
  payment_method: z.string().min(1, "Payment method harus diisi"),
  trx_date: z.date().optional(),
  image_url: z.string().optional().nullable(),
});

export type TransactionCreateSchema = z.infer<typeof transactionCreateSchema>;

export const transactionUpdateSchema = transactionCreateSchema.extend({
  id: z.string().min(1, "ID harus diisi"),
});

export type TransactionUpdateSchema = z.infer<typeof transactionUpdateSchema>;

export const transactionFilterSchema = paginationSchema.extend({
  search: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
});

export type TransactionFilterSchema = z.infer<typeof transactionFilterSchema>;

export const transactionSummarySchema = z.object({
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
});

export type TransactionSummarySchema = z.infer<typeof transactionSummarySchema>;

export const transactionChartSchema = transactionSummarySchema.extend({
  group_by: z.enum(["day", "month"]),
});

export type TransactionChartSchema = z.infer<typeof transactionChartSchema>;
