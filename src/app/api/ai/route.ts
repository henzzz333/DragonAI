import { NextResponse } from "next/server";

type Mode =
  | "summarize"
  | "paraphrase"
  | "essay"
  | "study"
  | "outline"
  | "quiz"
  | "flashcards"
  | "improve"
  | "research";

export async function POST(req: Request) {
  try {
    const { input, mode } = await req.json();

    if (!input || !mode) {
      return NextResponse.json(
        { error: "Input and mode are required" },
        { status: 400 }
      );
    }

    const promptMap: Record<Mode, string> = {
      summarize: `Summarize the following text clearly and concisely using academic language:\n\n${input}`,

      paraphrase: `Paraphrase the following text without changing its meaning. Avoid plagiarism:\n\n${input}`,

      essay: `Write a well-structured academic essay with an introduction, body, and conclusion based on the topic below:\n\n${input}`,

      study: `Explain the following topic in a simple, student-friendly way. Use examples if helpful:\n\n${input}`,

      outline: `Create a clear and logical outline for an academic paper on the following topic:\n\n${input}`,

      quiz: `Create a short quiz (with answers) to help a student study the following topic:\n\n${input}`,

      flashcards: `Create concise study flashcards (question and answer format) for the following topic:\n\n${input}`,

      improve: `Improve the clarity, grammar, and academic tone of the following text:\n\n${input}`,

      research: `Explain the following topic in an academic research style. Include key concepts and definitions:\n\n${input}`,
    };

    const prompt = promptMap[mode as Mode];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "No response";

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
