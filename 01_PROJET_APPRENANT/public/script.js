const form = document.querySelector("#chat-form");
const promptInput = document.querySelector("#prompt");
const statusElement = document.querySelector("#status");
const conversationElement = document.querySelector("#conversation");
const submitButton = document.querySelector("#submit-button");
const resetButton = document.querySelector("#reset-button");
const suggestionChips = document.querySelectorAll(".suggestion-chip");

let loadingMessage = null;
let conversationHistory = [];

function scrollConversationToBottom() { conversationElement.scrollTop = conversationElement.scrollHeight; }

function adjustPromptHeight() {
  promptInput.style.height = "auto";
  promptInput.style.height = `${Math.min(promptInput.scrollHeight + 2, 180)}px`;
}

function createMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role}-message`;
  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}-avatar`;
  avatar.textContent = role === "user" ? "Vous" : "VF";
  avatar.setAttribute("aria-hidden", "true");
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "message-content";
  const bubble = document.createElement("div"); bubble.className = "bubble";
  const author = document.createElement("span"); author.className = "sr-only";
  author.textContent = role === "user" ? "Vous : " : "VisitFrance : ";
  const paragraph = document.createElement("p"); paragraph.textContent = content;
  bubble.append(author, paragraph); contentWrapper.appendChild(bubble); article.append(avatar, contentWrapper);
  return article;
}

function addMessage(role, content) { const message = createMessage(role, content); conversationElement.appendChild(message); scrollConversationToBottom(); return message; }
function showLoadingMessage() {
  loadingMessage = document.createElement("article"); loadingMessage.className = "message assistant-message";
  loadingMessage.innerHTML = `<div class="avatar assistant-avatar" aria-hidden="true">VF</div><div class="message-content"><div class="bubble loading-bubble"><span>Réponse en cours...</span><span class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></span></div></div>`;
  conversationElement.appendChild(loadingMessage); scrollConversationToBottom();
}
function hideLoadingMessage() { loadingMessage?.remove(); loadingMessage = null; }
function setLoading(isLoading) { submitButton.disabled = isLoading; promptInput.disabled = isLoading; statusElement.textContent = isLoading ? "Réponse en cours de génération..." : ""; isLoading ? showLoadingMessage() : hideLoadingMessage(); }

async function sendMessage() {
  const prompt = promptInput.value.trim();
  if (!prompt || submitButton.disabled) return;
  addMessage("user", prompt); promptInput.value = ""; adjustPromptHeight();
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
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
  } catch (error) {
    hideLoadingMessage(); addMessage("assistant", `Je n'ai pas pu répondre à votre demande : ${error.message}`).classList.add("error-message");
  } finally { setLoading(false); promptInput.disabled = false; promptInput.focus(); }
}
form.addEventListener("submit", (event) => { event.preventDefault(); sendMessage(); });
promptInput.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
promptInput.addEventListener("input", adjustPromptHeight);
suggestionChips.forEach((chip) => chip.addEventListener("click", () => { promptInput.value = chip.textContent.trim(); sendMessage(); }));
resetButton.addEventListener("click", () => {
  conversationHistory = [];
  localStorage.removeItem("chatHistory");
  conversationElement.innerHTML = `<article class="message assistant-message"><div class="avatar assistant-avatar" aria-hidden="true">VF</div><div class="message-content"><div class="bubble"><span class="sr-only">VisitFrance : </span><p>La conversation et sa mémoire ont été réinitialisées. Comment puis-je vous aider ?</p></div></div></article>`;
  promptInput.focus();
});

function initChat() {
  const savedHistory = JSON.parse(localStorage.getItem('chatHistory'));
  if (!savedHistory) {
    return;
  }
  conversationHistory = savedHistory;
  savedHistory.forEach(({ role, content }) => addMessage(role, content));
}
initChat();
