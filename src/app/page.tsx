"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
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
        body: JSON.stringify({ input: userMessage.content }),
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
      <section className="flex flex-1 flex-col">
        {/* MOBILE / DESKTOP HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <h1 className="font-semibold">🐉 Dragon AI</h1>
          <p className="text-xs text-gray-500">
            Academic research assistant
          </p>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-24">
              Ask an academic question to begin
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
                Thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <div className="sticky bottom-0 bg-white border-t px-3 py-2">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an academic question…"
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
