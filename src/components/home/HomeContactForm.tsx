"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+62", flag: "🇮🇩", label: "ID", maxDigits: 12 },
  { code: "+60", flag: "🇲🇾", label: "MY", maxDigits: 11 },
  { code: "+65", flag: "🇸🇬", label: "SG", maxDigits: 8  },
  { code: "+92", flag: "🇵🇰", label: "PK", maxDigits: 10 },
  { code: "+966", flag: "🇸🇦", label: "SA", maxDigits: 9  },
  { code: "+971", flag: "🇦🇪", label: "AE", maxDigits: 9  },
  { code: "+44", flag: "🇬🇧", label: "UK", maxDigits: 10 },
  { code: "+1",  flag: "🇺🇸", label: "US", maxDigits: 10 },
  { code: "+61", flag: "🇦🇺", label: "AU", maxDigits: 9  },
];

function formatWithDashes(digits: string, max: number): string {
  const d = digits.slice(0, max);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
}

const schema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  countryCode: z.string().min(1),
  phoneNumber: z.string().min(4, { message: "Phone number is required" }),
  email: z.string().email({ message: "Enter a valid email" }).optional().or(z.literal("")),
  city: z.string().min(2, { message: "City name is required" }),
  gender: z.enum(["male", "female", ""]).optional(),
  age: z.string().optional().refine(
    (v) => !v || (Number(v) >= 18 && Number(v) <= 80),
    { message: "Age must be between 18 and 80" }
  ),
});

type FormData = z.infer<typeof schema>;

export function HomeContactForm() {
  const { lang } = useLanguage();
  const id = lang === "id";
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { countryCode: "+62", phoneNumber: "" },
    });

  const [isSubmitting, setSubmitting] = useState(false);
  const [displayPhone, setDisplayPhone] = useState("");

  const selectedCode = watch("countryCode");
  const maxDigits = COUNTRY_CODES.find((c) => c.code === selectedCode)?.maxDigits ?? 12;

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    setDisplayPhone(formatWithDashes(digits, maxDigits));
    setValue("phoneNumber", digits, { shouldValidate: true });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("countryCode", e.target.value);
    setDisplayPhone("");
    setValue("phoneNumber", "");
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: `${data.countryCode}${data.phoneNumber}`,
          city: data.city,
          email: data.email || undefined,
          gender: data.gender || undefined,
          age: data.age ? Number(data.age) : undefined,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to send");
      }
      toast.success("Message sent!", {
        description: "Thank you! Our team will reach out to you shortly.",
        duration: 5000,
      });
      analytics.formSubmit("contact_home");
      reset({ countryCode: "+62", phoneNumber: "", name: "", city: "", email: "", gender: "", age: "" });
      setDisplayPhone("");
    } catch (err) {
      toast.error("Something went wrong", {
        description: err instanceof Error ? err.message : "Please try again or WhatsApp us directly.",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "h-12 rounded-xl border-white/20 bg-white/15 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20";
  const sel = "h-12 w-full rounded-xl border border-white/20 bg-white/15 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 w-full max-w-2xl space-y-5">

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-white/90 mb-1">{id ? "Nama Lengkap" : "Full Name"}</label>
        <Input {...register("name")} placeholder={id ? "Masukkan nama lengkap Anda" : "Enter your full name"} className={inp} />
        {errors.name && <p className="mt-1 text-sm text-white/70">{errors.name.message}</p>}
      </div>

      {/* Phone + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-1">{id ? "Nomor Telepon" : "Phone Number"}</label>
          <div className="flex gap-2">
            <select
              {...register("countryCode")}
              onChange={handleCountryChange}
              className="h-12 rounded-xl border border-white/20 bg-white/15 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {COUNTRY_CODES.map(({ code, flag }) => (
                <option key={code} value={code} className="bg-[#9B2242] text-white">{flag} {code}</option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              value={displayPhone}
              onChange={handlePhoneInput}
              placeholder="8123-4567-890"
              className="h-12 flex-1 rounded-xl border border-white/20 bg-white/15 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-sm text-white/70">{errors.phoneNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-1">{id ? "Kota" : "City"}</label>
          <Input {...register("city")} placeholder={id ? "cth. Jakarta" : "e.g. Jakarta"} className={inp} />
          {errors.city && <p className="mt-1 text-sm text-white/70">{errors.city.message}</p>}
        </div>
      </div>

      {/* Gender + Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-1">
            {id ? "Jenis Kelamin" : "Gender"} <span className="font-normal text-white/50">({id ? "opsional" : "optional"})</span>
          </label>
          <select {...register("gender")} className={sel}>
            <option value="" className="bg-[#9B2242]">{id ? "Tidak ingin menyebutkan" : "Prefer not to say"}</option>
            <option value="male" className="bg-[#9B2242]">{id ? "Laki-laki" : "Male"}</option>
            <option value="female" className="bg-[#9B2242]">{id ? "Perempuan" : "Female"}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-1">
            {id ? "Usia" : "Age"} <span className="font-normal text-white/50">({id ? "opsional" : "optional"})</span>
          </label>
          <Input
            {...register("age")}
            type="number"
            inputMode="numeric"
            min={18}
            max={80}
            placeholder={id ? "cth. 27" : "e.g. 27"}
            className={inp}
          />
          {errors.age && <p className="mt-1 text-sm text-white/70">{errors.age.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-white/90 mb-1">
          Email <span className="font-normal text-white/50">({id ? "opsional" : "optional"})</span>
        </label>
        <Input {...register("email")} placeholder={id ? "Masukkan email Anda (opsional)" : "Enter your email (optional)"} className={inp} />
        {errors.email && <p className="mt-1 text-sm text-white/70">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-white py-4 text-base font-semibold text-[#9B2242] shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/90 disabled:opacity-70"
      >
        {isSubmitting
          ? (id ? "Mengirim…" : "Sending…")
          : (id ? "Ayo Mulai Perjalanan Menuju Pernikahan ✨" : "Let's Begin Your Journey to Marriage ✨")}
      </button>
    </form>
  );
}
