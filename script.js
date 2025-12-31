const REPLIT_URL = "https://79b5294b-8b6c-4109-ab32-15dab9332169-00-9no3sv7zu19v.pike.replit.dev/chat";

const messagesContainer = document.getElementById("messages");
const historyList = document.getElementById("history"); // Для правой колонки
const input = document.getElementById("userInput");
const typingBox = document.getElementById("typing-box");
const clearBtn = document.getElementById("clearBtn");
const sendBtn = document.getElementById("sendBtn");

// 1. Отображение сообщения в чате
function renderMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 2. Добавление короткой записи в правую колонку (История)
function addToHistoryPanel(text) {
    if (!historyList) return;
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerText = text.substring(0, 30) + (text.length > 30 ? "..." : "");
    historyList.prepend(item); // Новые запросы сверху
}

// 3. Сохранение и загрузка
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

// 4. Функция очистки (ТЕПЕРЬ ТОЧНО РАБОТАЕТ)
function clearFullHistory() {
    if (confirm("Удалить всю историю переписки?")) {
        localStorage.removeItem("chatHistory");
        messagesContainer.innerHTML = "";
        if (historyList) historyList.innerHTML = "";
        renderMessage("Бот", "История очищена!", "bot");
    }
}

// 5. Функция отправки
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
            renderMessage("Бот", "Ошибка: " + (data.error || "Пустой ответ"), "bot");
        }
    } catch (e) {
        if (typingBox) typingBox.style.display = "none";
        renderMessage("Бот", "❌ Ошибка связи с сервером.", "bot");
        console.error(e);
    }
}

// 6. Привязка событий
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

// Старт
loadAll();
