"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/utils";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  transactionCreateSchema,
  type TransactionCreateSchema,
} from "@/schema/transaction-schema";
import { api } from "@/trpc/react";

const paymentMethods = ["Tunai", "QRIS", "Transfer", "Lainnya"];

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const ManualTransactionForm = () => {
  const router = useRouter();
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [trxTime, setTrxTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const form = useForm<TransactionCreateSchema>({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      product_name: "",
      amount: "",
      price: "",
      payment_method: "",
      trx_date: new Date(),
      image_url: null,
    },
  });

  const isOtherMethod = form.watch("payment_method") === "Lainnya";

  const createTransaction = api.transaction.create.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Transaksi berhasil dicatat");
      router.push("/merchant");
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dl-foreground">
          Catat Transaksi Manual
        </h1>
        <p className="text-sm text-dl-muted">Catat penjualanmu secara manual</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-dl-foreground">
            Detail Transaksi
          </CardTitle>
          <CardDescription>
            Isi informasi transaksi yang akan dicatat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                const [hours, minutes] = trxTime.split(":").map(Number);
                const trxDate = values.trx_date ?? new Date();
                trxDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
                createTransaction.mutate({
                  ...values,
                  trx_date: trxDate,
                  payment_method:
                    values.payment_method === "Lainnya"
                      ? customPaymentMethod.trim()
                      : values.payment_method,
                });
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Nasi Goreng"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Qty)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="Contoh: 2"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="Contoh: 50000"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                    {isOtherMethod && (
                      <Input
                        placeholder="Tulis metode pembayaran"
                        className="mt-2 bg-white"
                        value={customPaymentMethod}
                        onChange={(e) => setCustomPaymentMethod(e.target.value)}
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trx_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Transaksi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="justify-start gap-2 border-dl-border bg-white text-left font-normal text-dl-foreground"
                          >
                            <CalendarDays className="h-4 w-4 text-dl-primary" />
                            {field.value
                              ? formatDate(field.value.toISOString())
                              : "Pilih tanggal"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-auto bg-white p-0"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          className="bg-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="flex flex-col">
                <FormLabel>Jam Transaksi (WIB)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="justify-start gap-2 border-dl-border bg-white text-left font-normal text-dl-foreground cursor-pointer"
                      >
                        <Clock className="h-4 w-4 text-dl-primary" />
                        {trxTime} WIB
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={trxTime.slice(0, 2)}
                        onValueChange={(h) =>
                          setTrxTime(`${h}${trxTime.slice(2)}`)
                        }
                      >
                        <SelectTrigger className="w-20 cursor-pointer bg-white">
                          <SelectValue placeholder="Jam" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {hours.map((h) => (
                            <SelectItem
                              key={h}
                              value={h}
                              className="cursor-pointer"
                            >
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-dl-muted">:</span>
                      <Select
                        value={trxTime.slice(3)}
                        onValueChange={(m) =>
                          setTrxTime(`${trxTime.slice(0, 3)}${m}`)
                        }
                      >
                        <SelectTrigger className="w-20 cursor-pointer bg-white">
                          <SelectValue placeholder="Menit" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {minutes.map((m) => (
                            <SelectItem
                              key={m}
                              value={m}
                              className="cursor-pointer"
                            >
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110 hover:shadow-dl-primary/40"
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save />
                    Simpan Transaksi
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualTransactionForm;
