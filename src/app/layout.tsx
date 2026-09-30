import "@/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ReactQueryDevtoolsDev from "@/components/devtools/ReactQueryDevtoolsDev";

export const metadata: Metadata = {
  title: "Uang Pintar AI: Catat Keuanganmu Dibantu AI",
  description: "Catat Keuanganmu Dibantu AI Cuma 10 Ribu / Bulan",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icons/uang-pintar.png" },
  ],
  manifest: "/manifest.json",
  applicationName: "Uang Pintar AI",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="font-sans">
        <TRPCReactProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster position="top-center" richColors />
          <ReactQueryDevtoolsDev />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
