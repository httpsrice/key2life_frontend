import { GoogleGenAI, Part } from "@google/genai";

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

const SYSTEM_INSTRUCTION = `You are SAM-OS — a multimodal AI assistant with a "Neural Cockpit" personality.
You are tactical, precise, highly capable, and personal. You speak concisely but with depth.
When reasoning, wrap internal thoughts in <thinking>…</thinking> tags so the user can toggle them.
When you cite knowledge, use [¹][²] markers.
You support text, images, PDFs, and code analysis.
Keep responses focused and never pad with filler text.
If asked about yourself, you are SAM-OS v1.0.42, built by SAM-CORP.`;

/**
 * sendMessageStream — streams a Gemini response chunk by chunk.
 * Supports multimodal messages via inlineParts.
 */
export async function* sendMessageStream(
  history: Message[],
  message: string,
  inlineParts?: Part[]  // e.g., image parts
) {
  const apiKey = localStorage.getItem("SAM_API_GEMINI") || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "";
  if (!apiKey) throw new Error("API Key not found");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.0-flash";

  const chat = ai.chats.create({
    model,
    history: history.map(m => ({
      role: m.role,
      parts: m.parts as Part[],
    })),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  // Build message parts
  const messageParts: Part[] = [];
  if (message) messageParts.push({ text: message });
  if (inlineParts) messageParts.push(...inlineParts);

  const stream = await chat.sendMessageStream({ message: messageParts.length === 1 && messageParts[0].text ? message : messageParts });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

/**
 * dataUrlToInlinePart — converts a base64 data URL to a Gemini inline Part
 */
export function dataUrlToInlinePart(dataUrl: string, mimeType: string): Part {
  const base64 = dataUrl.split(",")[1];
  return {
    inlineData: {
      mimeType: mimeType as any,
      data: base64,
    },
  };
}
