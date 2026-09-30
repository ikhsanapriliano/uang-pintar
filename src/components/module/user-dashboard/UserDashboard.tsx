"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateWithTime,
} from "@/lib/utils";
import {
  Wallet,
  ReceiptText,
  CalendarDays,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChartLine,
  History,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useDebounced } from "@/lib/debounced";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import TransactionActions from "./TransactionActions";

const chartConfig = {
  revenue: { label: "Pendapatan", color: "#2563EB" },
} satisfies ChartConfig;

const formatChartTick = (label: string) => {
  const [y, m, d] = label.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d ?? 1));
  return d
    ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : date.toLocaleDateString("id-ID", { month: "short" });
};

const formatChartTooltipLabel = (label: string) => {
  const [y, m, d] = label.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d ?? 1));
  return d
    ? date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const FILTER_MODES = [
  { value: "day", label: "Hari" },
  { value: "month", label: "Bulan" },
  { value: "year", label: "Tahun" },
] as const;

type FilterMode = (typeof FILTER_MODES)[number]["value"];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = { year: CURRENT_YEAR, month: new Date().getMonth() };
const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - i);

type DateFilterContentProps = {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  monthSel: { year: number; month: number } | undefined;
  onMonthChange: (sel: { year: number; month: number }) => void;
  yearSel: number | undefined;
  onYearChange: (year: number | undefined) => void;
};

const DateFilterContent = ({
  filterMode,
  onFilterModeChange,
  range,
  onRangeChange,
  monthSel,
  onMonthChange,
  yearSel,
  onYearChange,
}: DateFilterContentProps) => {
  return (
    <div className="w-full bg-white">
      <div className="flex gap-1 rounded-lg bg-dl-background p-1">
        {FILTER_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onFilterModeChange(mode.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              filterMode === mode.value
                ? "bg-white text-dl-primary shadow-sm"
                : "text-dl-muted hover:text-dl-foreground",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {filterMode === "day" && (
        <div className="flex justify-center">
          <Calendar
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            className="bg-white"
          />
        </div>
      )}
      {filterMode === "month" && (
        <div className="space-y-2 p-3">
          <Select
            value={String(monthSel?.month ?? 0)}
            onValueChange={(v) =>
              onMonthChange({
                year: monthSel?.year ?? CURRENT_YEAR,
                month: Number(v),
              })
            }
          >
            <SelectTrigger className="h-9 w-full cursor-pointer bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {MONTHS.map((m, i) => (
                <SelectItem
                  key={m}
                  value={String(i)}
                  className="cursor-pointer"
                >
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(monthSel?.year ?? CURRENT_YEAR)}
            onValueChange={(v) =>
              onMonthChange({
                year: Number(v),
                month: monthSel?.month ?? 0,
              })
            }
          >
            <SelectTrigger className="h-9 w-full cursor-pointer bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {YEARS.map((y) => (
                <SelectItem
                  key={y}
                  value={String(y)}
                  className="cursor-pointer"
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {filterMode === "year" && (
        <div className="p-3">
          <Select
            value={String(yearSel ?? CURRENT_YEAR)}
            onValueChange={(v) => onYearChange(Number(v))}
          >
            <SelectTrigger className="h-9 w-full cursor-pointer bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {YEARS.map((y) => (
                <SelectItem
                  key={y}
                  value={String(y)}
                  className="cursor-pointer"
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [monthSel, setMonthSel] = useState(CURRENT_MONTH);
  const [yearSel, setYearSel] = useState<number | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"summary" | "chart">("summary");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const endDate = range?.to
    ? new Date(range.to).setHours(23, 59, 59, 999)
    : undefined;

  const now = new Date();
  const startDate =
    filterMode === "month" && monthSel
      ? new Date(monthSel.year, monthSel.month, 1)
      : filterMode === "year" && yearSel
        ? new Date(yearSel, 0, 1)
        : range?.from
          ? range.from
          : new Date(now.getFullYear(), now.getMonth(), 1);

  const effectiveEndDate =
    filterMode === "month" && monthSel
      ? new Date(monthSel.year, monthSel.month + 1, 0, 23, 59, 59, 999)
      : filterMode === "year" && yearSel
        ? new Date(yearSel, 11, 31, 23, 59, 59, 999)
        : range?.to
          ? endDate
          : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const { data: summary, isLoading: isLoadingSummary } =
    api.transaction.summary.useQuery({
      start_date: startDate,
      end_date: effectiveEndDate ? new Date(effectiveEndDate) : undefined,
    });
  const { data: list, isLoading: isLoadingList } =
    api.transaction.findAll.useQuery({
      page,
      limit,
      search,
      start_date: startDate,
      end_date: effectiveEndDate ? new Date(effectiveEndDate) : undefined,
    });
  const { data: chartData, isLoading: isLoadingChart } =
    api.transaction.chart.useQuery({
      start_date: startDate,
      end_date: effectiveEndDate ? new Date(effectiveEndDate) : undefined,
      group_by: filterMode === "year" ? "month" : "day",
    });

  const rangeLabel =
    range?.from && range?.to
      ? `${formatDate(range.from.toISOString())} - ${formatDate(
          range.to.toISOString(),
        )}`
      : range?.from
        ? `Dari ${formatDate(range.from.toISOString())}`
        : "Pilih rentang tanggal";

  const filterLabel =
    filterMode === "month"
      ? monthSel
        ? `${MONTHS[monthSel.month]} ${monthSel.year}`
        : "Pilih bulan"
      : filterMode === "year"
        ? yearSel
          ? String(yearSel)
          : "Pilih tahun"
        : rangeLabel;

  const hasFilter = Boolean(
    range?.from ||
      yearSel ||
      (monthSel &&
        (monthSel.year !== CURRENT_MONTH.year ||
          monthSel.month !== CURRENT_MONTH.month)),
  );

  const resetFilter = () => {
    setRange(undefined);
    setMonthSel(CURRENT_MONTH);
    setYearSel(undefined);
    setPage(1);
    setCalendarOpen(false);
    setSheetOpen(false);
    setFilterMode("month");
  };

  const summaryCards = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-dl-muted">
            <Wallet className="h-4 w-4 text-dl-primary" />
            Pendapatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <Loader2 className="h-6 w-6 animate-spin text-dl-muted" />
          ) : (
            <p className="text-2xl font-bold text-dl-foreground">
              {formatCurrency(summary?.revenue ?? 0)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-dl-muted">
            <ReceiptText className="h-4 w-4 text-dl-primary" />
            Total Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <Loader2 className="h-6 w-6 animate-spin text-dl-muted" />
          ) : (
            <p className="text-2xl font-bold text-dl-foreground">
              {summary?.total ?? 0}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const chartCard = (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-dl-foreground">
          <ChartLine className="h-4 w-4 text-dl-primary" />
          Pendapatan {filterMode === "year" ? "per Bulan" : "per Hari"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingChart ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-dl-muted" />
          </div>
        ) : chartData?.length ? (
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <ChartContainer config={chartConfig} className="aspect-[16/7]">
                <LineChart data={chartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatChartTick}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) =>
                          formatChartTooltipLabel(String(label))
                        }
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-dl-muted">
            Belum ada data
          </p>
        )}
      </CardContent>
    </Card>
  );

  const mobileViews = [
    { value: "summary", label: "Ringkasan" },
    { value: "chart", label: "Grafik" },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dl-foreground">
            Halo, {session?.user?.firstName ?? "Pedagang"}
          </h1>
          <p className="text-sm text-dl-muted">Selamat datang kembali!</p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilter}
              className="hidden text-xs text-dl-muted hover:text-dl-error md:inline-flex"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
          <div className="hidden md:block">
            {mounted ? (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-dl-border text-xs font-medium text-dl-foreground"
                  >
                    <CalendarDays className="h-4 w-4 text-dl-primary" />
                    {filterLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto bg-white p-2">
                  <DateFilterContent
                    filterMode={filterMode}
                    onFilterModeChange={(mode) => {
                      setFilterMode(mode);
                      setPage(1);
                    }}
                    range={range}
                    onRangeChange={(selected) => {
                      setRange(selected);
                      setPage(1);
                    }}
                    monthSel={monthSel}
                    onMonthChange={(sel) => {
                      setMonthSel(sel);
                      setPage(1);
                    }}
                    yearSel={yearSel}
                    onYearChange={(year) => {
                      setYearSel(year);
                      setPage(1);
                    }}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-dl-border text-xs font-medium text-dl-foreground"
              >
                <CalendarDays className="h-4 w-4 text-dl-primary" />
                {filterLabel}
              </Button>
            )}
          </div>

          <div className="w-full md:hidden">
            {mounted ? (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-dl-border text-xs font-medium text-dl-foreground"
                  >
                    <CalendarDays className="h-4 w-4 text-dl-primary" />
                    {filterLabel}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-white px-4 pb-6 pt-4">
                  <SheetTitle className="sr-only">
                    Filter rentang tanggal
                  </SheetTitle>
                  <DateFilterContent
                    filterMode={filterMode}
                    onFilterModeChange={(mode) => {
                      setFilterMode(mode);
                      setPage(1);
                    }}
                    range={range}
                    onRangeChange={(selected) => {
                      setRange(selected);
                      setPage(1);
                    }}
                    monthSel={monthSel}
                    onMonthChange={(sel) => {
                      setMonthSel(sel);
                      setPage(1);
                    }}
                    yearSel={yearSel}
                    onYearChange={(year) => {
                      setYearSel(year);
                      setPage(1);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={resetFilter}
                    className="mt-3 w-full border-dl-error/40 text-dl-error hover:bg-dl-error/10 hover:text-dl-error"
                  >
                    <X className="h-4 w-4" />
                    Reset Filter
                  </Button>
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-dl-border text-xs font-medium text-dl-foreground"
              >
                <CalendarDays className="h-4 w-4 text-dl-primary" />
                {filterLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden space-y-4 md:block sm:space-y-6">
        {summaryCards}
        {chartCard}
      </div>

      <div className="space-y-4 md:hidden">
        <div className="flex gap-1 rounded-lg bg-dl-background p-1">
          {mobileViews.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setView(v.value)}
              className={cn(
                "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === v.value
                  ? "bg-white text-dl-primary shadow-sm"
                  : "text-dl-muted hover:text-dl-foreground",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        {view === "summary" ? summaryCards : chartCard}
      </div>

      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-dl-foreground">
            <History className="h-4 w-4 text-dl-primary" />
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          <div className="border-b border-dl-border px-4 pt-2 pb-4 sm:px-6">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dl-muted" />
              <Input
                placeholder="Cari Transaksi"
                className="h-9 w-full bg-white pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          {isLoadingList ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-dl-muted" />
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-dl-background">
                      <TableHead className="px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        ID Transaksi
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        Produk
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        Jumlah
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        Metode Pembayaran
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        Tanggal Transaksi
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        Dibuat
                      </TableHead>
                      <TableHead className="sticky right-0 bg-dl-background px-4 text-xs font-semibold tracking-wide text-dl-muted uppercase">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list?.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-10 text-center text-sm text-dl-muted"
                        >
                          Belum ada transaksi
                        </TableCell>
                      </TableRow>
                    ) : (
                      list?.items.map((item) => (
                        <TableRow key={item.id} className="group">
                          <TableCell className="px-4 py-3 font-medium text-dl-foreground">
                            {item.trxId}
                          </TableCell>
                          <TableCell className="px-4 py-3 font-medium text-dl-foreground">
                            {item.productName}
                          </TableCell>
                          <TableCell className="px-4 py-3 font-semibold text-dl-foreground tabular-nums">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="inline-flex rounded-full border border-dl-border bg-white px-2.5 py-0.5 text-xs font-medium text-dl-foreground">
                              {item.paymentMethod}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-dl-foreground">
                            {formatDateWithTime(item.trxDate.toISOString())}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-dl-foreground">
                            {formatDateWithTime(item.createdAt.toISOString())}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-white px-4 py-3">
                            <TransactionActions item={item} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="divide-y divide-dl-border md:hidden">
                {list?.items.length === 0 ? (
                  <p className="py-10 text-center text-sm text-dl-muted">
                    Belum ada transaksi
                  </p>
                ) : (
                  list?.items.map((item) => (
                    <details key={item.id} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-dl-foreground">
                            {item.productName}
                          </p>
                          <p className="text-xs text-dl-muted">{item.trxId}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold text-dl-foreground">
                            {formatCurrency(item.price)}
                          </span>
                          <ChevronDown className="h-4 w-4 text-dl-muted transition-transform group-open:rotate-180" />
                        </div>
                      </summary>
                      <div className="px-6 pb-4">
                        <dl className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-dl-muted">Metode</dt>
                            <dd className="text-dl-foreground">
                              {item.paymentMethod}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-dl-muted">Tanggal Transaksi</dt>
                            <dd className="text-dl-foreground">
                              {formatDateWithTime(item.trxDate.toISOString())}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-dl-muted">Dibuat</dt>
                            <dd className="text-dl-foreground">
                              {formatDateWithTime(item.createdAt.toISOString())}
                            </dd>
                          </div>
                        </dl>
                        <TransactionActions item={item} variant="list" />
                      </div>
                    </details>
                  ))
                )}
              </div>
            </>
          )}

          {list && list.meta.total_item > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dl-border px-4 py-3">
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

export default UserDashboard;
