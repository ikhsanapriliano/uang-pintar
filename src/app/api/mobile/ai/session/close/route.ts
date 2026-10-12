import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { fail, ok, verifyBearerToken } from "@/lib/mobile-auth";
import { getOrCreateOpenSession } from "@/server/services/ai-service";

export async function POST(req: NextRequest) {
  const claims = await verifyBearerToken(req);
  if (!claims?.userId) return fail("Unauthorized", 401);

  await db.aIChatSession.updateMany({
    where: { userId: claims.userId, status: "OPEN" },
    data: { status: "CLOSED" },
  });
  const session = await getOrCreateOpenSession(db, claims.userId);
  const user = await db.user.update({
    where: { id: claims.userId },
    data: { aiSessionCount: { increment: 1 } },
    select: { aiSessionCount: true },
  });

  return ok({ session, aiSessionCount: user.aiSessionCount });
}
