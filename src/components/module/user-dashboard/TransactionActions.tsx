"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, Loader2, CalendarDays } from "lucide-react";
import type { Transaction } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  transactionUpdateSchema,
  type TransactionUpdateSchema,
} from "@/schema/transaction-schema";
import { api } from "@/trpc/react";

const paymentMethods = ["Tunai", "QRIS", "Transfer", "Lainnya"];

type Props = {
  item: Transaction;
  variant?: "icon" | "list";
};

const TransactionActions = ({ item, variant = "icon" }: Props) => {
  const utils = api.useUtils();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");

  const invalidate = () => {
    utils.transaction.findAll.invalidate();
    utils.transaction.summary.invalidate();
  };

  const editTransaction = api.transaction.update.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Transaksi berhasil diperbarui");
      setEditOpen(false);
      invalidate();
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  const deleteTransaction = api.transaction.delete.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Transaksi berhasil dihapus");
      setDeleteOpen(false);
      invalidate();
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  const form = useForm<TransactionUpdateSchema>({
    resolver: zodResolver(transactionUpdateSchema),
    defaultValues: {
      id: item.id,
      product_name: item.productName,
      amount: String(item.amount),
      price: String(item.price),
      payment_method: item.paymentMethod,
      trx_date: item.trxDate,
      image_url: item.imageUrl,
    },
  });

  const isOtherMethod = form.watch("payment_method") === "Lainnya";

  return (
    <>
      {variant === "icon" ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-dl-muted hover:bg-dl-primary/10 hover:text-dl-primary"
            onClick={() => setEditOpen(true)}
            aria-label="Edit transaksi"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-dl-muted hover:bg-dl-error/10 hover:text-dl-error"
            onClick={() => setDeleteOpen(true)}
            aria-label="Hapus transaksi"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2 border-t border-dl-border pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-dl-foreground"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-dl-error/40 text-dl-error hover:bg-dl-error/10 hover:text-dl-error"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-dl-foreground">
              Edit Transaksi
            </DialogTitle>
            <DialogDescription>Perbarui informasi transaksi</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                editTransaction.mutate({
                  ...values,
                  payment_method:
                    values.payment_method === "Lainnya"
                      ? customPaymentMethod.trim()
                      : values.payment_method,
                }),
              )}
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
                        placeholder="Nama produk"
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
                          <SelectValue placeholder="Pilih metode" />
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
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white"
                  disabled={editTransaction.isPending}
                >
                  {editTransaction.isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-dl-foreground">
              Hapus transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi {item.productName} ({item.trxId}) akan dihapus permanen.
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTransaction.mutate({ id: item.id })}
              className="bg-dl-error text-white hover:bg-dl-error/90"
            >
              {deleteTransaction.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionActions;
