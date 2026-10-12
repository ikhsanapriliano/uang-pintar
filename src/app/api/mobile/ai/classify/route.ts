import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { fail, ok, str, verifyBearerToken } from "@/lib/mobile-auth";
import {
  CLASSIFY_MODEL,
  CLASSIFY_PROMPT,
  chatCompletion,
  draftSummary,
  getOrCreateOpenSession,
  parseAIReplyIntent,
} from "@/server/services/ai-service";

export async function POST(req: NextRequest) {
  const claims = await verifyBearerToken(req);
  if (!claims?.userId) return fail("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const prompt = str(body?.prompt).trim();
  const draft = body?.draft;

  if (!prompt) return fail("Prompt tidak boleh kosong", 400);
  if (prompt.length > 200) return fail("Prompt maksimal 200 karakter", 400);
  if (!draft) return fail("Draft harus diisi", 400);

  const summary = draftSummary(draft);
  const { content, usage } = await chatCompletion(
    [
      {
        role: "system",
        content: `${CLASSIFY_PROMPT}\n\nTransaksi tertunda:\n${summary}`,
      },
      { role: "user", content: prompt },
    ],
    CLASSIFY_MODEL,
  );

  const intent = parseAIReplyIntent(content);

  const session = await getOrCreateOpenSession(db, claims.userId);
  await db.aIChatSessionDetail.create({
    data: {
      sessionId: session.id,
      prompt,
      response: { intent } as Prisma.InputJsonValue,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      cost: usage?.cost ?? 0,
    },
  });

  return ok({ intent, usage });
}
