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
  whatsappClick: (source: string) =>
    trackEvent({ action: "whatsapp_click", category: "engagement", label: source }),

  ctaClick: (ctaName: string, page: string) =>
    trackEvent({ action: "cta_click", category: "conversion", label: `${ctaName}_${page}` }),

  formSubmit: (formName: string) =>
    trackEvent({ action: "form_submit", category: "conversion", label: formName }),

  pricingView: (packageName: string) =>
    trackEvent({ action: "pricing_view", category: "engagement", label: packageName }),

  pageScroll: (depth: string, page: string) =>
    trackEvent({ action: "scroll_depth", category: "engagement", label: `${depth}_${page}` }),
};
