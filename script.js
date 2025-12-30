// --- НАСТРОЙКИ ---
// Я добавил .trim(), чтобы код сам убирал лишние пробелы, если они попадут в ключ
const OPENAI_API_KEY = "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".trim(); 
const API_URL = "https://api.openai.com/v1/chat/completions";

const messagesContainer = document.getElementById("messages");
const input = document.getElementById("userInput");
const typingBox = document.getElementById("typing-box");
const historyList = document.getElementById("history");

// Твоя база ответов
const localAnswers = {
    "пицца": "Рецепт пиццы от Темирлана: 1. Тесто. 2. Соус. 3. Сыр. 4. Печь! 🍕",
    "создатель": "Меня создал великий Темирлан! 😎",
    "привет": "Привет! Я твой ИИ. О чем сегодня поговорим? 👋"
};

// --- ИНИЦИАЛИЗАЦИЯ ---
window.onload = () => {
    renderHistory();
    addMessage("Бот", "Я на связи через OpenAI! Спрашивай что угодно. 🚀", "bot");
};

// --- ФУНКЦИИ ИСТОРИИ ---
function saveToHistory(text) {
    let history = JSON.parse(localStorage.getItem("ai_chat_history")) || [];
    if (history[0] !== text) {
        history.unshift(text);
        if (history.length > 15) history.pop();
        localStorage.setItem("ai_chat_history", JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    let history = JSON.parse(localStorage.getItem("ai_chat_history")) || [];
    history.forEach((text, index) => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
            <span class="history-text" onclick="useHistoryItem('${text}')">${text}</span>
            <button class="delete-item-btn" onclick="deleteHistoryItem(${index})">✕</button>
        `;
        historyList.appendChild(item);
    });
}

function useHistoryItem(text) {
    input.value = text;
    sendMessage();
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem("ai_chat_history")) || [];
    history.splice(index, 1);
    localStorage.setItem("ai_chat_history", JSON.stringify(history));
    renderHistory();
}

// --- ЛОГИКА ЧАТА ---
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("Вы", text, "user");
    saveToHistory(text);
    input.value = "";
    
    if (typingBox) typingBox.style.display = "flex";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const response = await getBotResponse(text);

    if (typingBox) typingBox.style.display = "none";
    addMessage("Бот", response, "bot");
}

async function getBotResponse(text) {
    const lowText = text.toLowerCase();
    for (let key in localAnswers) {
        if (lowText.includes(key)) return localAnswers[key];
    }

    // Очистка ключа от невидимых символов (защита от ошибки ISO-8859-1)
    const cleanKey = OPENAI_API_KEY.replace(/[\u200B-\u200D\uFEFF]/g, "");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + cleanKey
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: text }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenAI Error:", data.error);
            return `Ошибка OpenAI: ${data.error.message}`;
        }

        return data.choices[0].message.content;
    } catch (e) {
        console.error("Детальная ошибка:", e);
        return `Ошибка связи: ${e.message}. Проверь VPN или ключ.`;
    }
}

function addMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

// Привязка событий
const sendBtn = document.getElementById("sendBtn");
if (sendBtn) sendBtn.onclick = sendMessage;

input.onkeydown = (e) => { 
    if (e.key === "Enter") { 
        e.preventDefault(); 
        sendMessage(); 
    } 
};
