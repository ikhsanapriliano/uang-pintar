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
                  purpose: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(input.category ? { category: input.category } : {}),
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
      const where = {
        userId: ctx.session.userId,
        trxDate: {
          ...(input.start_date ? { gte: input.start_date } : {}),
          ...(input.end_date ? { lte: input.end_date } : {}),
        },
        ...(input.category ? { category: input.category } : {}),
      };
      const [transactions, user] = await Promise.all([
        ctx.db.transaction.findMany({
          where,
          select: { amount: true, category: true },
        }),
        ctx.db.user.findUnique({
          where: { id: ctx.session.userId },
          select: { balance: true },
        }),
      ]);
      const income = transactions.filter((t) => t.category === "INCOME");
      const expense = transactions.filter((t) => t.category === "EXPENSE");
      return {
        balance: user?.balance ?? 0,
        income: {
          nominal: income.reduce((sum, t) => sum + t.amount, 0),
          quantity: income.length,
        },
        expense: {
          nominal: expense.reduce((sum, t) => sum + t.amount, 0),
          quantity: expense.length,
        },
      };
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
        select: { trxDate: true, amount: true },
      });
      const map = new Map<string, number>();
      for (const t of transactions) {
        const mm = String(t.trxDate.getMonth() + 1).padStart(2, "0");
        const dd = String(t.trxDate.getDate()).padStart(2, "0");
        const label =
          input.group_by === "month"
            ? `${t.trxDate.getFullYear()}-${mm}`
            : `${t.trxDate.getFullYear()}-${mm}-${dd}`;
        map.set(label, (map.get(label) ?? 0) + t.amount);
      }
      return Array.from(map, ([label, revenue]) => ({ label, revenue }));
    }),

  create: protectedProcedure
    .input(transactionCreateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const amount = toFloat(input.amount);
      const balanceDelta = input.category === "INCOME" ? amount : -amount;
      await ctx.db.$transaction([
        ctx.db.transaction.create({
          data: {
            userId: ctx.session.userId,
            trxId: generateTrxId(),
            trxDate: input.trx_date ?? new Date(),
            category: input.category,
            purpose: input.purpose,
            amount,
          },
        }),
        ctx.db.user.update({
          where: { id: ctx.session.userId },
          data: { balance: { increment: balanceDelta } },
        }),
      ]);
    }),

  update: protectedProcedure
    .input(transactionUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.transaction.findFirst({
        where: { id: input.id, userId: ctx.session.userId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      const oldDelta =
        existing.category === "INCOME" ? existing.amount : -existing.amount;
      const newAmount = toFloat(input.amount);
      const newDelta = input.category === "INCOME" ? newAmount : -newAmount;
      await ctx.db.$transaction([
        ctx.db.transaction.updateMany({
          where: { id: input.id, userId: ctx.session.userId },
          data: {
            trxDate: input.trx_date ?? undefined,
            category: input.category,
            purpose: input.purpose,
            amount: newAmount,
          },
        }),
        ctx.db.user.update({
          where: { id: ctx.session.userId },
          data: { balance: { increment: newDelta - oldDelta } },
        }),
      ]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.transaction.findFirst({
        where: { id: input.id, userId: ctx.session.userId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      const balanceDelta =
        existing.category === "INCOME" ? -existing.amount : existing.amount;
      await ctx.db.$transaction([
        ctx.db.transaction.deleteMany({
          where: { id: input.id, userId: ctx.session.userId },
        }),
        ctx.db.user.update({
          where: { id: ctx.session.userId },
          data: { balance: { increment: balanceDelta } },
        }),
      ]);
    }),
});
