"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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
import { formatDateWithTime } from "@/lib/utils";
import { useDebounced } from "@/lib/debounced";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  adminCreateSchema,
  adminUpdateSchema,
  type AdminCreateSchema,
  type AdminUpdateSchema,
} from "@/schema/admin-schema";
import { api } from "@/trpc/react";

const AdminUserData = () => {
  const utils = api.useUtils();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const invalidate = () => {
    utils.admin.findAll.invalidate();
  };

  const { data: list, isLoading } = api.admin.findAll.useQuery({
    page,
    limit,
    username: search || undefined,
  });

  const createForm = useForm<AdminCreateSchema>({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: { username: "", password: "" },
  });

  const editForm = useForm<AdminUpdateSchema>({
    resolver: zodResolver(adminUpdateSchema),
    defaultValues: { id: "", username: "", password: "" },
  });

  const createAdmin = api.admin.create.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Admin berhasil ditambahkan");
      setCreateOpen(false);
      createForm.reset();
      invalidate();
    },
    onError: (error) => toastError("Gagal!", error.message),
  });

  const updateAdmin = api.admin.update.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Admin berhasil diperbarui");
      setEditItem(null);
      editForm.reset();
      invalidate();
    },
    onError: (error) => toastError("Gagal!", error.message),
  });

  const deleteAdmin = api.admin.delete.useMutation({
    onSuccess: () => {
      toastSuccess("Berhasil!", "Admin berhasil dihapus");
      setDeleteItem(null);
      invalidate();
    },
    onError: (error) => toastError("Gagal!", error.message),
  });

  const openEdit = (item: { id: string; username: string }) => {
    editForm.reset({ id: item.id, username: item.username, password: "" });
    setEditItem(item);
  };

  return (
    <div className="space-y-4">
      <Card className="border-dl-border bg-white">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base font-bold text-dl-foreground">
            Data Admin
          </CardTitle>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110 hover:shadow-dl-primary/40"
          >
            <Plus className="h-4 w-4" />
            Tambah Admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dl-muted" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari username..."
              className="bg-white pl-9"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-dl-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Diperbarui</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-dl-muted"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : list && list.items.length > 0 ? (
                  list.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-dl-foreground">
                        {item.username}
                      </TableCell>
                      <TableCell className="text-dl-muted">
                        {formatDateWithTime(item.createdAt.toISOString())}
                      </TableCell>
                      <TableCell className="text-dl-muted">
                        {formatDateWithTime(item.updatedAt.toISOString())}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-dl-muted hover:bg-dl-primary/10 hover:text-dl-primary"
                            onClick={() =>
                              openEdit({ id: item.id, username: item.username })
                            }
                            aria-label="Edit admin"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-dl-muted hover:bg-dl-error/10 hover:text-dl-error"
                            onClick={() => setDeleteItem({ id: item.id })}
                            aria-label="Hapus admin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-dl-muted"
                    >
                      Tidak ada data admin
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-dl-foreground">
              Tambah Admin
            </DialogTitle>
            <DialogDescription>Buat akun admin baru</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((values) =>
                createAdmin.mutate(values),
              )}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan username"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimal 8 karakter"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white"
                  disabled={createAdmin.isPending}
                >
                  {createAdmin.isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editItem)}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-dl-foreground">Edit Admin</DialogTitle>
            <DialogDescription>
              Perbarui informasi admin. Kosongkan password jika tidak diubah.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((values) =>
                updateAdmin.mutate(
                  values.password
                    ? values
                    : { id: values.id, username: values.username },
                ),
              )}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan username"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Kosongkan jika tidak diubah"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white"
                  disabled={updateAdmin.isPending}
                >
                  {updateAdmin.isPending ? (
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

      <AlertDialog
        open={Boolean(deleteItem)}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-dl-foreground">
              Hapus admin?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Admin ini akan dihapus permanen. Tindakan ini tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAdmin.mutate({ id: deleteItem!.id })}
              className="bg-dl-error text-white hover:bg-dl-error/90"
            >
              {deleteAdmin.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserData;
