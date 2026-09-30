"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Lock, User, Eye, EyeOff } from "lucide-react";
import { UangPintarWhiteLogoNoBg } from "@/lib/images";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastError, toastSuccess } from "@/lib/toast";
import { adminLoginSchema, type AdminLoginSchema } from "@/schema/admin-schema";
import { cn } from "@/lib/utils";

const AdminLoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminLoginSchema>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: AdminLoginSchema) => {
    const res = await signIn("admin-credentials", {
      ...values,
      redirect: false,
    });
    if (res?.error) {
      toastError("Login Gagal!", "Username atau password salah");
      return;
    }
    toastSuccess("Login Berhasil!", "Selamat datang kembali");
    router.push("/tdibmkr");
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="mb-3 flex items-center justify-center gap-3">
          <div className="relative h-24 aspect-[1890/832] overflow-hidden rounded-sm">
            <Image
              src={UangPintarWhiteLogoNoBg}
              alt="Uang Pintar"
              fill
              className="object-contain"
            />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white">Masuk Admin</h1>
        <p className="mt-1 text-sm text-white/70">
          Masuk sebagai admin untuk melanjutkan
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dl-muted" />
                    <Input
                      type="text"
                      placeholder="Masukkan username"
                      className="bg-white pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dl-muted" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className={cn("bg-white pl-9", "pr-9")}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dl-muted transition-colors hover:text-dl-foreground"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110 hover:shadow-dl-primary/40"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminLoginForm;
