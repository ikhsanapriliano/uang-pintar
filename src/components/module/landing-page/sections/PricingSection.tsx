import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Gratis",
    price: "Rp. 0",
    period: "",
    description: "Coba Uang Pintar AI selama 7 hari penuh.",
    benefits: [
      "Gratis uji coba 7 hari",
      "Pencatatan keuangan manual tanpa batas",
      "Pencatatan keuangan oleh AI maksimal 50 transaksi selama 7 hari",
      "Riwayat pencatatan & saldo",
    ],
    highlighted: false,
    buttonVariant: "outline" as const,
  },
  {
    name: "Bulanan",
    price: "Rp. 10.000",
    period: "/bulan",
    description: "Paket fleksibel bayar per bulan.",
    benefits: [
      "Pencatatan keuangan manual tanpa batas",
      "Pencatatan keuangan oleh AI maksimal 50 transaksi per hari",
      "Riwayat pencatatan & saldo",
    ],
    highlighted: false,
    buttonVariant: "outline" as const,
  },
  {
    name: "Tahunan",
    price: "Rp. 60.000",
    period: "/tahun",
    description: "Hemat 50% dari bayar bulanan.",
    benefits: [
      "Hemat 50% dari bayar bulanan",
      "Pencatatan keuangan manual tanpa batas",
      "Pencatatan keuangan oleh AI maksimal 50 transaksi per hari",
      "Riwayat pencatatan & saldo",
    ],
    highlighted: true,
    buttonVariant: "default" as const,
  },
];

const PricingSection = () => {
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

      <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={
              plan.highlighted
                ? "relative rounded-2xl bg-gradient-to-br from-dl-gradient-2 via-dl-primary to-dl-gradient-4 p-[1.5px] shadow-2xl shadow-dl-primary/25"
                : "relative rounded-2xl"
            }
          >
            <div
              className={`relative flex h-full flex-col gap-6 rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-transparent bg-white"
                  : "border-dl-border bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-dl-gradient-1 via-dl-gradient-2 to-dl-primary px-4 py-1 text-xs font-bold text-white shadow-md">
                  Paling Hemat
                </div>
              )}

              <div>
                <h3
                  className={`text-lg font-bold ${
                    plan.highlighted ? "text-dl-primary" : "text-dl-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-dl-muted">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-extrabold ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-dl-gradient-2 to-dl-primary bg-clip-text text-transparent"
                      : "text-dl-foreground"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-dl-muted">{plan.period}</span>
                )}
              </div>

              <ul className="flex flex-col gap-3">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlighted
                          ? "bg-gradient-to-br from-dl-gradient-2 to-dl-primary text-white"
                          : "bg-dl-primary/10 text-dl-primary"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span
                      className={`text-sm leading-relaxed ${
                        plan.highlighted
                          ? "text-dl-foreground"
                          : "text-dl-muted"
                      }`}
                    >
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                className={`mt-auto h-12 w-full rounded-xl text-base font-semibold ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-dl-gradient-2 to-dl-primary text-white shadow-lg shadow-dl-primary/25 hover:brightness-110"
                    : "border-dl-border text-dl-foreground hover:border-dl-primary/50 hover:bg-gradient-to-r hover:from-dl-gradient-1/10 hover:via-dl-gradient-2/10 hover:to-dl-primary/10 hover:text-dl-primary hover:shadow-lg hover:shadow-dl-primary/15 transition-all duration-300"
                }`}
              >
                {plan.name === "Gratis" ? "Coba Gratis" : "Pilih Paket"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
