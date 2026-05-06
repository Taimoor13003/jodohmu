'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const whatsappBase = "https://wa.me/6281122210303";

type Tag = { label: string; color: "green" | "red" | "blue" | "amber" };

type Job = {
  number: string;
  title: string;
  subtitle: string;
  tags: Tag[];
  waLink: string;
  descEn: string;
  descId: string;
  whatYouDo: string[];
  whatYouGet: string[];
  whoYouAre: string[];
};

const jobs: Job[] = [
  {
    number: "01",
    title: "Appointment Setter",
    subtitle: "Pencari Klien & Penjadwal Konsultasi",
    tags: [
      { label: "Remote", color: "green" },
      { label: "Commission Only", color: "red" },
    ],
    waLink: `${whatsappBase}?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20posisi%20Appointment%20Setter%20di%20Jodohmu`,
    descEn:
      "You reach out to potential clients — through your network, social media, or community — and invite them to a free consultation with our team. Once they show up and qualify as a genuine lead, you earn. Simple, remote, and entirely flexible.",
    descId:
      "Anda menjangkau calon klien melalui jaringan, media sosial, atau komunitas, lalu mengundang mereka ke konsultasi gratis bersama tim kami. Setiap klien yang hadir dan memenuhi syarat, Anda dapat komisi.",
    whatYouDo: [
      "Reach out to potential clients via WhatsApp, Instagram, or community groups",
      "Have warm friendly conversations to understand their interest",
      "Book them in for a free consultation with our team",
      "Confirm their appointment and ensure they show up",
      "Our team handles everything after",
    ],
    whatYouGet: [
      "Rp 40,000 per confirmed consultation that shows up",
      "Fully remote — work from anywhere, any time",
      "No targets, no pressure",
      "Weekly payout",
      "Potential Rp 1–6 juta per month depending on effort",
    ],
    whoYouAre: [
      "Friendly, warm, and trusted in your community",
      "Active on WhatsApp or social media",
      "Self-motivated",
      "Muslim, understands the value of halal matchmaking",
      "Any location in Indonesia — fully remote",
    ],
  },
  {
    number: "02",
    title: "Sales Consultant",
    subtitle: "Konsultan Penjualan & Penutup Klien",
    tags: [
      { label: "Remote / Hybrid", color: "blue" },
      { label: "Commission Only", color: "red" },
    ],
    waLink: `${whatsappBase}?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20posisi%20Sales%20Consultant%20di%20Jodohmu`,
    descEn:
      "You meet with potential clients — in person or via call — explain our service, understand their needs, and guide them to register. You are the bridge between a curious lead and a committed client. High commission, no cap.",
    descId:
      "Anda bertemu calon klien secara langsung atau via call, menjelaskan layanan kami, memahami kebutuhan mereka, dan membimbing mereka untuk mendaftar. Komisi tinggi, tidak ada batas penghasilan.",
    whatYouDo: [
      "Conduct free consultation meetings with warm leads",
      "Listen deeply to understand their situation and goals",
      "Present the right Jodohmu package for their needs",
      "Handle objections with empathy and honesty",
      "Guide clients to register and make their first payment",
    ],
    whatYouGet: [
      "10–15% commission per client registered",
      "Pearl package (Rp 2,5 jt) → Rp 250–375k per close",
      "Ruby package (Rp 5 jt) → Rp 500–750k per close",
      "Diamond package (Rp 40 jt) → Rp 4–6 juta per close",
      "No base salary — no ceiling on earnings",
    ],
    whoYouAre: [
      "Confident, warm, and genuinely empathetic",
      "Experience in sales, counseling, or client-facing roles",
      "Understands Islamic marriage values deeply",
      "Can speak with both men and women professionally",
      "Based in Bandung or willing to meet clients there",
    ],
  },
  {
    number: "03",
    title: "Operations Assistant",
    subtitle: "Asisten Operasional & Penanganan Klien",
    tags: [
      { label: "Bandung", color: "blue" },
      { label: "Part-time → Full-time", color: "amber" },
    ],
    waLink: `${whatsappBase}?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20posisi%20Operations%20Assistant%20di%20Jodohmu`,
    descEn:
      "This is our core team role. You handle WhatsApp communication with registered clients, assist in the matching process, manage our client database, and create daily social media content. Starting part-time — becomes full-time onsite within 3 months as the business grows.",
    descId:
      "Ini adalah peran inti tim kami. Anda menangani komunikasi WhatsApp dengan klien terdaftar, membantu proses pencocokan, mengelola database klien, dan membuat konten media sosial harian. Dimulai part-time — menjadi full-time onsite dalam 3 bulan.",
    whatYouDo: [
      "Handle WhatsApp communication with registered clients",
      "Assist in curating and proposing match candidates",
      "Manage and update client database daily",
      "Create and post social media content (scripts provided)",
      "Coordinate ta'aruf meeting schedules",
      "Assist founder in day-to-day operations",
    ],
    whatYouGet: [
      "Rp 1.6–2 juta per month part-time to start",
      "Full-time salary reviewed at 3 months based on performance",
      "Commission per client successfully matched",
      "Flexible part-time hours initially",
      "Be part of building something meaningful from the ground up",
    ],
    whoYouAre: [
      "Muslim woman, based in Bandung — required",
      "Warm, empathetic, and deeply trustworthy",
      "Comfortable with technology — WhatsApp, Instagram, Google Sheets",
      "Functional English to communicate with founder",
      "Understands Islamic marriage values and ta'aruf process",
      "Ideally married — understands the journey personally",
    ],
  },
];

const tagColors: Record<Tag["color"], string> = {
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-[#0b3a86]",
  amber: "bg-amber-100 text-amber-700",
};

const values = [
  {
    num: "01",
    title: "Mission-driven work",
    text: "Every client who finds their spouse through Jodohmu is a life changed. Your work here has meaning beyond a paycheck.",
  },
  {
    num: "02",
    title: "Performance rewarded",
    text: "We believe in paying people for results. Our commission structure is transparent, fair, and designed to grow with you.",
  },
  {
    num: "03",
    title: "Room to grow",
    text: "We are early. The people who join now will shape how this company grows — and be rewarded for it.",
  },
];

export function CareersPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) =>
    setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="pb-24">

      {/* ══════════════
          HERO
      ══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7ecf4] via-white to-[#e7f0ff] pt-16 pb-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#9B2242]/8 blur-3xl" />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#0b3a86]/8 blur-3xl" />
        </div>
        <div className="container relative max-w-4xl">
          <span className="inline-flex items-center rounded-full border border-[#9B2242]/20 bg-[#9B2242]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#9B2242]">
            Careers at Jodohmu · Bandung, Indonesia
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tighter text-[#0b3a86] sm:text-5xl md:text-6xl">
            Build something that matters.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#3d425a] sm:text-lg">
            We are growing a team of people who genuinely believe in helping
            Muslims find their life partner with dignity. Every role here has
            real impact on real people&apos;s lives.
          </p>
        </div>
      </section>

      {/* ══════════════════
          VALUES STRIP
      ══════════════════ */}
      <section className="border-y border-[#e6eaf5] bg-white py-12">
        <div className="container max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.num} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9B2242]">
                  {v.num}
                </p>
                <h3 className="font-serif text-lg font-bold text-[#0b3a86]">
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#4a4f63]">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════
          OPEN POSITIONS
      ══════════════════ */}
      <section className="container mt-16 max-w-3xl">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-[#0b3a86] sm:text-4xl">
            Open Positions
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#9B2242]">
            3 roles available
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? "border-[#0b3a86]/30 shadow-md"
                    : "border-[#e6eaf5] hover:border-[#0b3a86]/20 hover:shadow-sm"
                }`}
              >
                {/* Card header */}
                <button
                  className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="mt-0.5 shrink-0 text-xs font-bold uppercase tracking-widest text-[#9B2242]">
                    {job.number} / 03
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="text-base font-bold leading-snug text-[#0b3a86] sm:text-lg">
                      {job.title}
                    </p>
                    <p className="text-sm italic text-[#4a4f63]">
                      {job.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagColors[tag.color]}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[#0b3a86] transition-transform duration-200 ${
                      isOpen
                        ? "rotate-45 border-[#0b3a86]"
                        : "border-[#0b3a86]/30"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="space-y-6 border-t border-[#e6eaf5] px-5 pb-7 pt-6 sm:px-6">
                    <p className="text-sm leading-relaxed text-[#2d3150]">
                      {job.descEn}
                    </p>
                    <p className="text-sm italic leading-relaxed text-[#4a4f63]">
                      {job.descId}
                    </p>

                    <div className="grid gap-6 sm:grid-cols-3">
                      {/* What You Do */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
                          What You Do
                        </p>
                        <ul className="space-y-2">
                          {job.whatYouDo.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm leading-snug text-[#2d3150]"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9B2242]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What You Get */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
                          What You Get
                        </p>
                        <ul className="space-y-2">
                          {job.whatYouGet.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm leading-snug text-[#2d3150]"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Who You Are */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
                          Who You Are
                        </p>
                        <ul className="space-y-2">
                          {job.whoYouAre.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm leading-snug text-[#2d3150]"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b3a86]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="rounded-full bg-[#0b3a86] px-6 py-5 text-sm font-bold text-white hover:bg-[#0a357a]"
                    >
                      <Link
                        href={job.waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply via WhatsApp →
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
