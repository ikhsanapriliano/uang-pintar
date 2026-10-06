import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Apa itu Uang Pintar AI?",
    answer:
      "Uang Pintar AI adalah aplikasi pencatatan keuangan pribadi. Kamu bisa mencatat pemasukan dan pengeluaran secara manual maupun dibantu oleh AI.",
  },
  {
    question: "Bagaimana cara mencatat keuangan dengan AI?",
    answer:
      "Cukup ketik atau ucapkan detail transaksimu, AI akan langsung mencatatnya secara otomatis. Cepat dan tanpa ribet!",
  },
  {
    question: "Apakah Uang Pintar AI gratis?",
    answer:
      "Ya, kamu bisa mencoba Uang Pintar AI gratis selama 7 hari. Setelah itu, kamu bisa pilih Paket Ngetik Rp. 10.000/bulan atau Paket Ngomong Rp. 30.000/bulan.",
  },
  {
    question: "Berapa harga berlangganan Uang Pintar AI?",
    answer:
      "Ada dua paket berbayar: Paket Ngetik Rp. 10.000/bulan dan Paket Ngomong Rp. 30.000/bulan. Bayar tahunan lebih hemat 17%: Paket Ngetik Rp. 100.000/tahun dan Paket Ngomong Rp. 300.000/tahun.",
  },
  {
    question: "Apa bedanya Paket Ngetik dan Paket Ngomong?",
    answer:
      "Keduanya punya pencatatan manual tanpa batas dan 500 pencatatan AI. Bedanya, Paket Ngomong bisa mencatat lewat suara, sedangkan Paket Ngetik tidak.",
  },
  {
    question: "Apa bedanya paket gratis dan berbayar?",
    answer:
      "Paket Uji Coba gratis selama 7 hari dengan pencatatan AI terbatas dan pencatatan suara. Paket berbayar mendapat 500 pencatatan AI per bulan (6.000 per tahun) dan pencatatan manual tanpa batas.",
  },
  {
    question: "Bisakah saya upgrade atau downgrade paket?",
    answer:
      "Tentu! Kamu bisa upgrade ke paket berbayar kapan saja. Untuk downgrade, bisa dilakukan di akhir periode berlangganan.",
  },
  {
    question: "Bisakah saya melihat riwayat pencatatan?",
    answer:
      "Tentu! Kamu bisa melihat riwayat pencatatan harian, mingguan, atau bulanan, serta total pemasukan, pengeluaran, dan sisa saldomu kapan saja.",
  },
  {
    question: "Apakah data keuangan saya aman?",
    answer:
      "Data keuanganmu tersimpan dengan aman di cloud. Kamu bisa mengaksesnya kapan saja dan di mana saja.",
  },
];

const FAQSection = () => {
  return (
    <section
      id="faq"
      className="flex flex-col items-center gap-10 px-6 py-16 lg:px-12"
    >
      <div className="max-w-xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-dl-foreground lg:text-4xl">
          Pertanyaan yang Sering{" "}
          <span className="bg-gradient-to-r from-dl-gradient-2 via-dl-primary to-dl-gradient-4 bg-clip-text text-transparent">
            Ditanyakan
          </span>
        </h2>
        <p className="mt-3 text-base text-dl-muted">
          Temukan jawaban atas pertanyaan umum seputar Uang Pintar AI.
        </p>
      </div>

      <div className="flex w-full max-w-3xl flex-col gap-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-2xl border border-dl-border bg-white px-6 py-5 transition open:border-dl-gradient-2/40 open:shadow-xl open:shadow-dl-primary/10"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-dl-foreground">
              {faq.question}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dl-gradient-2 to-dl-primary text-white">
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-dl-muted">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
