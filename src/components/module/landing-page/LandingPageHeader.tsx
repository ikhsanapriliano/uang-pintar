"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UangPintarLogo, UangPintarWhiteLogoNoBg } from "@/lib/images";
import Link from "next/link";

const navLinks = [
  { label: "Fitur", href: "#fitur" },
  { label: "Harga", href: "#harga" },
  { label: "Pertanyaan", href: "#faq" },
];

const LandingPageHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (!el) return;
      const header = document.querySelector("header");
      const headerOffset = header ? header.clientHeight + 16 : 80;
      const top =
        el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }, 350);
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white/70 shadow-sm backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-12">
        <a href="#" className="flex items-center gap-3">
          <div className="relative h-10 aspect-[2000/475] overflow-hidden rounded-sm">
            <Image
              src={scrolled ? UangPintarLogo : UangPintarWhiteLogoNoBg}
              alt="Uang Pintar"
              fill
              className="object-contain"
            />
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-dl-gradient-2 after:to-dl-primary after:transition-all after:duration-300 hover:after:w-full ${
                scrolled
                  ? "text-dl-foreground hover:text-dl-primary"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block">
            <Button className="h-10 rounded-lg bg-gradient-to-r from-dl-gradient-2 to-dl-primary px-5 text-sm font-semibold text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110">
              Mulai Sekarang
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buka menu"
                className={`rounded-lg border transition-colors ${
                  scrolled
                    ? "border-dl-border text-dl-foreground hover:border-dl-gradient-2/50 hover:text-dl-primary"
                    : "border-white/40 text-white hover:border-dl-gradient-2/70 hover:text-dl-gradient-2"
                }`}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white p-4">
              <SheetHeader className="border-b border-dl-border pb-4">
                <SheetTitle className="text-left text-dl-primary">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="rounded-lg px-4 py-3 text-left text-base font-medium text-dl-foreground transition-colors hover:bg-dl-cream hover:text-dl-primary"
                  >
                    {link.label}
                  </button>
                ))}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 block rounded-lg bg-gradient-to-r from-dl-gradient-2 to-dl-primary px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-dl-primary/25 transition-all duration-300 hover:brightness-110"
                >
                  Mulai Sekarang
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default LandingPageHeader;
