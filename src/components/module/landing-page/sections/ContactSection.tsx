"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  customerMessageCreateSchema,
  type CustomerMessageCreateSchema,
} from "@/schema/customer-message-schema";
import { api } from "@/trpc/react";

const ContactSection = () => {
  const form = useForm<CustomerMessageCreateSchema>({
    resolver: zodResolver(customerMessageCreateSchema),
    defaultValues: { name: "", contact: "", message: "" },
  });

  const sendMessage = api.customerMessage.create.useMutation({
    onSuccess: () => {
      toastSuccess("Terkirim!", "Pesan Anda telah kami terima");
      form.reset();
    },
    onError: (error) => {
      toastError("Gagal!", error.message);
    },
  });

  return (
    <section
      id="kontak"
      className="flex flex-col items-center gap-10 px-6 py-16 lg:px-12"
    >
      <div className="max-w-xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-dl-foreground lg:text-4xl">
          Kirim{" "}
          <span className="bg-gradient-to-r from-dl-gradient-2 via-dl-primary to-dl-gradient-4 bg-clip-text text-transparent">
            Pesan
          </span>
        </h2>
        <p className="mt-3 text-base text-dl-muted">
          Ada pertanyaan atau saran? Sampaikan kepada kami.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => sendMessage.mutate(values))}
          className="w-full max-w-md space-y-4 rounded-2xl border border-dl-border bg-white p-6 shadow-lg shadow-dl-primary/5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama Anda"
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
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email / WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: nama@email.com / 0812xxxx"
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
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pesan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tulis pesan Anda"
                    className="bg-white"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110 hover:shadow-dl-primary/40"
            disabled={sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send />
                Kirim Pesan
              </>
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default ContactSection;
