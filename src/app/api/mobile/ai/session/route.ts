import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { fail, ok, verifyBearerToken } from "@/lib/mobile-auth";
import { getOrCreateOpenSession } from "@/server/services/ai-service";

export async function POST(req: NextRequest) {
  const claims = await verifyBearerToken(req);
  if (!claims?.userId) return fail("Unauthorized", 401);

  const session = await getOrCreateOpenSession(db, claims.userId);
  const user = await db.user.findUnique({
    where: { id: claims.userId },
    select: { aiSessionCount: true, maxAISession: true },
  });

  return ok({
    session,
    aiSessionCount: user?.aiSessionCount ?? 0,
    maxAISession: user?.maxAISession ?? 0,
  });
}
