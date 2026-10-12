import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { fail, ok, str, verifyBearerToken } from "@/lib/mobile-auth";
import { getOrCreateOpenSession } from "@/server/services/ai-service";

const FORMATS = ["wav", "mp3", "flac", "m4a", "ogg", "webm", "aac"];

export async function POST(req: NextRequest) {
  const claims = await verifyBearerToken(req);
  if (!claims?.userId) return fail("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const audio = str(body?.audio);
  const format = FORMATS.includes(body?.format) ? body.format : "wav";

  if (!audio) return fail("Audio harus diisi", 400);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return fail("Layanan transkripsi tidak tersedia", 500);

  const form = new FormData();
  form.append("model_id", "scribe_v2");
  form.append("language_code", "id");
  form.append(
    "file",
    new Blob([Buffer.from(audio, "base64")], { type: `audio/${format}` }),
    `audio.${format}`,
  );

  let res: Response;
  try {
    res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
    });
  } catch {
    return fail("Gagal terhubung ke layanan transkripsi", 500);
  }

  if (!res.ok) {
    return fail(`Layanan transkripsi error: ${res.status}`, 500);
  }

  const data = (await res.json()) as {
    text?: string;
    audio_duration_secs?: number;
  };
  if (!data.text) return fail("Hasil transkripsi kosong", 500);

  const usage = {
    seconds: data.audio_duration_secs ?? 0,
    cost: ((data.audio_duration_secs ?? 0) / 3600) * 0.22,
  };
  const session = await getOrCreateOpenSession(db, claims.userId);
  await db.aIChatTranscription.create({
    data: {
      sessionId: session.id,
      text: data.text,
      seconds: usage.seconds,
      cost: usage.cost,
    },
  });

  return ok({ text: data.text, usage });
}
