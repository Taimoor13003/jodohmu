"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, MessageCircle, UserPlus, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { CandidateAccessStatus, InviteState } from "@/lib/account-invites";

type Lang = "id" | "en";

const STATE_BADGE: Record<InviteState, { id: string; en: string; cls: string }> = {
  valid:    { id: "Aktif",              en: "Active",           cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  accepted: { id: "Sudah dipakai masuk", en: "Used to sign in", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  expired:  { id: "Kedaluwarsa",        en: "Expired",          cls: "bg-amber-50 text-amber-700 border-amber-200" },
  revoked:  { id: "Diganti link baru",  en: "Replaced",         cls: "bg-slate-100 text-slate-500 border-slate-200" },
  missing:  { id: "Tidak ada",          en: "None",             cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

/** Team-side panel: see whether a candidate has signed in, and send them an invite link. */
export default function CandidateInvite({ candidateId, candidateName, lang, onClose }: {
  candidateId: string;
  candidateName: string;
  lang: Lang;
  onClose: () => void;
}) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const [status, setStatus] = useState<CandidateAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (method: "GET" | "POST") => {
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in");
    const res = await fetch(`/api/admin/candidate/${candidateId}/invite`, {
      method,
      headers: { Authorization: `Bearer ${await current.getIdToken()}` },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed");
    return body as CandidateAccessStatus;
  }, [candidateId]);

  useEffect(() => {
    call("GET")
      .then(setStatus)
      .catch(err => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [call]);

  const createLink = async () => {
    setCreating(true);
    setError(null);
    try {
      setStatus(await call("POST"));
      setCopied(false);
      toast.success(l("Link undangan dibuat", "Invite link created"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) : null;

  const invite = status?.invite ?? null;
  const usable = invite && (invite.state === "valid" || invite.state === "accepted");
  const url = usable && typeof window !== "undefined" ? `${window.location.origin}/invite/${invite.token}` : "";
  const email = status?.account?.email ?? "";
  const first = candidateName.trim().split(/\s+/)[0] ?? "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(l("Link disalin", "Link copied"));
    } catch {
      toast.error(l("Gagal menyalin link", "Couldn't copy the link"));
    }
  };

  const sendWhatsApp = () => {
    const text =
      `Assalamualaikum ${first},\n\n` +
      `Profil Jodohmu kamu sudah kami buatkan. Silakan buka link berikut dan masuk dengan Google memakai email ${email}:\n\n` +
      `${url}\n\n` +
      `Setelah masuk, kamu bisa melengkapi profil dan membagikan link profilmu. Link ini pribadi, mohon jangan dibagikan.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const providers = status?.account?.providers ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-6 py-5" style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }}>
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">{l("Undang ke Akun", "Invite to Account")}</h2>
              <p className="mt-0.5 text-[11.5px] text-white/60">{candidateName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 transition hover:text-white" aria-label={l("Tutup", "Close")}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : (
            <>
              {/* account */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{l("Akun kandidat", "Candidate account")}</p>
                <p className="mt-1 break-all text-[13px] font-semibold text-slate-800">{email || "—"}</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {!status?.account
                    ? l("Kandidat ini belum punya akun login, jadi link undangan tidak bisa dibuat.", "This candidate has no login account yet, so an invite link can't be created.")
                    : status.account.lastSignInAt
                    ? `${l("Terakhir masuk", "Last signed in")}: ${fmt(status.account.lastSignInAt)}`
                    : l("Belum pernah masuk", "Has never signed in")}
                </p>
                {providers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {providers.map(p => (
                      <span key={p} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-slate-500">
                        {p === "google.com" ? "Google" : p === "password" ? l("Email & password", "Email & password") : p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* invite */}
              {invite && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{l("Link undangan", "Invite link")}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold ${STATE_BADGE[invite.state].cls}`}>
                      {STATE_BADGE[invite.state][lang]}
                    </span>
                  </div>

                  {usable && (
                    <>
                      <div className="flex items-center gap-2">
                        <input readOnly value={url} onFocus={e => e.currentTarget.select()}
                          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-700" />
                        <button onClick={copy}
                          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? l("Disalin", "Copied") : l("Salin", "Copy")}
                        </button>
                      </div>
                      <button onClick={sendWhatsApp}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-[13px] font-bold text-white hover:opacity-90">
                        <MessageCircle className="h-4 w-4" /> {l("Kirim lewat WhatsApp", "Send via WhatsApp")}
                      </button>
                    </>
                  )}

                  <p className="text-[11.5px] leading-relaxed text-slate-500">
                    {invite.state === "valid" && `${l("Berlaku sampai", "Valid until")} ${fmt(invite.expiresAt)} · ${l("dibuka", "opened")} ${invite.opens}×`}
                    {invite.state === "accepted" && `${l("Kandidat masuk lewat link ini pada", "The candidate signed in with this link on")} ${fmt(invite.acceptedAt)}. ${l("Link tetap bisa dipakai untuk masuk.", "It still works as a sign-in link.")}`}
                    {invite.state === "expired" && l("Link sudah kedaluwarsa. Buat link baru untuk dikirim.", "This link has expired. Create a new one to send.")}
                    {invite.state === "revoked" && l("Link ini sudah diganti. Buat link baru.", "This link was replaced. Create a new one.")}
                  </p>
                </div>
              )}

              {error && <p className="text-[12.5px] font-semibold text-[#C4294A]">{error}</p>}

              <button onClick={createLink} disabled={creating || !email}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {invite ? l("Buat link baru", "Create a new link") : l("Buat link undangan", "Create invite link")}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                {l(
                  "Link berlaku 14 hari. Membuat link baru akan menonaktifkan link lama yang belum dipakai.",
                  "Links last 14 days. Creating a new link turns off any older unused link.",
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
