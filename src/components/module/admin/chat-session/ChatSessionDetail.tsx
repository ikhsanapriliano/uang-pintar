"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDateWithTime, formatStandardNumber } from "@/lib/utils";
import { useState } from "react";
import InputMoney from "@/components/shared/InputMoney";
import { api } from "@/trpc/react";

const statusVariant: Record<
  string,
  "green" | "yellow" | "blue" | "destructive" | "secondary"
> = {
  OPEN: "green",
  CLOSED: "destructive",
};

const statusLabel: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
};

type Props = {
  id: string;
};

const formatIDR = (usd: number, rate: number) =>
  `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(usd * rate)}`;

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
    <span className="text-dl-muted">{label}</span>
    <span className="text-right font-medium text-dl-foreground">{value}</span>
  </div>
);

const ChatSessionDetail = ({ id }: Props) => {
  const router = useRouter();
  const [rate, setRate] = useState(18000);
  const { data: session, isLoading } = api.ai.detail.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dl-muted" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center text-sm text-dl-muted">
        Session tidak ditemukan
      </div>
    );
  }

  const aiCost = session.details.reduce((sum, d) => sum + d.cost, 0);
  const transcriptionCost = session.transcriptions.reduce(
    (sum, t) => sum + t.cost,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => router.push("/tdibmkr/chat-sessions")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dl-muted">Kurs USD</span>
          <InputMoney
            value={rate}
            onChange={(raw: string) => setRate(Number(raw) || 0)}
            className="h-9 w-[150px]"
          />
        </div>
      </div>

      <Card className="border-dl-border bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-dl-foreground">
            Detail Chat Session
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-dl-border">
          <DetailRow label="ID" value={session.id} />
          <DetailRow
            label="User"
            value={`${session.user.firstName} ${session.user.lastName}`}
          />
          <DetailRow label="Email" value={session.user.email} />
          <DetailRow
            label="Status"
            value={
              <Badge
                variant={statusVariant[session.status] ?? "secondary"}
                className="rounded-md text-[10px]"
              >
                {statusLabel[session.status] ?? session.status}
              </Badge>
            }
          />
          <DetailRow
            label="Dibuat"
            value={formatDateWithTime(session.createdAt.toISOString())}
          />
          <DetailRow
            label="Diperbarui"
            value={formatDateWithTime(session.updatedAt.toISOString())}
          />
          <DetailRow
            label="Cost AI"
            value={
              <span>
                ${aiCost.toFixed(5)}
                <br />
                <span className="text-xs text-dl-muted">
                  {formatIDR(aiCost, rate)}
                </span>
              </span>
            }
          />
          <DetailRow
            label="Cost Transkripsi"
            value={
              <span>
                ${formatStandardNumber(transcriptionCost)}
                <br />
                <span className="text-xs text-dl-muted">
                  {formatIDR(transcriptionCost, rate)}
                </span>
              </span>
            }
          />
          <DetailRow
            label="Total Cost"
            value={
              <span>
                ${formatStandardNumber(aiCost + transcriptionCost)}
                <br />
                <span className="text-xs text-dl-muted">
                  {formatIDR(aiCost + transcriptionCost, rate)}
                </span>
              </span>
            }
          />
        </CardContent>
      </Card>

      <Card className="border-dl-border bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-dl-foreground">
            Riwayat Chat ({session.details.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {session.details.length === 0 ? (
            <p className="text-sm text-dl-muted">Belum ada chat</p>
          ) : (
            session.details.map((detail, index) => (
              <Collapsible
                key={detail.id}
                className="rounded-lg border border-dl-border"
              >
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-dl-foreground">
                    {detail.prompt}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-dl-muted">
                    <span>
                      {formatDateWithTime(detail.createdAt.toISOString())}
                    </span>
                    <span>${detail.cost.toFixed(5)}</span>
                    <span className="hidden sm:inline">
                      {formatIDR(detail.cost, rate)}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-dl-border p-3">
                    <p className="text-sm font-semibold text-dl-foreground">
                      Prompt
                    </p>
                    <p className="text-sm text-dl-muted">{detail.prompt}</p>
                    <p className="mt-2 text-sm font-semibold text-dl-foreground">
                      Respons
                    </p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-md bg-dl-background p-3 text-xs text-dl-foreground">
                      {JSON.stringify(detail.response, null, 2)}
                    </pre>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-dl-muted">
                      <span>
                        Prompt Tokens:{" "}
                        {formatStandardNumber(detail.promptTokens)}
                      </span>
                      <span>
                        Completion Tokens:{" "}
                        {formatStandardNumber(detail.completionTokens)}
                      </span>
                      <span>
                        Total Tokens: {formatStandardNumber(detail.totalTokens)}
                      </span>
                      <span>Cost: ${detail.cost.toFixed(5)}</span>
                      <span>{formatIDR(detail.cost, rate)}</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-dl-border bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-dl-foreground">
            Transkripsi ({session.transcriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {session.transcriptions.length === 0 ? (
            <p className="text-sm text-dl-muted">Belum ada transkripsi</p>
          ) : (
            session.transcriptions.map((transcription) => (
              <Collapsible
                key={transcription.id}
                className="rounded-lg border border-dl-border"
              >
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-dl-foreground">
                    {transcription.text}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-dl-muted">
                    <span>
                      {formatDateWithTime(
                        transcription.createdAt.toISOString(),
                      )}
                    </span>
                    <span>${formatStandardNumber(transcription.cost)}</span>
                    <span className="hidden sm:inline">
                      {formatIDR(transcription.cost, rate)}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-dl-border p-3">
                    <p className="text-sm text-dl-muted">
                      {transcription.text}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs text-dl-muted">
                      <span>
                        {formatStandardNumber(transcription.seconds)} detik
                      </span>
                      <span>
                        Cost ${formatStandardNumber(transcription.cost)}
                      </span>
                      <span>{formatIDR(transcription.cost, rate)}</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSessionDetail;
