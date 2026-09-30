import z from "zod";

export const paginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
