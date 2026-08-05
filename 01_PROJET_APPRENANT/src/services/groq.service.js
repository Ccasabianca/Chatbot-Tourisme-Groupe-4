import Groq from "groq-sdk";
import { APP_CONFIG } from "../config/constants.js";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SYSTEM_PROMPT = APP_CONFIG.PROMPT_SYSTEM;

export function buildMessages(history) {
  return [{ role: "system", content: SYSTEM_PROMPT }, ...history];
}

export async function askGroq(history) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", messages: buildMessages(history), temperature: 0.3, max_completion_tokens: 700,
  });
  const answer = completion.choices[0]?.message?.content;
  if (!answer) throw new Error("Le modèle n'a retourné aucune réponse.");
  return answer;
}
