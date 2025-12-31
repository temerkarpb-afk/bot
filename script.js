// --- НАСТРОЙКИ ---
// Твой актуальный адрес Replit (обязательно с /chat в конце)
const REPLIT_URL = "https://79b5294b-8b6c-4109-ab32-15dab9332169-00-9no3sv7zu19v.pike.replit.dev/chat";

const messagesContainer = document.getElementById("messages");
const historyList = document.getElementById("history"); 
const input = document.getElementById("userInput");
const typingBox = document.getElementById("typing-box");
const clearBtn = document.getElementById("clearBtn");
const sendBtn = document.getElementById("sendBtn");

// 1. Отображение сообщения
function renderMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

// 2. Панель истории (правая колонка)
function addToHistoryPanel(text) {
    if (!historyList) return;
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerText = text.substring(0, 30) + (text.length > 30 ? "..." : "");
    historyList.prepend(item); 
}

// 3. Работа с LocalStorage (память браузера)
function saveChat(author, text, className) {
    const chat = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chat.push({ author, text, className });
    localStorage.setItem("chatHistory", JSON.stringify(chat));
}

function loadAll() {
    const chat = JSON.parse(localStorage.getItem("chatHistory")) || [];
    messagesContainer.innerHTML = "";
    if (historyList) historyList.innerHTML = "";
    
    chat.forEach(msg => {
        renderMessage(msg.author, msg.text, msg.className);
        if (msg.className === "user") addToHistoryPanel(msg.text);
    });
}

// 4. Очистка истории
function clearFullHistory() {
    if (confirm("Удалить всю историю переписки?")) {
        localStorage.removeItem("chatHistory");
        messagesContainer.innerHTML = "";
        if (historyList) historyList.innerHTML = "";
        renderMessage("Бот", "История успешно очищена!", "bot");
    }
}

// 5. Отправка сообщения на Replit
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    renderMessage("Вы", text, "user");
    addToHistoryPanel(text);
    saveChat("Вы", text, "user");
    input.value = "";
    
    if (typingBox) typingBox.style.display = "flex";

    try {
        const response = await fetch(REPLIT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        
        if (typingBox) typingBox.style.display = "none";

        if (data.text) {
            renderMessage("Бот", data.text, "bot");
            saveChat("Бот", data.text, "bot");
        } else {
            renderMessage("Бот", "Ошибка: " + (data.error || "неизвестная ошибка"), "bot");
        }
    } catch (e) {
        if (typingBox) typingBox.style.display = "none";
        renderMessage("Бот", "❌ Ошибка связи. Убедись, что проект на Replit запущен (нажата кнопка RUN).", "bot");
        console.error("Fetch error:", e);
    }
}

// 6. Инициализация при загрузке
window.onload = () => {
    if (sendBtn) sendBtn.onclick = (e) => { e.preventDefault(); sendMessage(); };
    if (clearBtn) clearBtn.onclick = (e) => { e.preventDefault(); clearFullHistory(); };
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        };
    }
    loadAll();
};
