import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIMascot } from "@/lib/images";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-dl-foreground pb-6 pt-16 sm:pt-20 xl:pt-28 md:pt-24 lg:h-screen">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dl-gradient-2/5 via-transparent to-dl-gradient-4/15" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-dl-gradient-2/15 blur-3xl" />
      <div
        className={cn(
          "h-[810px] min-[340px]:h-[780px] min-[378px]:h-[810px] min-[480px]:h-[830px] min-[523px]:h-[900px] min-[590px]:h-[1000px] min-[670px]:h-[1100px] min-[800px]:h-[1200px] min-[900px]:h-[1300px] lg:h-auto",
          "mx-auto max-w-[1280px] relative z-10 flex flex-col items-center gap-8 px-6 py-16 text-center lg:flex-row lg:px-12 lg:py-24 lg:text-left",
        )}
      >
        <div className="flex flex-1 flex-col items-center gap-6 lg:items-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dl-gradient-2 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-dl-gradient-2 to-dl-primary" />
            </span>
            Solusi Pencatatan Keuangan Pribadi
          </div>
          <h1 className="max-w-md text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white lg:max-w-lg lg:text-5xl">
            Catat Keuanganmu <br />
            <span className="bg-gradient-to-r from-dl-gradient-1 via-dl-gradient-2 to-dl-gradient-4 bg-clip-text text-transparent">
              Dibantu AI
            </span>
          </h1>
          <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-lg sm:text-xl font-bold text-white backdrop-blur-sm">
            Cuma{" "}
            <span className="bg-gradient-to-r from-dl-gradient-1 to-dl-gradient-2 bg-clip-text text-transparent">
              Rp 10.000
            </span>{" "}
            / Bulan
          </p>
          <p className="max-w-sm text-base leading-relaxed text-white/80 lg:max-w-md lg:text-lg">
            Uang Pintar AI memudahkanmu mencatat pemasukan dan pengeluaran, baik
            secara manual maupun dibantu AI. Praktis, cepat, dan cocok untuk
            semua orang.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/login" className="w-full lg:w-fit">
              <Button className="w-full lg:w-fit h-12 rounded-xl bg-gradient-to-r from-dl-gradient-1 to-dl-gradient-2 !px-6 text-base font-semibold text-dl-foreground shadow-lg shadow-dl-gradient-2/30 hover:brightness-110 transition-all duration-300 hover:scale-105">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#harga" className="w-full lg:w-fit">
              <Button
                variant="outline"
                className="w-full lg:w-fit h-12 rounded-xl border-white/40 bg-transparent px-6 text-base font-semibold text-white hover:bg-white/10"
              >
                Daftar Harga
              </Button>
            </a>
          </div>
        </div>

        <div className="absolute right-0 bottom-[-85px] lg:bottom-0 w-full lg:w-fit min-[1024px]:h-[70%] min-[1170px]:h-[90%] min-[1280px]:h-[100%] aspect-[1374/1145]">
          <Image
            src={AIMascot}
            alt="Uang Pintar Maskot"
            fill
            className="object-cover object-bottom"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
