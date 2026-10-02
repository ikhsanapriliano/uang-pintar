"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDateWithTime, formatStandardNumber } from "@/lib/utils";
import { useDebounced } from "@/lib/debounced";
import { api } from "@/trpc/react";
import InputMoney from "@/components/shared/InputMoney";

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

const CostCell = ({
  usd,
  isAi,
  rate,
}: {
  usd: number;
  isAi?: boolean;
  rate: number;
}) => (
  <TableCell className="text-dl-muted">
    <span className="text-xs">
      {isAi ? `$${usd.toFixed(5)}` : `$${formatStandardNumber(usd)}`}
    </span>
    <br />
    <span className="text-xs text-dl-foreground">
      Rp{" "}
      {new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
      }).format(usd * rate)}
    </span>
  </TableCell>
);

const ChatSessionData = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rate, setRate] = useState(18000);

  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  const { data: list, isLoading } = api.ai.findAll.useQuery({
    page,
    limit,
    search: search || undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  return (
    <div className="space-y-4">
      <Card className="border-dl-border bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-dl-foreground">
            Data AI Chat Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dl-muted" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama/email user..."
              className="bg-white pl-9"
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-dl-muted">Kurs USD</span>
              <InputMoney
                value={rate}
                onChange={(raw: string) => setRate(Number(raw) || 0)}
                className="h-9 w-[150px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dl-muted">Dari</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-[160px] bg-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dl-muted">Sampai</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-[160px] bg-white text-sm"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-white text-xs"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Reset
              </Button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-dl-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Transkripsi</TableHead>
                  <TableHead>Cost AI</TableHead>
                  <TableHead>Cost Transkripsi</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-dl-muted"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : list && list.items.length > 0 ? (
                  list.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-dl-foreground">
                        {item.user.firstName} {item.user.lastName}
                      </TableCell>
                      <TableCell className="text-dl-muted">
                        {item.user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[item.status] ?? "secondary"}
                          className="rounded-md text-[10px]"
                        >
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-dl-muted">
                        {item.messageCount}
                      </TableCell>
                      <TableCell className="text-dl-muted">
                        {item.transcriptionCount}
                      </TableCell>
                      <CostCell usd={item.aiCost} isAi rate={rate} />
                      <CostCell usd={item.transcriptionCost} rate={rate} />
                      <CostCell usd={item.totalCost} rate={rate} />
                      <TableCell className="text-dl-muted">
                        {formatDateWithTime(item.createdAt.toISOString())}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-dl-muted hover:bg-dl-primary/10 hover:text-dl-primary"
                          onClick={() =>
                            router.push(`/tdibmkr/chat-sessions/${item.id}`)
                          }
                          aria-label="Lihat detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-dl-muted"
                    >
                      Tidak ada data session
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {list && list.meta.total_item > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="text-xs text-dl-muted">
                Menampilkan {(list.meta.page - 1) * list.meta.limit + 1}–
                {Math.min(
                  list.meta.page * list.meta.limit,
                  list.meta.total_item,
                )}{" "}
                dari {list.meta.total_item}
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[80px] cursor-pointer bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 100].map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="cursor-pointer data-[state=checked]:bg-slate-100 focus:bg-slate-100 focus:text-slate-900"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-dl-foreground">
                  {list.meta.page} / {list.meta.total_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={page >= list.meta.total_page}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSessionData;
