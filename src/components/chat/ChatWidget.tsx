"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, ChevronDown, Smile } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, onSnapshot,
  serverTimestamp, doc, setDoc, updateDoc, increment,
  Timestamp,
} from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  from: "candidate" | "admin";
  senderName: string;
  createdAt: Date | null;
}

export function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => {
    if (!user) return;

    const msgsRef = collection(db, "chats", user.uid, "messages");
    const threadRef = doc(db, "chats", user.uid);

    const unsub = onSnapshot(msgsRef,
      snap => {
        const msgs: Message[] = snap.docs.map(d => ({
          id: d.id,
          text: d.data().text as string,
          from: d.data().from as "candidate" | "admin",
          senderName: d.data().senderName as string,
          createdAt: (d.data().createdAt as Timestamp | null)?.toDate() ?? null,
        }));
        msgs.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
        setMessages(msgs);

        // If panel is open and the latest message is from admin, mark as read immediately
        const lastMsg = msgs[msgs.length - 1];
        if (openRef.current && lastMsg?.from === "admin") {
          updateDoc(threadRef, { unreadCandidate: 0, lastMessageRead: true }).catch(() => {});
        }
      },
      err => console.error("[ChatWidget] onSnapshot error:", err)
    );

    return () => unsub();
  }, [user]);

  // Track unread admin messages
  useEffect(() => {
    if (!user) return;
    const threadRef = doc(db, "chats", user.uid);
    const unsub = onSnapshot(threadRef, snap => {
      if (snap.exists()) {
        setUnread((snap.data().unreadCandidate as number) ?? 0);
      }
    });
    return () => unsub();
  }, [user]);

  // Mark read when panel opens
  useEffect(() => {
    if (!open || !user) return;
    setUnread(0);
    updateDoc(doc(db, "chats", user.uid), {
      unreadCandidate: 0,
      lastMessageRead: true,
    }).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  const send = async () => {
    if (!text.trim() || !user || sending) return;
    const msg = text.trim();
    setText("");
    setSending(true);
    try {
      const name = user.displayName ?? user.email?.split("@")[0] ?? "Kandidat";
      const msgsRef = collection(db, "chats", user.uid, "messages");
      await addDoc(msgsRef, {
        text: msg,
        from: "candidate",
        senderName: name,
        createdAt: serverTimestamp(),
      });
      // Update thread metadata
      await setDoc(doc(db, "chats", user.uid), {
        displayName: name,
        email: user.email ?? "",
        uid: user.uid,
        lastMessage: msg,
        lastAt: serverTimestamp(),
        lastMessageFrom: "candidate",
        lastMessageRead: true,
        unreadAdmin: increment(1),
        unreadCandidate: 0,
      }, { merge: true });
      fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: "admin",
          title: name,
          body: msg.length > 100 ? msg.slice(0, 97) + "…" : msg,
          link: "/admin/chat",
        }),
      }).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const EMOJIS = [
    "😊","😂","🥰","😍","🙏","❤️","💕","✨","😅","🤣",
    "😭","🥹","😁","🫶","💪","👍","🎉","🌸","🌺","💐",
    "🤲","☝️","🫰","🤝","👋","🫡","🥲","😔","🤔","😶",
  ];

  const formatTime = (d: Date | null) => {
    if (!d) return "";
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 20, width: 340, height: 480,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 8px 40px rgba(15,23,42,0.18)",
          display: "flex", flexDirection: "column", zIndex: 1000,
          border: "1px solid #E2E8F0",
          overflow: "visible",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: "1px solid #E2E8F0",
            background: "linear-gradient(to right, #9B2242, #0b3a86)",
            display: "flex", alignItems: "center", gap: 10,
            borderRadius: "16px 16px 0 0", flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <MessageCircle style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: 0 }}>Tim Jodohmu</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0 }}>Kami siap membantu kamu</p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: 8, padding: 6, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronDown style={{ width: 16, height: 16, color: "#fff" }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 12px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
                  Halo! Ada yang bisa kami bantu? Kirim pesan di sini dan tim kami akan segera membalasnya.
                </p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.from === "candidate";
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "80%", padding: "8px 12px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isMe ? "linear-gradient(135deg, #9B2242, #0b3a86)" : "#F1F5F9",
                    color: isMe ? "#fff" : "#0F172A",
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: "#CBD5E1", marginTop: 2, paddingLeft: 4, paddingRight: 4 }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Emoji picker */}
          {showEmoji && (
            <div style={{
              position: "absolute", bottom: 70, right: 12, left: 12,
              background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
              padding: "10px", boxShadow: "0 4px 20px rgba(15,23,42,0.12)",
              display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4,
              zIndex: 10,
            }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => insertEmoji(e)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 18, lineHeight: 1, padding: "3px",
                    borderRadius: 6, transition: "background 0.1s",
                  }}
                  onMouseEnter={el => (el.currentTarget.style.background = "#F1F5F9")}
                  onMouseLeave={el => (el.currentTarget.style.background = "none")}>
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 12px", borderTop: "1px solid #E2E8F0",
            display: "flex", alignItems: "center", gap: 8, background: "#FAFAFA",
            position: "relative",
          }}>
            <button
              onClick={() => setShowEmoji(prev => !prev)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: showEmoji ? "#E2E8F0" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0, transition: "background 0.15s",
              }}>
              <Smile style={{ width: 18, height: 18, color: showEmoji ? "#1B3A6B" : "#94A3B8" }} />
            </button>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ketik pesan..."
              style={{
                flex: 1, border: "1px solid #E2E8F0", borderRadius: 10,
                padding: "8px 12px", fontSize: 13, background: "#fff",
                outline: "none", color: "#0F172A",
              }}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none",
                background: text.trim() ? "linear-gradient(135deg, #9B2242, #0b3a86)" : "#E2E8F0",
                cursor: text.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                transition: "background 0.15s",
              }}>
              <Send style={{ width: 15, height: 15, color: text.trim() ? "#fff" : "#94A3B8" }} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: "fixed", bottom: 24, right: 20, width: 52, height: 52,
          borderRadius: "50%", border: "none",
          background: open ? "#64748B" : "linear-gradient(135deg, #9B2242, #0b3a86)",
          boxShadow: "0 4px 20px rgba(15,23,42,0.25)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1001, transition: "background 0.2s, transform 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        title="Chat dengan Tim Jodohmu"
      >
        {open
          ? <X style={{ width: 22, height: 22, color: "#fff" }} />
          : <MessageCircle style={{ width: 22, height: 22, color: "#fff" }} />
        }
        {!open && unread > 0 && (
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 18, height: 18, borderRadius: "50%",
            background: "#EF4444", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff",
          }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>
    </>
  );
}
