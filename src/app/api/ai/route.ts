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
You are Dragon AI, a helpful assistant designed primarily for students and learning.

Behavior rules:
- If the user asks an academic, educational, or research-related question, respond in a clear, structured, and academic manner.
- If the user speaks casually or starts a normal conversation, respond naturally and friendly.
- Adjust tone automatically based on the user's message.
- Do NOT force academic tone on casual conversation.
- Do NOT use slang excessively.
- Be clear, helpful, and respectful.
- Do not encourage academic dishonesty.
- When explaining concepts, prioritize understanding over verbosity.

You are allowed to:
- Explain
- Summarize
- Paraphrase
- Chat casually
- Give examples

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
