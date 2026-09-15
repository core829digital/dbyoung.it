"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Msg {
  from: "user" | "dby";
  text: string;
}

export function ChatWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[] | null>(null);

  const history = msgs ?? [{ from: "dby", text: t.chat.hello } as Msg];

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs([...history, { from: "user", text }]);
    setInput("");
    // TODO: collegare a Convex (convex/chat.ts) per chat realtime + Resend notify
    setTimeout(() => {
      setMsgs((m) => [...(m ?? [{ from: "dby", text: t.chat.hello } as Msg]), { from: "dby", text: t.chat.reply }]);
    }, 900);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[420px] w-[320px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-obsidian-soft shadow-card">
          <div className="flex items-center justify-between bg-gradient-to-r from-fire to-fire-deep px-4 py-3">
            <p className="text-sm font-semibold text-white">{t.chat.title}</p>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-4 w-4 text-white" /></button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {history.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <p className={m.from === "user" ? "max-w-[80%] rounded-2xl rounded-br-sm bg-fire px-3 py-2 text-sm text-white" : "max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85"}>
                  {m.text}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t.chat.placeholder}
              className="h-10 flex-1 rounded-full border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none"
            />
            <button onClick={send} aria-label="Send" className="btn-fire flex h-10 w-10 items-center justify-center rounded-full">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="btn-fire flex h-14 w-14 items-center justify-center rounded-full"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
