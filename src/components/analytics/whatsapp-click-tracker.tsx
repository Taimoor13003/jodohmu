"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

const isWhatsAppLink = (href: string) => /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(href) || href.startsWith("whatsapp://");

// Sends a whatsapp_click event for every WhatsApp link on the site, so GA4 can
// show which page and traffic source leads to a chat. A link can name itself
// with data-wa-source="..."; otherwise its visible text is used.
export function WhatsAppClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || !isWhatsAppLink(link.href)) return;
      const label = link.dataset.waSource || link.getAttribute("aria-label") || link.textContent?.trim().replace(/\s+/g, " ").slice(0, 60) || "whatsapp_link";
      analytics.whatsappClick(label);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
