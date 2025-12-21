"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(6, "Phone number is required")
    .regex(/^[0-9+()\\s-]+$/, "Use digits only (you can include +, space, or dashes)"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.string().min(2, "City name is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setStatus("idle");
    setMessage(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to send message");
      }

      setStatus("success");
      setMessage("Thanks! We will reach out shortly.");
      reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <div>
              <label className="block text-sm font-semibold text-[#0b3a86]">Full Name</label>
              <Input
                {...register("name")}
                placeholder="Enter your full name"
                className="mt-2 h-12 rounded-xl border-[#0b3a86]/20 bg-white/70"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-[#9B2242]">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0b3a86]">Phone Number</label>
              <Input
                {...register("phone")}
                type="tel"
                inputMode="tel"
                pattern="[0-9+()\\s-]*"
                placeholder="Enter your phone number"
                className="mt-2 h-12 rounded-xl border-[#0b3a86]/20 bg-white/70"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-[#9B2242]">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0b3a86]">Email (optional)</label>
              <Input
                {...register("email")}
                placeholder="Enter your email (optional)"
                className="mt-2 h-12 rounded-xl border-[#0b3a86]/20 bg-white/70"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#9B2242]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0b3a86]">City</label>
              <Input
                {...register("city")}
                placeholder="Which city are you based in?"
                className="mt-2 h-12 rounded-xl border-[#0b3a86]/20 bg-white/70"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-[#9B2242]">{errors.city.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] py-6 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-80"
            >
              {isSubmitting ? "Sending…" : "Submit"}
            </Button>

            {message && (
              <p
                className={`text-center text-sm font-semibold ${
                  status === "success" ? "text-[#0b3a86]" : "text-[#9B2242]"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
