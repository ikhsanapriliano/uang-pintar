import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  return (
    <section
      id="daftar"
      className="relative flex flex-col items-center gap-6 overflow-hidden bg-dl-foreground px-6 py-16 text-center lg:px-12"
    >
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
      <div className="relative z-10 flex flex-col items-center gap-6">
        <h2 className="max-w-lg text-2xl sm:text-3xl font-extrabold leading-tight text-white lg:text-4xl">
          Atur Uang, Bukan Ribet Mencatat
        </h2>
        <p className="max-w-md text-base leading-relaxed text-white/80">
          Serahkan urusan pencatatan kepada Uang Pintar AI dan biarkan AI
          membantu Anda mengelola keuangan.
        </p>
        <Link href="/login">
          <Button className="mt-2 h-12 rounded-xl bg-gradient-to-r from-dl-gradient-1 to-dl-gradient-2 !px-8 text-base font-bold text-dl-foreground shadow-lg shadow-dl-gradient-2/30 hover:brightness-110 transition-all duration-300 hover:scale-105">
            Coba Gratis 7 Hari
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
