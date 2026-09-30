import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { customerMessageCreateSchema } from "@/schema/customer-message-schema";

export const customerMessageRouter = createTRPCRouter({
  create: publicProcedure
    .input(customerMessageCreateSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.db.customerMessage.create({
        data: {
          ...input,
          messageType: "GENERAL",
        },
      });
    }),
});
