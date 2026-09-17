'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CalendarClock, HeartHandshake, MessageCircle, Plus, Search, ShieldCheck, Sparkles, Users, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const wa = "https://wa.me/6281122210303";

type Copy = { id: string; en: string };
type Faq = { q: Copy; a: Copy; link?: { href: string; label: Copy } };

const categories: { key: string; Icon: typeof Sparkles; label: Copy; items: Faq[] }[] = [
  {
    key: "tentang",
    Icon: Sparkles,
    label: { id: "Tentang Jodohmu", en: "About Jodohmu" },
    items: [
      {
        q: { id: "Apa beda Jodohmu dengan aplikasi kencan?", en: "How is Jodohmu different from dating apps?" },
        a: { id: "Di Jodohmu tidak ada geser-geser profil. Tim kami mengenal Anda secara pribadi, memilihkan kandidat yang benar-benar serius menikah, lalu memfasilitasi setiap perkenalan — online maupun tatap muka — dengan melibatkan keluarga.", en: "There's no swiping at Jodohmu. Our team gets to know you personally, selects candidates who are genuinely serious about marriage, and facilitates every introduction — online and in person — with family involved." },
      },
      {
        q: { id: "Apakah Jodohmu hanya untuk satu agama?", en: "Is Jodohmu only for one religion?" },
        a: { id: "Tidak. Jodohmu terbuka untuk semua keyakinan. Setiap proses menghormati nilai dan keyakinan Anda, dan pendamping dari keyakinan Anda dapat hadir sesuai permintaan.", en: "No. Jodohmu is open to all faiths. Every step respects your values and beliefs, and a facilitator from your own faith can be present on request." },
      },
      {
        q: { id: "Apakah layanannya online atau tatap muka?", en: "Is the service online or in person?" },
        a: { id: "Keduanya. Konsultasi dan perkenalan awal bisa dilakukan online, sementara pertemuan penting diatur secara tatap muka di tempat yang nyaman dan santun.", en: "Both. Consultations and early introductions can happen online, while important meetings are arranged in person at comfortable, respectful venues." },
      },
      {
        q: { id: "Apakah melayani klien dari kota lain?", en: "Do you serve clients in other cities?" },
        a: { id: "Ya. Kami melayani klien dari berbagai kota di Indonesia, dan mengatur pertemuan online atau tatap muka sesuai lokasi serta preferensi Anda.", en: "Yes. We serve clients from cities across Indonesia and arrange online or in-person meetings based on your location and preferences." },
      },
    ],
  },
  {
    key: "proses",
    Icon: CalendarClock,
    label: { id: "Proses", en: "Process" },
    items: [
      {
        q: { id: "Bagaimana prosesnya dimulai?", en: "How does the process start?" },
        a: { id: "Mulai dengan mendaftar atau konsultasi gratis. Setelah memilih paket, kami melakukan verifikasi dan melengkapi dokumen Anda. Setelah itu profil kandidat mulai dikirimkan, dan setiap pertemuan kami fasilitasi hingga tahap keluarga.", en: "Start by registering or booking a free consultation. Once you choose a package, we verify you and complete your documents. Then candidate profiles start arriving, and we facilitate every meeting through to the family stage." },
        link: { href: "/plan-your-jodohmu-way", label: { id: "Rencanakan perjalanan Anda", en: "Plan your journey" } },
      },
      {
        q: { id: "Kapan masa layanan saya mulai dihitung?", en: "When does my service period start?" },
        a: { id: "Masa layanan dimulai saat profil pertama dikirimkan kepada Anda — bukan saat pembayaran. Waktu verifikasi dan persiapan tidak mengurangi masa layanan Anda sedikit pun.", en: "Your service period starts when your first profiles are sent — not when you pay. Verification and onboarding time never eats into your service period." },
      },
      {
        q: { id: "Berapa banyak profil yang akan saya terima?", en: "How many profiles will I receive?" },
        a: { id: "Jumlahnya bergantung pada paket yang Anda pilih. Kami mengutamakan kecocokan, bukan sekadar jumlah — setiap profil dipilih dengan cermat.", en: "It depends on the package you choose. We prioritize fit over volume — every profile is selected with care." },
        link: { href: "/pricing", label: { id: "Bandingkan paket", en: "Compare packages" } },
      },
      {
        q: { id: "Saya belum pernah mengikuti proses seperti ini. Apakah akan dibimbing?", en: "I'm new to this kind of process. Will I be guided?" },
        a: { id: "Tentu. Tim kami membimbing Anda soal etika, batasan, dan langkah berikutnya, sehingga setiap pertemuan terasa jelas, nyaman, dan terhormat.", en: "Absolutely. Our team guides you on etiquette, boundaries, and next steps so every meeting feels clear, comfortable, and respectful." },
      },
      {
        q: { id: "Apakah Jodohmu membantu sampai tahap lamaran?", en: "Do you help all the way to the proposal?" },
        a: { id: "Ya. Kami mendampingi dari perkenalan pertama hingga lamaran, dengan tindak lanjut yang terarah dan komunikasi antar keluarga.", en: "Yes. We support you from the first introduction to the proposal, with structured follow-ups and communication between families." },
      },
    ],
  },
  {
    key: "keamanan",
    Icon: ShieldCheck,
    label: { id: "Keamanan & Privasi", en: "Safety & Privacy" },
    items: [
      {
        q: { id: "Apakah kandidat diverifikasi?", en: "Are candidates verified?" },
        a: { id: "Ya. Setiap kandidat disaring untuk keseriusan, niat menikah, dan kesiapan melibatkan keluarga. Paket Ruby dan Diamond juga mencakup pemeriksaan latar belakang dan asesmen psikologi.", en: "Yes. Every candidate is screened for seriousness, intent to marry, and readiness to involve family. The Ruby and Diamond packages also include background checks and psychology assessments." },
      },
      {
        q: { id: "Apakah profil saya ditampilkan secara publik?", en: "Is my profile shown publicly?" },
        a: { id: "Tidak. Profil Anda tidak pernah dipajang untuk umum. Profil hanya dibagikan secara terbatas kepada kandidat yang telah diverifikasi dan dinilai cocok oleh tim kami.", en: "No. Your profile is never displayed publicly. It is only shared, in a limited way, with verified candidates our team considers a good fit." },
      },
      {
        q: { id: "Bagaimana keamanan saat pertemuan?", en: "How safe are the meetings?" },
        a: { id: "Pertemuan difasilitasi oleh tim kami di tempat yang aman dan santun, dengan opsi pendamping serta keterlibatan keluarga. Untuk paket dengan pemeriksaan latar belakang, pemeriksaan dilakukan sebelum pertemuan.", en: "Meetings are facilitated by our team in safe, respectful venues, with the option of a chaperone and family involvement. For packages that include background checks, the check happens before the meeting." },
      },
    ],
  },
  {
    key: "keluarga",
    Icon: Users,
    label: { id: "Keluarga", en: "Family" },
    items: [
      {
        q: { id: "Bisakah keluarga atau wali ikut terlibat?", en: "Can family or a guardian be involved?" },
        a: { id: "Sangat bisa — justru kami menganjurkannya. Kami membantu komunikasi dengan orang tua dan wali, serta memfasilitasi pertemuan keluarga.", en: "Absolutely — in fact, we encourage it. We help with communication with parents and guardians and facilitate family meetings." },
      },
      {
        q: { id: "Bisakah pembimbing agama hadir?", en: "Can a religious advisor attend?" },
        a: { id: "Bisa. Pembimbing agama sesuai keyakinan Anda dapat hadir untuk mendampingi pertemuan agar prosesnya terasa tenang dan terarah.", en: "Yes. A religious advisor from your faith can attend meetings so the process feels calm and well-guided." },
      },
    ],
  },
  {
    key: "biaya",
    Icon: Wallet,
    label: { id: "Paket & Biaya", en: "Packages & Fees" },
    items: [
      {
        q: { id: "Berapa biaya layanan Jodohmu?", en: "How much does Jodohmu cost?" },
        a: { id: "Paket dimulai dari Rp 2,5 juta untuk Pearl. Tersedia juga paket Ruby dan Diamond dengan pendampingan yang lebih lengkap. Semua harga transparan, tanpa biaya tersembunyi.", en: "Packages start from Rp 2.5 million for Pearl. Ruby and Diamond offer more comprehensive support. All pricing is transparent, with no hidden fees." },
        link: { href: "/pricing", label: { id: "Lihat semua paket", en: "See all packages" } },
      },
      {
        q: { id: "Apakah pembayaran bisa bertahap?", en: "Can I pay in installments?" },
        a: { id: "Untuk paket tertentu, pembayaran bertahap bisa didiskusikan dengan tim kami saat konsultasi.", en: "For certain packages, staged payment can be discussed with our team during your consultation." },
      },
      {
        q: { id: "Saya warga negara asing yang tinggal di Indonesia. Bisakah bergabung?", en: "I'm a foreign national living in Indonesia. Can I join?" },
        a: { id: "Bisa. Karena keluarga Indonesia membutuhkan verifikasi yang lengkap, klien internasional memulai dari paket Ruby, yang sudah mencakup pemeriksaan latar belakang dan asesmen psikologi.", en: "Yes. Because Indonesian families need thorough verification, international clients start from the Ruby package, which includes a background check and psychology assessment." },
        link: { href: "/pricing/international", label: { id: "Harga untuk klien internasional", en: "International pricing" } },
      },
      {
        q: { id: "Apakah Jodohmu menjamin saya menemukan jodoh?", en: "Does Jodohmu guarantee I'll find a spouse?" },
        a: { id: "Kami tidak menjanjikan hal yang tidak bisa dijanjikan siapa pun. Yang kami jamin adalah proses yang serius, jujur, dan terarah — dengan kandidat terpilih dan pendampingan penuh di setiap langkah.", en: "We don't promise what no one can honestly promise. What we do guarantee is a serious, honest, well-guided process — with selected candidates and full support at every step." },
      },
    ],
  },
];

export function FaqPage() {
  const { lang } = useLanguage();
  const l = (copy: Copy) => (lang === "id" ? copy.id : copy.en);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>("tentang-0");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return categories
      .filter((category) => activeCategory === "all" || category.key === activeCategory)
      .map((category) => ({
        ...category,
        items: category.items
          .map((item, index) => ({ ...item, key: `${category.key}-${index}` }))
          .filter((item) => !needle || `${l(item.q)} ${l(item.a)}`.toLowerCase().includes(needle)),
      }))
      .filter((category) => category.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, query, lang]);

  // Schema stays in Indonesian so the server-rendered JSON-LD matches the default page language
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((category) =>
      category.items.map((item) => ({
        "@type": "Question",
        name: item.q.id,
        acceptedAnswer: { "@type": "Answer", text: item.a.id },
      }))
    ),
    url: `${siteUrl}/faq`,
  };

  const total = categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <main className="overflow-hidden bg-[#fffdfd] pb-24 text-[#152852]">
      {/* Plain script tag so the FAQPage JSON-LD is in the server-rendered HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#10275b] pb-24 pt-16 text-white sm:pb-28 sm:pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(235,83,132,.45),transparent_32%),radial-gradient(circle_at_85%_90%,rgba(74,133,232,.4),transparent_35%)]" />
        <div className="container max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em]">
            <Sparkles className="h-3.5 w-3.5 text-[#ffb8d0]" />{l({ id: "Pusat bantuan", en: "Help center" })}
          </span>
          <h1 className="mx-auto mt-7 max-w-3xl font-serif text-5xl font-bold leading-[1.02] tracking-[-.04em] sm:text-6xl">
            {l({ id: "Ada pertanyaan? ", en: "Questions? " })}
            <span className="text-[#ffb8d0]">{l({ id: "Kami punya jawabannya.", en: "We have answers." })}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            {l({ id: "Semua yang perlu Anda ketahui tentang perkenalan terpandu, keamanan, keluarga, dan paket Jodohmu — dijawab dengan jujur.", en: "Everything you need to know about guided introductions, safety, family, and Jodohmu packages — answered honestly." })}
          </p>
          <label className="relative mx-auto mt-9 flex max-w-xl items-center">
            <Search className="pointer-events-none absolute left-5 h-5 w-5 text-[#65718a]" />
            <span className="sr-only">{l({ id: "Cari pertanyaan", en: "Search questions" })}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={l({ id: "Cari, misalnya “keluarga” atau “biaya”", en: "Search, e.g. “family” or “fees”" })}
              className="h-14 w-full rounded-full border-0 bg-white pl-14 pr-5 text-base text-[#152852] shadow-2xl placeholder:text-[#9aa5bb] focus:outline-none focus:ring-4 focus:ring-[#ffb8d0]/40"
            />
          </label>
        </div>
      </section>

      {/* Category cards */}
      <section className="relative z-10 -mt-12 px-4">
        <div className="container grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[{ key: "all", Icon: HeartHandshake, label: { id: "Semua", en: "All" }, count: total }, ...categories.map((c) => ({ ...c, count: c.items.length }))].map(({ key, Icon, label, count }) => {
            const active = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(key)}
                className={`group rounded-2xl border p-4 text-left shadow-lg transition hover:-translate-y-0.5 ${active ? "border-[#d52e62] bg-[#d52e62] text-white" : "border-[#dde6f4] bg-white text-[#10275b] hover:border-[#d52e62]/40"}`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-white" : "text-[#d52e62]"}`} />
                <p className="mt-3 text-sm font-extrabold leading-tight">{l(label)}</p>
                <p className={`mt-1 text-xs font-semibold ${active ? "text-white/75" : "text-[#65718a]"}`}>
                  {count} {l({ id: "pertanyaan", en: "questions" })}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Questions */}
      <section className="container mt-16 grid max-w-6xl gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12">
          {visible.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-[#dce5f2] bg-white p-10 text-center">
              <p className="font-serif text-2xl font-bold text-[#10275b]">{l({ id: "Belum ada jawaban untuk itu.", en: "No answer for that yet." })}</p>
              <p className="mt-2 text-[#65718a]">{l({ id: "Tanyakan langsung ke tim kami — kami senang membantu.", en: "Ask our team directly — we're happy to help." })}</p>
              <Button asChild className="mt-6 h-11 rounded-full bg-[#10275b] px-6 font-extrabold text-white hover:bg-[#1b438b]">
                <Link href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Link>
              </Button>
            </div>
          )}
          {visible.map(({ key, Icon, label, items }) => (
            <div key={key}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0f5] text-[#d52e62]"><Icon className="h-5 w-5" /></span>
                <h2 className="font-serif text-3xl font-bold text-[#10275b]">{l(label)}</h2>
              </div>
              <div className="mt-5 space-y-3">
                {items.map((item) => {
                  const isOpen = openKey === item.key || Boolean(query.trim());
                  return (
                    <div key={item.key} className={`overflow-hidden rounded-2xl border bg-white transition ${isOpen ? "border-[#d52e62]/35 shadow-lg" : "border-[#dce5f2] hover:border-[#d52e62]/25"}`}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenKey(openKey === item.key ? null : item.key)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:px-6"
                      >
                        <span className="font-bold leading-6 text-[#10275b]">{l(item.q)}</span>
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d7e2f5] text-[#173b81] transition ${isOpen ? "rotate-45 border-[#d52e62]/30 bg-[#fff0f5] text-[#d52e62]" : ""}`}>
                          <Plus className="h-4 w-4" />
                        </span>
                      </button>
                      <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="overflow-hidden">
                          <div className="border-t border-[#f0f3f9] px-5 pb-5 pt-4 sm:px-6">
                            <p className="leading-7 text-[#53617d]">{l(item.a)}</p>
                            {item.link && (
                              <Link href={item.link.href} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#d52e62] hover:underline">
                                {l(item.link.label)} <ArrowRight className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky help card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] bg-[#10275b] text-white shadow-2xl">
            <div className="relative isolate p-7">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_90%_0%,rgba(235,83,132,.45),transparent_45%)]" />
              <MessageCircle className="h-8 w-8 text-[#ffb8d0]" />
              <h3 className="mt-5 font-serif text-3xl font-bold leading-tight">{l({ id: "Masih ada pertanyaan?", en: "Still have questions?" })}</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">
                {l({ id: "Ceritakan kota Anda, target waktu menikah, dan apa yang Anda cari. Tim kami akan menyiapkan rencana yang sesuai untuk Anda.", en: "Tell us your city, your marriage timeline, and what you're looking for. Our team will prepare a plan that fits you." })}
              </p>
              <Button asChild className="mt-6 h-12 w-full rounded-full bg-white font-extrabold text-[#13316c] hover:bg-[#fff1f5]">
                <Link href={`${wa}?text=${encodeURIComponent("Halo Jodohmu, saya punya pertanyaan tentang layanan Jodohmu.")}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />{l({ id: "Chat via WhatsApp", en: "Chat on WhatsApp" })}
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-3 h-12 w-full rounded-full border-white/30 bg-transparent font-extrabold text-white hover:bg-white/10 hover:text-white">
                <Link href="/register">{l({ id: "Daftar sekarang", en: "Register now" })}</Link>
              </Button>
            </div>
            <ul className="space-y-3 border-t border-white/10 bg-white/[.04] p-7 text-sm text-white/85">
              {[
                { id: "Perkenalan terpandu dan terverifikasi", en: "Guided, verified introductions" },
                { id: "Online dan tatap muka", en: "Online and in person" },
                { id: "Keluarga dilibatkan sejak awal", en: "Family involved from the start" },
                { id: "Paket transparan, tanpa biaya tersembunyi", en: "Transparent packages, no hidden fees" },
              ].map((point) => (
                <li key={point.id} className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb8d0]" />{l(point)}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Bottom CTA */}
      <section className="container mt-24 max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#d52e62] to-[#9B2242] px-8 py-14 text-center text-white sm:px-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,.2),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(16,39,91,.35),transparent_40%)]" />
          <h2 className="mx-auto max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
            {l({ id: "Siap memulai perjalanan menuju pernikahan?", en: "Ready to begin your journey to marriage?" })}
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/85">
            {l({ id: "Lihat paket yang sesuai atau rencanakan perjalanan Anda bersama tim kami.", en: "Find the package that fits, or plan your journey with our team." })}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="h-12 rounded-full bg-white px-6 font-extrabold text-[#9B2242] hover:bg-[#fff1f5]">
              <Link href="/pricing">{l({ id: "Lihat paket", en: "See packages" })} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-white/40 bg-transparent px-6 font-extrabold text-white hover:bg-white/10 hover:text-white">
              <Link href="/plan-your-jodohmu-way">{l({ id: "Rencanakan perjalanan Anda", en: "Plan your journey" })}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
