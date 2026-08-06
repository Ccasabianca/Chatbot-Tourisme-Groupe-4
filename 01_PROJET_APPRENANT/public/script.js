const form = document.querySelector("#chat-form");
const promptInput = document.querySelector("#prompt");
const statusElement = document.querySelector("#status");
const conversationElement = document.querySelector("#conversation");
const submitButton = document.querySelector("#submit-button");
const resetButton = document.querySelector("#reset-button");

let loadingMessage = null;
let conversationHistory = [];

function scrollConversationToBottom() { conversationElement.scrollTop = conversationElement.scrollHeight; }

function createMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role}-message`;
  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}-avatar`;
  avatar.textContent = role === "user" ? "VOUS" : "IN";
  avatar.setAttribute("aria-hidden", "true");
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "message-content";
  const meta = document.createElement("div"); meta.className = "message-meta";
  const author = document.createElement("strong"); author.textContent = role === "user" ? "Vous" : "VisitFrance";
  const detail = document.createElement("span"); detail.textContent = role === "user" ? "Votre message" : "Assistant de voyage";
  meta.append(author, detail);
  const bubble = document.createElement("div"); bubble.className = "bubble";
  const paragraph = document.createElement("p"); paragraph.textContent = content;
  bubble.appendChild(paragraph); contentWrapper.append(meta, bubble); article.append(avatar, contentWrapper);
  return article;
}

function addMessage(role, content) { conversationElement.appendChild(createMessage(role, content)); scrollConversationToBottom(); }
function showLoadingMessage() {
  loadingMessage = document.createElement("article"); loadingMessage.className = "message assistant-message";
  loadingMessage.innerHTML = `<div class="avatar assistant-avatar" aria-hidden="true">VF</div><div class="message-content"><div class="message-meta"><strong>VisitFrance</strong><span>Assistant de voyage</span></div><div class="bubble loading-bubble"><span>Analyse en cours</span><span class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></span></div></div>`;
  conversationElement.appendChild(loadingMessage); scrollConversationToBottom();
}
function hideLoadingMessage() { loadingMessage?.remove(); loadingMessage = null; }
function setLoading(isLoading) { submitButton.disabled = isLoading; promptInput.disabled = isLoading; statusElement.textContent = isLoading ? "Réponse en cours de génération..." : ""; isLoading ? showLoadingMessage() : hideLoadingMessage(); }

async function sendMessage() {
  const prompt = promptInput.value.trim();
  if (!prompt || submitButton.disabled) return;
  addMessage("user", prompt); promptInput.value = "";
  conversationHistory.push({ role: "user", content: prompt });
  setLoading(true);
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Une erreur est survenue.");
    hideLoadingMessage(); addMessage("assistant", data.data.answer);
    conversationHistory.push({ role: "assistant", content: data.data.answer });
    // Save history
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
  } catch (error) {
    hideLoadingMessage(); addMessage("assistant", `Je n'ai pas pu répondre à votre demande : ${error.message}`);
  } finally { setLoading(false); promptInput.disabled = false; promptInput.focus(); }
}
form.addEventListener("submit", (event) => { event.preventDefault(); sendMessage(); });
promptInput.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
resetButton.addEventListener("click", () => {
  conversationHistory = [];
  localStorage.setItem('chatHistory', null);
  conversationElement.innerHTML = `<article class="message assistant-message"><div class="avatar assistant-avatar" aria-hidden="true">VF</div><div class="message-content"><div class="message-meta"><strong>VisitFrance</strong><span>Assistant de voyage</span></div><div class="bubble"><p>La conversation et sa mémoire ont été réinitialisées. Comment puis-je vous aider ?</p></div></div></article>`;
  promptInput.focus();
});

// Initialise saved history on chat load.
function initChat() {
  const savedHistory = JSON.parse(localStorage.getItem('chatHistory'));
  if(!savedHistory) {
    return
  }
  savedHistory.forEach(({ role, content }) => addMessage(role, content))
}
initChat();