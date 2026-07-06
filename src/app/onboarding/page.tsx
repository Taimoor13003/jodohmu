"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { User as UserIcon, Phone, Cake, MapPin, Users } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";

export default function OnboardingPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { user, role, loading } = useAuth();

  const l = (id: string, en: string) => lang === "id" ? id : en;

  const [checking, setChecking] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone,    setPhone]    = useState("");
  const [gender,   setGender]   = useState("");
  const [dob,      setDob]      = useState("");
  const [city,     setCity]     = useState("");
  const [pending,  setPending]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (role === "admin" || role === "worker") { router.replace("/admin"); return; }

    (async () => {
      try {
        setFullName(user.displayName ?? "");
        const token = await getIdToken(user);
        const res = await fetch("/api/candidate/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const { data } = await res.json() as { data: Record<string, unknown> | null };
          if (data?.fullName && data?.whatsappNumber && data?.gender) {
            router.replace("/dashboard");
            return;
          }
          if (typeof data?.fullName === "string" && data.fullName) setFullName(data.fullName);
          if (typeof data?.whatsappNumber === "string") setPhone(data.whatsappNumber);
          if (typeof data?.gender === "string") setGender(data.gender);
          if (typeof data?.dateOfBirth === "string") setDob(data.dateOfBirth);
          if (typeof data?.location === "string") setCity(data.location);
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [user, role, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !gender) {
      setError(l("Nama, nomor WhatsApp, dan jenis kelamin wajib diisi.", "Name, WhatsApp number, and gender are required."));
      return;
    }

    setPending(true);
    try {
      const token = await getIdToken(auth.currentUser!);
      const payload: Record<string, unknown> = {
        fullName: fullName.trim(),
        whatsappNumber: phone.trim(),
        gender,
      };
      if (city.trim()) payload.location = city.trim();

      if (dob.trim()) {
        payload.dateOfBirth = dob;
        const parsed = new Date(dob);
        if (!isNaN(parsed.getTime())) {
          const today = new Date();
          let a = today.getFullYear() - parsed.getFullYear();
          const dm = today.getMonth() - parsed.getMonth();
          if (dm < 0 || (dm === 0 && today.getDate() < parsed.getDate())) a--;
          if (a > 0 && a < 120) payload.age = String(a);
        }
      }

      const res = await fetch("/api/candidate/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/dashboard");
    } catch {
      setError(l("Gagal menyimpan data. Coba lagi.", "Could not save your info. Please try again."));
      setPending(false);
    }
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF2F7]">
        <div className="w-8 h-8 rounded-full border-2 border-[#9B2242] border-t-transparent animate-spin" />
      </div>
    );
  }

  const firstName = (user?.displayName ?? "").split(" ")[0];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2F7] px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">

        {/* header */}
        <div className="relative overflow-hidden px-8 pt-9 pb-8 text-center text-white"
          style={{ background: "linear-gradient(135deg, #0b3a86, #9B2242)" }}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="bg-white rounded-2xl px-4 py-2.5 shadow-md">
              <Image src={LogoIcon} alt="Jodohmu" height={26} style={{ width: "auto" }} priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {firstName
                ? l(`Selamat datang, ${firstName}`, `Welcome, ${firstName}`)
                : l("Selamat datang di Jodohmu", "Welcome to Jodohmu")}
            </h1>
            <p className="text-white/85 text-sm max-w-sm">
              {l(
                "Satu langkah singkat sebelum tim matchmaker kami mulai mendampingimu.",
                "One short step before our matchmaking team starts guiding you."
              )}
            </p>
          </div>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {l("Nama Lengkap", "Full Name")} <span className="text-[#9B2242]">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="fullName" required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder={l("Nama lengkap kamu", "Your full name")}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {l("Nomor WhatsApp", "WhatsApp Number")} <span className="text-[#9B2242]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="phone" required type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+62 8xx-xxxx-xxxx"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {l("Jenis Kelamin", "Gender")} <span className="text-[#9B2242]">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="gender" required value={gender} onChange={e => setGender(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
              >
                <option value="" disabled>{l("Pilih jenis kelamin", "Select gender")}</option>
                <option value="male">{l("Laki-laki", "Male")}</option>
                <option value="female">{l("Perempuan", "Female")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l("Tanggal Lahir", "Date of Birth")} <span className="text-slate-400 normal-case font-medium">({l("opsional", "optional")})</span>
              </label>
              <div className="relative">
                <Cake className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l("Kota", "City")} <span className="text-slate-400 normal-case font-medium">({l("opsional", "optional")})</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="city" value={city} onChange={e => setCity(e.target.value)}
                  placeholder={l("Jakarta", "Jakarta")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
              </div>
            </div>
          </div>

          {user?.email && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
              <div className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-100 text-[15px] text-slate-500 flex items-center">
                {user.email}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={pending}
            className="mt-2 w-full h-12 rounded-full font-bold text-base text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(to right, #9B2242, #0b3a86)" }}
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {l("Menyimpan...", "Saving...")}
              </span>
            ) : l("Lanjutkan", "Continue")}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            {l(
              "Tim matchmaker kami akan menghubungimu secara personal dalam 1x24 jam.",
              "Our matchmaking team will personally reach out to you within 24 hours."
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
