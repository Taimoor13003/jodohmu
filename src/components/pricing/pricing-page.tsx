'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarHeart,
  Check,
  HeartHandshake,
  Headphones,
  MessageCircle,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { analytics } from "@/lib/analytics";

const phoneHref = "tel:+6281122210303";
const whatsappBase = "https://wa.me/6281122210303";

const packageWhatsappHref = (name: string) =>
  `${whatsappBase}?text=${encodeURIComponent(`Halo, saya tertarik dengan paket ${name} dari Jodohmu. Saya ingin menjadwalkan panggilan untuk membahasnya.`)}`;

type PkgConfig = {
  key: "awal" | "serius" | "istimewa";
  featuresCount: number;
  months: number;
  popular?: boolean;
};

const packages: PkgConfig[] = [
  { key: "awal", featuresCount: 7, months: 3 },
  { key: "serius", featuresCount: 11, months: 6, popular: true },
  { key: "istimewa", featuresCount: 13, months: 12 },
];

export function PricingPage() {
  const { t, lang } = useLanguage();
  const id = lang === "id";
  const l = (idText: string, enText: string) => (id ? idText : enText);
  const [jobleStyle, setJobleStyle] = useState("");
  const [jobleGuests, setJobleGuests] = useState("");
  const [jobleFacilitator, setJobleFacilitator] = useState("");
  const [jobleName, setJobleName] = useState("");
  const [joblePhone, setJoblePhone] = useState("");

  const callbackWhatsappHref = `${whatsappBase}?text=${encodeURIComponent(
    l(
      "Halo Jodohmu, saya ingin menjadwalkan panggilan awal gratis untuk memahami proses dan paket yang tersedia.",
      "Hello Jodohmu, I would like to schedule a free discovery call to understand the process and available packages."
    )
  )}`;

  const jobleStyles = id
    ? ["Santai & alami", "Terarah", "Hangat & kekeluargaan", "Fleksibel"]
    : ["Relaxed & natural", "Structured", "Warm & family-oriented", "Flexible"];
  const jobleGuestOptions = id
    ? ["Tanpa pendamping", "1 orang", "2 orang"]
    : ["No guests", "1 guest", "2 guests"];

  const trustItems = [
    {
      icon: HeartHandshake,
      title: l("Matchmaker manusia", "Human matchmakers"),
      desc: l("Didampingi orang nyata, bukan algoritma swipe.", "Guided by real people, not a swipe algorithm."),
    },
    {
      icon: BadgeCheck,
      title: l("Profil diverifikasi", "Verified profiles"),
      desc: l("Identitas dan informasi penting diperiksa.", "Identity and key information are reviewed."),
    },
    {
      icon: ShieldCheck,
      title: l("Privasi terjaga", "Privacy protected"),
      desc: l("Data Anda tidak ditampilkan secara publik.", "Your information is not publicly displayed."),
    },
    {
      icon: CalendarHeart,
      title: l("Tujuan pernikahan", "Marriage-minded"),
      desc: l("Setiap proses dimulai dengan tujuan yang jelas.", "Every journey starts with a clear intention."),
    },
  ];

  const facilitatorOptions = id
    ? ["Imam", "Pendeta", "Tim Jodohmu", "Tanpa fasilitator"]
    : ["Imam", "Priest", "Jodohmu team", "No facilitator"];

  const processSteps = [
    {
      number: "01",
      title: l("Mulai di WhatsApp", "Start on WhatsApp"),
      desc: l("Kirim pesan singkat. Tidak perlu mengisi formulir panjang.", "Send a short message. No long application is required."),
    },
    {
      number: "02",
      title: l("Panggilan awal", "Discovery call"),
      desc: l("Ceritakan tujuan, batasan, dan kebutuhan Anda kepada tim kami.", "Tell our team about your goals, boundaries, and needs."),
    },
    {
      number: "03",
      title: l("Susun profil bersama", "Build your profile together"),
      desc: l("Setelah prosesnya jelas, kami membantu menyusun profil yang bermakna.", "Once the process is clear, we help you build a meaningful profile."),
    },
    {
      number: "04",
      title: l("Perkenalan terkurasi", "Curated introductions"),
      desc: l("Kami mencari kandidat yang relevan dan merancang Joble bersama Anda.", "We find relevant candidates and design your Joble with you."),
    },
  ];

  const joblePlanReady = Boolean(jobleStyle && jobleGuests && jobleFacilitator);

  const submitJoblePlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joblePlanReady || !jobleName.trim() || !joblePhone.trim()) return;

    const message = id
      ? `Halo Jodohmu, saya ingin membahas rencana Joble saya.\n\nNama: ${jobleName.trim()}\nNomor WhatsApp: ${joblePhone.trim()}\nGaya percakapan: ${jobleStyle}\nPendamping (orang tua, teman, atau keluarga): ${jobleGuests}\nFasilitator: ${jobleFacilitator}\nMakanan: Termasuk\n\nMohon hubungi saya untuk langkah berikutnya.`
      : `Hello Jodohmu, I would like to discuss my Joble plan.\n\nName: ${jobleName.trim()}\nWhatsApp number: ${joblePhone.trim()}\nConversation style: ${jobleStyle}\nGuests (parents, friends, or family): ${jobleGuests}\nFacilitator: ${jobleFacilitator}\nFood: Included\n\nPlease contact me about the next step.`;

    analytics.whatsappClick("joble_planner");
    window.open(`${whatsappBase}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="overflow-hidden bg-[#fffdfd] text-[#101f4d]">
      <section className="relative isolate border-b border-[#dce7ff] bg-[linear-gradient(125deg,#fff5f8_0%,#ffffff_46%,#edf5ff_100%)] py-16 sm:py-24">
        <div className="absolute -left-24 top-8 -z-10 h-72 w-72 rounded-full bg-[#ff8fb1]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#5d8cff]/20 blur-3xl" />

        <div className="container grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e986a3]/30 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#c62d5c] shadow-sm">
              <Sparkles className="h-4 w-4" />
              {l("Siap untuk menikah", "Ready for marriage")}
            </span>

            <h1 className="mt-7 max-w-3xl font-serif text-4xl font-bold leading-[1.03] tracking-[-0.035em] text-[#102457] sm:text-6xl lg:text-7xl">
              <span className="block">{l("Bukan lebih banyak pilihan.", "Not more choices.")}</span>
              <span className="mt-1 block text-[#d72d62]">{l("Pasangan yang tepat untuk menikah.", "The right person to marry.")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#4a5877] sm:text-lg">
              {l(
                "Jodohmu mengganti swipe tanpa akhir dengan perkenalan terverifikasi, penilaian manusia, dan pertemuan yang dirancang dengan jelas.",
                "Jodohmu replaces endless swiping with verified introductions, human judgment, and meetings designed with clarity."
              )}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-[52px] rounded-full bg-[#d92f63] px-7 text-base font-bold text-white shadow-[0_14px_35px_rgba(217,47,99,.25)] hover:bg-[#bf2454]">
                <Link href={callbackWhatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => analytics.whatsappClick("hero_callback")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {l("Mulai via WhatsApp", "Start on WhatsApp")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-[52px] rounded-full border-[#204ea7]/25 bg-white/80 px-7 text-base font-bold text-[#153778] hover:bg-[#edf4ff]">
                <Link href="#packages">{l("Lihat Paket", "View Packages")}</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#687590]">
              <Headphones className="h-4 w-4 text-[#2f68cc]" />
              {l("Panggilan awal gratis, tanpa kewajiban membeli paket.", "The first call is free, with no obligation to purchase.")}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#ef4779]/20 to-[#3175df]/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_30px_80px_rgba(24,51,111,.16)] backdrop-blur sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d72d62]">Joble</p>
                  <h2 className="mt-1 font-serif text-3xl font-bold text-[#102457]">Jodohmu Table</h2>
                </div>
                <span className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-bold text-[#2359b9]">
                  {l("Makanan termasuk", "Food included")}
                </span>
              </div>

              <div className="relative mx-auto my-7 flex h-64 w-64 items-center justify-center rounded-full border-[18px] border-[#f2c9a8] bg-[#f9e4d0] shadow-[inset_0_0_0_1px_rgba(118,72,40,.12),0_18px_45px_rgba(24,51,111,.12)]">
                <div className="grid h-36 w-36 place-items-center rounded-full border border-[#efc5d1] bg-white text-center shadow-sm">
                  <div>
                    <HeartHandshake className="mx-auto h-8 w-8 text-[#d72d62]" />
                    <p className="mt-2 font-serif text-lg font-bold text-[#102457]">{l("Dirancang bersama", "Designed together")}</p>
                  </div>
                </div>
                {["-top-8 left-1/2 -translate-x-1/2", "-bottom-8 left-1/2 -translate-x-1/2", "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"].map((position) => (
                  <div key={position} className={`absolute h-14 w-14 rounded-2xl border-4 border-white bg-gradient-to-br from-[#ef6d94] to-[#316ed4] shadow-lg ${position}`} />
                ))}
              </div>

              <p className="text-center text-sm leading-6 text-[#53617d]">
                {l("Pertemuan yang Anda rancang untuk saling mengenal dengan tujuan pernikahan.", "A meeting you design to get to know each other with marriage in mind.")}
              </p>
              <Link href="/blog/joble-jodohmu-table" className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-[#c62d5c] hover:underline">
                {l("Pelajari Joble", "Learn about Joble")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-6 px-4">
        <div className="container grid max-w-7xl gap-px overflow-hidden rounded-3xl border border-[#dce6fb] bg-[#dce6fb] shadow-[0_16px_50px_rgba(24,51,111,.1)] sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 bg-white px-5 py-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff0f5] to-[#eaf2ff] text-[#d72d62]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#102457]">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#6a7690]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-24 sm:pt-28">
        <div className="container max-w-5xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d72d62]">{l("Siapa kami", "Who we are")}</span>
          <h2 className="mx-auto mt-4 max-w-4xl font-serif text-4xl leading-tight text-[#102457] sm:text-5xl lg:text-6xl">
            {l(
              "Mencari pasangan hidup tidak seharusnya terasa seperti berbelanja profil.",
              "Finding a life partner should not feel like shopping through profiles."
            )}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#65718a] sm:text-lg">
            {l(
              "Kami mengenal Anda, menyaring dengan pertimbangan manusia, lalu membantu dua orang bertemu dengan tujuan dan proses yang jelas.",
              "We get to know you, screen with human judgment, and help two people meet with a clear purpose and process."
            )}
          </p>
        </div>
      </section>

      <section id="joble" className="py-20 sm:py-24">
        <div className="container max-w-7xl">
          <div className="overflow-hidden rounded-[2.25rem] border border-[#cadcff] bg-[linear-gradient(120deg,#fff0f5_0%,#ffffff_47%,#e7f1ff_100%)] shadow-[0_24px_80px_rgba(29,69,145,.1)]">
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:p-14">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d72d62]">Joble · Jodohmu Table</span>
                <h2 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-tight text-[#102457] sm:text-5xl">
                  {l("Pertemuan yang dirancang bersama.", "A meeting designed together.")}
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-[#53617d]">
                  {l(
                    "Joble adalah pertemuan terencana dengan tujuan pernikahan. Anda berbagi gaya percakapan yang nyaman, siapa yang mendampingi, dan siapa yang memfasilitasi.",
                    "Joble is a planned meeting with marriage in mind. You share your preferred conversation style, who accompanies you, and who facilitates it."
                  )}
                </p>
                <div className="mt-7 rounded-2xl border border-[#e8b8c7]/50 bg-white/75 p-5 text-sm leading-6 text-[#53617d]">
                  <strong className="text-[#102457]">{l("Jika pilihan berbeda?", "If preferences differ?")}</strong>{" "}
                  {l("Tim Jodohmu menentukan format akhir yang nyaman dan aman bagi semua.", "The Jodohmu team determines a final format that is comfortable and safe for everyone.")}
                </div>
                <Link href="/blog/joble-jodohmu-table" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#c62d5c] hover:underline">
                  {l("Baca panduan lengkap Joble", "Read the complete Joble guide")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-[1.75rem] border border-white/90 bg-white/85 p-5 shadow-[0_18px_50px_rgba(24,51,111,.08)] backdrop-blur sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d72d62]">{l("Rancang Joble Anda", "Design your Joble")}</p>
                <p className="mt-2 text-sm leading-6 text-[#65718a]">{l("Pilih preferensi Anda. Kontak baru diminta setelah rencana siap.", "Choose your preferences. We only ask for contact details when your plan is ready.")}</p>

                {[
                  { icon: SlidersHorizontal, title: l("Gaya percakapan seperti apa yang terasa nyaman?", "What conversation style feels right?"), options: jobleStyles, value: jobleStyle, setValue: setJobleStyle },
                  { icon: Users, title: l("Bawa orang tua, teman, atau keluarga", "Bring parents, friends, or family"), options: jobleGuestOptions, value: jobleGuests, setValue: setJobleGuests },
                  { icon: UserRound, title: l("Pilih satu fasilitator", "Choose one facilitator"), options: facilitatorOptions, value: jobleFacilitator, setValue: setJobleFacilitator },
                ].map(({ icon: Icon, title, options, value, setValue }, index) => (
                  <fieldset key={title} className="mt-6 border-t border-[#e3eaf7] pt-5">
                    <legend className="flex items-center gap-2 pr-3 text-sm font-extrabold text-[#173166]">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#edf4ff] text-[#245fc3]"><Icon className="h-4 w-4" /></span>
                      {index + 1}. {title}
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={value === option}
                          onClick={() => setValue(option)}
                          className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${value === option ? "border-[#d72d62] bg-[#fff0f5] text-[#bd2857] shadow-sm" : "border-[#d6e1f7] bg-[#f8fbff] text-[#314b7c] hover:border-[#8eaddf] hover:bg-white"}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}

                <p className="mt-4 text-xs leading-5 text-[#65718a]">
                  {l("Jumlah pendamping mengikuti paket: Pearl maksimal 1 orang; Ruby dan Diamond maksimal 2 orang.", "Guest allowance follows your package: Pearl allows 1; Ruby and Diamond allow up to 2.")}
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#edf4ff] px-4 py-3 text-sm font-bold text-[#2457ad]">
                  <Utensils className="h-5 w-5 shrink-0" /> {l("Makanan sesuai paket: Pearl hidangan terpilih, Ruby buffet, Diamond buffet hotel bintang 4 atau 5.", "Food follows your package: Pearl has a prepared meal, Ruby a buffet, and Diamond a 4- or 5-star hotel buffet.")}
                </div>

                {joblePlanReady && (
                  <form onSubmit={submitJoblePlan} className="mt-6 animate-in rounded-2xl border border-[#efbfd0] bg-[linear-gradient(135deg,#fff3f7,#f1f6ff)] p-5 fade-in slide-in-from-bottom-3 duration-500">
                    <p className="font-extrabold text-[#102457]">{l("Rencana Joble Anda siap.", "Your Joble plan is ready.")}</p>
                    <p className="mt-1 text-xs leading-5 text-[#65718a]">{l("Tambahkan kontak agar tim kami dapat mengatur detailnya bersama Anda.", "Add your contact so our team can coordinate the details with you.")}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-bold text-[#314b7c]">
                        {l("Nama", "Name")}
                        <input required value={jobleName} onChange={(event) => setJobleName(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#d5dfef] bg-white px-3 text-sm text-[#102457] outline-none transition focus:border-[#d72d62] focus:ring-2 focus:ring-[#f6cfdb]" placeholder={l("Nama Anda", "Your name")} />
                      </label>
                      <label className="text-xs font-bold text-[#314b7c]">
                        {l("Nomor WhatsApp", "WhatsApp number")}
                        <input required type="tel" value={joblePhone} onChange={(event) => setJoblePhone(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#d5dfef] bg-white px-3 text-sm text-[#102457] outline-none transition focus:border-[#d72d62] focus:ring-2 focus:ring-[#f6cfdb]" placeholder="+62 ..." />
                      </label>
                    </div>
                    <Button type="submit" className="mt-4 h-12 w-full rounded-full bg-gradient-to-r from-[#df3268] to-[#356fd4] font-extrabold text-white hover:opacity-90">
                      <MessageCircle className="mr-2 h-4 w-4" /> {l("Kirim rencana ke WhatsApp", "Send plan to WhatsApp")}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="relative bg-[#f7f9ff] py-24 sm:py-28">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ef88a7] to-transparent" />
        <div className="container max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d72d62]">{l("Paket Jodohmu", "Jodohmu packages")}</span>
            <h2 className="mt-4 font-serif text-4xl text-[#102457] sm:text-5xl">{l("Pilih seberapa dekat kami mendampingi Anda", "Choose how closely we support you")}</h2>
            <p className="mt-5 text-base leading-7 text-[#65718a]">
              {l(
                "Anda tidak membayar untuk membuka katalog profil. Paket mencakup kurasi, verifikasi, koordinasi, dan penilaian manusia sepanjang proses.",
                "You are not paying to unlock a profile catalog. Each package covers curation, verification, coordination, and human judgment throughout the process."
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[l("Waktu lebih terarah", "More focused time"), l("Ketidakpastian berkurang", "Less uncertainty"), l("Keputusan lebih jelas", "Clearer decisions")].map((value) => (
                <span key={value} className="rounded-full border border-[#dbe5f6] bg-white px-4 py-2 text-xs font-bold text-[#284373] shadow-sm">{value}</span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-3 rounded-2xl border border-[#d9e5fb] bg-white px-5 py-4 text-center shadow-sm sm:flex-row sm:text-left">
            <p className="text-sm text-[#53617d]">
              <span className="font-bold text-[#102457]">{l("Setiap paket adalah perjalanan yang didampingi.", "Every package is a guided journey.")}</span>{" "}
              {l("Verifikasi, kurasi, koordinasi Joble, dan dukungan tim sudah menjadi bagian dari proses.", "Verification, curation, Joble coordination, and team support are built into the process.")}
            </p>
            <Link href={callbackWhatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => analytics.whatsappClick("pricing_question")} className="shrink-0 text-sm font-bold text-[#d72d62] hover:underline">{l("Tanya tim kami", "Ask our team")} →</Link>
          </div>

          <div className="mt-12 grid gap-7 lg:grid-cols-3 lg:items-stretch">
            {packages.map((pkg) => {
              const popular = pkg.popular;
              const name = t(`pricingPage.packages.items.${pkg.key}.name`);

              return (
                <article
                  key={pkg.key}
                  className={`relative flex flex-col rounded-[2rem] bg-white p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8 ${
                    popular
                      ? "border-2 border-transparent shadow-[0_24px_70px_rgba(65,79,150,.18)] [background:linear-gradient(white,white)_padding-box,linear-gradient(145deg,#ef4779,#397ee8)_border-box]"
                      : "border border-[#dce5f5] shadow-[0_16px_45px_rgba(24,51,111,.08)]"
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#df3268] to-[#356fd4] px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white shadow-lg">
                      {l("Rekomendasi Jodohmu", "Jodohmu Recommendation")}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-4 pt-2">
                    <div>
                      <h3 className={`font-serif text-3xl font-bold ${popular ? "text-[#d72d62]" : "text-[#102457]"}`}>{name}</h3>
                      <p className="mt-2 min-h-10 text-sm leading-5 text-[#7b6980]">{t(`pricingPage.packages.items.${pkg.key}.tagline`)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${popular ? "bg-[#fff0f5] text-[#c82d5b]" : "bg-[#edf4ff] text-[#2457ad]"}`}>
                      {pkg.months} {l("bulan", "months")}
                    </span>
                  </div>

                  <div className="my-7 border-y border-[#e8edf7] py-6">
                    <p className={`text-4xl font-extrabold tracking-tight ${popular ? "text-[#d72d62]" : "text-[#102457]"}`}>{t(`pricingPage.packages.items.${pkg.key}.price`)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8893a8]">{l("Paket pendampingan lengkap", "Complete support package")}</p>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {Array.from({ length: pkg.featuresCount }, (_, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-6 text-[#4f5e7b]">
                        <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${popular ? "bg-[#fff0f5] text-[#d72d62]" : "bg-[#edf4ff] text-[#245fc3]"}`}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {t(`pricingPage.packages.items.${pkg.key}.features.${i}`)}
                      </li>
                    ))}
                  </ul>

                  <Button asChild className={`mt-8 h-12 w-full rounded-full text-sm font-extrabold text-white ${popular ? "bg-gradient-to-r from-[#df3268] to-[#356fd4] hover:opacity-90" : "bg-[#102457] hover:bg-[#1a3b83]"}`}>
                    <Link href={packageWhatsappHref(name)} target="_blank" rel="noopener noreferrer" onClick={() => analytics.whatsappClick(`package_${pkg.key}`)}>
                      {l("Jadwalkan Panggilan", "Schedule a Call")}
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl overflow-hidden rounded-3xl border border-[#dce5f5] bg-white shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-[#e4eaf5]">
            <div className="p-7 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d72d62]">{l("Pelajar & mahasiswa", "Students")}</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-[#102457]">{t("pricingPage.special.student.title")}</h3>
              <p className="mt-2 text-sm leading-6 text-[#63708a]">{t("pricingPage.special.student.desc")}</p>
            </div>
            <div className="border-t border-[#e4eaf5] p-7 sm:border-t-0 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#2d69ce]">{l("Memulai kembali", "A new beginning")}</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-[#102457]">{t("pricingPage.special.widow.title")}</h3>
              <p className="mt-2 text-sm leading-6 text-[#63708a]">{t("pricingPage.special.widow.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#fffdfd_0%,#f5f8ff_100%)] py-24 sm:py-28">
        <div className="container max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2d69ce]">{l("Mulai dengan percakapan", "Start with a conversation")}</span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-[#102457] sm:text-5xl">{l("Anda tidak perlu menjelaskan semuanya sebelum kita bicara.", "You do not need to explain everything before we speak.")}</h2>
            <p className="mt-5 text-base leading-7 text-[#65718a]">{l("Mulai dengan pesan WhatsApp singkat. Kami akan mendengarkan lebih dulu, menjelaskan prosesnya, lalu membantu Anda membangun profil tanpa tekanan.", "Start with a short WhatsApp message. We listen first, explain the process, and then help you build your profile without pressure.")}</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step.number} className={`relative rounded-3xl border bg-white p-6 shadow-[0_12px_35px_rgba(24,51,111,.06)] ${index === 0 ? "border-[#efadc1] ring-4 ring-[#fff0f5]" : "border-[#dce5f5]"}`}>
                <span className={`font-serif text-4xl font-bold ${index === 0 ? "text-[#d72d62]" : "text-[#80a3df]"}`}>{step.number}</span>
                <h3 className="mt-5 text-base font-extrabold text-[#102457]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#65718a]">{step.desc}</p>
                {index < processSteps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 rounded-full bg-white p-1 text-[#7ca0e0] md:block" />}
              </div>
            ))}
          </div>
          <div className="mt-9 text-center">
            <Button asChild className="h-12 rounded-full bg-[#102457] px-7 font-extrabold text-white hover:bg-[#1a3b83]">
              <Link href={callbackWhatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => analytics.whatsappClick("process_callback")}>
                <MessageCircle className="mr-2 h-4 w-4" /> {l("Mulai percakapan", "Start the conversation")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="container max-w-7xl overflow-hidden rounded-[2.25rem] bg-[linear-gradient(115deg,#d92f63_0%,#a43787_45%,#155ec6_100%)] px-7 py-12 text-white shadow-[0_30px_80px_rgba(32,69,145,.22)] sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">{l("Panggilan awal gratis", "Free discovery call")}</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">{l("Satu percakapan dapat membuat langkah berikutnya lebih jelas.", "One conversation can make the next step clear.")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{l("Ceritakan tujuan, privasi, dan bagaimana Anda ingin keluarga terlibat. Tim kami akan mendengarkan dan membantu menentukan langkah yang tepat.", "Tell us about your goals, privacy, and how you want family involved. Our team will listen and help you decide the right next step.")}</p>
          </div>
          <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
            <Button asChild className="h-[52px] rounded-full bg-white px-8 font-extrabold text-[#bd2857] hover:bg-[#fff4f7]">
              <Link href={callbackWhatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => analytics.whatsappClick("final_callback")}>
                <MessageCircle className="mr-2 h-4 w-4" /> {l("Mulai via WhatsApp", "Start on WhatsApp")}
              </Link>
            </Button>
            <Link href={phoneHref} onClick={() => analytics.ctaClick("direct_phone", "pricing")} className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-center text-white transition hover:bg-white/15">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/65">{l("Lebih nyaman bicara langsung?", "Prefer to speak directly?")}</span>
              <span className="mt-1 flex items-center justify-center gap-2 text-sm font-extrabold"><Phone className="h-4 w-4" /> +62 811-2221-0303</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
