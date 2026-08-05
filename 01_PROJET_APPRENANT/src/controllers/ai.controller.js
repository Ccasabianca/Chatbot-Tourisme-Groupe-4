import { askGroq } from "../services/groq.service.js";
import { APP_CONFIG } from "../config/constants.js";

const ALLOWED_ROLES = new Set(["user", "assistant"]);

function isValidMessage(message) {
  return message && ALLOWED_ROLES.has(message.role) && typeof message.content === "string" && message.content.trim();
}

export async function generateAnswer(req, res) {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: { code: "INVALID_MESSAGES", message: "Messages ne peut pas être un tableau vide." } });
    }
    for (const message of messages) {
      if (!isValidMessage(message)) {
        return res.status(400).json({ success: false, error: { code: "INVALID_MESSAGE", message: "Chaque objet du tableau messages doit contenir un rôle autorisé et un contenu non vide." } });
      }
    }

    let cleanMessages = messages.map(({ role, content }) => ({ role, content: content.trim() }));

    if (cleanMessages.length > process.env.MAX_MESSAGES) {
      // cleanMessages = messages.slice(1, process.env.MAX_MESSAGES);
      console.log("if", cleanMessages);
    }
    else {
      // cleanMessages = messages.map(({ role, content }) => ({ role, content: content.trim() }));
      console.log("else", cleanMessages);
    }
    const answer = await askGroq(cleanMessages);


    return res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    console.error("Erreur dans le contrôleur IA :", error);
    return res.status(500).json({ success: false, error: { code: "AI_GENERATION_ERROR", message: "Une erreur est survenue lors de la génération de la réponse." } });
  }
}
