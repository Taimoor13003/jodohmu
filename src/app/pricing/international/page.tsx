import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "International Packages | Jodohmu",
  description:
    "Jodohmu's international matchmaking service for those outside Indonesia seeking a verified Indonesian spouse — conducted with dignity, full facilitation, and serious intent.",
};

const whatsappHref =
  "https://wa.me/6281122210303?text=" +
  encodeURIComponent(
    "Hello, I'm interested in Jodohmu's international matchmaking service. Could you please share more details?"
  );

const safar = [
  "Profile built, verified & locked by our team",
  "Passport, employment & social media verification",
  "Video call verification with family member",
  "Clinical psychology assessment",
  "3 supervised online ta'aruf sessions",
  "Matched with verified Indonesian candidates",
  "In-person meeting in Indonesia arranged upon match",
  "Contact details exchanged only after Indonesia visit",
];

const amanah = [
  "Everything in Safar",
  "10 supervised online ta'aruf sessions",
  "2 clinical psychology sessions",
  "Deep background check including references",
  "Priority matching",
  "Dedicated personal facilitator throughout",
];

const steps = [
  {
    num: "01",
    title: "Apply",
    desc: "Fill out our intake form and complete your full package payment to begin your journey.",
  },
  {
    num: "02",
    title: "Verify",
    desc: "We verify your documents, conduct a video call with a family member, and complete a psychology assessment.",
  },
  {
    num: "03",
    title: "Match",
    desc: "Our team builds your profile and presents verified Indonesian candidates suited to you.",
  },
  {
    num: "04",
    title: "Ta'aruf",
    desc: "Online facilitated sessions via video call — a facilitator is present at every meeting.",
  },
  {
    num: "05",
    title: "Meet in Indonesia",
    desc: "When both parties are ready, we arrange an in-person meeting in Indonesia. This is where your story truly begins — and where we ensure everything is handled with the care it deserves.",
  },
];

const trust = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2l7 4v6c0 4.4-3.1 8.5-7 9.9C8.1 20.5 5 16.4 5 12V6l7-4z" />
      </svg>
    ),
    title: "Structured & Dignified",
    desc: "Every step — from first contact to in-person meeting — is conducted with a facilitator present. No unsupervised contact. No casual exchanges. Dignity is built into the process.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-1a8 8 0 0116 0v1" />
      </svg>
    ),
    title: "Human-Led, Not Algorithmic",
    desc: "Your case is handled by a real person who knows the Indonesian community deeply — not a swipe-based app. We invest real time into your journey.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
      </svg>
    ),
    title: "Rigorous Verification",
    desc: "Every Indonesian candidate on our platform is screened, ID-verified, and vetted for serious intent. You will never be matched with someone we haven't personally assessed.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M3 12h18M12 3l9 9-9 9" />
      </svg>
    ),
    title: "End-to-End Support",
    desc: "From your first message to meeting in Indonesia, we are alongside you — coordinating logistics, translating cultural nuances, and keeping the process dignified.",
  },
];

const faqs = [
  {
    q: "Do I need to speak Bahasa Indonesia?",
    a: "Not at all. We're here to bridge every gap — language included. We communicate in English, Arabic, and Bahasa Indonesia, and will do our best to accommodate you in other languages too. Just reach out and we'll make it work.",
  },
  {
    q: "Why must I visit Indonesia before exchanging contact details?",
    a: "This protects both parties. We verify identity and seriousness in person before any direct contact is made. It ensures every introduction is dignified and safe.",
  },
  {
    q: "What happens if my package window expires before a match is found?",
    a: "We work hard to find your match well within your window insha Allah. If genuine circumstances arise, please reach out to us — we review every situation with care and understanding.",
  },
  {
    q: "Can I do everything remotely without visiting Indonesia?",
    a: "The online verification, psychology assessment, and ta'aruf sessions are all remote. The in-person Indonesia visit is only required when both parties wish to proceed after ta'aruf — it is not required upfront.",
  },
  {
    q: "Are the Indonesian candidates aware they may be matched with someone from abroad?",
    a: "Yes. Every candidate in our pool has confirmed they are open to an international match before any introduction is made.",
  },
  {
    q: "What countries do you accept international clients from?",
    a: "We accept serious clients from any country worldwide. There are no geographic restrictions.",
  },
];

export default function InternationalPricingPage() {
  return (
    <div className="pb-24">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0b1535] py-24">
        {/* Subtle pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Pink glow */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-[#e8147a]/10 blur-[120px]" />

        <div className="container relative max-w-4xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8147a]/40 bg-[#e8147a]/10 px-5 py-2 text-sm font-semibold text-[#f080b0]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10 3.22l-.61 2.034A9 9 0 006 6.22l-2.034-.61-.61 2.034 1.63 1.224a9.043 9.043 0 000 2.264L3.356 12.356l.61 2.034L6 13.78a9 9 0 003.39 1.566l.61 2.034h2l.61-2.034A9 9 0 0016 13.78l2.034.61.61-2.034-1.63-1.224a9.043 9.043 0 000-2.264l1.63-1.224-.61-2.034L16 6.22a9 9 0 00-3.39-1.566L12 2.61l-2 .61z" />
            </svg>
            International Matchmaking
          </span>

          <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl">
            Seeking an Indonesian Spouse —{" "}
            <span className="italic text-[#e8147a]">Done Right.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            You are serious about marriage. You want someone genuine,
            family-involved, and committed to building something real — not a
            profile to swipe past, not a casual connection. You want to do this
            the right way.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-white/70">
            Jodohmu&apos;s international service was built for exactly this. Not a
            dating app. Not a listing site. A fully facilitated, human-led
            journey — from first introduction to meeting in Indonesia.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#e8147a] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#c90f68]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.856L.057 23.625a.75.75 0 00.918.919l5.85-1.48A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.717 9.717 0 01-4.953-1.354l-.355-.211-3.682.931.978-3.591-.232-.371A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              Enquire on WhatsApp
            </a>
            <a
              href="#packages"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
            >
              View Packages
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── IMPORTANT POLICIES ── */}
      <section className="border-b border-[#e8147a]/20 bg-[#fdf0f6] py-8">
        <div className="container max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "✈️", text: "When both hearts are ready, we arrange a beautiful first meeting in Indonesia" },
              { icon: "🎥", text: "All ta'aruf sessions are online via video call with a facilitator present" },
              { icon: "💳", text: "Your journey begins with a single step — full package payment confirms your place" },
              { icon: "📅", text: "Every service is delivered with full care within your package window — we give our best from day one" },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
                <span className="text-2xl">{p.icon}</span>
                <p className="text-sm leading-snug text-[#3d2a3a]">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-bold text-[#0b1535] sm:text-5xl">
              How It Works
            </h2>
            <div className="my-4 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#e8147a]/40" />
              <svg viewBox="0 0 20 18" fill="none" stroke="#e8147a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M10 17S1 11 1 5.5A4.5 4.5 0 0110 2a4.5 4.5 0 019 3.5C19 11 10 17 10 17z" />
              </svg>
              <span className="h-px w-14 bg-[#e8147a]/40" />
            </div>
            <p className="mx-auto max-w-xl text-base text-[#5a4a5a]">
              A clear, structured journey designed to protect both parties and
              honour the seriousness of your intention.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[28px] top-10 hidden h-[calc(100%-80px)] w-px bg-gradient-to-b from-[#e8147a]/60 to-[#1630a0]/30 lg:left-1/2 lg:block" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 lg:items-center ${
                    i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Number bubble */}
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8147a] font-serif text-lg font-bold text-white shadow-lg lg:mx-auto">
                    {step.num}
                  </div>
                  {/* Content */}
                  <div className={`flex-1 rounded-2xl border border-[#e8d0e0] bg-white px-6 py-5 shadow-sm lg:max-w-[calc(50%-48px)] ${i % 2 !== 0 ? "lg:text-right" : ""}`}>
                    <h3 className="font-serif text-xl font-bold text-[#0b1535]">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#5a4a5a]">{step.desc}</p>
                  </div>
                  {/* Spacer for opposite side on desktop */}
                  <div className="hidden lg:block lg:flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" className="bg-[#0b1535] py-24">
        <div className="container max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl">
              Choose Your Package
            </h2>
            <div className="my-4 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#e8147a]/50" />
              <svg viewBox="0 0 20 18" fill="none" stroke="#e8147a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M10 17S1 11 1 5.5A4.5 4.5 0 0110 2a4.5 4.5 0 019 3.5C19 11 10 17 10 17z" />
              </svg>
              <span className="h-px w-14 bg-[#e8147a]/50" />
            </div>
            <p className="mx-auto max-w-xl text-base text-white/60">
              To begin your journey, full payment is made upfront. From that moment, our team is fully dedicated to you.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* SAFAR */}
            <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#e8147a]">The Journey</p>
                  <h3 className="mt-1 font-serif text-3xl font-bold text-white">Safar</h3>
                  <p className="mt-1 text-sm italic text-white/50">3-month window</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-4xl font-extrabold text-[#e8147a]">$1,200</p>
                </div>
              </div>

              <div className="mb-8 h-px bg-white/10" />

              <ul className="flex-1 space-y-3">
                {safar.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="#e8147a" strokeWidth="1.4" />
                      <path d="M7.5 12l3 3 5-5" stroke="#e8147a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm leading-relaxed text-white/80">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-center gap-2 rounded-full border border-[#e8147a] bg-transparent px-6 py-4 text-base font-bold text-[#e8147a] transition hover:bg-[#e8147a] hover:text-white"
              >
                Enquire about Safar
              </a>
            </div>

            {/* AMANAH */}
            <div className="relative flex flex-col overflow-hidden rounded-3xl bg-[#e8147a] p-8 shadow-2xl shadow-[#e8147a]/30">
              {/* Popular badge */}
              <div className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#e8147a]">
                Most Complete
              </div>

              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">The Trust</p>
                  <h3 className="mt-1 font-serif text-3xl font-bold text-white">Amanah</h3>
                  <p className="mt-1 text-sm italic text-white/60">6-month window</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-4xl font-extrabold text-white">$3,000</p>
                </div>
              </div>

              <div className="mb-8 h-px bg-white/20" />

              <ul className="flex-1 space-y-3">
                {amanah.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.4" />
                      <path d="M7.5 12l3 3 5-5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm leading-relaxed text-white/90">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-bold text-[#e8147a] transition hover:bg-white/90"
              >
                Enquire about Amanah
              </a>
            </div>
          </div>

          {/* Assessment fee note */}
          <p className="mt-8 text-center text-sm text-white/40">
            Not sure which package is right for you? Message us on WhatsApp — we&apos;re happy to help you decide.
          </p>
        </div>
      </section>

      {/* ── WHY JODOHMU INTERNATIONAL ── */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-bold text-[#0b1535] sm:text-5xl">
              Why Jodohmu?
            </h2>
            <div className="my-4 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#e8147a]/40" />
              <svg viewBox="0 0 20 18" fill="none" stroke="#e8147a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M10 17S1 11 1 5.5A4.5 4.5 0 0110 2a4.5 4.5 0 019 3.5C19 11 10 17 10 17z" />
              </svg>
              <span className="h-px w-14 bg-[#e8147a]/40" />
            </div>
            <p className="mx-auto max-w-xl text-base text-[#5a4a5a]">
              We are not a platform. We are a team that takes personal
              responsibility for your journey.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {trust.map((t, i) => (
              <div key={i} className="flex items-start gap-5 rounded-2xl border border-[#eee0ea] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fce8f3] text-[#e8147a]">
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0b1535]">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5a4a5a]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#fdf0f6] py-20">
        <div className="container max-w-3xl">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-bold text-[#0b1535] sm:text-5xl">
              Common Questions
            </h2>
            <div className="my-4 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#e8147a]/40" />
              <svg viewBox="0 0 20 18" fill="none" stroke="#e8147a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M10 17S1 11 1 5.5A4.5 4.5 0 0110 2a4.5 4.5 0 019 3.5C19 11 10 17 10 17z" />
              </svg>
              <span className="h-px w-14 bg-[#e8147a]/40" />
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-[#ecd8e8] bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5">
                  <span className="font-serif text-base font-bold text-[#0b1535]">{faq.q}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#e8147a] transition-transform group-open:rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed text-[#5a4a5a]">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24">
        <div className="container max-w-3xl text-center">
          <h2 className="font-serif text-4xl font-bold text-[#0b1535] sm:text-5xl">
            Ready to Begin?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-[#5a4a5a]">
            Send us a message on WhatsApp. Tell us a little about yourself and
            what you are looking for. No pressure, no rush — just an honest conversation about your hopes and what you&apos;re looking for.
          </p>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#e8147a] px-10 py-5 text-lg font-bold text-white shadow-xl shadow-[#e8147a]/30 transition hover:bg-[#c90f68]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.856L.057 23.625a.75.75 0 00.918.919l5.85-1.48A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.717 9.717 0 01-4.953-1.354l-.355-.211-3.682.931.978-3.591-.232-.371A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
            </svg>
            Message Us on WhatsApp
          </a>

          <p className="mt-5 text-sm text-[#8a7a8a]">
            We typically respond within a few hours. All enquiries are treated with full confidentiality.
          </p>
        </div>
      </section>

      {/* ── BACK LINK ── */}
      <div className="container pb-4 text-center">
        <Link
          href="/pricing"
          className="text-sm text-[#8a7a8a] underline underline-offset-4 hover:text-[#e8147a]"
        >
          ← Back to main pricing page
        </Link>
      </div>
    </div>
  );
}
