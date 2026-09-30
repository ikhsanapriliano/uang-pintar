import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  transactionChartSchema,
  transactionCreateSchema,
  transactionFilterSchema,
  transactionSummarySchema,
  transactionUpdateSchema,
} from "@/schema/transaction-schema";
import { z } from "zod";
import { randomInt } from "crypto";
import { TRPCError } from "@trpc/server";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const toInt = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;
const toFloat = (value: string | number) =>
  typeof value === "number" ? value : Number(value.replace(/[^\d.]/g, "")) || 0;

const generateTrxId = () => {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHANUMERIC[randomInt(ALPHANUMERIC.length)];
  }
  return `TRX-${code}`;
};

export const transactionRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(transactionFilterSchema)
    .query(async ({ input, ctx }) => {
      const where = {
        userId: ctx.session.userId,
        trxDate: {
          ...(input.start_date ? { gte: input.start_date } : {}),
          ...(input.end_date ? { lte: input.end_date } : {}),
        },
        ...(input.search
          ? {
              OR: [
                {
                  trxId: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  productName: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  paymentMethod: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(input.payment_method
          ? { paymentMethod: input.payment_method }
          : {}),
      };
      const [items, total] = await Promise.all([
        ctx.db.transaction.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.transaction.count({ where }),
      ]);
      return {
        items,
        meta: {
          page: input.page,
          limit: input.limit,
          total_page: Math.ceil(total / input.limit),
          total_item: total,
        },
      };
    }),

  detail: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const transaction = await ctx.db.transaction.findFirst({
        where: { id: input.id, userId: ctx.session.userId },
      });
      if (!transaction) throw new TRPCError({ code: "NOT_FOUND" });
      return transaction;
    }),

  summary: protectedProcedure
    .input(transactionSummarySchema)
    .query(async ({ input, ctx }) => {
      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.userId,
          trxDate: {
            ...(input.start_date ? { gte: input.start_date } : {}),
            ...(input.end_date ? { lte: input.end_date } : {}),
          },
        },
        select: { price: true },
      });
      const revenue = transactions.reduce((sum, t) => sum + t.price, 0);
      return { total: transactions.length, revenue };
    }),

  chart: protectedProcedure
    .input(transactionChartSchema)
    .query(async ({ input, ctx }) => {
      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.userId,
          trxDate: {
            ...(input.start_date ? { gte: input.start_date } : {}),
            ...(input.end_date ? { lte: input.end_date } : {}),
          },
        },
        orderBy: { trxDate: "asc" },
        select: { trxDate: true, price: true },
      });
      const map = new Map<string, number>();
      for (const t of transactions) {
        const mm = String(t.trxDate.getMonth() + 1).padStart(2, "0");
        const dd = String(t.trxDate.getDate()).padStart(2, "0");
        const label =
          input.group_by === "month"
            ? `${t.trxDate.getFullYear()}-${mm}`
            : `${t.trxDate.getFullYear()}-${mm}-${dd}`;
        map.set(label, (map.get(label) ?? 0) + t.price);
      }
      return Array.from(map, ([label, revenue]) => ({ label, revenue }));
    }),

  create: protectedProcedure
    .input(transactionCreateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await ctx.db.transaction.create({
        data: {
          userId: ctx.session.userId,
          trxId: generateTrxId(),
          trxDate: input.trx_date ?? new Date(),
          productName: input.product_name,
          amount: toInt(input.amount),
          price: toFloat(input.price),
          paymentMethod: input.payment_method,
          imageUrl: input.image_url ?? null,
        },
      });
    }),

  update: protectedProcedure
    .input(transactionUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.transaction.updateMany({
        where: { id: input.id, userId: ctx.session.userId },
        data: {
          trxDate: input.trx_date ?? undefined,
          productName: input.product_name,
          amount: toInt(input.amount),
          price: toFloat(input.price),
          paymentMethod: input.payment_method,
          imageUrl: input.image_url ?? null,
        },
      });
      if (result.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.transaction.deleteMany({
        where: { id: input.id, userId: ctx.session.userId },
      });
      if (result.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
    }),
});
