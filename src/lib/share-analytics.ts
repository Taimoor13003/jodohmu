/* ──────────────────────────────────────────────────────────────────────
   "How was this link opened?" — coarse, privacy-conscious visit context
   for the team's link metrics. No raw IPs, no fingerprinting: device class,
   OS, browser, in-app source, and city/country when the host provides it.
   ────────────────────────────────────────────────────────────────────── */

export interface VisitContext {
  device: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  /** In-app browser the link was opened from, e.g. "WhatsApp". */
  app: string | null;
  country: string | null;
  city: string | null;
  /** Host of the page that linked here, when the browser reports one. */
  referrer: string | null;
}

const IN_APP: [RegExp, string][] = [
  [/WhatsApp/i, "WhatsApp"],
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
  [/\bLine\//i, "LINE"],
  [/Telegram/i, "Telegram"],
  [/TikTok|musical_ly|BytedanceWebview/i, "TikTok"],
  [/\bGSA\//, "Google App"],
];

function detectOs(ua: string): string {
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/CriOS|Chrome\//.test(ua)) return "Chrome";
  if (/FxiOS|Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function detectDevice(ua: string): VisitContext["device"] {
  if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android/.test(ua)) return "mobile";
  return "desktop";
}

function header(headers: Headers, name: string): string | null {
  const raw = headers.get(name);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw).slice(0, 60);
  } catch {
    return raw.slice(0, 60);
  }
}

export function describeVisit(headers: Headers, referrerHost: string | null): VisitContext {
  const ua = headers.get("user-agent") ?? "";
  const referrer = referrerHost && /^[a-z0-9.-]{3,80}$/i.test(referrerHost) ? referrerHost.toLowerCase() : null;
  return {
    device: detectDevice(ua),
    os: detectOs(ua),
    browser: detectBrowser(ua),
    app: IN_APP.find(([re]) => re.test(ua))?.[1] ?? null,
    country: header(headers, "x-vercel-ip-country") ?? header(headers, "cf-ipcountry"),
    city: header(headers, "x-vercel-ip-city"),
    referrer,
  };
}
