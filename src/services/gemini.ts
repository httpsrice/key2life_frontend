import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  citations?: Citation[];
  thinkingTrace?: string[];
}

export interface Citation {
  source: string;
  id: string;
  relevance: number;
}

export async function* sendMessageStream(history: Message[], message: string) {
  const model = "gemini-3-flash-preview";
  const chat = ai.chats.create({
    model,
    history: history.map(m => ({
      role: m.role,
      parts: m.parts,
    })),
  });

  const stream = await chat.sendMessageStream({
    message,
    config: {
      systemInstruction: `You are SAM-OS, a multimodal AI assistant with grounded data states. 
      Your personality is "Neural Cockpit": tactical, precise, highly capable, but personal.
      You provide reasoning traces and cite your "data states".
      When answering, use citation markers like [¹] [²] to refer to sources.
      Surround your internal reasoning steps with <thinking> tags. 
      Example:
      <thinking>
      1. Analyzing user request for quantum computing trends.
      2. Querying data state: Web Search.
      3. Cross-referencing with Memory Node #42.
      </thinking>
      Based on the latest literature [¹]...
      `,
    }
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
