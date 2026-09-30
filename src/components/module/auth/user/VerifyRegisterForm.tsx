"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { UangPintarWhiteLogoNoBg } from "@/lib/images";
import { toastError, toastSuccess } from "@/lib/toast";
import { verifyCodeSchema, type VerifyCodeSchema } from "@/schema/user-schema";
import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
};

const FIB_SECONDS = [60, 60, 120, 180, 300, 480, 780];

const formatCountdown = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const VerifyRegisterForm = ({ email }: Props) => {
  const router = useRouter();
  const [fibIndex, setFibIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const form = useForm<VerifyCodeSchema>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { type: "register", identifier: email, code: "" },
  });

  const verify = api.user.verifyCode.useMutation({
    onSuccess: async (data: { email: string }) => {
      const res = await signIn("credentials", {
        email: data.email,
        isRetoken: "true",
        redirect: false,
      });
      if (res?.error) {
        toastError("Login Gagal!", "Email atau password salah");
        return;
      }
      toastSuccess("Verifikasi Berhasil!", "Akun Anda telah terverifikasi");
      router.push("/merchant");
    },
    onError: (error) => {
      toastError("Verifikasi Gagal!", error.message);
    },
  });

  const resend = api.user.resendRegisterCode.useMutation({
    onSuccess: () => {
      toastSuccess(
        "Kode Terkirim!",
        "Kode verifikasi baru telah dikirim ke email Anda",
      );
      setCountdown(
        FIB_SECONDS[Math.min(fibIndex, FIB_SECONDS.length - 1)] ?? 60,
      );
      setFibIndex((i) => i + 1);
    },
    onError: (error) => {
      toastError("Gagal Mengirim!", error.message);
    },
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
        <h1 className="text-2xl font-bold text-white">Verifikasi Email</h1>
        <p className="mt-1 text-sm text-white/70">
          Masukkan kode 6 digit yang dikirim ke <br />
          <span className="font-medium text-white">{email}</span>
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => verify.mutate(values))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Kode Verifikasi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MailCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dl-muted" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      className="bg-white pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110 hover:shadow-dl-primary/40"
            disabled={verify.isPending}
          >
            {verify.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Verifikasi"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-white/70">
        Tidak menerima kode?{" "}
        <button
          type="button"
          onClick={() => resend.mutate({ email })}
          disabled={countdown > 0}
          className={cn(
            "font-medium text-white underline underline-offset-4 hover:text-dl-gradient-2 disabled:opacity-50",
            countdown <= 0 && "cursor-pointer",
          )}
        >
          {countdown > 0
            ? `Kirim ulang dalam ${formatCountdown(countdown)}`
            : "Kirim ulang"}
        </button>
      </p>
      <p className="mt-2 text-center text-sm text-white/70">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-white underline underline-offset-4 hover:text-dl-gradient-2"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
};

export default VerifyRegisterForm;
