"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  HeartHandshake,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Category = "foundation" | "confidence" | "meeting";
type Facilitator = "none" | "imam" | "priest" | "team" | "couple";

type Service = {
  id: string;
  category: Category;
  price?: number;
  clientPrice?: number;
  name: { id: string; en: string };
  description: { id: string; en: string };
  joble?: {
    guestLimit: number;
    basePrice: number;
    guestPrice: number;
    singleFacilitatorPrice: number;
    coupleFacilitatorPrice: number;
    clientBasePrice: number;
    clientGuestPrice: number;
    clientSingleFacilitatorPrice: number;
    clientCoupleFacilitatorPrice: number;
  };
};

type PlanEntry = {
  id: string;
  serviceId: string;
  guests: number;
  facilitator: Facilitator;
};

const services: Service[] = [
  {
    id: "pearl-search",
    category: "foundation",
    price: 400_000,
    clientPrice: 1_250_000,
    name: { id: "Pencarian Pearl", en: "Pearl search" },
    description: { id: "Profil Anda dibangun dan pencarian dasar dilakukan bersama matchmaker.", en: "Your profile is built and a focused search begins with a matchmaker." },
  },
  {
    id: "ruby-search",
    category: "foundation",
    price: 2_000_000,
    clientPrice: 4_500_000,
    name: { id: "Pencarian Ruby", en: "Ruby search" },
    description: { id: "Pencarian aktif yang lebih mendalam dengan penyempurnaan berdasarkan masukan Anda.", en: "A deeper active search, refined around your feedback." },
  },
  {
    id: "diamond-search",
    category: "foundation",
    price: 4_000_000,
    clientPrice: 8_500_000,
    name: { id: "Pencarian Diamond", en: "Diamond search" },
    description: { id: "Strategi pencarian privat dan proaktif dengan perhatian matchmaker yang lebih tinggi.", en: "A private, proactive search strategy with higher matchmaker attention." },
  },
  {
    id: "identity",
    category: "foundation",
    price: 50_000,
    clientPrice: 150_000,
    name: { id: "Verifikasi identitas & media sosial", en: "Identity & social verification" },
    description: { id: "Pemeriksaan dasar sebelum profil diperkenalkan.", en: "A basic check before a profile is introduced." },
  },
  {
    id: "online-meeting",
    category: "foundation",
    price: 120_000,
    clientPrice: 300_000,
    name: { id: "Pertemuan online", en: "Online meeting" },
    description: { id: "Pertemuan video yang dipandu untuk membangun kenyamanan sebelum bertemu.", en: "A guided video meeting to build comfort before meeting in person." },
  },
  {
    id: "work",
    category: "confidence",
    price: 150_000,
    clientPrice: 350_000,
    name: { id: "Verifikasi pekerjaan & pendapatan", en: "Work & income verification" },
    description: { id: "Konfirmasi informasi pekerjaan dan penghasilan penting.", en: "Confirm important employment and income information." },
  },
  {
    id: "family-call",
    category: "confidence",
    price: 100_000,
    clientPrice: 250_000,
    name: { id: "Panggilan konfirmasi keluarga", en: "Family confirmation call" },
    description: { id: "Panggilan singkat untuk memahami kesiapan keluarga.", en: "A short call to understand family readiness." },
  },
  {
    id: "psychology",
    category: "confidence",
    price: 500_000,
    clientPrice: 1_250_000,
    name: { id: "Asesmen psikologi", en: "Psychology assessment" },
    description: { id: "Sesi untuk memahami kesiapan dan kecocokan secara lebih baik.", en: "A session to better understand readiness and compatibility." },
  },
  {
    id: "background",
    category: "confidence",
    price: 1_200_000,
    clientPrice: 2_750_000,
    name: { id: "Background check lapangan", en: "Field background check" },
    description: { id: "Pemeriksaan rumah, keluarga, dan lingkungan bila diperlukan.", en: "A home, family, and neighbourhood check when needed." },
  },
  {
    id: "pearl-joble",
    category: "meeting",
    name: { id: "Joble Pearl", en: "Joble Pearl" },
    description: { id: "Hidangan terpilih dan maksimal satu pendamping.", en: "A prepared meal with up to one trusted guest." },
    joble: { guestLimit: 1, basePrice: 100_000, guestPrice: 100_000, singleFacilitatorPrice: 500_000, coupleFacilitatorPrice: 700_000, clientBasePrice: 250_000, clientGuestPrice: 250_000, clientSingleFacilitatorPrice: 1_000_000, clientCoupleFacilitatorPrice: 1_400_000 },
  },
  {
    id: "ruby-joble",
    category: "meeting",
    name: { id: "Joble Ruby", en: "Joble Ruby" },
    description: { id: "Makan buffet dan maksimal dua pendamping.", en: "Buffet dining with up to two trusted guests." },
    joble: { guestLimit: 2, basePrice: 200_000, guestPrice: 200_000, singleFacilitatorPrice: 500_000, coupleFacilitatorPrice: 700_000, clientBasePrice: 500_000, clientGuestPrice: 500_000, clientSingleFacilitatorPrice: 1_000_000, clientCoupleFacilitatorPrice: 1_400_000 },
  },
  {
    id: "diamond-joble",
    category: "meeting",
    name: { id: "Joble Diamond", en: "Joble Diamond" },
    description: { id: "Pertemuan hotel dengan buffet dan maksimal dua pendamping.", en: "A hotel buffet meeting with up to two trusted guests." },
    joble: { guestLimit: 2, basePrice: 500_000, guestPrice: 500_000, singleFacilitatorPrice: 500_000, coupleFacilitatorPrice: 700_000, clientBasePrice: 1_200_000, clientGuestPrice: 1_200_000, clientSingleFacilitatorPrice: 1_000_000, clientCoupleFacilitatorPrice: 1_400_000 },
  },
  {
    id: "family-meeting",
    category: "meeting",
    price: 2_000_000,
    clientPrice: 4_500_000,
    name: { id: "Pertemuan keluarga besar", en: "Extended family meeting" },
    description: { id: "Koordinasi pertemuan keluarga saat kedua pihak siap melangkah lebih serius.", en: "A coordinated family meeting when both people are ready for a more serious next step." },
  },
];

const categoryDetails = {
  foundation: {
    icon: Sparkles,
    label: { id: "Mulai dari dasar", en: "Start with the essentials" },
    description: { id: "Bangun profil dan fondasi yang jelas.", en: "Build a clear profile and foundation." },
  },
  confidence: {
    icon: ShieldCheck,
    label: { id: "Bangun kepercayaan", en: "Build confidence" },
    description: { id: "Pilih pemeriksaan yang memberi ketenangan.", en: "Choose checks that give both sides confidence." },
  },
  meeting: {
    icon: UsersRound,
    label: { id: "Rancang pertemuan", en: "Plan the meeting" },
    description: { id: "Buat Joble sesuai kenyamanan Anda.", en: "Create Jobles around your comfort." },
  },
};

const formatIdr = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function JodohmuWayPlanner() {
  const { lang } = useLanguage();
  const id = lang === "id";
  const l = (idText: string, enText: string) => (id ? idText : enText);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [plannerView, setPlannerView] = useState<"services" | "journey" | "client">("services");
  const [couponCode, setCouponCode] = useState("");
  const entryCounter = useRef(0);

  const serviceFor = (entry: PlanEntry) => services.find((service) => service.id === entry.serviceId)!;
  const isClientView = plannerView === "client";
  const entryPrice = (entry: PlanEntry, clientPrice = false) => {
    const service = serviceFor(entry);
    if (!service.joble) return clientPrice ? service.clientPrice ?? 0 : service.price ?? 0;
    if (clientPrice) {
      const facilitatorCost = entry.facilitator === "couple" ? service.joble.clientCoupleFacilitatorPrice : entry.facilitator === "none" ? 0 : service.joble.clientSingleFacilitatorPrice;
      return service.joble.clientBasePrice + entry.guests * service.joble.clientGuestPrice + facilitatorCost;
    }
    const facilitatorCost = entry.facilitator === "couple" ? service.joble.coupleFacilitatorPrice : entry.facilitator === "none" ? 0 : service.joble.singleFacilitatorPrice;
    return service.joble.basePrice + entry.guests * service.joble.guestPrice + facilitatorCost;
  };
  const total = plan.reduce((sum, entry) => sum + entryPrice(entry, isClientView), 0);
  const couponApplied = isClientView && couponCode.trim().toUpperCase() === "JODOHMU20";
  const discount = couponApplied ? total * 0.2 : 0;
  const finalTotal = total - discount;

  const addService = (service: Service) => {
    entryCounter.current += 1;
    setPlan((current) => [
      ...current,
      { id: `${service.id}-${entryCounter.current}`, serviceId: service.id, guests: 0, facilitator: "none" },
    ]);
  };

  const addServiceById = (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    if (service) addService(service);
  };

  const updateEntry = (entryId: string, update: Partial<PlanEntry>) => {
    setPlan((current) => current.map((entry) => (entry.id === entryId ? { ...entry, ...update } : entry)));
  };

  const removeEntry = (entryId: string) => {
    setPlan((current) => current.filter((entry) => entry.id !== entryId));
  };

  const moveEntry = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= plan.length) return;
    setPlan((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const facilitatorLabel = (facilitator: Facilitator) => ({
    none: l("Tanpa fasilitator", "No facilitator"),
    imam: "Imam",
    priest: l("Pendeta", "Priest"),
    team: l("Tim Jodohmu", "Jodohmu team"),
    couple: l("Pasangan fasilitator", "Facilitator couple"),
  })[facilitator];

  const entryDetails = (entry: PlanEntry) => {
    const service = serviceFor(entry);
    if (!service.joble) return "";
    return `${entry.guests} ${l("pendamping", "guest")}${entry.guests === 1 ? "" : ""} · ${facilitatorLabel(entry.facilitator)}`;
  };

  const sharePlan = () => {
    if (!plan.length) return;
    const serviceList = plan
      .map((entry, index) => {
        const service = serviceFor(entry);
        const details = entryDetails(entry);
        return `${index + 1}. ${service.name[id ? "id" : "en"]}${details ? ` (${details})` : ""} - ${formatIdr(entryPrice(entry, isClientView))}`;
      })
      .join("\n");
    const message = id
      ? `Halo Jodohmu, saya sudah membuat rencana layanan saya.\n\n${serviceList}\n\nEstimasi total saat ini: ${formatIdr(finalTotal)}${couponApplied ? " (diskon 20% sudah diterapkan)" : ""}\n\nMohon bantu konfirmasi rencana dan harga akhirnya.`
      : `Hello Jodohmu, I have built my service plan.\n\n${serviceList}\n\nCurrent estimated total: ${formatIdr(finalTotal)}${couponApplied ? " (20% discount applied)" : ""}\n\nPlease help me confirm the plan and final pricing.`;
    window.open(`https://wa.me/6281122210303?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdfd] text-[#102457]">
      <section className="relative isolate overflow-hidden border-b border-[#dbe5fa] bg-[linear-gradient(125deg,#fff0f5_0%,#ffffff_45%,#eaf3ff_100%)] py-16 sm:py-24">
        <div className="absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-[#f36a93]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#3575df]/20 blur-3xl" />
        <div className="container max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e98aa5]/35 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#c62d5c] shadow-sm"><HeartHandshake className="h-4 w-4" />{l("Rancang cara Anda", "Design your way")}</span>
          <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[#102457] sm:text-6xl">{l("Pilih dukungan yang terasa tepat untuk perjalanan Anda.", "Choose the support that feels right for your journey.")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#52617f] sm:text-lg">{l("Tambahkan layanan sebanyak yang Anda butuhkan, susun urutannya, dan lihat estimasi biaya berjalan.", "Add services as often as you need, set their order, and see a running cost estimate.")}</p>
          <div className="mx-auto mt-8 inline-flex rounded-full border border-[#d5e0f0] bg-white/80 p-1.5 shadow-sm">
            <button type="button" onClick={() => setPlannerView("services")} className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${plannerView === "services" ? "bg-[#102457] text-white shadow-sm" : "text-[#567094] hover:text-[#102457]"}`}>{l("Pilih layanan", "Choose services")}</button>
            <button type="button" onClick={() => setPlannerView("journey")} className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${plannerView === "journey" ? "bg-[#d92f63] text-white shadow-sm" : "text-[#567094] hover:text-[#102457]"}`}>{l("Bayangkan perjalanan", "Picture your journey")}</button>
            <button type="button" onClick={() => setPlannerView("client")} className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${plannerView === "client" ? "bg-[#d92f63] text-white shadow-sm" : "text-[#567094] hover:text-[#102457]"}`}>{l("Rencana klien", "Client plan")}</button>
          </div>
        </div>
      </section>

      <section className="container grid max-w-7xl gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:py-16">
        <div className="space-y-10">
          {plannerView === "services" ? (Object.keys(categoryDetails) as Category[]).map((category) => {
            const detail = categoryDetails[category];
            const Icon = detail.icon;
            return (
              <section key={category}>
                <div className="mb-4 flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff0f5] to-[#eaf2ff] text-[#c62d5c]"><Icon className="h-5 w-5" /></span><div><h2 className="text-xl font-extrabold tracking-tight text-[#102457]">{detail.label[id ? "id" : "en"]}</h2><p className="mt-0.5 text-sm text-[#65718a]">{detail.description[id ? "id" : "en"]}</p></div></div>
                {category === "foundation" ? <div className="mb-5 rounded-3xl border border-[#dbe5f5] bg-[linear-gradient(135deg,#fff7fa,#f2f7ff)] p-5"><p className="font-serif text-xl font-bold text-[#102457]">{l("Setiap pencarian dimulai dengan keseriusan yang sama.", "Every search begins with the same serious intention.")}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-[#56647e]">{l("Paket tidak mengubah perhatian yang Anda layak dapatkan. Paket mengubah waktu, jangkauan, dan koordinasi yang dapat kami tempatkan di sekitar pencarian Anda.", "Your package does not change the care you deserve. It changes how much time, reach, and coordination we can place around your search.")}</p></div> : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.filter((service) => service.category === category).map((service) => (
                    <article key={service.id} className="flex min-h-52 flex-col rounded-3xl border border-[#dce5f5] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#b9cce9] hover:shadow-[0_14px_32px_rgba(30,69,138,.09)]">
                      <p className="text-base font-extrabold text-[#102457]">{service.name[id ? "id" : "en"]}</p>
                      <p className="mt-2 text-sm leading-6 text-[#60708d]">{service.description[id ? "id" : "en"]}</p>
                      {service.joble ? <p className="mt-3 text-xs font-bold text-[#68758e]">{l("Mulai dari", "Starts from")} {formatIdr(service.joble.basePrice)}</p> : <p className="mt-3 text-sm font-extrabold text-[#c62d5c]">{formatIdr(service.price ?? 0)}</p>}
                      <button type="button" onClick={() => addService(service)} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d92f63]/25 bg-[#fff5f8] px-4 text-sm font-extrabold text-[#c62d5c] transition hover:bg-[#d92f63] hover:text-white"><Plus className="h-4 w-4" />{l("Tambah ke rencana", "Add to plan")}</button>
                    </article>
                  ))}
                </div>
              </section>
            );
          }) : <div className="relative space-y-5">
            <div className="rounded-[2rem] bg-[#102457] px-6 py-7 text-white shadow-[0_20px_50px_rgba(16,36,87,.18)] sm:px-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffb7cd]">{plannerView === "client" ? l("Buat rencana pribadi Anda", "Build your private journey") : l("Bukan sekadar daftar layanan", "More than a list of services")}</p>
              <h2 className="mt-2 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">{plannerView === "client" ? l("Pilih langkah yang paling berarti bagi perjalanan Anda menuju pernikahan.", "Choose the moments that matter most in your journey toward marriage.") : l("Bangun perjalanan yang membuat Anda merasa siap, bukan terburu-buru.", "Build a journey that helps you feel ready, not rushed.")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{plannerView === "client" ? l("Anda bebas memilih dukungan yang Anda perlukan. Tim Jodohmu akan mengonfirmasi setiap rencana sebelum proses dimulai.", "Choose the support you need. The Jodohmu team will confirm every plan before the process begins.") : l("Pilih langkah yang terasa penting bagi Anda. Setiap pilihan langsung masuk ke rencana di samping.", "Choose the moments that matter to you. Every choice goes directly into the plan beside you.")}</p>
            </div>
            {[
              { number: "01", title: l("Mulai dengan pencarian yang terasa tepat", "Begin with a search that fits your life"), desc: l("Ceritakan hidup yang ingin Anda bangun. Kami membantu menerjemahkannya menjadi pencarian yang jelas.", "Tell us about the life you want to build. We turn it into a clear search."), choices: ["pearl-search", "ruby-search", "diamond-search"] },
              { number: "02", title: l("Kenal dan bertemu dengan nyaman", "Get to know each other and meet with ease"), desc: l("Mulai dari pertemuan online yang dipandu atau Joble. Anda dapat mengajak keluarga atau pendamping tepercaya untuk hadir bila terasa tepat.", "Begin with a guided online meeting or a Joble. You may invite family or a trusted guest when that feels right."), choices: ["online-meeting", "pearl-joble", "ruby-joble", "diamond-joble"] },
              { number: "03", title: l("Bangun keyakinan sebelum melangkah", "Build confidence before moving forward"), desc: l("Saat ada alasan nyata untuk melanjutkan, tambahkan pemeriksaan dan asesmen yang membantu kedua pihak merasa lebih tenang.", "When there is a real reason to continue, add the checks and assessment that help both sides feel more certain."), choices: ["identity", "psychology", "background"] },
              { number: "04", title: l("Bawa keluarga besar pada waktu yang tepat", "Bring extended family in at the right time"), desc: l("Ketika kedua pihak siap melangkah lebih serius, kami membantu mengatur percakapan keluarga yang lebih tenang dan terarah.", "When both people are ready for a more serious next step, we help arrange a calmer, more intentional family conversation."), choices: ["family-call", "family-meeting"] },
            ].map((moment, index) => <article key={moment.number} className="relative overflow-hidden rounded-[2rem] border border-[#dce5f5] bg-white p-6 shadow-[0_12px_28px_rgba(30,69,138,.07)] sm:p-7"><div className={`absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] ${index % 2 ? "bg-[#eaf3ff]" : "bg-[#fff0f5]"}`} /><div className="relative flex gap-5"><span className="font-serif text-5xl font-bold leading-none text-[#d92f63]/25">{moment.number}</span><div className="min-w-0 flex-1"><h3 className="max-w-xl font-serif text-2xl font-bold leading-tight text-[#102457]">{moment.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#62718c]">{moment.desc}</p><div className="mt-5 flex flex-wrap gap-2">{moment.choices.map((serviceId) => { const service = services.find((item) => item.id === serviceId)!; const startPrice = service.joble ? (isClientView ? service.joble.clientBasePrice : service.joble.basePrice) : (isClientView ? service.clientPrice : service.price) ?? 0; return <button key={serviceId} type="button" onClick={() => addServiceById(serviceId)} className="inline-flex items-center gap-2 rounded-full border border-[#d8e2f1] bg-[#fbfcff] px-3.5 py-2 text-xs font-extrabold text-[#254b8a] transition hover:border-[#d92f63]/35 hover:bg-[#fff3f7] hover:text-[#c62d5c]"><Plus className="h-3.5 w-3.5" />{service.name[id ? "id" : "en"]}{plannerView === "client" ? ` · ${l("mulai", "from")} ${formatIdr(startPrice)}` : ""}</button>; })}</div></div></div></article>)}
          </div>}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="overflow-hidden rounded-[2rem] border border-[#d8e4f6] bg-white shadow-[0_22px_55px_rgba(33,65,123,.14)]">
            <div className="bg-[linear-gradient(135deg,#102457,#2c67bf)] px-6 py-6 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffb8cd]">{l("Rencana Anda", "Your plan")}</p><h2 className="mt-2 font-serif text-3xl font-bold">{l("Jodohmu, cara Anda.", "Jodohmu, your way.")}</h2><p className="mt-2 text-sm leading-6 text-white/75">{l("Tambahkan layanan berulang kali dan susun urutannya.", "Add services repeatedly and arrange the sequence.")}</p></div>
            <div className="p-5">
              {plan.length ? <ol className="space-y-3">{plan.map((entry, index) => {
                const service = serviceFor(entry);
                const allowsFacilitator = Boolean(service.joble);
                const singleFacilitatorPrice = isClientView ? 1_000_000 : 500_000;
                const coupleFacilitatorPrice = isClientView ? 1_400_000 : 700_000;
                return <li key={entry.id} className="rounded-2xl border border-[#e1e9f6] bg-[#fbfcff] p-3"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fff0f5] text-xs font-extrabold text-[#c62d5c]">{index + 1}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#102457]">{service.name[id ? "id" : "en"]}</p>{service.joble ? <div className="mt-3 space-y-2"><label className="block text-xs font-bold text-[#68758e]">{l("Pendamping", "Guests")}</label><div className="flex gap-1">{Array.from({ length: service.joble.guestLimit + 1 }, (_, guestCount) => <button key={guestCount} type="button" onClick={() => updateEntry(entry.id, { guests: guestCount })} className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${entry.guests === guestCount ? "bg-[#d92f63] text-white" : "bg-white text-[#3866ac] ring-1 ring-[#d6e0f0] hover:bg-[#edf4ff]"}`}>{guestCount}</button>)}</div></div> : null}{allowsFacilitator ? <div className="mt-3"><label className="block text-xs font-bold text-[#68758e]">{l("Fasilitator", "Facilitator")}</label><select value={entry.facilitator} onChange={(event) => updateEntry(entry.id, { facilitator: event.target.value as Facilitator })} className="mt-1 h-9 w-full rounded-lg border border-[#d6e0f0] bg-white px-2 text-xs font-bold text-[#264a87] outline-none focus:border-[#d92f63]">{(["none", "imam", "priest", "team", "couple"] as Facilitator[]).map((facilitator) => <option key={facilitator} value={facilitator}>{facilitator === "couple" ? `${facilitatorLabel(facilitator)} - ${formatIdr(coupleFacilitatorPrice)}` : facilitator === "none" ? facilitatorLabel(facilitator) : `${facilitatorLabel(facilitator)} - ${formatIdr(singleFacilitatorPrice)}`}</option>)}</select></div> : null}<p className="mt-2 text-xs font-bold text-[#c62d5c]">{formatIdr(entryPrice(entry, isClientView))}</p></div><div className="flex shrink-0 flex-col items-center gap-1"><button type="button" onClick={() => removeEntry(entry.id)} aria-label={l("Hapus layanan", "Remove service")} className="grid h-7 w-7 place-items-center rounded-lg text-[#c62d5c] transition hover:bg-[#fff0f5]"><X className="h-4 w-4" /></button><button type="button" onClick={() => moveEntry(index, "up")} disabled={index === 0} aria-label={l("Naikkan layanan", "Move service up")} className="grid h-7 w-7 place-items-center rounded-lg text-[#3467b7] transition hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => moveEntry(index, "down")} disabled={index === plan.length - 1} aria-label={l("Turunkan layanan", "Move service down")} className="grid h-7 w-7 place-items-center rounded-lg text-[#3467b7] transition hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button></div></div></li>;
              })}</ol> : <div className="rounded-2xl border border-dashed border-[#cbd8ea] bg-[#f8fbff] px-5 py-8 text-center"><Sparkles className="mx-auto h-6 w-6 text-[#d92f63]" /><p className="mt-3 text-sm font-bold text-[#102457]">{l("Mulai pilih layanan Anda.", "Start choosing your services.")}</p><p className="mt-1 text-xs leading-5 text-[#68758e]">{l("Anda bisa menambahkan layanan yang sama lebih dari sekali.", "You can add the same service more than once.")}</p></div>}
              <div className="mt-5 border-t border-[#e3eaf6] pt-5">
                <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6a7892]">{isClientView ? l("Investasi perjalanan Anda", "Your journey investment") : l("Estimasi total", "Estimated total")}</p><p className="mt-1 text-xs text-[#71809a]">{isClientView ? l("Buat rencana Anda sendiri", "Build your own plan") : l("Biaya operasional saat ini", "Current operational cost")}</p></div><p className="text-2xl font-extrabold tracking-tight text-[#102457]">{formatIdr(total)}</p></div>
                {isClientView ? <div className="mt-4 rounded-2xl bg-[#fff5f8] p-3"><label className="text-xs font-extrabold text-[#9d2850]">{l("Kode khusus presenter", "Presenter code")}</label><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="JODOHMU20" className="mt-1.5 h-10 w-full rounded-xl border border-[#f0bfd0] bg-white px-3 text-sm font-bold text-[#102457] outline-none focus:border-[#d92f63]" />{couponApplied ? <div className="mt-3 flex items-center justify-between text-sm font-extrabold text-[#b42354]"><span>{l("Diskon 20% diterapkan", "20% discount applied")}</span><span>-{formatIdr(discount)}</span></div> : null}<div className="mt-3 flex items-center justify-between border-t border-[#f0cada] pt-3"><span className="text-sm font-extrabold text-[#102457]">{l("Total setelah diskon", "Total after discount")}</span><span className="text-xl font-extrabold text-[#d92f63]">{formatIdr(finalTotal)}</span></div></div> : null}
                <button type="button" onClick={sharePlan} disabled={!plan.length} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d92f63] px-5 text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(217,47,99,.24)] transition hover:bg-[#bf2454] disabled:cursor-not-allowed disabled:opacity-45"><MessageCircle className="h-4 w-4" />{l("Kirim rencana ke WhatsApp", "Send plan to WhatsApp")}</button><p className="mt-4 text-center text-xs leading-5 text-[#73809a]">{l("Ini adalah estimasi, bukan tagihan akhir. Tim kami akan mengonfirmasi ketersediaan dan harga sebelum proses dimulai.", "This is an estimate, not a final invoice. Our team will confirm availability and final pricing before the process begins.")}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
