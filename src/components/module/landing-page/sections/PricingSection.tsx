"use client";

import { useState } from "react";
import { ChartColumn, Check, Mic, NotebookPen, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Benefit = { label: string; disabled?: boolean };

const yearlyDiscount = (monthly: string, yearly: string) => {
  const m = Number(monthly.replace(/[^\d]/g, ""));
  const y = Number(yearly.replace(/[^\d]/g, ""));
  return Math.round((1 - y / (m * 12)) * 100);
};

const trialPlan = {
  name: "Uji Coba",
  icon: Rocket,
  price: "Rp. 0",
  period: "gratis 7 hari",
  description: "Cocok buat yang mau coba aplikasi dulu sebelum beli.",
  benefits: [
    { label: "Gratis selama 7 hari" },
    { label: "Unlimited Pencatatan Manual" },
    { label: "Pencatatan AI Terbatas" },
    { label: "Pencatatan Lewat Suara" },
    { label: "Riwayat Catatan Keuangan" },
  ] as Benefit[],
  buttonVariant: "outline" as const,
};

const paidPlans = [
  {
    name: "Paket Ngetik",
    icon: NotebookPen,
    monthlyPrice: "Rp. 10.000",
    yearlyPrice: "Rp. 100.000",
    description: "Cocok buat yang baru mau mulai mencatat keuangan.",
    benefits: [
      { label: "Unlimited Pencatatan Manual" },
      { label: "500 Pencatatan AI" },
      { label: "Riwayat Catatan Keuangan" },
      { label: "Pencatatan Lewat Suara", disabled: true },
    ] as Benefit[],
    buttonVariant: "outline" as const,
    highlighted: true,
  },
  {
    name: "Paket Ngomong",
    icon: Mic,
    monthlyPrice: "Rp. 30.000",
    yearlyPrice: "Rp. 300.000",
    description: "Cocok buat yang ingin mencatat keuangan tinggal ngomong.",
    benefits: [
      { label: "Unlimited Pencatatan Manual" },
      { label: "500 Pencatatan AI" },
      { label: "Pencatatan Lewat Suara" },
      { label: "Riwayat Catatan Keuangan" },
    ] as Benefit[],
    buttonVariant: "outline" as const,
  },
  {
    name: "Paket Analisis",
    icon: ChartColumn,
    price: "Rp. 500.000",
    period: "/tahun",
    description: "Cocok yang ingin mulai serius mengelola keuangan.",
    benefits: [
      { label: "Unlimited Pencatatan Manual" },
      { label: "Unlimited Pencatatan AI" },
      { label: "Pencatatan Lewat Suara" },
      { label: "Riwayat Catatan Keuangan" },
      { label: "Pembagian Dompet Keuangan" },
      { label: "Analisis Keuangan oleh AI" },
      { label: "OCR (Tinggal Foto Struk)" },
    ] as Benefit[],
    buttonVariant: "outline" as const,
    disabled: true,
    yearlyOnly: true,
  },
];

const PricingSection = () => {
  const [period, setPeriod] = useState<"bulan" | "tahun">("bulan");

  return (
    <section
      id="harga"
      className="flex flex-col items-center gap-10 px-6 py-16 lg:px-12"
    >
      <div className="max-w-xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-dl-foreground lg:text-4xl">
          Pilih Paket{" "}
          <span className="bg-gradient-to-r from-dl-gradient-2 via-dl-primary to-dl-gradient-4 bg-clip-text text-transparent">
            Uang Pintar AI
          </span>
        </h2>
        <p className="mt-3 text-base text-dl-muted">
          Mulai gratis, upgrade kapan saja sesuai kebutuhanmu.
        </p>
      </div>

      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as "bulan" | "tahun")}
        className="flex flex-col items-center gap-6"
      >
        <TabsList className="h-11 rounded-full bg-white p-1 gap-1">
          <TabsTrigger value="bulan" className="rounded-full px-6 py-2">
            Per Bulan
          </TabsTrigger>
          <TabsTrigger value="tahun" className="rounded-full px-6 py-2">
            Per Tahun
          </TabsTrigger>
        </TabsList>

        <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[trialPlan, ...paidPlans]
            .filter((plan) => {
              if ("yearlyOnly" in plan && plan.yearlyOnly)
                return period === "tahun";
              if (plan.name === "Uji Coba") return period === "bulan";
              return true;
            })
            .map((plan) => {
              const highlighted = "monthlyPrice" in plan && plan.highlighted;
              const isDisabled = "disabled" in plan && plan.disabled;
              const price =
                "monthlyPrice" in plan
                  ? period === "bulan"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice
                  : plan.price;
              const periodLabel =
                "monthlyPrice" in plan
                  ? period === "bulan"
                    ? "/bulan"
                    : "/tahun"
                  : plan.period;

              const benefits = plan.benefits;

              return (
                <div
                  key={plan.name}
                  className={
                    highlighted
                      ? "relative rounded-2xl bg-gradient-to-br from-dl-gradient-2 via-dl-primary to-dl-gradient-4 p-[1.5px] shadow-2xl shadow-dl-primary/25"
                      : "relative rounded-2xl"
                  }
                >
                  <div
                    className={`relative flex h-full flex-col gap-6 rounded-2xl border p-6 ${
                      highlighted
                        ? "border-transparent bg-white"
                        : "border-dl-border bg-white"
                    }`}
                  >
                    {plan.name === "Paket Ngomong" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-dl-foreground px-4 py-1 text-xs font-bold text-white shadow-md">
                        Tinggal Ngomong
                      </div>
                    )}

                    {isDisabled && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-dl-error px-4 py-1 text-xs font-bold text-white shadow-md">
                        Dalam Pengembangan
                      </div>
                    )}

                    <div>
                      <h3
                        className={`flex items-center gap-2 text-lg font-bold ${
                          highlighted ? "text-dl-primary" : "text-dl-foreground"
                        }`}
                      >
                        {"icon" in plan && <plan.icon className="h-5 w-5" />}
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm text-dl-muted">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-extrabold ${
                          highlighted
                            ? "bg-gradient-to-r from-dl-gradient-2 to-dl-primary bg-clip-text text-transparent"
                            : "text-dl-foreground"
                        }`}
                      >
                        {price}
                      </span>
                      <span className="text-sm text-dl-muted">
                        {periodLabel}
                      </span>
                    </div>

                    {"monthlyPrice" in plan && (
                      <p className="-mt-4 text-xs font-semibold text-dl-primary">
                        {period === "tahun" ? (
                          <>
                            Setara{" "}
                            {(
                              Number(plan.yearlyPrice.replace(/[^\d]/g, "")) /
                              12
                            ).toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            })}
                            /bulan — hemat{" "}
                            {yearlyDiscount(
                              plan.monthlyPrice,
                              plan.yearlyPrice,
                            )}
                            %
                          </>
                        ) : (
                          <>
                            Hemat{" "}
                            {yearlyDiscount(
                              plan.monthlyPrice,
                              plan.yearlyPrice,
                            )}
                            % dengan paket tahunan
                          </>
                        )}
                      </p>
                    )}

                    <ul className="flex flex-col gap-3">
                      {benefits.map((benefit) => {
                        const disabled = benefit.disabled;
                        return (
                          <li
                            key={benefit.label}
                            className="flex items-start gap-3"
                          >
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                disabled
                                  ? "bg-dl-error/10 text-dl-error"
                                  : highlighted
                                    ? "bg-gradient-to-br from-dl-gradient-2 to-dl-primary text-white"
                                    : "bg-dl-primary/10 text-dl-primary"
                              }`}
                            >
                              {disabled ? (
                                <X className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                            <span
                              className={`text-sm leading-relaxed ${
                                disabled
                                  ? "text-dl-muted"
                                  : highlighted
                                    ? "text-dl-foreground"
                                    : "text-dl-muted"
                              }`}
                            >
                              {benefit.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <Button
                      variant={plan.buttonVariant}
                      disabled={isDisabled}
                      className={`mt-auto h-12 w-full rounded-xl text-base font-semibold ${
                        highlighted
                          ? "bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 hover:brightness-110"
                          : "border-dl-border text-dl-foreground hover:border-dl-primary/50 hover:bg-gradient-to-r hover:from-dl-gradient-1/10 hover:via-dl-gradient-2/10 hover:to-dl-primary/10 hover:text-dl-primary hover:shadow-lg hover:shadow-dl-primary/15 transition-all duration-300"
                      }`}
                    >
                      {plan.name === "Uji Coba" ? "Coba Gratis" : "Pilih Paket"}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </Tabs>
    </section>
  );
};

export default PricingSection;
