'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Lead = {
  interest: string;
  name: string;
  phone: string;
  city: string;
  timeline: string;
  preferredCallTime: string;
};

const initialLead: Lead = { interest: "", name: "", phone: "", city: "", timeline: "", preferredCallTime: "" };

export function LeadChatbot() {
  const { lang } = useLanguage();
  const id = lang === "id";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [lead, setLead] = useState<Lead>(initialLead);
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const copy = id ? {
    title: "Tim Jodohmu", online: "Biasanya membalas dalam jam kerja",
    welcome: "Halo. Saya akan membantu tim Jodohmu memahami kebutuhan Anda.",
    purpose: "Apa yang ingin Anda ketahui hari ini?", name: "Boleh tahu nama Anda?",
    phone: "Nomor WhatsApp terbaik untuk menghubungi Anda?", city: "Anda tinggal di kota mana?",
    timeline: "Kapan Anda berharap menikah?", callTime: "Jika tim mengundang Anda untuk call, kapan waktu yang nyaman?",
    consent: "Dengan mengirim, Anda setuju Jodohmu menyimpan detail ini untuk menghubungi Anda.",
    submit: "Kirim detail", sending: "Mengirim...", error: "Belum berhasil disimpan. Coba lagi.",
    confirmation: "Terima kasih. Saya akan membagikan detail Anda kepada tim kami. Jika kebutuhan Anda sesuai dengan proses kami, kami mungkin mengundang Anda untuk call singkat guna menjelaskan langkah berikutnya.",
    close: "Tutup", placeholderName: "Nama Anda", placeholderPhone: "+62 ...", placeholderCity: "Contoh: Bandung",
    interests: ["Mencari pasangan", "Memahami Joble", "Melihat paket"],
    timelines: ["Dalam 3 bulan", "Dalam 6-12 bulan", "Masih ingin memahami proses"],
    callTimes: ["Pagi", "Siang", "Malam", "Hubungi saya dulu via WhatsApp"],
  } : {
    title: "Jodohmu Team", online: "Usually replies during working hours",
    welcome: "Hello. I will help the Jodohmu team understand what you need.",
    purpose: "What would you like to explore today?", name: "May I know your name?",
    phone: "What is the best WhatsApp number to reach you?", city: "Which city do you live in?",
    timeline: "When are you hoping to get married?", callTime: "If our team invites you to a call, what time feels comfortable?",
    consent: "By sending, you agree that Jodohmu may store these details to contact you.",
    submit: "Send details", sending: "Sending...", error: "We could not save this yet. Please try again.",
    confirmation: "Thank you. I will share your details with our team. If your needs fit our process, we may invite you to a short call to explain the next step.",
    close: "Close", placeholderName: "Your name", placeholderPhone: "+62 ...", placeholderCity: "Example: Bandung",
    interests: ["Find a partner", "Understand Joble", "See packages"],
    timelines: ["Within 3 months", "Within 6-12 months", "Still understanding the process"],
    callTimes: ["Morning", "Afternoon", "Evening", "Message me on WhatsApp first"],
  };

  const advance = (nextStep: number) => {
    setThinking(true);
    window.setTimeout(() => {
      setStep(nextStep);
      setThinking(false);
    }, 550);
  };

  const select = (field: keyof Lead, value: string, nextStep: number) => {
    setLead((current) => ({ ...current, [field]: value }));
    advance(nextStep);
  };

  const continueText = (event: FormEvent<HTMLFormElement>, field: "name" | "phone" | "city", nextStep: number) => {
    event.preventDefault();
    if (!lead[field].trim()) return;
    advance(nextStep);
  };

  const submit = async () => {
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/chat-leads", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead),
      });
      if (!response.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError(copy.error);
    } finally {
      setSending(false);
    }
  };

  const bubble = (text: string) => <p className="max-w-[86%] self-start rounded-2xl rounded-tl-sm bg-[#eef3fb] px-3.5 py-2.5 text-[13px] leading-5 text-[#2d416e]">{text}</p>;
  const reply = (text: string) => <p className="max-w-[86%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#cf3466] to-[#2862bf] px-3.5 py-2.5 text-[13px] leading-5 text-white">{text}</p>;
  const activeTextField = !submitted && !thinking && (
    step === 1 ? { field: "name" as const, nextStep: 2, placeholder: copy.placeholderName, type: "text" }
      : step === 2 ? { field: "phone" as const, nextStep: 3, placeholder: copy.placeholderPhone, type: "tel" }
        : step === 3 ? { field: "city" as const, nextStep: 4, placeholder: copy.placeholderCity, type: "text" }
          : null
  );

  return <>
    {open && <div className="fixed bottom-24 right-4 z-[70] flex h-[min(560px,calc(100vh-120px))] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-3xl border border-[#dbe5f5] bg-white shadow-[0_24px_70px_rgba(24,51,111,.25)]">
      <header className="flex items-center gap-3 bg-[linear-gradient(125deg,#c82f60,#2458b6)] px-4 py-3.5 text-white">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><MessageCircle className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{copy.title}</p><p className="text-[11px] text-white/75">{copy.online}</p></div>
        <button type="button" aria-label={copy.close} onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/15"><ChevronDown className="h-4 w-4" /></button>
      </header>
      <div className="flex-1 overflow-y-auto bg-[#fcfdff] p-4"><div className="flex min-h-full flex-col gap-3">
        {bubble(copy.welcome)}
        {submitted ? <>{bubble(copy.confirmation)}<Link href="/pricing" onClick={() => setOpen(false)} className="mt-2 self-start text-sm font-extrabold text-[#c52d5a] hover:underline">{id ? "Lihat paket Jodohmu" : "See Jodohmu packages"}</Link></> : <>
          {step >= 0 && bubble(copy.purpose)}
          {lead.interest ? reply(lead.interest) : <div className="flex flex-wrap gap-2">{copy.interests.map((item) => <button key={item} type="button" onClick={() => select("interest", item, 1)} className="rounded-full border border-[#d6e2f6] bg-white px-3 py-2 text-xs font-bold text-[#2855a9] hover:border-[#cf3466] hover:bg-[#fff4f7]">{item}</button>)}</div>}
          {thinking && <p className="self-start rounded-2xl rounded-tl-sm bg-[#eef3fb] px-3.5 py-2.5 text-xs font-semibold text-[#65779d]"><span className="mr-2 inline-flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c52d5a] [animation-delay:-.2s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c52d5a] [animation-delay:-.1s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c52d5a]" /></span>{id ? "Jodohmu sedang menyiapkan pertanyaan berikutnya" : "Jodohmu is preparing the next question"}</p>}
          {step >= 1 && <>{bubble(copy.name)}{lead.name ? reply(lead.name) : null}</>}
          {step >= 2 && <>{bubble(copy.phone)}{lead.phone ? reply(lead.phone) : null}</>}
          {step >= 3 && <>{bubble(copy.city)}{lead.city ? reply(lead.city) : null}</>}
          {step >= 4 && <>{bubble(copy.timeline)}{lead.timeline ? reply(lead.timeline) : <div className="flex flex-wrap gap-2">{copy.timelines.map((item) => <button key={item} type="button" onClick={() => select("timeline", item, 5)} className="rounded-full border border-[#d6e2f6] bg-white px-3 py-2 text-xs font-bold text-[#2855a9] hover:border-[#cf3466] hover:bg-[#fff4f7]">{item}</button>)}</div>}</>}
          {step >= 5 && <>{bubble(copy.callTime)}{lead.preferredCallTime ? <>{reply(lead.preferredCallTime)}<p className="mt-2 text-xs leading-5 text-[#77839b]">{copy.consent}</p>{error && <p className="text-xs font-bold text-[#c52d5a]">{error}</p>}<button type="button" onClick={submit} disabled={sending} className="mt-1 self-start rounded-full bg-gradient-to-r from-[#cf3466] to-[#2862bf] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60">{sending ? copy.sending : copy.submit}</button></> : <div className="flex flex-wrap gap-2">{copy.callTimes.map((item) => <button key={item} type="button" onClick={() => select("preferredCallTime", item, 6)} className="rounded-full border border-[#d6e2f6] bg-white px-3 py-2 text-xs font-bold text-[#2855a9] hover:border-[#cf3466] hover:bg-[#fff4f7]">{item}</button>)}</div>}</>}
        </>}
      </div></div>
      {activeTextField && <form onSubmit={(event) => continueText(event, activeTextField.field, activeTextField.nextStep)} className="flex gap-2 border-t border-[#dbe5f5] bg-white p-3">
        <input autoFocus type={activeTextField.type} value={lead[activeTextField.field]} onChange={(event) => setLead({ ...lead, [activeTextField.field]: event.target.value })} placeholder={activeTextField.placeholder} className="min-w-0 flex-1 rounded-xl border border-[#d6e2f6] bg-[#fcfdff] px-3 text-sm outline-none focus:border-[#cf3466]" />
        <button className="grid h-11 w-11 place-items-center rounded-xl bg-[#173b85] text-white"><Send className="h-4 w-4" /></button>
      </form>}
    </div>}
    <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? copy.close : copy.title} className="fixed bottom-5 right-5 z-[71] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#cf3466] to-[#2862bf] text-white shadow-[0_10px_30px_rgba(36,88,182,.38)] transition hover:scale-105">{open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}</button>
  </>;
}
