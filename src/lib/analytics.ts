declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function trackEvent({ action, category, label, value }: GTagEvent) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}

// Pre-built events for common conversions
export const analytics = {
  // Every tap that opens WhatsApp. Anchor links are caught site-wide by
  // WhatsAppClickTracker; call this only where code opens WhatsApp (window.open).
  whatsappClick: (source: string) => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: source,
      button: source,
      page_path: window.location.pathname,
      page_language: window.location.pathname === "/en" || window.location.pathname.startsWith("/en/") ? "en" : "id",
    });
  },

  ctaClick: (ctaName: string, page: string) =>
    trackEvent({ action: "cta_click", category: "conversion", label: `${ctaName}_${page}` }),

  formSubmit: (formName: string) =>
    trackEvent({ action: "form_submit", category: "conversion", label: formName }),

  pricingView: (packageName: string) =>
    trackEvent({ action: "pricing_view", category: "engagement", label: packageName }),

  pageScroll: (depth: string, page: string) =>
    trackEvent({ action: "scroll_depth", category: "engagement", label: `${depth}_${page}` }),
};
