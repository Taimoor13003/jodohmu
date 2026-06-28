"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  collection, onSnapshot, addDoc,
  serverTimestamp, doc, updateDoc, setDoc, increment,
  Timestamp,
} from "firebase/firestore";
import { MessageCircle, Send, User, CheckCheck, Clock, Smile } from "lucide-react";

interface Thread {
  uid: string;
  displayName: string;
  email: string;
  lastMessage: string;
  lastAt: Date | null;
  unreadAdmin: number;
  lastMessageFrom: "candidate" | "admin" | null;
  lastMessageRead: boolean;
}

interface Message {
  id: string;
  text: string;
  from: "candidate" | "admin";
  senderName: string;
  createdAt: Date | null;
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const EMOJIS = [
    "😊","😂","🥰","😍","🙏","❤️","💕","✨","😅","🤣",
    "😭","🥹","😁","🫶","💪","👍","🎉","🌸","🌺","💐",
    "🤲","☝️","🫰","🤝","👋","🫡","🥲","😔","🤔","😶",
  ];

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // Load all chat threads
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chats"), snap => {
      const threads: Thread[] = snap.docs.map(d => ({
        uid: d.id,
        displayName: d.data().displayName as string ?? "—",
        email: d.data().email as string ?? "",
        lastMessage: d.data().lastMessage as string ?? "",
        lastAt: (d.data().lastAt as Timestamp | null)?.toDate() ?? null,
        unreadAdmin: (d.data().unreadAdmin as number) ?? 0,
        lastMessageFrom: (d.data().lastMessageFrom as "candidate" | "admin") ?? null,
        lastMessageRead: (d.data().lastMessageRead as boolean) ?? false,
      }));
      threads.sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
      setThreads(threads);
    });
    return () => unsub();
  }, []);

  // Load messages for selected thread
  useEffect(() => {
    if (!selected) return;
    const unsub = onSnapshot(collection(db, "chats", selected, "messages"),
      snap => {
        const msgs = snap.docs.map(d => ({
          id: d.id,
          text: d.data().text as string,
          from: d.data().from as "candidate" | "admin",
          senderName: d.data().senderName as string,
          createdAt: (d.data().createdAt as Timestamp | null)?.toDate() ?? null,
        }));
        msgs.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
        setMessages(msgs);
      },
      err => console.error("[AdminChat] onSnapshot error:", err)
    );
    return () => unsub();
  }, [selected]);

  // Mark as read when thread opened
  useEffect(() => {
    if (!selected) return;
    updateDoc(doc(db, "chats", selected), { unreadAdmin: 0 }).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selected]);

  // Scroll on new messages
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !user || !selected || sending) return;
    const msg = text.trim();
    setText("");
    setSending(true);
    try {
      const name = user.displayName ?? "Tim Jodohmu";
      await addDoc(collection(db, "chats", selected, "messages"), {
        text: msg,
        from: "admin",
        senderName: name,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "chats", selected), {
        lastMessage: msg,
        lastAt: serverTimestamp(),
        lastMessageFrom: "admin",
        lastMessageRead: false,
        unreadAdmin: 0,
        unreadCandidate: increment(1),
      }, { merge: true });
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const selectedThread = threads.find(t => t.uid === selected);

  const formatTime = (d: Date | null) => {
    if (!d) return "";
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Kemarin";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto h-[calc(100vh-52px)] flex flex-col">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#C4294A" }}>Chat</p>
        <h1 className="text-xl font-extrabold" style={{ color: "#0F172A", fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Pesan Kandidat
        </h1>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">

        {/* Thread list */}
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div className="p-3 border-b border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {threads.length} Thread{threads.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <MessageCircle className="w-8 h-8 mb-2" style={{ color: "#CBD5E1" }} />
                <p className="text-sm text-slate-400">Belum ada pesan masuk</p>
              </div>
            )}
            {threads.map(t => (
              <button key={t.uid}
                onClick={() => setSelected(t.uid)}
                className="w-full text-left px-4 py-3 border-b border-slate-50 transition hover:bg-slate-50"
                style={{ background: selected === t.uid ? "#F8FAFC" : undefined, borderLeft: selected === t.uid ? "3px solid #C4294A" : "3px solid transparent" }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #9B2242, #0b3a86)" }}>
                    {(t.displayName[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-[13px] font-bold text-slate-800 truncate">{t.displayName}</p>
                      {t.unreadAdmin > 0 && (
                        <span className="shrink-0 w-4.5 h-4.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1.5 py-0.5" style={{ background: "#C4294A", fontSize: 10 }}>
                          {t.unreadAdmin > 9 ? "9+" : t.unreadAdmin}
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-slate-400 truncate">{t.lastMessage || "—"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.lastAt && <p className="text-[10.5px] text-slate-300">{formatTime(t.lastAt)}</p>}
                      {t.lastMessageFrom === "admin" && (
                        t.lastMessageRead
                          ? <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: "#16A34A" }}>
                              <CheckCheck style={{ width: 11, height: 11 }} /> Seen
                            </span>
                          : <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                              <Clock style={{ width: 10, height: 10 }} /> Unseen
                            </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden min-w-0"
          style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>

          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <MessageCircle className="w-12 h-12 mb-3" style={{ color: "#CBD5E1" }} />
              <p className="text-sm font-medium text-slate-500">Pilih thread untuk mulai membalas</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #9B2242, #0b3a86)" }}>
                  {(selectedThread?.displayName[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-slate-800">{selectedThread?.displayName}</p>
                  <p className="text-[11.5px] text-slate-400">{selectedThread?.email}</p>
                </div>
                <a href={`/admin/candidates/${selected}`}
                  className="ml-auto flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  <User className="w-3.5 h-3.5" />
                  Profil
                </a>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-slate-400">Belum ada pesan dalam thread ini.</p>
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isAdmin = msg.from === "admin";
                  const isLast = idx === messages.length - 1;
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start" }}>
                      {!isAdmin && <p className="text-[10.5px] text-slate-400 mb-1 pl-1">{msg.senderName}</p>}
                      <div style={{
                        maxWidth: "72%", padding: "9px 13px",
                        borderRadius: isAdmin ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: isAdmin ? "linear-gradient(135deg, #9B2242, #0b3a86)" : "#F1F5F9",
                        color: isAdmin ? "#fff" : "#0F172A",
                        fontSize: 13.5, lineHeight: 1.5,
                      }}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] text-slate-300">{formatTime(msg.createdAt)}</span>
                        {isAdmin && isLast && (
                          selectedThread?.lastMessageRead
                            ? <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: "#16A34A" }}>
                                <CheckCheck style={{ width: 11, height: 11 }} /> Seen
                              </span>
                            : <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                                <Clock style={{ width: 10, height: 10 }} /> Unseen
                              </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2 relative" style={{ background: "#FAFAFA" }}>
                {/* Emoji picker */}
                {showEmoji && (
                  <div style={{
                    position: "absolute", bottom: 60, left: 12, right: 12,
                    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
                    padding: "10px", boxShadow: "0 4px 20px rgba(15,23,42,0.12)",
                    display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4,
                    zIndex: 10,
                  }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => insertEmoji(e)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 18, lineHeight: 1, padding: "3px", borderRadius: 6,
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={el => (el.currentTarget.style.background = "#F1F5F9")}
                        onMouseLeave={el => (el.currentTarget.style.background = "none")}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowEmoji(prev => !prev)}
                  className="w-8 h-8 rounded-lg border-none flex items-center justify-center shrink-0 transition"
                  style={{ background: showEmoji ? "#E2E8F0" : "transparent", cursor: "pointer" }}>
                  <Smile style={{ width: 18, height: 18, color: showEmoji ? "#1B3A6B" : "#94A3B8" }} />
                </button>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Tulis balasan..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] bg-white outline-none focus:border-slate-400 transition"
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-xl border-none flex items-center justify-center shrink-0 transition"
                  style={{
                    background: text.trim() ? "linear-gradient(135deg, #9B2242, #0b3a86)" : "#E2E8F0",
                    cursor: text.trim() ? "pointer" : "default",
                  }}>
                  <Send style={{ width: 16, height: 16, color: text.trim() ? "#fff" : "#94A3B8" }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
