import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  TAIChatCompletionUsage,
  TAIResponse,
} from "@/server/api/types/ai-type";

const sendMessageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt tidak boleh kosong")
    .max(200, "Prompt maksimal 200 karakter"),
});

const transcribeSchema = z.object({
  audio: z.string().min(1, "Audio harus diisi"),
  format: z
    .enum(["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac"])
    .default("wav"),
});

const SYSTEM_PROMPT = `Waktu sekarang: ${new Date().toISOString()}. Ubah input transaksi menjadi JSON. Balas JSON saja:
{"purpose":string|null,"amount":number|null,"trxDate":string|null,"trxTime":string|null}
Gunakan null jika data tidak diketahui. purpose adalah keterangan transaksi, amount adalah nominal (angka tanpa format, contoh 50000). trxDate adalah tanggal transaksi format "YYYY-MM-DD" (contoh "2026-05-12"), trxTime adalah jam transaksi format "HH:mm" (contoh "14:30"). Gunakan waktu sekarang sebagai acuan untuk kata seperti "hari ini", "kemarin", "jam 3 sore".`;

const getOrCreateOpenSession = async (
  db: PrismaClient,
  userId: string | undefined,
) => {
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const existing = await db.aIChatSession.findFirst({
    where: { userId, status: "OPEN" },
    include: { details: { orderBy: { createdAt: "asc" } } },
  });
  if (existing) return existing;
  return db.aIChatSession.create({
    data: { userId },
    include: { details: true },
  });
};

export const aiRouter = createTRPCRouter({
  getOrCreateSession: protectedProcedure.mutation(async ({ ctx }) => {
    const session = await getOrCreateOpenSession(ctx.db, ctx.session.userId);
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.userId! },
      select: { aiSessionCount: true },
    });
    return { session, aiSessionCount: user?.aiSessionCount ?? 0 };
  }),

  closeAndStartNewSession: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    await ctx.db.aIChatSession.updateMany({
      where: { userId: ctx.session.userId, status: "OPEN" },
      data: { status: "CLOSED" },
    });
    const session = await getOrCreateOpenSession(ctx.db, ctx.session.userId);
    const user = await ctx.db.user.update({
      where: { id: ctx.session.userId },
      data: { aiSessionCount: { increment: 1 } },
      select: { aiSessionCount: true },
    });
    return { session, aiSessionCount: user.aiSessionCount };
  }),

  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const session = await getOrCreateOpenSession(ctx.db, ctx.session.userId);

      const apiKey = process.env.OPENROUTER;
      if (!apiKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let res: Response;
      try {
        res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "xiaomi/mimo-v2.6-flash",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: input.prompt },
            ],
            response_format: { type: "json_object" },
            max_tokens: 200,
            temperature: 0.2,
            reasoning: { effort: "none" },
          }),
        });
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal terhubung ke layanan AI",
        });
      }

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Layanan AI error: ${res.status}`,
        });
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: TAIChatCompletionUsage;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let parsed: TAIResponse;
      try {
        parsed = JSON.parse(content) as TAIResponse;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Respons AI tidak valid",
        });
      }

      await ctx.db.aIChatSessionDetail.create({
        data: {
          sessionId: session.id,
          prompt: input.prompt,
          response: parsed as unknown as Prisma.InputJsonValue,
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
          cost: data.usage?.cost ?? 0,
        },
      });

      return {
        data: parsed,
        usage: data.usage ?? null,
      };
    }),

  transcribe: protectedProcedure
    .input(transcribeSchema)
    .mutation(async ({ input, ctx }) => {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const form = new FormData();
      form.append("model_id", "scribe_v2");
      form.append("language_code", "id");
      form.append(
        "file",
        new Blob([Buffer.from(input.audio, "base64")], {
          type: `audio/${input.format}`,
        }),
        `audio.${input.format}`,
      );

      let res: Response;
      try {
        res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: { "xi-api-key": apiKey },
          body: form,
        });
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal terhubung ke layanan transkripsi",
        });
      }

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Layanan transkripsi error: ${res.status}`,
        });
      }

      const data = (await res.json()) as {
        text?: string;
        audio_duration_secs?: number;
      };
      if (!data.text) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const usage = {
        seconds: data.audio_duration_secs ?? 0,
        cost: ((data.audio_duration_secs ?? 0) / 3600) * 0.22,
      };
      const session = await getOrCreateOpenSession(ctx.db, ctx.session.userId);
      await ctx.db.aIChatTranscription.create({
        data: {
          sessionId: session.id,
          text: data.text,
          seconds: usage.seconds,
          cost: usage.cost,
        },
      });

      return {
        text: data.text,
        usage,
      };
    }),
});
