import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  Fingerprint,
  Globe2,
  HeartHandshake,
  Home,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { localizeHref, siteUrl, type Lang } from "@/lib/i18n-routes";

const phoneHref = "tel:+628138858595";
const whatsappBase = "https://wa.me/628138858595";

const guideHrefs = {
  international: "/blog/international-marriage-facilitation",
  joble: "/blog/joble-jodohmu-table",
  trends: "/blog/tren-menikah-dengan-wna",
  family: "/blog/perkenalan-pertama-dan-keluarga",
};

// Shared by /pricing/international (Indonesian) and /en/pricing/international (English)
const copy = {
  en: {
    whatsapp: "Hello, I'm interested in Jodohmu's international matchmaking service. Could you please share more details?",
    packageWhatsapp: (name: string) => `Hello, I'm interested in Jodohmu's international ${name} package. I'd like to schedule a call to discuss it.`,
    badge: "For clients outside Indonesia",
    heroTitle: "Looking for an Indonesian spouse?",
    heroAccent: "Meet people who are verified and serious about marriage.",
    heroBody: "From another country, it is hard to know who is genuine. We take that risk off your shoulders: we verify both sides, sit in on every introduction, involve the family, and arrange your meeting in Indonesia when you are both ready.",
    enquire: "Enquire on WhatsApp",
    viewPackages: "View Packages",
    heroNote: "The first conversation is free. We speak English, Arabic and Bahasa Indonesia.",
    heroImageAlt: "An international client meeting a potential spouse and her parents in Indonesia",
    heroChecks: ["Both sides verified", "Every introduction facilitated", "Family involved from the start"],
    heroFrom: "From $1,200",
    trust: [
      { title: "Human matchmakers", desc: "A real person handles your case, not an algorithm." },
      { title: "Both sides verified", desc: "Identity, intent and background are checked." },
      { title: "Always facilitated", desc: "No unsupervised contact at any stage." },
      { title: "Any country", desc: "Serious clients are welcome from anywhere." },
    ],
    worriesLabel: "Built for the risks of distance",
    worriesTitle: "What worries people abroad, and what we do about it",
    worriesIntro: "These are the questions almost every international client asks on the first call. Here are the straight answers.",
    worries: [
      { q: "How do I know the person is real?", a: "We assess every Indonesian candidate ourselves and check their identity and intent before you see a profile. You are verified too: passport, employment, social media and a call with your family. Trust runs both ways." },
      { q: "Do they actually want to marry someone from abroad?", a: "Yes. Every candidate confirms they are open to an international marriage before any introduction. You only meet people who chose this path." },
      { q: "Isn't it risky to travel for someone I met online?", a: "You never talk to a candidate alone, and personal contact details are only exchanged after you meet in Indonesia. There is no private channel for pressure, games or requests for money." },
      { q: "Will their family accept me?", a: "In Indonesia, marriage involves the family. A family gathering is part of every package, and we explain customs and expectations beforehand so you arrive prepared." },
      { q: "I don't speak Bahasa Indonesia.", a: "You don't need to. We work in English, Arabic and Bahasa Indonesia, and a facilitator joins every introduction to keep the conversation clear." },
      { q: "What about the legal side of a mixed marriage?", a: "Amanah includes a one-hour consultation with a marriage lawyer. Our guide to mixed marriages in Indonesia covers the practical steps to prepare." },
    ],
    worriesLink: "Read the guide",
    howLabel: "How it works",
    howTitle: "How marrying an Indonesian partner works with Jodohmu",
    steps: [
      { title: "Apply", desc: "Tell us about yourself and confirm your place to begin." },
      { title: "Verify", desc: "We verify your documents, speak with a family member and complete a psychology assessment." },
      { title: "Match", desc: "We build your profile and present verified Indonesian candidates suited to you." },
      { title: "Video introductions", desc: "Online sessions from wherever you live, with a facilitator present at every one." },
      { title: "Meet in Indonesia", desc: "When both of you want to continue, we plan your visit and accompany every meeting." },
    ],
    youTitle: "You focus on the person.",
    youSub: "We handle everything around it.",
    youLabel: "What you do",
    you: ["Share your story and who you hope to meet", "Join video introductions from home", "Travel to Indonesia once you are both ready"],
    weLabel: "What we handle",
    we: ["Searching and verifying candidates", "Scheduling across time zones", "Facilitating every introduction", "Planning your Joble and the family gathering", "Explaining customs before you arrive"],
    visitLabel: "Your visit to Indonesia",
    visitTitle: "The trip where it becomes real",
    visitBody: "When you both want to continue, you come to Indonesia to meet in person. Nothing is improvised: we plan the meetings, invite the family and stay with you throughout.",
    visitImageAlt: "A table prepared for a Joble meeting",
    visit: [
      { title: "Joble meetings", desc: "A planned meeting at a table we prepare, meal included. You choose the facilitator: an imam, a priest, our team or none. Safar includes 2, Amanah 4." },
      { title: "A family gathering", desc: "Meet the family in a setting that respects their role in such an important decision." },
      { title: "Contact details, after you meet", desc: "Personal contacts are exchanged only once you have met face to face. It protects both of you." },
      { title: "Amanah extras", desc: "A premarital health check for both of you and a one-hour consultation with a marriage lawyer." },
    ],
    jobleLink: "Read the Joble guide",
    packagesLabel: "International packages",
    packagesTitle: "International matchmaking packages and prices",
    packagesIntro: "Each package covers verification, curation, facilitated introductions and meetings in Indonesia, coordinated by our team throughout.",
    months: "months",
    popular: "Most complete",
    priceNote: "Complete international package",
    safarTagline: "A focused six-month search with the essentials covered.",
    safar: [
      "Onboarding: your story & who you're looking for",
      "Profile built + identity, passport & employment verified",
      "Up to 3 online meetings",
      "1 psychology assessment + 1 background check",
      "1 family gathering",
      "2 Joble meetings in Indonesia",
    ],
    safarExcluded: "Travel, visas, accommodation, legal services, and third-party professional fees are not included.",
    amanahTagline: "Twelve months with a dedicated matchmaker and legal and health support.",
    amanah: [
      "Deep onboarding + personality assessment",
      "Dedicated matchmaker, priority search",
      "Up to 10 online meetings",
      "2 psychology assessments + 2 background checks",
      "1 family gathering",
      "4 Joble meetings in Indonesia",
      "1-hour consultation with a marriage lawyer",
      "Premarital health check for both of you",
    ],
    amanahExcluded: "Travel, visas, accommodation, notary and further legal work, and other third-party professional fees are not included.",
    cta: "Schedule a Call",
    paymentTitle: "Flexible payment.",
    paymentBody: "A minimum 20% payment confirms your place, and we agree a clear plan for the rest together.",
    customTitle: "Need something different?",
    customBody: "For two foreign nationals, or needs that don't fit either package, we can design a custom plan.",
    askTeam: "Ask our team",
    localLabel: "Living in Indonesia?",
    localTitle: "Our local packages may suit you better",
    localBody: "Pearl, Ruby and Diamond are designed for clients who can meet in person more easily.",
    localCta: "View local packages",
    guidesLabel: "Read before you decide",
    guidesTitle: "Guides for marrying across borders",
    guides: [
      { key: "international", title: "How Jodohmu facilitates marriage across borders", desc: "The full international process, from onboarding to meeting in Indonesia." },
      { key: "joble", title: "Joble: what a planned meeting looks like", desc: "Facilitators, guests, food, and how the format is agreed with both people." },
      { key: "trends", title: "Are more Indonesians marrying foreigners?", desc: "What the official data says, and the practical steps to prepare." },
      { key: "family", title: "First introductions and the role of family", desc: "How to prepare, what to ask, and how to involve parents well." },
    ] as { key: keyof typeof guideHrefs; title: string; desc: string }[],
    faqLabel: "Questions",
    faqTitle: "Questions about marrying an Indonesian partner",
    faqs: [
      { q: "Why must I visit Indonesia before exchanging contact details?", a: "This protects both parties. We verify identity and seriousness in person before any direct contact is made. It ensures every introduction is dignified and safe." },
      { q: "Can I do everything remotely without visiting Indonesia?", a: "The online verification, psychology assessment, and introduction sessions are all remote. The in-person Indonesia visit is only required when both parties wish to proceed after the introductions — it is not required upfront." },
      { q: "Can I pay in instalments?", a: "Yes. A minimum 20% payment confirms your place, and we agree a clear plan for the rest together before the search begins." },
      { q: "We are both foreign nationals. Can Jodohmu help us?", a: "Yes. We facilitate cases involving two foreign nationals, including people of different nationalities, usually through a custom plan. Indonesia can be the meeting location when it suits you both." },
      { q: "What happens if my package window expires before a match is found?", a: "We work hard to find your match well within your window insha Allah. If genuine circumstances arise, please reach out to us — we review every situation with care and understanding." },
      { q: "What countries do you accept international clients from?", a: "We accept serious clients from any country worldwide. There are no geographic restrictions." },
    ],
    readyLabel: "Free first conversation",
    readyTitle: "Tell us what you are looking for.",
    readyBody: "Send a short WhatsApp message about yourself and the person you hope to meet. We usually reply within a few hours, and every enquiry stays confidential.",
    readyCta: "Message us on WhatsApp",
    phoneLabel: "Prefer to speak directly?",
    back: "Back to main pricing page",
  },
  id: {
    whatsapp: "Halo, saya tertarik dengan layanan perjodohan internasional Jodohmu. Boleh saya minta informasi lebih lanjut?",
    packageWhatsapp: (name: string) => `Halo, saya tertarik dengan paket internasional ${name} dari Jodohmu. Saya ingin menjadwalkan panggilan untuk membahasnya.`,
    badge: "Untuk klien di luar Indonesia",
    heroTitle: "Mencari pasangan dari Indonesia?",
    heroAccent: "Bertemu orang terverifikasi yang serius menikah.",
    heroBody: "Dari negara lain, sulit mengetahui siapa yang sungguh-sungguh. Kami mengambil alih risiko itu: kami memverifikasi kedua pihak, mendampingi setiap perkenalan, melibatkan keluarga, dan mengatur pertemuan Anda di Indonesia saat keduanya siap.",
    enquire: "Tanya lewat WhatsApp",
    viewPackages: "Lihat Paket",
    heroNote: "Percakapan pertama gratis. Kami melayani dalam bahasa Inggris, Arab, dan Indonesia.",
    heroImageAlt: "Klien internasional bertemu calon pasangan dan orang tuanya di Indonesia",
    heroChecks: ["Kedua pihak diverifikasi", "Setiap perkenalan didampingi", "Keluarga terlibat sejak awal"],
    heroFrom: "Mulai $1,200",
    trust: [
      { title: "Matchmaker manusia", desc: "Orang sungguhan menangani kasus Anda, bukan algoritma." },
      { title: "Kedua pihak diverifikasi", desc: "Identitas, niat, dan latar belakang diperiksa." },
      { title: "Selalu didampingi", desc: "Tidak ada kontak tanpa pendampingan di tahap mana pun." },
      { title: "Negara mana pun", desc: "Klien yang serius diterima dari seluruh dunia." },
    ],
    worriesLabel: "Dirancang untuk risiko jarak jauh",
    worriesTitle: "Kekhawatiran klien dari luar negeri, dan cara kami menjawabnya",
    worriesIntro: "Hampir setiap klien internasional menanyakan hal ini di panggilan pertama. Ini jawaban jujurnya.",
    worries: [
      { q: "Bagaimana saya tahu orang itu nyata?", a: "Kami menilai sendiri setiap kandidat Indonesia serta memeriksa identitas dan niatnya sebelum Anda melihat profilnya. Anda pun diverifikasi: paspor, pekerjaan, media sosial, dan panggilan dengan keluarga Anda. Kepercayaan berjalan dua arah." },
      { q: "Apakah mereka benar-benar mau menikah dengan orang luar negeri?", a: "Ya. Setiap kandidat menyatakan terbuka untuk pernikahan internasional sebelum perkenalan apa pun. Anda hanya bertemu orang yang memang memilih jalan ini." },
      { q: "Bukankah berisiko bepergian untuk orang yang dikenal online?", a: "Anda tidak pernah berbicara dengan kandidat tanpa pendamping, dan kontak pribadi baru ditukar setelah bertemu di Indonesia. Tidak ada jalur pribadi untuk tekanan, permainan, atau permintaan uang." },
      { q: "Apakah keluarganya akan menerima saya?", a: "Di Indonesia, pernikahan melibatkan keluarga. Pertemuan keluarga termasuk dalam setiap paket, dan kami menjelaskan adat serta harapan keluarga sebelumnya agar Anda datang dengan siap." },
      { q: "Saya tidak bisa berbahasa Indonesia.", a: "Tidak masalah. Kami melayani dalam bahasa Inggris, Arab, dan Indonesia, dan fasilitator hadir di setiap perkenalan agar percakapan tetap jelas." },
      { q: "Bagaimana dengan urusan hukum pernikahan campuran?", a: "Amanah mencakup konsultasi satu jam dengan pengacara pernikahan. Panduan kami tentang pernikahan campuran di Indonesia membahas langkah praktis untuk bersiap." },
    ],
    worriesLink: "Baca panduannya",
    howLabel: "Cara kerjanya",
    howTitle: "Cara kerja perjodohan internasional Jodohmu",
    steps: [
      { title: "Daftar", desc: "Ceritakan tentang diri Anda dan amankan tempat Anda untuk memulai." },
      { title: "Verifikasi", desc: "Kami memverifikasi dokumen, berbicara dengan anggota keluarga, dan menyelesaikan asesmen psikologi." },
      { title: "Pencocokan", desc: "Kami menyusun profil Anda dan menghadirkan kandidat Indonesia terverifikasi yang sesuai." },
      { title: "Perkenalan video", desc: "Sesi online dari tempat Anda tinggal, dengan fasilitator hadir di setiap sesi." },
      { title: "Bertemu di Indonesia", desc: "Saat Anda berdua ingin melanjutkan, kami merencanakan kunjungan dan mendampingi setiap pertemuan." },
    ],
    youTitle: "Anda fokus pada orangnya.",
    youSub: "Kami mengurus semua hal di sekitarnya.",
    youLabel: "Yang Anda lakukan",
    you: ["Ceritakan kisah Anda dan sosok yang ingin Anda temui", "Ikuti perkenalan video dari rumah", "Datang ke Indonesia saat Anda berdua siap"],
    weLabel: "Yang kami urus",
    we: ["Mencari dan memverifikasi kandidat", "Menjadwalkan lintas zona waktu", "Mendampingi setiap perkenalan", "Merencanakan Joble dan pertemuan keluarga", "Menjelaskan adat sebelum Anda tiba"],
    visitLabel: "Kunjungan Anda ke Indonesia",
    visitTitle: "Perjalanan saat semuanya menjadi nyata",
    visitBody: "Saat Anda berdua ingin melanjutkan, Anda datang ke Indonesia untuk bertemu langsung. Tidak ada yang serba dadakan: kami merencanakan pertemuan, mengundang keluarga, dan mendampingi Anda sepanjang waktu.",
    visitImageAlt: "Meja yang disiapkan untuk pertemuan Joble",
    visit: [
      { title: "Pertemuan Joble", desc: "Pertemuan terencana di meja yang kami siapkan, makanan termasuk. Anda memilih fasilitator: imam, pendeta, tim kami, atau tanpa fasilitator. Safar mencakup 2, Amanah 4." },
      { title: "Pertemuan keluarga", desc: "Bertemu keluarga dalam suasana yang menghormati peran mereka dalam keputusan sepenting ini." },
      { title: "Kontak ditukar setelah bertemu", desc: "Kontak pribadi baru ditukar setelah Anda bertemu langsung. Ini melindungi kalian berdua." },
      { title: "Tambahan Amanah", desc: "Pemeriksaan kesehatan pranikah untuk Anda berdua dan konsultasi satu jam dengan pengacara pernikahan." },
    ],
    jobleLink: "Baca panduan Joble",
    packagesLabel: "Paket internasional",
    packagesTitle: "Paket dan harga perjodohan internasional",
    packagesIntro: "Setiap paket mencakup verifikasi, kurasi, perkenalan yang didampingi, dan pertemuan di Indonesia, dikoordinasikan oleh tim kami dari awal hingga akhir.",
    months: "bulan",
    popular: "Paling lengkap",
    priceNote: "Paket internasional lengkap",
    safarTagline: "Pencarian terarah enam bulan dengan semua hal penting tercakup.",
    safar: [
      "Onboarding: cerita Anda & sosok yang Anda cari",
      "Profil disusun + identitas, paspor & pekerjaan diverifikasi",
      "Hingga 3 pertemuan online",
      "1 asesmen psikologi + 1 pemeriksaan latar belakang",
      "1 pertemuan keluarga",
      "2 pertemuan Joble di Indonesia",
    ],
    safarExcluded: "Belum termasuk perjalanan, visa, akomodasi, layanan hukum, dan biaya profesional pihak ketiga.",
    amanahTagline: "Dua belas bulan bersama matchmaker khusus, plus dukungan hukum dan kesehatan.",
    amanah: [
      "Onboarding mendalam + asesmen kepribadian",
      "Matchmaker khusus, pencarian prioritas",
      "Hingga 10 pertemuan online",
      "2 asesmen psikologi + 2 pemeriksaan latar belakang",
      "1 pertemuan keluarga",
      "4 pertemuan Joble di Indonesia",
      "Konsultasi 1 jam dengan pengacara pernikahan",
      "Pemeriksaan kesehatan pranikah untuk Anda berdua",
    ],
    amanahExcluded: "Belum termasuk perjalanan, visa, akomodasi, notaris dan pekerjaan hukum lanjutan, serta biaya profesional pihak ketiga lainnya.",
    cta: "Jadwalkan Panggilan",
    paymentTitle: "Pembayaran fleksibel.",
    paymentBody: "Pembayaran minimal 20% mengamankan tempat Anda, dan sisanya kita sepakati bersama dalam rencana yang jelas.",
    customTitle: "Butuh yang berbeda?",
    customBody: "Untuk dua warga negara asing, atau kebutuhan yang tidak cocok dengan kedua paket, kami bisa merancang rencana khusus.",
    askTeam: "Tanya tim kami",
    localLabel: "Tinggal di Indonesia?",
    localTitle: "Paket lokal kami mungkin lebih cocok",
    localBody: "Pearl, Ruby, dan Diamond dirancang untuk klien yang lebih mudah bertemu langsung.",
    localCta: "Lihat paket lokal",
    guidesLabel: "Baca sebelum memutuskan",
    guidesTitle: "Panduan menikah lintas negara",
    guides: [
      { key: "international", title: "Cara Jodohmu mendampingi pernikahan lintas negara", desc: "Proses internasional lengkap, dari onboarding hingga bertemu di Indonesia." },
      { key: "joble", title: "Joble: seperti apa pertemuan yang direncanakan", desc: "Fasilitator, pendamping, makanan, dan cara format disepakati kedua pihak." },
      { key: "trends", title: "Benarkah makin banyak yang menikah dengan WNA?", desc: "Apa kata data resmi, dan langkah praktis untuk bersiap." },
      { key: "family", title: "Perkenalan pertama dan peran keluarga", desc: "Cara bersiap, apa yang perlu ditanyakan, dan cara melibatkan orang tua." },
    ] as { key: keyof typeof guideHrefs; title: string; desc: string }[],
    faqLabel: "Pertanyaan",
    faqTitle: "Pertanyaan seputar perjodohan internasional",
    faqs: [
      { q: "Mengapa saya harus datang ke Indonesia sebelum bertukar kontak?", a: "Ini melindungi kedua pihak. Kami memverifikasi identitas dan keseriusan secara langsung sebelum ada kontak pribadi. Dengan begitu setiap perkenalan tetap terhormat dan aman." },
      { q: "Bisakah semuanya dilakukan dari jauh tanpa datang ke Indonesia?", a: "Verifikasi online, asesmen psikologi, dan sesi perkenalan semuanya dilakukan dari jauh. Kunjungan langsung ke Indonesia hanya diperlukan ketika kedua pihak ingin melanjutkan setelah perkenalan — tidak diwajibkan di awal." },
      { q: "Bisakah saya membayar dengan cicilan?", a: "Bisa. Pembayaran minimal 20% mengamankan tempat Anda, dan sisanya kita sepakati bersama dalam rencana yang jelas sebelum pencarian dimulai." },
      { q: "Kami berdua warga negara asing. Bisakah Jodohmu membantu?", a: "Bisa. Kami mendampingi kasus dua warga negara asing, termasuk yang berbeda kewarganegaraan, biasanya lewat rencana khusus. Indonesia bisa menjadi tempat bertemu jika sesuai untuk kalian berdua." },
      { q: "Bagaimana jika masa paket saya habis sebelum menemukan pasangan?", a: "Kami berusaha keras menemukan pasangan Anda jauh sebelum masa paket berakhir, insyaAllah. Jika ada keadaan yang benar-benar di luar kendali, silakan hubungi kami — kami meninjau setiap situasi dengan cermat dan penuh pengertian." },
      { q: "Dari negara mana saja klien internasional diterima?", a: "Kami menerima klien yang serius dari negara mana pun di dunia. Tidak ada batasan wilayah." },
    ],
    readyLabel: "Percakapan pertama gratis",
    readyTitle: "Ceritakan apa yang Anda cari.",
    readyBody: "Kirim pesan WhatsApp singkat tentang diri Anda dan sosok yang ingin Anda temui. Kami biasanya membalas dalam beberapa jam, dan setiap pertanyaan dijaga kerahasiaannya.",
    readyCta: "Kirim pesan lewat WhatsApp",
    phoneLabel: "Lebih nyaman bicara langsung?",
    back: "Kembali ke halaman harga utama",
  },
};

const packageSchema = {
  safar: { price: 1200, months: 6 },
  amanah: { price: 3000, months: 12 },
};

export const internationalShareImage = (alt: string) => ({
  url: `${siteUrl}/images/blog/international-marriage-indonesia-hero.png`,
  width: 1672,
  height: 941,
  alt,
});

// Page-level schema: the service with its two USD offers, plus the FAQ shown on the page
export function internationalPricingSchema(lang: Lang) {
  const c = copy[lang];
  const pageUrl = `${siteUrl}${localizeHref("/pricing/international", lang)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: lang === "id" ? "Perjodohan internasional Jodohmu" : "Jodohmu international matchmaking",
        serviceType: "International marriage matchmaking",
        description: c.heroBody,
        provider: { "@id": `${siteUrl}#organization` },
        areaServed: "Worldwide",
        url: pageUrl,
        inLanguage: lang,
        offers: (["safar", "amanah"] as const).map((key) => ({
          "@type": "Offer",
          name: key === "safar" ? "Safar" : "Amanah",
          description: (key === "safar" ? c.safar : c.amanah).join("; "),
          price: packageSchema[key].price,
          priceCurrency: "USD",
          eligibleDuration: { "@type": "QuantitativeValue", value: packageSchema[key].months, unitCode: "MON" },
          availability: "https://schema.org/InStock",
          url: `${pageUrl}#packages`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        inLanguage: lang,
        mainEntity: [...c.worries, ...c.faqs].map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
}

const trustIcons = [HeartHandshake, BadgeCheck, Users, Globe2];
const worryIcons = [Fingerprint, HeartHandshake, ShieldCheck, Home, Languages, Scale];
const worryLinks: (keyof typeof guideHrefs | null)[] = [null, null, null, "family", null, "trends"];
const visitIcons = [Utensils, Users, ShieldCheck, Sparkles];

export function InternationalPricing({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const href = (path: string) => localizeHref(path, lang);
  const whatsappHref = `${whatsappBase}?text=${encodeURIComponent(c.whatsapp)}`;
  const packageHref = (name: string) => `${whatsappBase}?text=${encodeURIComponent(c.packageWhatsapp(name))}`;

  const packages = [
    { name: "Safar", key: "safar", price: "$1,200", months: 6, tagline: c.safarTagline, features: c.safar, excluded: c.safarExcluded, popular: false },
    { name: "Amanah", key: "amanah", price: "$3,000", months: 12, tagline: c.amanahTagline, features: c.amanah, excluded: c.amanahExcluded, popular: true },
  ];

  return (
    <div className="pricing-fonts">
      <div className="overflow-hidden bg-[#fffdfd] text-[#101f4d]">
        <section className="relative isolate border-b border-[#dce7ff] bg-[linear-gradient(125deg,#fff5f8_0%,#ffffff_46%,#edf5ff_100%)] py-16 sm:py-24">
          <div className="absolute -left-24 top-8 -z-10 h-72 w-72 rounded-full bg-[#ff8fb1]/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#5d8cff]/20 blur-3xl" />

          <div className="container grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e986a3]/30 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#c62d5c] shadow-sm">
                <Globe2 className="h-4 w-4" />
                {c.badge}
              </span>

              <h1 className="mt-7 max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[#102457] sm:text-5xl lg:text-[3.5rem]">
                <span className="block">{c.heroTitle}</span>{" "}
                <span className="mt-2 block text-[#d72d62]">{c.heroAccent}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#4a5877] sm:text-lg">{c.heroBody}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-[52px] rounded-full bg-[#d92f63] px-7 text-base font-bold text-white shadow-[0_14px_35px_rgba(217,47,99,.25)] hover:bg-[#bf2454]">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-wa-source="intl_hero">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {c.enquire}
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-[52px] rounded-full border-[#204ea7]/25 bg-white/80 px-7 text-base font-bold text-[#153778] hover:bg-[#edf4ff]">
                  <a href="#packages">{c.viewPackages}</a>
                </Button>
              </div>
              <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#687590]">
                <Languages className="mt-0.5 h-4 w-4 shrink-0 text-[#2f68cc]" />
                {c.heroNote}
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-xl pb-10 lg:pb-0">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#ef4779]/20 to-[#3175df]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_30px_80px_rgba(24,51,111,.18)]">
                <Image
                  src="/images/blog/international-marriage-indonesia-hero.png"
                  alt={c.heroImageAlt}
                  width={1672}
                  height={941}
                  priority
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="aspect-[4/3] w-full object-cover object-[30%_center]"
                />
                <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#2359b9] shadow-sm backdrop-blur">{c.heroFrom}</span>
              </div>
              <div className="absolute -bottom-2 left-4 right-4 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_18px_45px_rgba(24,51,111,.16)] backdrop-blur sm:left-auto sm:right-[-1rem] sm:w-72 lg:-bottom-8">
                <ul className="space-y-2.5">
                  {c.heroChecks.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-[#102457]">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ef6d94] to-[#316ed4] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-6 px-4">
          <div className="container grid max-w-7xl gap-px overflow-hidden rounded-3xl border border-[#dce6fb] bg-[#dce6fb] shadow-[0_16px_50px_rgba(24,51,111,.1)] sm:grid-cols-2 lg:grid-cols-4">
            {c.trust.map(({ title, desc }, i) => {
              const Icon = trustIcons[i];
              return (
                <div key={title} className="flex gap-4 bg-white px-5 py-6">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff0f5] to-[#eaf2ff] text-[#d72d62]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#102457]">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#6a7690]">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="container max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d72d62]">{c.worriesLabel}</span>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#102457] sm:text-5xl">{c.worriesTitle}</h2>
              <p className="mt-5 text-base leading-7 text-[#65718a]">{c.worriesIntro}</p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {c.worries.map((worry, i) => {
                const Icon = worryIcons[i];
                const link = worryLinks[i];
                return (
                  <div key={worry.q} className="flex flex-col rounded-3xl border border-[#dce5f5] bg-white p-6 shadow-[0_12px_35px_rgba(24,51,111,.06)] sm:p-7">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff0f5] to-[#eaf2ff] text-[#d72d62]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="pt-1 text-base font-extrabold leading-6 text-[#102457]">“{worry.q}”</h3>
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-6 text-[#65718a]">{worry.a}</p>
                    {link && (
                      <Link href={href(guideHrefs[link])} className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#c62d5c] hover:underline">
                        {c.worriesLink} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#fffdfd_0%,#f5f8ff_100%)] pb-24 sm:pb-28">
          <div className="container max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2d69ce]">{c.howLabel}</span>
                <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight text-[#102457] sm:text-5xl">{c.howTitle}</h2>
                <ol className="mt-10 space-y-3">
                  {c.steps.map((step, i) => {
                    const last = i === c.steps.length - 1;
                    return (
                      <li key={step.title} className={`flex gap-5 rounded-2xl border bg-white p-5 ${last ? "border-[#efadc1] ring-4 ring-[#fff0f5]" : "border-[#dce5f5]"}`}>
                        <span className={`w-10 shrink-0 font-serif text-3xl font-bold ${last ? "text-[#d72d62]" : "text-[#80a3df]"}`}>{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <h3 className="text-base font-extrabold text-[#102457]">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#65718a]">{step.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-[#cadcff] bg-[linear-gradient(140deg,#fff0f5_0%,#ffffff_50%,#e7f1ff_100%)] p-7 shadow-[0_24px_70px_rgba(29,69,145,.1)] sm:p-9 lg:sticky lg:top-28 lg:mt-24">
                <p className="font-serif text-3xl font-bold leading-tight text-[#102457]">{c.youTitle}</p>
                <p className="mt-1 font-serif text-3xl font-bold leading-tight text-[#d72d62]">{c.youSub}</p>

                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-[#8893a8]">{c.youLabel}</p>
                <ul className="mt-3 space-y-2.5">
                  {c.you.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4f5e7b]">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[#245fc3]">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="my-6 h-px bg-[#e3eaf7]" />

                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c62d5c]">{c.weLabel}</p>
                <ul className="mt-3 space-y-2.5">
                  {c.we.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#102457]">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ef6d94] to-[#316ed4] text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="container max-w-7xl">
            <div className="overflow-hidden rounded-[2.25rem] border border-[#cadcff] bg-white shadow-[0_24px_80px_rgba(29,69,145,.1)]">
              <div className="grid lg:grid-cols-[.95fr_1.05fr]">
                <div className="relative min-h-72 lg:min-h-full">
                  <Image
                    src="/images/blog/joble-table.png"
                    alt={c.visitImageAlt}
                    fill
                    sizes="(min-width: 1024px) 600px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102457]/70 via-[#102457]/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
                      <MapPin className="h-4 w-4" /> {c.visitLabel}
                    </p>
                    <p className="mt-2 font-serif text-2xl font-bold">Joble · Jodohmu Table</p>
                  </div>
                </div>

                <div className="p-7 sm:p-10 lg:p-12">
                  <h2 className="font-serif text-4xl font-bold leading-tight text-[#102457] sm:text-[2.75rem]">{c.visitTitle}</h2>
                  <p className="mt-4 text-base leading-7 text-[#53617d]">{c.visitBody}</p>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    {c.visit.map((item, i) => {
                      const Icon = visitIcons[i];
                      return (
                        <div key={item.title}>
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf4ff] text-[#245fc3]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <h3 className="mt-3 text-sm font-extrabold text-[#102457]">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#65718a]">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <Link href={href(guideHrefs.joble)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#fff0f5] px-5 py-3 text-sm font-extrabold text-[#c62d5c] transition hover:bg-[#ffe3ec]">
                    {c.jobleLink} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="packages" className="relative scroll-mt-20 bg-[#f7f9ff] py-24 sm:py-28">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ef88a7] to-transparent" />
          <div className="container max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d72d62]">{c.packagesLabel}</span>
              <h2 className="mt-4 font-serif text-4xl text-[#102457] sm:text-5xl">{c.packagesTitle}</h2>
              <p className="mt-5 text-base leading-7 text-[#65718a]">{c.packagesIntro}</p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-7 lg:grid-cols-2 lg:items-stretch">
              {packages.map((pkg) => (
                <article
                  key={pkg.key}
                  className={`relative flex flex-col rounded-[2rem] bg-white p-7 sm:p-8 ${
                    pkg.popular
                      ? "border-2 border-transparent shadow-[0_24px_70px_rgba(65,79,150,.18)] [background:linear-gradient(white,white)_padding-box,linear-gradient(145deg,#ef4779,#397ee8)_border-box]"
                      : "border border-[#dce5f5] shadow-[0_16px_45px_rgba(24,51,111,.08)]"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#df3268] to-[#356fd4] px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white shadow-lg">
                      {c.popular}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-4 pt-2">
                    <div>
                      <h3 className={`font-serif text-3xl font-bold ${pkg.popular ? "text-[#d72d62]" : "text-[#102457]"}`}>{pkg.name}</h3>
                      <p className="mt-2 min-h-10 text-sm leading-5 text-[#7b6980]">{pkg.tagline}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${pkg.popular ? "bg-[#fff0f5] text-[#c82d5b]" : "bg-[#edf4ff] text-[#2457ad]"}`}>
                      {pkg.months} {c.months}
                    </span>
                  </div>

                  <div className="my-7 border-y border-[#e8edf7] py-6">
                    <p className={`text-4xl font-extrabold tracking-tight ${pkg.popular ? "text-[#d72d62]" : "text-[#102457]"}`}>
                      {pkg.price} <span className="text-base font-bold text-[#8893a8]">USD</span>
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8893a8]">{c.priceNote}</p>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[#4f5e7b]">
                        <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${pkg.popular ? "bg-[#fff0f5] text-[#d72d62]" : "bg-[#edf4ff] text-[#245fc3]"}`}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button asChild className={`mt-8 h-12 w-full rounded-full text-sm font-extrabold text-white ${pkg.popular ? "bg-gradient-to-r from-[#df3268] to-[#356fd4] hover:opacity-90" : "bg-[#102457] hover:bg-[#1a3b83]"}`}>
                    <a href={packageHref(pkg.name)} target="_blank" rel="noopener noreferrer" data-wa-source={`intl_package_${pkg.key}`}>
                      {c.cta}
                    </a>
                  </Button>
                  <p className="mt-4 text-center text-xs leading-5 text-[#8893a8]">{pkg.excluded}</p>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-2xl border border-[#d9e5fb] bg-white shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-[#e4eaf5]">
              <p className="px-5 py-4 text-sm leading-6 text-[#53617d]">
                <span className="font-bold text-[#102457]">{c.paymentTitle}</span> {c.paymentBody}
              </p>
              <p className="border-t border-[#e4eaf5] px-5 py-4 text-sm leading-6 text-[#53617d] sm:border-t-0">
                <span className="font-bold text-[#102457]">{c.customTitle}</span> {c.customBody}{" "}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-wa-source="intl_custom_plan" className="font-bold text-[#d72d62] hover:underline">
                  {c.askTeam} →
                </a>
              </p>
            </div>

            <section className="relative mx-auto mt-6 max-w-5xl overflow-hidden rounded-[2rem] border border-[#c9d9f2] bg-[#eef5ff] p-6 shadow-[0_16px_40px_rgba(30,78,154,.10)] sm:p-8">
              <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f7bad0]/45 blur-3xl" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-2xl gap-4 sm:gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#2457ad] shadow-sm sm:h-14 sm:w-14">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c62d5c]">{c.localLabel}</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-[#102457]">{c.localTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#52627f]">{c.localBody}</p>
                  </div>
                </div>
                <Button asChild className="h-12 shrink-0 rounded-full bg-[#102457] px-6 font-extrabold text-white hover:bg-[#1a3b83]">
                  <Link href={href("/pricing")}>
                    {c.localCta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="container max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2d69ce]">{c.guidesLabel}</span>
                <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#102457] sm:text-5xl">{c.guidesTitle}</h2>
              </div>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {c.guides.map((guide) => (
                <Link
                  key={guide.key}
                  href={href(guideHrefs[guide.key])}
                  className="group flex gap-5 rounded-3xl border border-[#dce5f5] bg-white p-6 shadow-[0_12px_35px_rgba(24,51,111,.06)] transition hover:-translate-y-0.5 hover:border-[#efadc1] sm:p-7"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff0f5] to-[#eaf2ff] text-[#d72d62]">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold leading-6 text-[#102457] group-hover:text-[#c62d5c]">{guide.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#65718a]">{guide.desc}</p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#80a3df] transition group-hover:translate-x-1 group-hover:text-[#c62d5c]" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#fffdfd_0%,#f5f8ff_100%)] pb-24 sm:pb-28">
          <div className="container max-w-3xl">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d72d62]">{c.faqLabel}</span>
              <h2 className="mt-4 font-serif text-4xl font-bold text-[#102457] sm:text-5xl">{c.faqTitle}</h2>
            </div>

            <div className="mt-12 overflow-hidden rounded-3xl border border-[#dce5f5] bg-white shadow-[0_16px_45px_rgba(24,51,111,.06)]">
              {c.faqs.map((faq, i) => (
                <details key={faq.q} className={`group ${i > 0 ? "border-t border-[#e8edf7]" : ""}`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#f8fbff] [&::-webkit-details-marker]:hidden">
                    <span className="text-[15px] font-extrabold text-[#102457]">{faq.q}</span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[#245fc3] transition-transform group-open:rotate-180">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-sm leading-7 text-[#65718a]">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="container max-w-7xl overflow-hidden rounded-[2.25rem] bg-[linear-gradient(115deg,#d92f63_0%,#a43787_45%,#155ec6_100%)] px-7 py-12 text-white shadow-[0_30px_80px_rgba(32,69,145,.22)] sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">
                <Sparkles className="h-4 w-4" /> {c.readyLabel}
              </p>
              <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">{c.readyTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{c.readyBody}</p>
            </div>
            <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
              <Button asChild className="h-[52px] rounded-full bg-white px-8 font-extrabold text-[#bd2857] hover:bg-[#fff4f7]">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-wa-source="intl_final">
                  <MessageCircle className="mr-2 h-4 w-4" /> {c.readyCta}
                </a>
              </Button>
              <a href={phoneHref} className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-center text-white transition hover:bg-white/15">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/65">{c.phoneLabel}</span>
                <span className="mt-1 flex items-center justify-center gap-2 text-sm font-extrabold">
                  <Phone className="h-4 w-4" /> +62 813-885-8595
                </span>
              </a>
            </div>
          </div>
        </section>

        <div className="container pb-20 text-center">
          <Link href={href("/pricing")} className="inline-flex items-center gap-2 text-sm font-bold text-[#687590] hover:text-[#d72d62]">
            <ArrowLeft className="h-4 w-4" /> {c.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
