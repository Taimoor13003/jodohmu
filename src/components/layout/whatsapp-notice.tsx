"use client";

import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const linkClass = "font-semibold underline underline-offset-2 hover:text-white/80";

export function WhatsAppNotice() {
  const { t } = useLanguage();

  return (
    <div role="status" className="bg-[#9B2242] text-white">
      <div className="container mx-auto flex items-start justify-center gap-2 px-4 py-2.5 text-center text-sm leading-snug">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          {t("whatsappNotice.message")}{" "}
          <a href="mailto:info@jodohmu.com" className={linkClass}>
            info@jodohmu.com
          </a>
          {" · "}
          <a href="https://www.instagram.com/jodohmu_official/" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Instagram
          </a>
          {" · "}
          <a href="https://www.facebook.com/profile.php?id=61583458260206" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Facebook
          </a>
          {" · "}
          <a href="https://www.tiktok.com/@jodohmu.official" target="_blank" rel="noopener noreferrer" className={linkClass}>
            TikTok
          </a>
        </p>
      </div>
    </div>
  );
}
