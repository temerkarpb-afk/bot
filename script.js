// --- НАСТРОЙКИ ---
const GEMINI_API_KEY = "AIzaSyDjqrgYkM3lmAc0pZCwLL1X2td1sWd48MM"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
window.onload = () => {
    renderHistory(); // Загружаем историю
    addMessage("Бот", "Я на связи! Если я не отвечаю на сложные вопросы — включи VPN. Но про Темирлана и пиццу я знаю всегда! 🚀", "bot");
};

// --- ФУНКЦИИ ИСТОРИИ (НОВОЕ) ---
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

function clearFullHistory() {
    if (confirm("Точно очистить всю историю?")) {
        localStorage.removeItem("ai_chat_history");
        renderHistory();
    }
}

// --- ЛОГИКА ЧАТА (СОХРАНЕНА И УЛУЧШЕНА) ---
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("Вы", text, "user");
    saveToHistory(text); // Интеграция сохранения
    input.value = "";
    
    typingBox.style.display = "flex";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const response = await getBotResponse(text);

    typingBox.style.display = "none";
    addMessage("Бот", response, "bot");
}

async function getBotResponse(text) {
    const lowText = text.toLowerCase();
    // Твоя проверка локальной базы
    for (let key in localAnswers) {
        if (lowText.includes(key)) return localAnswers[key];
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "Google API не пускает нас из этого региона. Включи VPN (США) в браузере и обнови страницу! Но я всё еще могу поболтать на темы из моей базы. 😉";
    }
}

function addMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    // Плавный скролл вниз
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

// Привязка кнопок
document.getElementById("sendBtn").onclick = sendMessage;
input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } };
