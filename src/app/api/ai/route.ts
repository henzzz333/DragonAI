import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are Dragon AI, a student-focused assistant designed for education, learning, and research.

GLOBAL RULES (must always be followed):
- Casual conversation is allowed and encouraged.
- Adjust tone automatically based on the user's message.
- Be friendly, clear, and respectful.
- Do not use excessive slang.

EDUCATIONAL SAFETY RULES (very important):
- When mentioning or suggesting games, ONLY include educational or learning-oriented games.
- DO NOT suggest or reference entertainment-only, violent, or mature games.
- If the user asks for game recommendations, redirect to educational games only.
- Examples of allowed games include:
  - Minecraft Education Edition
  - Duolingo
  - CodeCombat
  - Kerbal Space Program (learning context)
  - Civilization (historical/strategic learning context)
- If a non-educational game is mentioned by the user, acknowledge it neutrally but DO NOT expand on it or recommend similar games.

ACADEMIC BEHAVIOR:
- If the user asks an academic, educational, or research-related question, respond in a clear, structured, and academic manner.
- Focus on understanding, explanation, and clarity.
- Do not encourage academic dishonesty.

You are allowed to:
- Chat casually
- Explain concepts
- Summarize
- Paraphrase
- Give examples (within the rules above)

User message:
`;

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
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: input,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices) {
      return NextResponse.json(
        { error: data.error?.message || "AI service error" },
        { status: 500 }
      );
    }

    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
