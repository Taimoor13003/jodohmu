import { auth } from "@/lib/firebase";

export async function authFetch<T = Record<string, unknown>>(url: string, init: RequestInit = {}): Promise<T> {
  const current = auth.currentUser;
  if (!current) throw new Error("Not signed in");
  const token = await current.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers ?? {}), "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? "Request failed");
  return json as T;
}

export function shareUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.jodohmu.com";
  return `${origin}/s/${token}`;
}

export function formatDateTime(iso: string | null, lang: "id" | "en"): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
