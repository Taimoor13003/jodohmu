"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Expand, Languages } from "lucide-react";

type Lang = "id" | "en";

const COPY = {
  en: {
    tagline: "Jodohmu · Discovery conversation",
    langLabel: "Select language",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    navHint: "Use ← → keys or swipe to navigate",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    goToSlide: (n: number) => `Go to slide ${n}`,
    greeting: "A private conversation with Dokcin",
    welcome: {
      headA: "Let's get to know ",
      headB: "you.",
      sub: "This isn't an interview, and there's no right answer to give. We simply want to understand who you are, before we ever introduce you to anyone.",
      tags: ["No pressure", "Nothing here is judged", "Everything stays confidential"],
    },
    story: {
      eyebrow: "Getting to Know You",
      head: "Who you are — and who you're hoping to find.",
      aboutTitle: "About you",
      about: ["Your background & daily life", "The values that matter most to you", "What people who know you well would say about you"],
      lookingTitle: "What you're looking for",
      looking: ["The qualities you hope for in a partner", "The kind of marriage and family life you're picturing", "What's felt missing from past attempts, if any"],
    },
    close: {
      eyebrow: "Thank You",
      headA: "Thank you for trusting ",
      headB: "Jodohmu.",
      para: "We will try our best to find your life partner.",
    },
  },
  id: {
    tagline: "Jodohmu · Percakapan penjajakan",
    langLabel: "Pilih bahasa",
    fullscreen: "Layar penuh",
    exitFullscreen: "Keluar layar penuh",
    navHint: "Gunakan tombol ← → atau geser untuk berpindah",
    prevSlide: "Slide sebelumnya",
    nextSlide: "Slide berikutnya",
    goToSlide: (n: number) => `Ke slide ${n}`,
    greeting: "Percakapan pribadi bersama Dokcin",
    welcome: {
      headA: "Mari kita ",
      headB: "saling mengenal.",
      sub: "Ini bukan wawancara, dan tidak ada jawaban yang benar atau salah. Kami hanya ingin memahami siapa Anda, sebelum kami memperkenalkan Anda kepada siapa pun.",
      tags: ["Tanpa tekanan", "Tidak ada yang dinilai di sini", "Semuanya tetap rahasia"],
    },
    story: {
      eyebrow: "Mengenal Anda Lebih Dekat",
      head: "Siapa Anda — dan siapa yang Anda harapkan.",
      aboutTitle: "Tentang Anda",
      about: ["Latar belakang & keseharian Anda", "Nilai-nilai yang paling penting bagi Anda", "Apa yang akan dikatakan orang-orang terdekat tentang Anda"],
      lookingTitle: "Yang Anda cari",
      looking: ["Kualitas yang Anda harapkan dari seorang pasangan", "Pernikahan dan kehidupan keluarga seperti apa yang Anda bayangkan", "Apa yang selama ini terasa kurang, jika ada"],
    },
    close: {
      eyebrow: "Terima Kasih",
      headA: "Terima kasih telah mempercayai ",
      headB: "Jodohmu.",
      para: "Kami akan berusaha sebaik mungkin untuk menemukan pasangan hidup Anda.",
    },
  },
};

type Copy = (typeof COPY)["en"];

export function DiscoveryPresentation() {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];
  const [slide, setSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const slides = useMemo(
    () => [
      <WelcomeSlide key="welcome" t={t} />,
      <StorySlide key="story" t={t} />,
      <CloseSlide key="close" t={t} />,
    ],
    [t]
  );

  const go = useCallback((next: number) => setSlide(Math.min(Math.max(next, 0), slides.length - 1)), [slides.length]);
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) await deckRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " ", "Enter"].includes(event.key)) {
        event.preventDefault();
        go(slide + 1);
      }
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        go(slide - 1);
      }
      if (event.key === "f" || event.key === "F") void toggleFullscreen();
      if (event.key === "Escape" && document.fullscreenElement) void document.exitFullscreen();
    };
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [go, slide, toggleFullscreen]);

  return (
    <div
      ref={deckRef}
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#101d3b] font-sans text-white"
      onTouchStart={(e) => { touchStart.current = e.changedTouches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const distance = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(distance) > 50) go(slide + (distance < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(216,91,135,.26),transparent_25%),radial-gradient(circle_at_85%_82%,rgba(214,172,87,.2),transparent_26%)]" />
      <div className="relative flex h-full flex-col">
        <header className="z-20 flex items-center justify-between px-6 py-5 sm:px-10">
          <Image src="/jodohmu-logo.png" alt="Jodohmu" width={45} height={45} className="h-10 w-10 object-contain brightness-0 invert" priority />
          <p className="hidden text-xs font-bold uppercase tracking-[.24em] text-white/55 sm:block">{t.tagline}</p>
          <div className="flex gap-2">
            <div role="group" aria-label={t.langLabel} className="inline-flex items-center gap-1 rounded-full border border-white/20 py-1 pl-2.5 pr-1 text-xs font-semibold">
              <Languages className="mr-1 h-4 w-4 text-white/55" />
              {(["id", "en"] as const).map((code) => (
                <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code} className={`rounded-full px-2.5 py-1 transition ${lang === code ? "bg-white text-[#17213d]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => void toggleFullscreen()} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white" aria-label="Toggle full screen">
              <Expand className="h-4 w-4" />
              <span className="hidden sm:inline">{isFullscreen ? t.exitFullscreen : t.fullscreen}</span>
            </button>
          </div>
        </header>

        <div className="relative flex flex-1 items-center overflow-hidden">
          <div className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {slides.map((content, index) => (
              <section key={index} aria-hidden={slide !== index} className="flex h-full w-full shrink-0 items-center justify-center px-7 pb-20 pt-2 sm:px-16 lg:px-24">
                {content}
              </section>
            ))}
          </div>
        </div>

        <footer className="z-20 flex items-center justify-between px-6 pb-6 sm:px-10 sm:pb-8">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button aria-label={t.goToSlide(index + 1)} onClick={() => go(index)} key={index} className={`h-1.5 rounded-full transition-all ${index === slide ? "w-8 bg-[#e6bd69]" : "w-1.5 bg-white/30 hover:bg-white/60"}`} />
            ))}
          </div>
          <p className="hidden text-xs text-white/45 sm:block">{t.navHint}</p>
          <div className="flex gap-2">
            <button onClick={() => go(slide - 1)} disabled={slide === 0} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label={t.prevSlide}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => go(slide + 1)} disabled={slide === slides.length - 1} className="grid h-10 w-10 place-items-center rounded-full bg-[#d85b87] text-white transition hover:bg-[#c44874] disabled:cursor-not-allowed disabled:opacity-40" aria-label={t.nextSlide}>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function WelcomeSlide({ t }: { t: Copy }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{t.greeting}</p>
      <h1 className="mx-auto mt-8 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
        {t.welcome.headA}
        <span className="italic text-[#ef91b1]">{t.welcome.headB}</span>
      </h1>
      <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-white/70">{t.welcome.sub}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {t.welcome.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/20 bg-white/[.06] px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-white/70">{tag}</span>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <ChevronDown className="h-6 w-6 animate-bounce text-[#e6bd69]" />
      </div>
    </div>
  );
}

function StorySlide({ t }: { t: Copy }) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{t.story.eyebrow}</p>
      <h2 className="mt-3 text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{t.story.head}</h2>
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/15 bg-white/[.07] p-7">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e6bd69]">{t.story.aboutTitle}</p>
          <ul className="mt-4 space-y-3">
            {t.story.about.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-white/85">
                <span className="mt-0.5 font-serif text-lg italic text-[#e6bd69]">0{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white/[.07] p-7">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#ef91b1]">{t.story.lookingTitle}</p>
          <ul className="mt-4 space-y-3">
            {t.story.looking.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-white/85">
                <span className="mt-0.5 font-serif text-lg italic text-[#ef91b1]">0{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CloseSlide({ t }: { t: Copy }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{t.close.eyebrow}</p>
      <h2 className="mx-auto mt-8 max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
        {t.close.headA}
        <span className="italic text-[#ef91b1]">{t.close.headB}</span>
      </h2>
      <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-white/70">{t.close.para}</p>
    </div>
  );
}
