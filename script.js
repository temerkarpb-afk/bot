// --- НАСТРОЙКИ ---
const OPENAI_API_KEY = "ВАШ_КЛЮЧ_OPENAI"; // Замените на свой ключ
const API_URL = "https://api.openai.com/v1/chat/completions";

const messagesContainer = document.getElementById("messages");
const input = document.getElementById("userInput");
const typingBox = document.getElementById("typing-box");
const historyList = document.getElementById("history");

// Твоя старая база ответов
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

// --- ФУНКЦИИ ИСТОРИИ (БЕЗ ИЗМЕНЕНИЙ) ---
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

// --- ЛОГИКА ЧАТА (ОБНОВЛЕНА ПОД OPENAI) ---
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("Вы", text, "user");
    saveToHistory(text);
    input.value = "";
    
    typingBox.style.display = "flex";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const response = await getBotResponse(text);

    typingBox.style.display = "none";
    addMessage("Бот", response, "bot");
}

async function getBotResponse(text) {
    const lowText = text.toLowerCase();
    for (let key in localAnswers) {
        if (lowText.includes(key)) return localAnswers[key];
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}` // Ключ теперь передается в заголовке
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Указываем модель
                messages: [{ role: "user", content: text }] // Структура OpenAI
            })
        });

        const data = await response.json();

        if (data.error) {
            return `Ошибка OpenAI: ${data.error.message}`;
        }

        return data.choices[0].message.content; // Путь к ответу в OpenAI
    } catch (e) {
        return "Ошибка подключения. Проверь VPN (если ты в РФ) или баланс API ключа. 🛠️";
    }
}

function addMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

document.getElementById("sendBtn").onclick = sendMessage;
input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } };
