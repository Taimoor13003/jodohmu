'use client';

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight, BadgeCheck, Brain, BriefcaseBusiness, Building2, Church, Check, CircleUserRound, Flower2, Gem, Gift, HandHeart, MapPin, Megaphone, Mic, Presentation, SearchCheck,
  HeartHandshake, House, Lock, MessageCircle, Plus, Send, ShieldCheck, Sparkles, UserCheck, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { analytics } from "@/lib/analytics";

const wa = "https://wa.me/6281122210303";

const partnerTypes = [
  { value: "faith", Icon: Church, id: ["Pemuka agama", "Ustaz, pendeta, pastor, romo, pandita, dan pengurus rumah ibadah dari keyakinan apa pun."], en: ["Faith leaders", "Ustaz, pastors, priests, monks, and place-of-worship committees of any faith."] },
  { value: "elder", Icon: Flower2, id: ["Sosok yang dituakan", "Ibu atau bapak yang dikenal semua orang di lingkungannya — tempat warga bertanya, “Ada calon yang cocok?”"], en: ["Respected elders", "The auntie or uncle everyone in the neighborhood knows — the one people ask, “Know anyone suitable?”"] },
  { value: "wedding", Icon: Gem, id: ["Vendor pernikahan", "Wedding organizer, MUA, butik, fotografer, dan katering yang bertemu keluarga setiap minggu."], en: ["Wedding vendors", "Wedding organizers, MUAs, boutiques, photographers, and caterers who meet families every week."] },
  { value: "organization", Icon: Building2, id: ["Komunitas & organisasi", "Komunitas profesional, alumni, kampus, kajian, dan organisasi yang ingin memberi manfaat nyata."], en: ["Communities & organizations", "Professional, alumni, campus, and study communities that want to offer something genuinely useful."] },
  { value: "professional", Icon: Brain, id: ["Profesional", "Psikolog, konselor, pengacara, penyelidik latar belakang, HR, dan coach."], en: ["Professionals", "Psychologists, counselors, lawyers, background investigators, HR teams, and coaches."] },
  { value: "individual", Icon: CircleUserRound, id: ["Siapa pun yang peduli", "Anda yang punya lingkar pertemanan luas dan tulus ingin melihat orang-orang terdekat bahagia."], en: ["Anyone who cares", "People with a wide circle who sincerely want to see those close to them happy."] },
] as const;

const contributions = [
  { value: "refer", Icon: Users, id: ["Mengenalkan orang", "Kenalkan orang-orang yang serius ingin menikah kepada tim kami."], en: ["Introduce people", "Introduce people who are serious about marriage to our team."] },
  { value: "seminar", Icon: Presentation, id: ["Menyelenggarakan seminar", "Bantu kami mengadakan seminar pranikah, kajian, dan diskusi di komunitas Anda."], en: ["Host seminars", "Help us run pre-marriage seminars, study circles, and talks in your community."] },
  { value: "speaker", Icon: Mic, id: ["Menjadi pembicara", "Berbagi pengalaman dan ilmu sebagai pembicara di acara-acara Jodohmu."], en: ["Speak at events", "Share your experience and knowledge as a speaker at Jodohmu events."] },
  { value: "venue", Icon: MapPin, id: ["Menyediakan tempat", "Rumah ibadah, aula, kafe, atau ruang pertemuan untuk acara dan pertemuan keluarga."], en: ["Offer a venue", "Places of worship, halls, cafés, or meeting rooms for events and family meetings."] },
  { value: "psychology", Icon: Brain, id: ["Asesmen psikologi", "Psikolog dan konselor yang membantu menilai kesiapan menikah para klien."], en: ["Psychology assessments", "Psychologists and counselors who help assess clients' readiness for marriage."] },
  { value: "background", Icon: SearchCheck, id: ["Pemeriksaan latar belakang", "Profesional yang membantu memverifikasi identitas dan latar belakang kandidat."], en: ["Background checks", "Professionals who help verify candidates' identity and background."] },
  { value: "spread", Icon: Megaphone, id: ["Menyebarkan kabar baik", "Bagikan informasi Jodohmu di grup, komunitas, dan media sosial Anda."], en: ["Spread the word", "Share Jodohmu in your groups, communities, and social media."] },
] as const;

const steps = [
  { Icon: Send, id: ["Daftar", "Isi formulir singkat di halaman ini. Tidak ada biaya pendaftaran."], en: ["Apply", "Fill in the short form on this page. There is no sign-up fee."] },
  { Icon: MessageCircle, id: ["Sesi perkenalan", "Tim kami menghubungi Anda via WhatsApp untuk berkenalan dan menjelaskan cara kita bekerja sama."], en: ["Intro call", "Our team reaches out on WhatsApp to get to know you and explain how we'll work together."] },
  { Icon: Users, id: ["Mulai berkontribusi", "Kenalkan orang, bantu acara, atau berbagi keahlian — sesuai peran yang Anda pilih."], en: ["Start contributing", "Introduce people, help with events, or share your expertise — whichever role you choose."] },
  { Icon: Gift, id: ["Tanda terima kasih", "Setiap kontribusi kami hargai dengan layak, sebagai ucapan terima kasih atas waktu dan kepercayaan Anda."], en: ["A thank-you", "Every contribution is properly appreciated, as our thank-you for your time and trust."] },
];

const benefits = [
  { Icon: House, id: ["Bagian dari kisah mereka", "Setiap keluarga baru yang terbentuk berawal dari satu perkenalan — dan perkenalan itu datang dari Anda."], en: ["Part of their story", "Every new family begins with one introduction — and that introduction came from you."] },
  { Icon: BadgeCheck, id: ["Nama yang terjaga", "Setiap rekomendasi ditangani dengan hati-hati, sehingga kepercayaan orang kepada Anda tetap terjaga."], en: ["Your name, protected", "Every referral is handled with care, so the trust people place in you stays intact."] },
  { Icon: UserCheck, id: ["Didampingi tim kami", "Satu kontak khusus dari tim kami, lengkap dengan brosur dan pesan yang siap Anda bagikan."], en: ["Supported by our team", "A dedicated contact on our team, plus brochures and messages ready for you to share."] },
  { Icon: Gift, id: ["Apresiasi yang tulus", "Setiap kontribusi — dari satu perkenalan hingga satu seminar — kami hargai sebagai tanda terima kasih."], en: ["Sincere appreciation", "Every contribution — from one introduction to one seminar — is appreciated as our thank-you."] },
];

const conduct = [
  { id: "Data dan profil kandidat hanya diakses oleh pihak yang bertugas menanganinya, dengan perjanjian kerahasiaan.", en: "Candidate data and profiles are only accessed by those assigned to handle them, under a confidentiality agreement." },
  { id: "Setiap orang yang dikenalkan harus sudah setuju untuk dihubungi tim Jodohmu.", en: "Everyone you refer must have agreed to be contacted by the Jodohmu team." },
  { id: "Tidak ada janji jodoh, tidak ada tekanan, dan tidak ada penarikan uang oleh mitra.", en: "No promised matches, no pressure, and partners never collect money." },
  { id: "Jodohmu terbuka untuk semua keyakinan — mitra menghormati latar belakang setiap orang.", en: "Jodohmu is open to all faiths — partners respect everyone's background." },
];

const faqs = [
  { id: ["Apakah ada biaya untuk menjadi mitra?", "Tidak. Pendaftaran dan keikutsertaan dalam program mitra sepenuhnya gratis."], en: ["Does it cost anything to become a partner?", "No. Applying and taking part in the partner program is completely free."] },
  { id: ["Apakah mitra mendapatkan apresiasi?", "Ya. Sebagai ucapan terima kasih, kami memberikan apresiasi untuk setiap orang yang bergabung melalui Anda. Detailnya kami jelaskan secara terbuka saat sesi perkenalan."], en: ["Do partners receive any appreciation?", "Yes. As a thank-you, we offer appreciation for every person who joins through you. We explain the details openly during the intro call."] },
  { id: ["Saya tidak punya jaringan besar. Bisakah saya tetap membantu?", "Tentu. Anda bisa membantu lewat keahlian, tempat, waktu, atau cukup menyebarkan kabar baik. Setiap bantuan berarti."], en: ["I don't have a big network. Can I still help?", "Of course. You can help with your expertise, a venue, your time, or simply by spreading the word. Every bit of help matters."] },
  { id: ["Apakah saya harus menjual atau meyakinkan orang?", "Tidak. Cukup kenalkan. Penjelasan layanan, konsultasi, dan pendampingan sepenuhnya ditangani oleh tim kami."], en: ["Do I have to sell or convince anyone?", "No. Just make the introduction. Our team handles explaining the service, consultations, and guidance."] },
  { id: ["Apakah Jodohmu hanya untuk satu agama?", "Tidak. Jodohmu terbuka untuk semua keyakinan, dan proses perkenalan selalu menghormati nilai serta keluarga setiap klien."], en: ["Is Jodohmu for one religion only?", "No. Jodohmu is open to all faiths, and every introduction respects each client's values and family."] },
];

const schema = z.object({
  name: z.string().trim().min(2, { message: "Nama wajib diisi / Name is required" }),
  phone: z.string().trim().regex(/^\+?[\d\s-]{8,20}$/, { message: "Nomor WhatsApp tidak valid / Invalid WhatsApp number" }),
  city: z.string().trim().min(2, { message: "Kota wajib diisi / City is required" }),
  partnerType: z.string().min(1, { message: "Pilih salah satu / Choose one" }),
  roles: z.array(z.string()).min(1, { message: "Pilih minimal satu / Choose at least one" }),
  organization: z.string().optional(),
  network: z.string().max(1500).optional(),
  agreed: z.boolean().refine((v) => v, { message: "Wajib disetujui / Required" }),
});

type FormData = z.infer<typeof schema>;

export function MitraPage() {
  const { lang } = useLanguage();
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const pick = (item: { id: readonly string[]; en: readonly string[] }) => (lang === "id" ? item.id : item.en);
  const [openFaq, setOpenFaq] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "+62 ", partnerType: "", roles: [], agreed: false },
  });
  const selectedType = watch("partnerType");
  const selectedRoles = watch("roles") ?? [];
  const toggleRole = (value: string) =>
    setValue("roles", selectedRoles.includes(value) ? selectedRoles.filter((role) => role !== value) : [...selectedRoles, value], { shouldValidate: true });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to send");
      }
      analytics.formSubmit("partner_mitra");
      setSubmitted(true);
    } catch (err) {
      toast.error(l("Terjadi kesalahan", "Something went wrong"), {
        description: l("Silakan coba lagi atau hubungi kami via WhatsApp.", "Please try again or reach us on WhatsApp."),
        duration: 6000,
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const field = "h-12 rounded-xl border-[#dce5f2] bg-white text-[#152852] placeholder:text-[#9aa5bb] focus-visible:ring-[#d52e62]/30";
  const label = "mb-1.5 block text-sm font-bold text-[#10275b]";
  const error = "mt-1.5 text-xs font-semibold text-[#d52e62]";

  return (
    <main className="overflow-hidden bg-[#fffdfd] pb-24 text-[#152852]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#10275b] py-16 text-white sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(235,83,132,.5),transparent_32%),radial-gradient(circle_at_90%_85%,rgba(74,133,232,.42),transparent_35%)]" />
        <div className="container grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em]">
              <Sparkles className="h-3.5 w-3.5 text-[#ffb8d0]" />{l("Program Mitra Jodohmu", "Jodohmu Partner Program")}
            </span>
            <h1 className="mt-7 max-w-3xl font-serif text-5xl font-bold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              {l("Bantu lebih banyak orang menikah ", "Help more people marry ")}
              <span className="text-[#ffb8d0]">{l("dengan cara yang terhormat.", "the respectful way.")}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              {l(
                "Banyak orang serius ingin menikah, tapi tidak tahu harus mulai dari mana. Kami mengajak orang-orang baik dari seluruh Indonesia — pemuka agama, profesional, komunitas, hingga sosok yang dituakan di lingkungan — untuk bergerak bersama.",
                "Many people are serious about marriage but don't know where to start. We are inviting good people across Indonesia — faith leaders, professionals, communities, and respected elders in every neighborhood — to move together."
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full bg-white px-6 font-extrabold text-[#13316c] hover:bg-[#fff1f5]">
                <Link href="#daftar">{l("Daftar jadi Mitra", "Become a Partner")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/30 bg-transparent px-6 font-extrabold text-white hover:bg-white/10 hover:text-white">
                <Link href="#cara-kerja">{l("Lihat cara kerjanya", "See how it works")}</Link>
              </Button>
            </div>
          </div>

          {/* Referral journey card */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#ff8fb5]/25 to-[#4a85e8]/20 blur-2xl" />
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur sm:p-7">
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/60">{l("Perjalanan satu rekomendasi", "The journey of one referral")}</p>
              <ol className="mt-6 space-y-3">
                {[
                  [HandHeart, l("Anda mengenalkan", "You introduce"), l("Dengan izin orang tersebut", "With their permission")],
                  [MessageCircle, l("Tim kami menghubungi", "Our team reaches out"), l("Konsultasi tanpa tekanan", "A no-pressure consultation")],
                  [HeartHandshake, l("Pendampingan dimulai", "Guidance begins"), l("Perkenalan yang terverifikasi", "Verified introductions")],
                  [House, l("Keluarga baru terbentuk", "A new family begins"), l("Dan Anda menjadi bagian darinya", "And you are part of it")],
                ].map(([Icon, title, sub], index) => {
                  const StepIcon = Icon as typeof HandHeart;
                  return (
                    <li key={index} className={`flex items-center gap-4 rounded-2xl p-4 ${index === 3 ? "bg-white text-[#10275b] shadow-xl" : "bg-white/[.07]"}`}>
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${index === 3 ? "bg-[#fff0f5] text-[#d52e62]" : "bg-white/10 text-[#ffd5e3]"}`}>
                        <StepIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold">{title as string}</p>
                        <p className={`text-sm ${index === 3 ? "text-[#65718a]" : "text-white/65"}`}>{sub as string}</p>
                      </div>
                      <span className={`ml-auto font-serif text-2xl font-bold ${index === 3 ? "text-[#d52e62]/40" : "text-white/20"}`}>0{index + 1}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Mission strip */}
      <section className="relative z-10 -mt-7 px-4">
        <div className="container grid max-w-6xl gap-px overflow-hidden rounded-3xl border border-[#dde6f4] bg-[#dde6f4] shadow-xl md:grid-cols-3">
          {[
            [HeartHandshake, l("Misi yang bermakna", "A meaningful mission"), l("Membantu orang menemukan pasangan hidup adalah salah satu kebaikan yang dampaknya terasa seumur hidup.", "Helping someone find a life partner is a kindness whose impact lasts a lifetime.")],
            [ShieldCheck, l("Proses yang aman", "A safe process"), l("Verifikasi, pemeriksaan latar belakang, dan keterlibatan keluarga di setiap tahap.", "Verification, background checks, and family involvement at every step.")],
            [Lock, l("Privasi terjaga", "Privacy protected"), l("Data dan profil kandidat hanya ditangani tim Jodohmu dan mitra profesional yang terikat perjanjian kerahasiaan.", "Candidate data and profiles are handled only by the Jodohmu team and professional partners bound by confidentiality.")],
          ].map(([Icon, title, text], index) => {
            const ValueIcon = Icon as typeof HeartHandshake;
            return (
              <div key={index} className="bg-white p-7">
                <ValueIcon className="h-6 w-6 text-[#d52e62]" />
                <h2 className="mt-5 font-serif text-xl font-bold text-[#10275b]">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-[#65718a]">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ways to help */}
      <section className="container mt-24 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">{l("Banyak cara untuk membantu", "Many ways to help")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-[#10275b] sm:text-5xl">{l("Misi sebesar ini butuh banyak tangan.", "A mission this big needs many hands.")}</h2>
            <p className="mt-4 leading-7 text-[#65718a]">{l("Kami sedang membangun jaringan mitra di seluruh Indonesia. Kami mencari orang-orang berkualitas yang ingin berkontribusi — dengan cara apa pun yang paling sesuai untuk Anda.", "We are building a partner network across Indonesia. We're looking for quality people who want to contribute — in whatever way suits you best.")}</p>
          </div>
          <Button asChild className="h-12 w-fit rounded-full bg-[#d52e62] px-6 font-extrabold text-white hover:bg-[#b8254f]">
            <Link href="#daftar">{l("Saya ingin membantu", "I want to help")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contributions.map(({ value, Icon, ...copy }, index) => {
            const [title, text] = pick(copy);
            return (
              <div key={value} className="group relative overflow-hidden rounded-[1.5rem] border border-[#dce5f2] bg-white p-6 transition hover:-translate-y-1 hover:border-[#245ec0]/30 hover:shadow-xl">
                <span className="absolute right-5 top-4 font-serif text-3xl font-bold text-[#10275b]/[.07]">0{index + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef3fc] text-[#245ec0] transition group-hover:bg-[#10275b] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-[#10275b]">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#65718a]">{text}</p>
              </div>
            );
          })}
          <Link href="/careers" className="group flex flex-col justify-between rounded-[1.5rem] bg-[#10275b] p-6 text-white transition hover:-translate-y-1 hover:shadow-xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-[#ffb8d0]">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div className="mt-4">
              <h3 className="text-lg font-extrabold">{l("Bergabung dengan tim", "Join the team")}</h3>
              <p className="mt-1.5 text-sm leading-6 text-white/70">{l("Ingin berkontribusi lebih jauh? Lihat posisi yang sedang dibuka.", "Want to go further? See our open roles.")}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#ffb8d0]">{l("Lihat karier", "See careers")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Who it's for */}
      <section className="container mt-24 max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">{l("Siapa yang cocok", "Who it's for")}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-[#10275b] sm:text-5xl">{l("Dari mimbar hingga warung sebelah.", "From the pulpit to the corner shop.")}</h2>
          <p className="mt-4 leading-7 text-[#65718a]">{l("Jika orang sering bercerita kepada Anda tentang keinginan mereka untuk menikah, Anda sudah punya yang paling penting: kepercayaan.", "If people often confide in you about wanting to get married, you already have what matters most: their trust.")}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerTypes.map(({ value, Icon, ...copy }, index) => {
            const [title, text] = pick(copy);
            return (
              <article key={value} className={`group rounded-[1.75rem] border border-[#dce5f2] p-7 transition hover:-translate-y-1 hover:border-[#d52e62]/35 hover:shadow-xl ${index === 1 ? "bg-gradient-to-br from-[#fff0f5] to-white" : "bg-white"}`}>
                <div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f5] text-[#d52e62] transition group-hover:bg-[#d52e62] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#10275b]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#65718a]">{text}</p>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-6 rounded-2xl border border-dashed border-[#d52e62]/30 bg-[#fff7fa] p-5 text-center font-serif text-lg font-semibold leading-8 text-[#10275b]">
          {l("“Tolong carikan jodoh untuk anak saya.” — Jika kalimat ini sering Anda dengar, Anda sudah menjadi bagian dari misi ini.", "“Please help find a spouse for my child.” — If you hear this often, you are already part of this mission.")}
        </p>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="mt-24 scroll-mt-24 bg-[#f6f8fd] py-20">
        <div className="container max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">{l("Cara kerja", "How it works")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-bold text-[#10275b] sm:text-5xl">{l("Empat langkah sederhana.", "Four simple steps.")}</h2>
          </div>
          <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-[#d52e62]/10 via-[#d52e62]/40 to-[#245ec0]/10 lg:block" />
            {steps.map(({ Icon, ...copy }, index) => {
              const [title, text] = pick(copy);
              return (
                <div key={index} className="relative text-center">
                  <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border-4 border-[#f6f8fd] bg-[#10275b] text-white shadow-lg">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#d52e62] text-xs font-extrabold">{index + 1}</span>
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-bold text-[#10275b]">{title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#65718a]">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits + conduct */}
      <section className="container mt-24 grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">{l("Untuk para mitra", "For our partners")}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-[#10275b] sm:text-5xl">{l("Menjadi bagian dari kebaikan yang nyata.", "Be part of something genuinely good.")}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {benefits.map(({ Icon, ...copy }, index) => {
              const [title, text] = pick(copy);
              return (
                <div key={index} className="rounded-[1.5rem] border border-[#dce5f2] bg-white p-6">
                  <Icon className="h-6 w-6 text-[#245ec0]" />
                  <h3 className="mt-4 text-lg font-extrabold text-[#10275b]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#65718a]">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="self-end rounded-[2rem] bg-[#10275b] p-8 text-white shadow-2xl">
          <ShieldCheck className="h-8 w-8 text-[#ffb8d0]" />
          <h3 className="mt-5 font-serif text-3xl font-bold">{l("Kode etik mitra", "Partner code of conduct")}</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">{l("Kepercayaan adalah fondasi kami. Setiap mitra memegang prinsip ini:", "Trust is our foundation. Every partner holds to these principles:")}</p>
          <ul className="mt-6 space-y-4">
            {conduct.map((item, index) => (
              <li key={index} className="flex gap-3 text-sm leading-6 text-white/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb8d0]" strokeWidth={3} />
                {l(item.id, item.en)}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Application form */}
      <section id="daftar" className="container mt-24 max-w-6xl scroll-mt-24">
        <div className="grid overflow-hidden rounded-[2.25rem] border border-[#dce5f2] bg-white shadow-xl lg:grid-cols-[.8fr_1.2fr]">
          <div className="relative isolate bg-gradient-to-br from-[#d52e62] to-[#9B2242] p-8 text-white sm:p-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,.22),transparent_35%)]" />
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-white/70">{l("Pendaftaran mitra", "Partner application")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold leading-tight">{l("Mari mulai bersama.", "Let's start together.")}</h2>
            <p className="mt-4 leading-7 text-white/85">{l("Isi formulir ini, dan tim kami akan menghubungi Anda via WhatsApp untuk sesi perkenalan singkat.", "Fill in this form and our team will reach you on WhatsApp for a short intro call.")}</p>
            <ul className="mt-8 space-y-3 text-sm font-semibold">
              {[l("Gratis, tanpa biaya pendaftaran", "Free, no sign-up fee"), l("Tanpa target atau kewajiban", "No targets or obligations"), l("Dihubungi dalam 1–2 hari kerja", "Contacted within 1–2 working days")].map((text) => (
                <li key={text} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/20"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>{text}</li>
              ))}
            </ul>
            <Link href={`${wa}?text=${encodeURIComponent("Halo Jodohmu, saya tertarik menjadi Mitra Jodohmu.")}`} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 hover:underline">
              <MessageCircle className="h-4 w-4" />{l("Lebih suka chat langsung? WhatsApp kami", "Prefer to chat? WhatsApp us")}
            </Link>
          </div>

          <div className="p-8 sm:p-10">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e9f8f1] text-[#18a56d]"><Check className="h-8 w-8" strokeWidth={3} /></span>
                <h3 className="mt-6 font-serif text-3xl font-bold text-[#10275b]">{l("Terima kasih!", "Thank you!")}</h3>
                <p className="mt-3 max-w-sm leading-7 text-[#65718a]">{l("Pendaftaran Anda sudah kami terima. Tim kami akan menghubungi Anda via WhatsApp dalam 1–2 hari kerja.", "We've received your application. Our team will reach you on WhatsApp within 1–2 working days.")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="mitra-name" className={label}>{l("Nama lengkap", "Full name")}</label>
                    <Input id="mitra-name" {...register("name")} placeholder={l("Nama Anda", "Your name")} className={field} />
                    {errors.name && <p className={error}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="mitra-phone" className={label}>{l("Nomor WhatsApp", "WhatsApp number")}</label>
                    <Input id="mitra-phone" type="tel" inputMode="tel" {...register("phone")} placeholder="+62 812 3456 7890" className={field} />
                    {errors.phone && <p className={error}>{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="mitra-city" className={label}>{l("Kota", "City")}</label>
                    <Input id="mitra-city" {...register("city")} placeholder={l("cth. Surabaya", "e.g. Surabaya")} className={field} />
                    {errors.city && <p className={error}>{errors.city.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="mitra-org" className={label}>
                      {l("Organisasi / usaha", "Organization / business")} <span className="font-medium text-[#9aa5bb]">({l("opsional", "optional")})</span>
                    </label>
                    <Input id="mitra-org" {...register("organization")} placeholder={l("cth. Komunitas, WO, masjid, gereja", "e.g. community, WO, mosque, church")} className={field} />
                  </div>
                </div>

                <fieldset>
                  <legend className={label}>{l("Anda mendaftar sebagai", "You are applying as")}</legend>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {partnerTypes.map(({ value, Icon, ...copy }) => {
                      const active = selectedType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setValue("partnerType", value, { shouldValidate: true })}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${active ? "border-[#d52e62] bg-[#d52e62] text-white" : "border-[#dce5f2] bg-white text-[#3c4b6b] hover:border-[#d52e62]/40"}`}
                        >
                          <Icon className="h-4 w-4" />{pick(copy)[0]}
                        </button>
                      );
                    })}
                  </div>
                  {errors.partnerType && <p className={error}>{errors.partnerType.message}</p>}
                </fieldset>

                <fieldset>
                  <legend className={label}>{l("Bagaimana Anda ingin membantu?", "How would you like to help?")} <span className="font-medium text-[#9aa5bb]">({l("boleh lebih dari satu", "choose any")})</span></legend>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {contributions.map(({ value, Icon, ...copy }) => {
                      const active = selectedRoles.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleRole(value)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${active ? "border-[#10275b] bg-[#10275b] text-white" : "border-[#dce5f2] bg-white text-[#3c4b6b] hover:border-[#10275b]/40"}`}
                        >
                          {active ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}{pick(copy)[0]}
                        </button>
                      );
                    })}
                  </div>
                  {errors.roles && <p className={error}>{errors.roles.message}</p>}
                </fieldset>

                <div>
                  <label htmlFor="mitra-network" className={label}>
                    {l("Ceritakan sedikit tentang jaringan Anda", "Tell us a little about your network")} <span className="font-medium text-[#9aa5bb]">({l("opsional", "optional")})</span>
                  </label>
                  <textarea
                    id="mitra-network"
                    {...register("network")}
                    rows={4}
                    placeholder={l("cth. Saya membina komunitas pemuda ±200 orang dan sering dimintai tolong mencarikan jodoh.", "e.g. I lead a youth community of ~200 people and am often asked to help find spouses.")}
                    className="w-full rounded-xl border border-[#dce5f2] bg-white px-3 py-3 text-sm text-[#152852] placeholder:text-[#9aa5bb] focus:outline-none focus:ring-2 focus:ring-[#d52e62]/30"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f6f8fd] p-4 text-sm leading-6 text-[#53617d]">
                  <input type="checkbox" {...register("agreed")} className="mt-1 h-4 w-4 shrink-0 accent-[#d52e62]" />
                  <span>{l("Saya memahami dan menyetujui kode etik mitra Jodohmu, termasuk hanya merekomendasikan orang yang sudah setuju untuk dihubungi.", "I understand and agree to the Jodohmu partner code of conduct, including only referring people who have agreed to be contacted.")}</span>
                </label>
                {errors.agreed && <p className={error}>{errors.agreed.message}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#10275b] py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-[#1b438b] disabled:opacity-70"
                >
                  {isSubmitting ? l("Mengirim…", "Sending…") : <>{l("Kirim pendaftaran", "Send application")} <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mt-24 max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">{l("Pertanyaan umum", "Common questions")}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-[#10275b]">{l("Yang sering ditanyakan calon mitra", "What prospective partners ask")}</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((item, index) => {
            const [question, answer] = pick(item);
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`overflow-hidden rounded-2xl border bg-white transition ${isOpen ? "border-[#d52e62]/35 shadow-lg" : "border-[#dce5f2]"}`}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                  <span className="font-bold text-[#10275b]">{question}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d7e2f5] text-[#173b81] transition ${isOpen ? "rotate-45 bg-[#fff0f5]" : ""}`}><Plus className="h-4 w-4" /></span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm leading-7 text-[#65718a]">{answer}</p>}
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-sm text-[#65718a]">
          {l("Tertarik bergabung sebagai tim internal?", "Interested in joining the team instead?")}{" "}
          <Link href="/careers" className="font-bold text-[#d52e62] hover:underline">{l("Lihat karier di Jodohmu", "See careers at Jodohmu")}</Link>
        </p>
      </section>
    </main>
  );
}
