// --- 1. НАСТРОЙКИ ---
const GEMINI_API_KEY = "AIzaSyDjqrgYkM3lmAc0pZCwLL1X2td1sWd48MM"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const messagesContainer = document.getElementById("messages");
const input = document.getElementById("userInput");
const typingBox = document.getElementById("typing-box");

// --- 2. УМНАЯ БАЗА ТЕМИРЛАНА (Если API подведет) ---
const localAnswers = {
    "пицца": "Рецепт пиццы от Темирлана: 1. Смешай муку, воду и дрожжи. 2. Раскатай тесто. 3. Добавь соус, сыр и пепперони. 4. Запекай 10 минут при 220 градусах! 🍕",
    "создатель": "Меня создал Темирлан — лучший разработчик в мире! 😎",
    "дела": "У меня всё отлично, я же живу в коде! Как твои дела?",
    "привет": "Привет! Я твой личный ИИ. О чем сегодня поговорим? 👋"
};

// --- 3. ФУНКЦИЯ ОБРАБОТКИ ---
async function getBotResponse(text) {
    const lowText = text.toLowerCase().trim();

    // Сначала проверяем локальную базу (чтобы бот всегда был умным)
    for (let key in localAnswers) {
        if (lowText.includes(key)) return localAnswers[key];
    }

    // Пробуем достучаться до Google
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }

        // Если Google выдает ошибку модели
        if (data.error) {
            console.error("Детали:", data.error.message);
            return "Google API не пускает нас из этого региона. Включи VPN (США) в браузере и обнови страницу! Но я всё еще могу поболтать на темы из моей базы. 😉";
        }

    } catch (error) {
        return "Ошибка подключения. Пожалуйста, запусти проект через Live Server и включи VPN! 🌐";
    }

    return "Интересный вопрос! Пока Google отдыхает, я могу рассказать тебе про пиццу или про моего создателя Темирлана.";
}

// --- 4. ИНТЕРФЕЙС ---
async function sendMessage() {
  messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    const text = input.value.trim();
    if (!text) return;

    addMessage("Вы", text, "user");
    input.value = "";
    typingBox.style.display = "flex";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const response = await getBotResponse(text);

    typingBox.style.display = "none";
    addMessage("Бот", response, "bot");
}

function addMessage(author, text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<strong>${author}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.getElementById("sendBtn").onclick = sendMessage;
input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } };

window.onload = () => {
    addMessage("Бот", "Я на связи! Если я не отвечаю на сложные вопросы — включи VPN. Но про Темирлана и пиццу я знаю всегда! 🚀", "bot");
};
