"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Presentation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function PresentationsPage() {
  const { lang } = useLanguage();
  const id = lang === "id";

  return (
    <div className="min-h-[70vh] overflow-hidden bg-[#f8faff]">
      <section className="relative isolate overflow-hidden bg-[#10275b] py-16 text-white sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(235,83,132,.48),transparent_28%),radial-gradient(circle_at_88%_80%,rgba(74,133,232,.4),transparent_34%)]" />
        <div className="container max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em]">
            <Presentation className="h-4 w-4 text-[#ffb8d0]" />
            {id ? "Jodohmu" : "Jodohmu"}
          </span>
          <h1 className="mt-7 max-w-3xl font-serif text-5xl font-bold leading-[.98] tracking-[-.045em] sm:text-6xl">
            {id ? "Presentasi kami" : "Our presentations"}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            {id
              ? "Pelajari bagaimana Jodohmu mendampingi perjalanan menuju pernikahan yang serius, aman, dan penuh perhatian."
              : "Explore how Jodohmu supports a serious, safe, and thoughtful journey toward marriage."}
          </p>
        </div>
      </section>

      <section className="container max-w-6xl py-16 sm:py-20">
        <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">
          {id ? "Tersedia sekarang" : "Available now"}
        </p>
        <h2 className="mt-3 font-serif text-4xl font-bold text-[#10275b] sm:text-5xl">
          {id ? "Pilih presentasi" : "Choose a presentation"}
        </h2>
        <div className="mt-9 grid max-w-md gap-6">
          <Link
            href="/presentations/foreign"
            className="group overflow-hidden rounded-[2rem] border border-[#dce5f5] bg-white shadow-[0_12px_35px_rgba(24,51,111,.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(24,51,111,.16)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#10275b]">
              <Image
                src="/presentations-foreign-journey.png"
                alt="A couple beginning their international marriage journey with Jodohmu"
                fill
                sizes="(max-width: 640px) 100vw, 420px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10275b]/65 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#173b81]">
                {id ? "Internasional" : "International"}
              </span>
            </div>
            <div className="p-6 sm:p-7">
              <h3 className="font-serif text-2xl font-bold text-[#10275b]">
                {id ? "Perjalanan Jodohmu untuk Warga Negara Asing" : "Your Jodohmu International Journey"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#65718a]">
                {id
                  ? "Kenali proses perjodohan internasional Jodohmu yang terarah, terverifikasi, dan menghormati keluarga."
                  : "Discover Jodohmu’s guided, verified, and family-respectful international matchmaking process."}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#c62d5c]">
                {id ? "Lihat presentasi" : "View presentation"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
