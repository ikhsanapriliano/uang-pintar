"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Pencil,
  Trash2,
  Loader2,
  CalendarDays,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
import { formatDate, cn } from "@/lib/utils";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  transactionUpdateSchema,
  type TransactionUpdateSchema,
} from "@/schema/transaction-schema";
import { api } from "@/trpc/react";
import InputMoney from "@/components/shared/InputMoney";

type Props = {
  item: Transaction;
  variant?: "icon" | "list";
};

const TransactionActions = ({ item, variant = "icon" }: Props) => {
  const utils = api.useUtils();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
      purpose: item.purpose,
      category: item.category,
      amount: String(item.amount),
      trx_date: item.trxDate,
    },
  });

  const category = form.watch("category");

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
                editTransaction.mutate(values),
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange("INCOME")}
                          className={cn(
                            "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                            field.value === "INCOME"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-dl-border bg-white text-dl-muted hover:border-dl-border/60",
                          )}
                        >
                          <TrendingUp className="h-4 w-4" />
                          Pemasukan
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("EXPENSE")}
                          className={cn(
                            "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                            field.value === "EXPENSE"
                              ? "border-rose-500 bg-rose-50 text-rose-700"
                              : "border-dl-border bg-white text-dl-muted hover:border-dl-border/60",
                          )}
                        >
                          <TrendingDown className="h-4 w-4" />
                          Pengeluaran
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Keterangan transaksi"
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
                    <FormLabel>Nominal (Rp)</FormLabel>
                    <FormControl>
                      <InputMoney placeholder="Contoh: 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trx_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Tanggal{" "}
                      {category === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                    </FormLabel>
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
              Transaksi {item.purpose} ({item.trxId}) akan dihapus permanen.
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
