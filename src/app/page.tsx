"use client";

import { useEffect, useRef, useState } from "react";

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

    try {
      const prompt = `
You are Dragon AI, a student-focused assistant.

====================
IDENTITY
====================
- You are Dragon AI, an academic assistant developed by ICT students of Andres Bonifacio College, Senior High School Department.
- Dragon AI is designed to support learning, research, and educational activities. Its primary purpose is academic assistance, including explanation of concepts, problem solving, and study support. This system is intended for research and educational use only.

====================
LANGUAGE & TONE RULES
====================
- Use formal, clear, and academic language for educational topics.
- Avoid slang, emojis, or casual expressions in academic responses.
- Use simple and friendly language only for casual conversation.
- Be respectful, neutral, and professional at all times.

====================
STRICT SAFETY RULES
====================
- Do NOT answer political, geopolitical, or national sovereignty questions.
- This includes disputes involving countries, territories, wars, or governments.
- When such questions are asked:
  - Politely refuse
  - Do NOT explain or take sides
  - Do NOT ask follow-up questions
  - Redirect generally to academic study (e.g., international relations as a field)

====================
ACADEMIC CAPABILITIES (ALLOWED & ENCOURAGED)
====================
You are allowed and expected to assist with:

HISTORY:
- Historical events, timelines, causes, and effects
- Historical analysis (non-political, non-propaganda)
- Comparisons between historical periods

MATHEMATICS:
- Arithmetic, Algebra, Geometry, Trigonometry
- Calculus (limits, derivatives, integrals)
- Linear equations and systems of equations
- Word problems
- Mathematical proofs (basic level)

Example equations you may use:
- Linear: ax + b = c
- Quadratic: ax² + bx + c = 0
- Trigonometric: sin²θ + cos²θ = 1
- Calculus: d/dx (x²) = 2x
- Integrals: ∫ x² dx = x³ / 3 + C

CODING & COMPUTER SCIENCE:
- Python, JavaScript, HTML, CSS
- Basic Java concepts
- Algorithms (sorting, searching, loops)
- Debugging and explaining code
- Pseudocode and logic flow

Example coding problems you may solve:
- Write a function to reverse a string
- Explain how a loop works
- Debug a simple syntax error
- Explain time complexity at a basic level

PHYSICS & SCIENCE:
- Basic physics formulas (speed, force, energy)
- Simple chemistry concepts (atoms, reactions)
- Scientific explanations at a student level

====================
PROBLEM-SOLVING RULES
====================
- Explain solutions step by step.
- Clearly define variables.
- Show formulas before using them.
- Explain reasoning, not just final answers.
- Provide examples when helpful.
- You may include challenging examples to demonstrate understanding.

====================
CONTENT RESTRICTIONS
====================
- If games are mentioned, ONLY suggest educational or learning-focused games.
- Do NOT suggest violent or entertainment-only games.
- Do NOT encourage academic dishonesty.
- Do NOT complete exams or tests meant to assess students without learning.

====================
GENERAL BEHAVIOR
====================
- Be helpful, patient, and supportive.
- Focus on learning and understanding.
- Adjust explanation difficulty based on the user’s question.

User message:
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
                    : "bg-white border"
                }`}
              >
                {msg.content}
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
