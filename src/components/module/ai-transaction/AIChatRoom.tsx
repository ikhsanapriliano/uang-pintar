"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Bot,
  HelpCircle,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Save,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  cn,
  formatCurrency,
  formatDateWithTime,
  formatLongDateWithTime,
} from "@/lib/utils";
import { toastError, toastSuccess } from "@/lib/toast";
import type { TAIResponse } from "@/server/api/types/ai-type";
import { api } from "@/trpc/react";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content:
      'Halo! Saya asisten AI untuk mencatat transaksi. Ceritakan penjualanmu, contoh: "Jual nasi goreng 50.000, dibayar QRIS."',
  },
];

type TransactionDraft = Partial<TAIResponse>;

const toDateInput = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const toTimeInput = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const initialDraft = (): TransactionDraft => {
  const now = new Date();
  return {
    trxDate: toDateInput(now),
    trxTime: toTimeInput(now),
    amount: "1",
  };
};

const MAX_SESSION_COST = 0.00025;

const draftDate = (data: Partial<TAIResponse>): Date | null => {
  if (!data.trxDate) return null;
  const date = new Date(`${data.trxDate}T${data.trxTime ?? "00:00"}`);
  return isNaN(date.getTime()) ? null : date;
};

const isComplete = (data: Partial<TAIResponse>) =>
  !!data.productName && !!data.amount && !!data.price && !!data.paymentMethod;

const formatResponse = (data: Partial<TAIResponse>) => {
  const date = draftDate(data);
  return `Berikut data transaksi kamu:
- Nama Produk: ${data.productName ?? "-"}
- Jumlah: ${data.amount ?? "-"} pcs
- Harga: ${formatCurrency(data.price || 0) ?? "-"}
- Metode Pembayaran: ${data.paymentMethod ?? "-"}
- Tanggal: ${date ? formatDateWithTime(date.toISOString()) : "-"}
${isComplete(data) ? "\n Data transaksi sudah lengkap, kamu bisa klik tombol Catat Transaksi untuk menyimpan jika sudah benar." : ""}`;
};

const mergeResponse = (
  draft: TransactionDraft,
  response: Partial<TAIResponse>,
) => {
  for (const [key, value] of Object.entries(response)) {
    if (value !== null && value !== undefined) {
      (draft as Record<string, unknown>)[key] = value;
    }
  }
};

const AIChatRoom = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const isFreeTier = session?.user?.status === "FREE_TIER";
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionCost, setSessionCost] = useState(0);
  const [aiTransactionCount, setAiTransactionCount] = useState(0);
  const aiResponseRef = useRef<TransactionDraft>(initialDraft());
  const [, setDraftTick] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(initialMessages.length);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cancelRecordingRef = useRef(false);

  const pushMessage = (message: Omit<Message, "id">) => {
    idRef.current += 1;
    setMessages((prev) => [...prev, { ...message, id: idRef.current }]);
  };

  const getOrCreateSession = api.ai.getOrCreateSession.useMutation({
    onSuccess: (result) => {
      const session = result.session;
      setAiTransactionCount(result.aiTransactionCount);
      let lastId = 1;
      const draft = initialDraft();
      const loaded: Message[] = [...initialMessages];
      for (const detail of session.details) {
        const response = detail.response as unknown as TAIResponse;
        mergeResponse(draft, response);
        loaded.push({ id: ++lastId, role: "user", content: detail.prompt });
        loaded.push({
          id: ++lastId,
          role: "ai",
          content: formatResponse({ ...draft }),
        });
      }
      aiResponseRef.current = draft;
      idRef.current = lastId;
      setMessages(loaded);
      setSessionCost(session.details.reduce((sum, d) => sum + d.cost, 0));
      setDraftTick((t) => t + 1);
      setLoading(false);
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
      setLoading(false);
    },
  });

  useEffect(() => {
    getOrCreateSession.mutate();
  }, []);

  const sendMessage = api.ai.sendMessage.useMutation({
    onSuccess: (result) => {
      mergeResponse(aiResponseRef.current, result.data);
      setSessionCost((c) => c + (result.usage?.cost ?? 0));
      pushMessage({
        role: "ai",
        content: formatResponse(aiResponseRef.current),
      });
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  const transcribe = api.ai.transcribe.useMutation({
    onSuccess: (result) => {
      setInput(result.text);
      toastSuccess("Berhasil!", "Audio berhasil diubah menjadi teks");
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const processAudio = async (blob: Blob): Promise<string> => {
    const targetRate = 16000;
    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(await blob.arrayBuffer());
    await audioCtx.close();
    const offCtx = new OfflineAudioContext(
      1,
      Math.ceil(decoded.duration * targetRate),
      targetRate,
    );
    const source = offCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(offCtx.destination);
    source.start();
    const rendered = await offCtx.startRendering();
    const channel = rendered.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < channel.length; i++)
      peak = Math.max(peak, Math.abs(channel[i]!));
    const gain = peak > 0 ? 0.9 / peak : 1;
    const pcm = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++)
      pcm[i] = Math.max(
        -32768,
        Math.min(32767, Math.round(channel[i]! * gain * 32768)),
      );
    const buffer = new ArrayBuffer(44 + pcm.byteLength);
    const view = new DataView(buffer);
    const writeString = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++)
        view.setUint8(offset + i, s.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcm.byteLength, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, pcm.byteLength, true);
    new Int16Array(buffer, 44).set(pcm);
    return blobToBase64(new Blob([buffer], { type: "audio/wav" }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        if (cancelRecordingRef.current) {
          cancelRecordingRef.current = false;
          toastError("Dibatalkan!", "Maksimal 30 detik per rekaman");
          return;
        }
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        transcribe.mutate({ audio: await processAudio(blob), format: "wav" });
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      cancelRecordingRef.current = false;
      recordingTimeoutRef.current = setTimeout(() => {
        cancelRecordingRef.current = true;
        mediaRecorderRef.current?.stop();
      }, 30000);
      setIsRecording(true);
    } catch {
      toastError("Gagal!", "Mikrofon tidak tersedia atau ditolak");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const resetSession = api.ai.closeAndStartNewSession.useMutation({
    onSuccess: (result) => {
      aiResponseRef.current = initialDraft();
      setMessages(initialMessages);
      setSessionCost(0);
      setAiTransactionCount(result.aiTransactionCount);
      setDraftTick((t) => t + 1);
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  const createTransaction = api.transaction.create.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Transaksi berhasil dicatat");
      resetSession.mutate();
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  const isDraftComplete = isComplete(aiResponseRef.current);

  const energyPct = Math.min(sessionCost / MAX_SESSION_COST, 1);
  const energyExhausted = sessionCost >= MAX_SESSION_COST;

  const send = () => {
    const content = input.trim();
    if (!content) return;
    pushMessage({ role: "user", content });
    setInput("");
    sendMessage.mutate({ prompt: content });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-96px)] items-center justify-center sm:h-[calc(100dvh-104px)] md:h-[calc(100dvh-56px)] lg:h-[calc(100dvh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-dl-primary" />
      </div>
    );
  }

  if (aiTransactionCount >= 50) {
    if (isFreeTier) {
      return (
        <div className="mx-auto flex h-[calc(100dvh-96px)] w-full max-w-xl flex-col items-center justify-center gap-4 text-center sm:h-[calc(100dvh-104px)] md:h-[calc(100dvh-56px)] lg:h-[calc(100dvh-64px)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dl-primary/10">
            <Sparkles className="h-7 w-7 text-dl-primary" />
          </div>
          <h2 className="text-xl font-bold text-dl-foreground">
            Jatah AI gratis kamu sudah habis
          </h2>
          <p className="max-w-sm text-sm text-dl-muted">
            Kamu sudah menggunakan {aiTransactionCount} sesi chat AI hari ini.
            Upgrade paketmu untuk terus mencatat transaksi dengan bantuan AI.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110"
          >
            Upgrade Paket
          </Button>
        </div>
      );
    }

    return (
      <div className="mx-auto flex h-[calc(100dvh-96px)] w-full max-w-xl flex-col items-center justify-center gap-4 text-center sm:h-[calc(100dvh-104px)] md:h-[calc(100dvh-56px)] lg:h-[calc(100dvh-64px)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dl-error/10">
          <AlertTriangle className="h-7 w-7 text-dl-error" />
        </div>
        <h2 className="text-xl font-bold text-dl-foreground">
          Jatah AI kamu sudah habis untuk hari ini
        </h2>
        <p className="max-w-sm text-sm text-dl-muted">
          Kamu sudah menggunakan {aiTransactionCount} sesi chat AI hari ini.
          Lakukan transaksi manual untuk tetap mencatat penjualanmu.
        </p>
        <Button
          onClick={() => router.push("/merchant/manual-transaction")}
          className="bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110"
        >
          Ke Transaksi Manual
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-96px)] w-full max-w-3xl flex-col sm:h-[calc(100dvh-104px)] md:h-[calc(100dvh-56px)] lg:h-[calc(100dvh-64px)]">
      <div className="mb-4 border-b border-dl-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-dl-foreground">
              Asisten Transaksi AI
            </h1>
            <p className="text-xs text-dl-muted sm:text-sm">
              Ceritakan penjualanmu, AI akan mencatatnya.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-dl-primary/10 px-3 py-1 text-xs font-medium text-dl-primary">
            Sesi AI: {aiTransactionCount}/50
          </div>
        </div>
        <div className="mt-3 w-full">
          <div className="mb-1 flex items-center justify-between text-xs text-dl-muted">
            <div className="flex items-center gap-1.5">
              <span>Energi AI</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Info energi AI"
                    className="cursor-pointer shrink-0 p-0.5 flex justify-center items-center place-items-center rounded-full bg-dl-primary/10 text-dl-primary transition-colors hover:bg-dl-primary hover:text-white"
                  >
                    <HelpCircle className="size-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="bg-white text-sm text-dl-foreground sm:w-80 mr-2"
                >
                  AI sudah mengeluarkan {Math.round(energyPct * 100)}% energi
                  untuk sesi ini. Jangan sampai kehabisan tenaga 😴
                  <br />
                  <br />
                  Kalau energinya habis, cukup buat sesi chat baru untuk lanjut
                  mencatat.
                </PopoverContent>
              </Popover>
            </div>
            <span>{Math.round(energyPct * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-dl-border">
            <div
              className="h-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary transition-all duration-300"
              style={{ width: `${energyPct * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                message.role === "ai"
                  ? "bg-dl-primary/10 text-dl-primary"
                  : "bg-dl-foreground text-white",
              )}
            >
              {message.role === "ai" ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "ai"
                  ? "rounded-tl-sm border border-dl-border bg-white text-dl-foreground"
                  : "rounded-tr-sm bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dl-primary/10 text-dl-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-dl-border bg-white px-4 py-2.5 text-sm text-dl-muted">
              <Loader2 className="h-4 w-4 animate-spin text-dl-primary" />
              AI sedang memproses...
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {isDraftComplete && (
        <div className="pt-2">
          <Button
            onClick={() =>
              createTransaction.mutate({
                product_name: aiResponseRef.current.productName!,
                amount: aiResponseRef.current.amount!,
                price: aiResponseRef.current.price!,
                payment_method: aiResponseRef.current.paymentMethod!,
                trx_date: draftDate(aiResponseRef.current) ?? new Date(),
              })
            }
            disabled={createTransaction.isPending}
            className="w-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110"
          >
            {createTransaction.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Catat Transaksi
              </>
            )}
          </Button>
        </div>
      )}

      {energyExhausted ? (
        <div className="border-t border-dl-border pt-3">
          <Button
            onClick={() => {
              resetSession.mutate();
              toastSuccess("Sesi Baru!", "Sesi chat baru telah dibuat");
            }}
            disabled={resetSession.isPending}
            className="w-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110"
          >
            {resetSession.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Buat Sesi Baru
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-dl-muted">
            Energi AI habis untuk sesi ini. Buat sesi baru untuk lanjut.
          </p>
        </div>
      ) : (
        <div className="border-t border-dl-border pt-3">
          <div className="flex items-end gap-2">
            {isRecording ? (
              <div className="flex min-h-12 flex-1 items-center justify-center gap-1 rounded-lg border border-dl-error/30 bg-dl-error/5">
                <span className="mr-2 text-xs font-medium text-dl-error">
                  Merekam...
                </span>
                {[0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map(
                  (delay, i) => (
                    <div
                      key={i}
                      className="dl-wave-bar h-6 w-1 rounded-full bg-dl-error"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ),
                )}
              </div>
            ) : transcribe.isPending ? (
              <div className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-dl-primary/20 bg-dl-primary/5">
                <Loader2 className="h-4 w-4 animate-spin text-dl-primary" />
                <span className="text-xs font-medium text-dl-primary">
                  Memproses audio...
                </span>
              </div>
            ) : (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Jual nasi goreng 50.000, dibayar QRIS"
                className="min-h-12 max-h-32 flex-1 resize-none bg-white text-sm"
                rows={1}
                maxLength={200}
              />
            )}
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={transcribe.isPending}
              className={cn(
                "h-12 w-12 shrink-0 transition-all duration-300",
                isRecording
                  ? "bg-dl-error text-white shadow-lg shadow-dl-error/40 animate-pulse"
                  : "bg-dl-primary/10 text-dl-primary hover:bg-dl-primary/20",
              )}
              aria-label={isRecording ? "Berhenti merekam" : "Rekam suara"}
            >
              {transcribe.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={send}
              disabled={!input.trim() || sendMessage.isPending}
              className="h-12 shrink-0 aspect-square bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110"
              aria-label="Kirim pesan"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-dl-muted">
            <Sparkles className="h-3 w-3" />
            AI akan mengubah chat menjadi transaksi. Tekan Enter untuk kirim,
            atau tekan mic untuk merekam suara.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIChatRoom;
