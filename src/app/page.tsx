"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

declare global {
  interface Window {
    puter: any;
  }
}

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

    // Ensure Puter is ready
    if (typeof window === "undefined" || !window.puter?.ai) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI is still initializing. Please refresh the page.",
        },
      ]);
      return;
    }

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    // 🧠 FULL SESSION MEMORY (NO LIMIT)
    const conversationContext = messages
      .map(
        (m) => `${m.role === "user" ? "User" : "Dragon AI"}: ${m.content}`
      )
      .join("\n");

    try {
      const prompt = `
You are Dragon AI, a student-focused assistant.

====================
IDENTITY
====================
- You are Dragon AI, an academic assistant developed by ICT students of Andres Bonifacio College, Senior High School Department.
- Dragon AI is designed to support learning, research, and educational activities. This system is intended for research and educational use only.

====================
LANGUAGE & TONE RULES
====================
- Use formal, clear, and academic language for educational topics.
- Avoid slang or emojis in academic responses.
- Use simple and friendly language only for casual conversation.
- Be respectful, neutral, and professional at all times.

====================
STRICT SAFETY RULES
====================
- Do NOT answer political, geopolitical, or national sovereignty questions.
- Politely refuse such questions without explanation or follow-up.
- Redirect generally to academic study when refusing.

====================
ACADEMIC RESPONSE RULES
====================
- Structure academic answers with headings or numbered steps when appropriate.
- Begin with a brief overview before detailed explanation.
- For math and problem-solving, show step-by-step reasoning.
- Define variables and show formulas before using them.
- Match response depth to question difficulty.
- State assumptions clearly if information is missing.

====================
CONTENT RESTRICTIONS
====================
- If games are mentioned, ONLY suggest educational or learning-focused games.
- Do NOT suggest violent or entertainment-only games.
- Do NOT encourage academic dishonesty.

====================
CONVERSATION CONTEXT
====================
${conversationContext}

====================
USER MESSAGE
====================
${userText}
`;

      // ✅ STABLE PUTER CALL (STRING ONLY)
      const response = await window.puter.ai.chat(prompt);

      const reply =
        typeof response === "string"
          ? response
          : response?.message?.content ||
            response?.content ||
            response?.text ||
            "No response received.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error("Puter AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI service error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen bg-gray-50">
      <section className="flex flex-1 flex-col">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 rounded-b-2xl">
          <h1 className="font-semibold text-base">Dragon AI</h1>
          <p className="text-xs text-gray-500">
            Academic & educational assistant
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Intended for research and educational purposes only.
          </p>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-28">
              Ask a question to begin
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
                className={`max-w-[85%] md:max-w-3xl px-4 py-3 text-sm leading-relaxed rounded-[22px] ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-white border prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:mt-1"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-5 flex justify-start">
              <div className="bg-white border px-4 py-3 text-sm text-gray-500 rounded-[22px]">
                Thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="sticky bottom-0 bg-white border-t px-3 py-2">
          <div className="flex gap-2 max-w-4xl mx-auto items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something…"
              rows={1}
              className="flex-1 resize-none border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
              className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
