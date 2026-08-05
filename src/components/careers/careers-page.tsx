'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Check, HeartHandshake, MessageCircle, Plus, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const jobs = [
  { colors: ["bg-emerald-50 text-emerald-700", "bg-rose-50 text-rose-700"], name: "Appointment%20Setter", do: 5, get: 5, are: 5 },
  { colors: ["bg-blue-50 text-[#164494]", "bg-rose-50 text-rose-700"], name: "Sales%20Consultant", do: 5, get: 5, are: 5 },
  { colors: ["bg-blue-50 text-[#164494]", "bg-amber-50 text-amber-700"], name: "Operations%20Assistant", do: 6, get: 5, are: 6 },
];
const wa = "https://wa.me/6281122210303";

export function CareersPage() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(0);
  const l = (id: string, en: string) => lang === "id" ? id : en;
  const columns = (index: number, job: typeof jobs[number]) => [
    { label: t("careersPage.jobs.whatYouDo"), key: "do", count: job.do, color: "#d52e62" },
    { label: t("careersPage.jobs.whatYouGet"), key: "get", count: job.get, color: "#18a56d" },
    { label: t("careersPage.jobs.whoYouAre"), key: "are", count: job.are, color: "#245ec0" },
  ].map(({ label, key, count, color }) => <div key={key}><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#173b81]">{label}</p><ul className="mt-4 space-y-3">{Array.from({ length: count }, (_, item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#53617d]"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} strokeWidth={3} />{t(`careersPage.jobs.items.${index}.${key}.${item}`)}</li>)}</ul></div>);

  return <main className="overflow-hidden bg-[#fffdfd] pb-24 text-[#152852]">
    <section className="relative isolate overflow-hidden bg-[#10275b] py-16 text-white sm:py-24"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_8%,rgba(235,83,132,.48),transparent_30%),radial-gradient(circle_at_88%_78%,rgba(74,133,232,.42),transparent_33%)]" /><div className="container grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em]"><Sparkles className="h-3.5 w-3.5 text-[#ffb8d0]" />{t("careersPage.hero.eyebrow")}</span><h1 className="mt-7 max-w-3xl font-serif text-5xl font-bold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">{t("careersPage.hero.title")}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{t("careersPage.hero.subtitle")}</p><Button asChild className="mt-8 h-12 rounded-full bg-white px-6 font-extrabold text-[#13316c] hover:bg-[#fff1f5]"><Link href="#roles">{l("Lihat posisi terbuka", "Explore open roles")} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div><div className="grid grid-cols-3 gap-3 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">{[["03",l("Posisi","Roles")],["01",l("Misi","Mission")],["∞",l("Tumbuh","Growth")]].map(([n,label]) => <div key={label}><p className="font-serif text-4xl font-bold text-[#ffd5e3]">{n}</p><p className="mt-2 text-xs font-bold text-white/75">{label}</p></div>)}</div></div></section>
    <section className="relative z-10 -mt-7 px-4"><div className="container grid max-w-6xl gap-px overflow-hidden rounded-3xl border border-[#dde6f4] bg-[#dde6f4] shadow-xl md:grid-cols-3">{[HeartHandshake, Target, BriefcaseBusiness].map((Icon, index) => <div key={index} className="bg-white p-7"><Icon className="h-6 w-6 text-[#d52e62]" /><h2 className="mt-5 font-serif text-xl font-bold text-[#10275b]">{t(`careersPage.values.${index}.title`)}</h2><p className="mt-2 text-sm leading-6 text-[#65718a]">{t(`careersPage.values.${index}.text`)}</p></div>)}</div></section>
    <section id="roles" className="container mt-20 max-w-6xl scroll-mt-24"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d52e62]">{l("Bergabung dengan tim", "Join the team")}</p><h2 className="mt-3 font-serif text-4xl font-bold text-[#10275b] sm:text-5xl">{t("careersPage.jobs.title")}</h2><p className="mt-4 text-[#65718a]">{l("Pilih peran yang paling sesuai dengan cara Anda membangun dampak.", "Choose the role that best fits how you want to make an impact.")}</p><div className="mt-10 space-y-5">{jobs.map((job, index) => <article key={job.name} className={`overflow-hidden rounded-[1.75rem] border bg-white ${open === index ? "border-[#d52e62]/35 shadow-xl" : "border-[#dce5f2]"}`}><button className="grid w-full gap-5 p-6 text-left sm:grid-cols-[70px,1fr,40px] sm:items-center sm:p-8" onClick={() => setOpen(open === index ? -1 : index)}><span className="font-serif text-4xl font-bold text-[#d52e62]/30">0{index + 1}</span><div><h3 className="font-serif text-2xl font-bold text-[#10275b] sm:text-3xl">{t(`careersPage.jobs.items.${index}.title`)}</h3><p className="mt-1 text-sm text-[#65718a]">{t(`careersPage.jobs.items.${index}.subtitle`)}</p><div className="mt-4 flex gap-2">{job.colors.map((color, tag) => <span key={tag} className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{t(`careersPage.jobs.items.${index}.tags.${tag}`)}</span>)}</div></div><span className={`grid h-10 w-10 place-items-center rounded-full border border-[#d7e2f5] text-[#173b81] transition ${open === index ? "rotate-45 bg-[#fff0f5]" : ""}`}><Plus className="h-5 w-5" /></span></button>{open === index && <div className="border-t border-[#e7edf7] bg-[#fbfcff] p-6 sm:p-8"><p className="max-w-4xl leading-7 text-[#53617d]">{t(`careersPage.jobs.items.${index}.desc`)}</p><div className="mt-8 grid gap-8 lg:grid-cols-3">{columns(index, job)}</div><Button asChild className="mt-8 h-12 rounded-full bg-[#10275b] px-6 font-extrabold text-white hover:bg-[#1b438b]"><Link href={`${wa}?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20posisi%20${job.name}%20di%20Jodohmu`} target="_blank"><MessageCircle className="mr-2 h-4 w-4" />{t("careersPage.jobs.apply")}</Link></Button></div>}</article>)}</div></section>
  </main>;
}
