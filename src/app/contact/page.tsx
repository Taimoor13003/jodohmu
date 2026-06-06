"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
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

// Auto-formats digits into XXX-XXXX-XXXX style with dashes
function formatWithDashes(digits: string, max: number): string {
  const d = digits.slice(0, max);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
}

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  countryCode: z.string().min(1),
  phoneNumber: z.string().min(4, { message: "Phone number is required" }),
  email: z.string().email({ message: "Enter a valid email" }).optional().or(z.literal("")),
  city: z.string().min(2, { message: "City name is required" }),
  gender: z.enum(["male", "female", ""]).optional(),
  age: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 18 && Number(v) <= 80), { message: "Age must be between 18 and 80" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { countryCode: "+62", phoneNumber: "" },
  });

  const [isSubmitting, setSubmitting] = useState(false);
  const [displayPhone, setDisplayPhone] = useState("");

  const selectedCode = watch("countryCode");
  const maxDigits = COUNTRY_CODES.find((c) => c.code === selectedCode)?.maxDigits ?? 12;

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    const formatted = formatWithDashes(digits, maxDigits);
    setDisplayPhone(formatted);
    setValue("phoneNumber", digits, { shouldValidate: true });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("countryCode", e.target.value);
    // Reset phone when country changes since max length may differ
    setDisplayPhone("");
    setValue("phoneNumber", "");
  };

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      const phone = `${data.countryCode}${data.phoneNumber}`;
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone,
          city: data.city,
          email: data.email || undefined,
          gender: data.gender || undefined,
          age: data.age ? Number(data.age) : undefined,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to send message");
      }

      toast.success("Message sent!", {
        description: "Thank you! Our team will reach out to you shortly.",
        duration: 5000,
      });
      analytics.formSubmit("contact");
      reset({ countryCode: "+62", phoneNumber: "", name: "", city: "", email: "", gender: "", age: "" });
      setDisplayPhone("");
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Please try again or WhatsApp us directly.",
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "mt-2 h-12 rounded-xl border-[#0b3a86]/20 bg-white/70";
  const selectCls = "mt-2 h-12 w-full rounded-xl border border-[#0b3a86]/20 bg-white/70 px-3 text-sm text-[#0b3a86] focus:outline-none focus:ring-2 focus:ring-[#9B2242]/30";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fbe4ef] via-white to-[#e6f0ff] py-20">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#9B2242]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#0b3a86]/10 blur-3xl" />
      </div>
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl rounded-3xl border border-white/50 bg-white/80 p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-4 text-center">
            <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[#9B2242]/20 bg-[#9B2242]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2242]">
              Contact JodohMu
            </span>
            <h1 className="text-3xl font-serif font-bold text-[#0b3a86] sm:text-4xl">
              Concierge matchmaking crafted around you
            </h1>
            <p className="text-base text-[#0b3a86]/70">
              Share your details and our team will personally get in touch to guide your journey.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[#0b3a86]">Full Name</label>
              <Input {...register("name")} placeholder="Enter your full name" className={inputCls} />
              {errors.name && <p className="mt-1 text-sm text-[#9B2242]">{errors.name.message}</p>}
            </div>

            {/* Phone + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0b3a86]">Phone Number</label>
                <div className="mt-2 flex gap-2">
                  <select
                    {...register("countryCode")}
                    onChange={handleCountryChange}
                    className="h-12 rounded-xl border border-[#0b3a86]/20 bg-white/70 px-2 text-sm text-[#0b3a86] focus:outline-none focus:ring-2 focus:ring-[#9B2242]/30"
                  >
                    {COUNTRY_CODES.map(({ code, flag }) => (
                      <option key={code} value={code}>{flag} {code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={displayPhone}
                    onChange={handlePhoneInput}
                    placeholder="8123-4567-890"
                    className="h-12 flex-1 rounded-xl border border-[#0b3a86]/20 bg-white/70 px-3 text-sm text-[#0b3a86] placeholder:text-[#0b3a86]/40 focus:outline-none focus:ring-2 focus:ring-[#9B2242]/30"
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-sm text-[#9B2242]">{errors.phoneNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0b3a86]">City</label>
                <Input {...register("city")} placeholder="e.g. Jakarta" className={inputCls} />
                {errors.city && <p className="mt-1 text-sm text-[#9B2242]">{errors.city.message}</p>}
              </div>
            </div>

            {/* Gender + Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0b3a86]">
                  Gender <span className="font-normal text-[#0b3a86]/50">(optional)</span>
                </label>
                <select {...register("gender")} className={selectCls}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0b3a86]">
                  Age <span className="font-normal text-[#0b3a86]/50">(optional)</span>
                </label>
                <Input
                  {...register("age")}
                  type="number"
                  inputMode="numeric"
                  min={18}
                  max={80}
                  placeholder="e.g. 27"
                  className={inputCls}
                />
                {errors.age && <p className="mt-1 text-sm text-[#9B2242]">{errors.age.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0b3a86]">
                Email <span className="font-normal text-[#0b3a86]/50">(optional)</span>
              </label>
              <Input {...register("email")} placeholder="Enter your email (optional)" className={inputCls} />
              {errors.email && <p className="mt-1 text-sm text-[#9B2242]">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] py-6 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-80"
            >
              {isSubmitting ? "Sending…" : "Submit"}
            </Button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
