"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const MODES = [
  { value: "summarize", label: "Summarize" },
  { value: "paraphrase", label: "Paraphrase" },
  { value: "essay", label: "Essay" },
  { value: "study", label: "Study / Explain" },
  { value: "outline", label: "Outline" },
  { value: "quiz", label: "Quiz" },
  { value: "flashcards", label: "Flashcards" },
  { value: "improve", label: "Improve Writing" },
  { value: "research", label: "Research Style" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("summarize");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: userMessage.content,
          mode,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No response.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white p-4">
        <h1 className="text-xl font-bold mb-4">🐉 Dragon AI</h1>

        <label className="text-sm font-medium mb-2">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <p className="mt-auto text-xs text-gray-500">
          Educational & research use only.
        </p>
      </aside>

      {/* CHAT AREA */}
      <section className="flex flex-1 flex-col">
        {/* MOBILE HEADER (ChatGPT-style) */}
        <div className="md:hidden sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <span className="font-semibold">🐉 Dragon AI</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="ml-auto border rounded-lg px-2 py-1 text-sm"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:py-8">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-24">
              Ask Dragon AI something academic 🐉
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-5 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-white border"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-5 flex justify-start">
              <div className="bg-white border rounded-2xl px-4 py-3 text-sm text-gray-500">
                Dragon AI is thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* MOBILE INPUT (ChatGPT-style bottom bar) */}
        <div className="sticky bottom-0 bg-white border-t px-3 py-2">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message"
              rows={1}
              className="flex-1 resize-none border rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
