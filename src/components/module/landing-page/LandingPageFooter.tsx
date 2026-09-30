import Image from "next/image";
import { UangPintarLogoNoBg, UangPintarWhiteLogoNoBg } from "@/lib/images";

const LandingPageFooter = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-dl-foreground">
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
      <div className="relative mx-auto max-w-[1280px] px-6 py-12 lg:px-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-12 aspect-[2000/475]">
            <Image
              src={UangPintarWhiteLogoNoBg}
              alt="Uang Pintar"
              fill
              className="object-cover"
            />
          </div>

          <p className="max-w-md text-sm text-white/70">
            Catat keuanganmu dengan mudah, dibantu AI. Solusi praktis untuk
            mengelola keuangan pribadi.
          </p>

          <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Uang Pintar AI. Hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingPageFooter;
