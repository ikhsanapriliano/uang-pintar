import { FileText, Sparkles, BarChart3 } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Pencatatan Manual",
    description:
      "Catat setiap pemasukan dan pengeluaran dengan mudah dan rapi. Cocok untuk kamu yang ingin kontrol penuh atas keuanganmu.",
    color: "from-dl-gradient-1 via-dl-gradient-2 to-dl-primary",
  },
  {
    icon: Sparkles,
    title: "Pencatatan oleh AI",
    description:
      "Cukup bicara atau ketik, AI akan mencatat pemasukan dan pengeluaranmu secara otomatis. Cepat, akurat, dan tanpa ribet.",
    color: "from-dl-gradient-2 via-dl-primary to-dl-secondary",
  },
  {
    icon: BarChart3,
    title: "Riwayat & Saldo",
    description:
      "Pantau riwayat pencatatanmu kapan saja. Lihat total pemasukan, pengeluaran, dan sisa saldo dalam satu dashboard.",
    color: "from-dl-primary via-dl-secondary to-dl-gradient-4",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="fitur"
      className="flex flex-col items-center gap-10 px-6 py-16 lg:px-12"
    >
      <div className="max-w-xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-dl-foreground lg:text-4xl">
          Fitur Andalan{" "}
          <span className="bg-gradient-to-r from-dl-gradient-2 via-dl-primary to-dl-gradient-4 bg-clip-text text-transparent">
            Uang Pintar AI
          </span>
        </h2>
        <p className="mt-3 text-base text-dl-muted">
          Semua yang kamu butuhkan untuk mengelola keuangan pribadi, dalam satu
          genggaman.
        </p>
      </div>

      <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group flex flex-col gap-5 rounded-2xl border border-dl-border bg-white p-6 transition hover:border-dl-gradient-2/50 hover:shadow-xl hover:shadow-dl-primary/10"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
            >
              <feature.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dl-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dl-muted">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
