"use client";

import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const linkClass = "font-semibold underline underline-offset-2 hover:text-white/80";

export function WhatsAppNotice() {
  const { t } = useLanguage();

  return (
    <div role="status" className="bg-[#9B2242] text-white">
      <div className="container mx-auto flex items-start justify-center gap-2 px-4 py-2.5 text-center text-sm leading-snug">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          {t("whatsappNotice.message")}{" "}
          <a href="https://wa.me/628138858595" target="_blank" rel="noopener noreferrer" className={linkClass}>
            +62 813 885 8595
          </a>
        </p>
      </div>
    </div>
  );
}
