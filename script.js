// --- НАСТРОЙКИ ---
// Твой актуальный адрес Replit (проверь, чтобы в Replit была нажата кнопка RUN)
const REPLIT_URL = "https://79b5294b-8b6c-4109-ab32-15dab9332169-00-9no3sv7zu19v.pike.replit.dev/chat";

const messagesContainer = document.getElementById("messages");
const historyList = document.getElementById("history"); 
const input = document.getElementById("userInput");
const typingBox = document.getElementById("typing-box");
const clearBtn = document.getElementById("clearBtn");
const sendBtn = document.getElementById("sendBtn");

// 1. Отображение сообщения в интерфейсе
function renderMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    // Плавная прокрутка к последнему сообщению
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

// 2. Добавление записи в правую панель истории
function addToHistoryPanel(text) {
    if (!historyList) return;
    const item = document.createElement("div");
    item.className = "history-item";
    // Показываем только первые 30 символов в превью
    item.innerText = text.substring(0, 30) + (text.length > 30 ? "..." : "");
    historyList.prepend(item); 
}

// 3. Сохранение и загрузка истории из LocalStorage
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
        // Добавляем в правую колонку только вопросы пользователя
        if (msg.className === "user") addToHistoryPanel(msg.text);
    });
}

// 4. Функция очистки всей истории
function clearFullHistory() {
    if (confirm("Вы действительно хотите удалить всю историю переписки?")) {
        localStorage.removeItem("chatHistory");
        messagesContainer.innerHTML = "";
        if (historyList) historyList.innerHTML = "";
        renderMessage("Бот", "История успешно очищена!", "bot");
    }
}

// 5. Главная функция отправки сообщения
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Отображаем сообщение пользователя
    renderMessage("Вы", text, "user");
    addToHistoryPanel(text);
    saveChat("Вы", text, "user");
    input.value = "";
    
    // Показываем анимацию загрузки
    if (typingBox) typingBox.style.display = "flex";

    // --- ПРОВЕРКА НА СПЕЦИАЛЬНЫЙ ВОПРОС ---
    const lowerText = text.toLowerCase();
    if (lowerText.includes("кто твой создатель") || lowerText.includes("кто тебя создал")) {
        setTimeout(() => {
            if (typingBox) typingBox.style.display = "none";
            const customAnswer = "Меня создал господин Темирлан.";
            renderMessage("Бот", customAnswer, "bot");
            saveChat("Бот", customAnswer, "bot");
        }, 600); 
        return; // Прерываем функцию, чтобы не делать запрос к ИИ
    }

    // --- ЗАПРОС К ИИ (REPLIT) ---
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
            renderMessage("Бот", "Ошибка сервера: " + (data.error || "пустой ответ"), "bot");
        }
    } catch (e) {
        if (typingBox) typingBox.style.display = "none";
        renderMessage("Бот", "❌ Ошибка связи. Убедитесь, что Replit запущен (кнопка RUN).", "bot");
        console.error("Ошибка запроса:", e);
    }
}

// 6. Привязка событий после загрузки страницы
window.onload = () => {
    // Кнопка отправить
    if (sendBtn) {
        sendBtn.onclick = (e) => {
            e.preventDefault();
            sendMessage();
        };
    }

    // Кнопка очистить
    if (clearBtn) {
        clearBtn.onclick = (e) => {
            e.preventDefault();
            clearFullHistory();
        };
    }

    // Отправка по нажатию Enter
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        };
    }

    // Загружаем сохраненную переписку
    loadAll();
};
