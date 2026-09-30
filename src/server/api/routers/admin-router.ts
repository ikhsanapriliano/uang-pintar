import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  adminCreateSchema,
  adminFilterSchema,
  adminUpdateSchema,
} from "@/schema/admin-schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const adminRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(adminFilterSchema)
    .query(async ({ input, ctx }) => {
      const where = input.username
        ? { username: { contains: input.username } }
        : {};
      const [items, total] = await Promise.all([
        ctx.db.admin.findMany({
          where,
          select: {
            id: true,
            username: true,
            createdAt: true,
            updatedAt: true,
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.admin.count({ where }),
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
      const admin = await ctx.db.admin.findUnique({
        where: { id: input.id },
        select: { id: true, username: true, createdAt: true, updatedAt: true },
      });
      if (!admin) throw new TRPCError({ code: "NOT_FOUND" });
      return admin;
    }),

  create: protectedProcedure
    .input(adminCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const hash = await bcrypt.hash(input.password, 10);
      await ctx.db.admin.create({
        data: { username: input.username, password: hash },
      });
    }),

  update: protectedProcedure
    .input(adminUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.admin.findUnique({
        where: { id: input.id },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.admin.update({
        where: { id: input.id },
        data: {
          username: input.username,
          ...(input.password
            ? { password: await bcrypt.hash(input.password, 10) }
            : {}),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.admin.deleteMany({
        where: { id: input.id },
      });
      if (result.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
    }),
});
