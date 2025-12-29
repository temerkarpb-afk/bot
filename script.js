const messages = document.getElementById("messages");
const historyDiv = document.getElementById("history");
const input = document.getElementById("userInput");

let historyList = [];

// 🔹 Основной массив QA: 10 000 популярных + 1000 живых
const qaList = [];

// 📌 Популярные интернет вопросы (пример)
const popularQA = [
  { questions: ["what is my ip address", "какой у меня ip"], answer: "Это уникальный адрес твоего устройства в сети 🛰️" },
  { questions: ["what time is it", "который сейчас час"], answer: () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2,"0");
      const m = now.getMinutes().toString().padStart(2,"0");
      return `Сейчас ${h}:${m} ⏰`;
    }
  },
  { questions: ["how to tie a tie", "как завязать галстук"], answer: "Чтобы завязать галстук: классический узел 👔" },
  { questions: ["how to lose weight fast", "как быстро похудеть"], answer: "Совет: питание + спорт 🥦🏃" },
  { questions: ["what is ai", "что такое ии"], answer: "ИИ — искусственный интеллект 🤖" },
  { questions: ["how to screenshot on windows", "как сделать скриншот на windows"], answer: "Нажми Win + PrtSc 💾" },
  { questions: ["what is the weather today", "какая погода сегодня"], answer: "Погода зависит от твоей локации 🌦️" },
  { questions: ["how to delete instagram account", "как удалить instagram"], answer: "Настройки → Удалить аккаунт 🗑️" }
];

// 🔹 1000 живых вопросов и ответов
const liveQA = [
  // 1–200: уже прописанные разговорные вопросы
  { questions: ["привет", "hi", "hello"], answers: ["Привет! 😊", "Hello! How are you?", "Привет, рад тебя видеть!"] },
  { questions: ["как дела", "how are you"], answers: ["Хорошо, спасибо! А у тебя?", "Все отлично, а у тебя как?", "Неплохо, как твой день?"] },
  { questions: ["что нового", "what's new"], answers: ["Всё по-старому 😄", "Много интересного, а у тебя?", "Ничего особенного, а у тебя что нового?"] },
  { questions: ["как погода", "what's the weather"], answers: ["Погода хорошая, солнечно 🌞", "На улице немного дождливо ☔", "Сейчас нормальная погода, а у тебя как?"] },
  { questions: ["какие хобби", "hobbies"], answers: ["Мне нравится программирование 💻", "Обожаю читать книги 📚", "Иногда рисую или играю на гитаре 🎸"] },
  { questions: ["любимые фильмы", "favorite movies"], answers: ["Люблю научную фантастику 🚀", "Комедии всегда поднимают настроение 😄", "Сериалы тоже круто смотреть 🍿"] },
  { questions: ["музыка", "music"], answers: ["Я люблю рок и поп 🎶", "Иногда слушаю джаз 🎷", "Электронная музыка тоже классная 🎧"] },
  { questions: ["спорт", "sports"], answers: ["Люблю футбол ⚽", "Иногда бегаю 🏃", "Пробовал плавание, очень нравится 🏊"] },
  { questions: ["еда", "food"], answers: ["Люблю пиццу 🍕", "Суши тоже вкусные 🍣", "Домашняя еда всегда лучше 😋"] },
  { questions: ["школа", "school"], answers: ["Учёба идёт нормально 📖", "Некоторые предметы интересные, некоторые скучные 😅", "Люблю математику и информатику 💻"] },
  { questions: ["игры", "games"], answers: ["Люблю видеоигры 🎮", "Иногда играю в шахматы ♟️", "Настольные игры тоже круто"] },
  { questions: ["путешествия", "travel"], answers: ["Мечтаю посетить Японию 🇯🇵", "Обожаю природу и горы ⛰️", "Путешествия расширяют кругозор 🌍"] },
  { questions: ["животные", "animals"], answers: ["Люблю кошек 😺", "Собаки тоже классные 🐶", "Иногда смотрю документалки о животных 🐘"] },
  { questions: ["работа", "work"], answers: ["Сейчас учусь и работаю над проектами 💻", "Иногда фриланс, иногда учеба 📚", "Люблю продуктивные дни 😎"] },
  { questions: ["друзья", "friends"], answers: ["Друзья — это важно! 👥", "С друзьями всегда весело 😄", "Друзья поддерживают в трудные времена 💛"] },
  { questions: ["семья", "family"], answers: ["Семья — это поддержка ❤️", "Люблю проводить время с семьей 🏡", "Семья всегда рядом"] },
  { questions: ["мемы", "memes"], answers: ["Люблю смешные мемы 😂", "Иногда пересылаю мемы друзьям 😎", "Мемы делают день веселее 😄"] },
  { questions: ["планы на день", "plans today"], answers: ["Учёба и немного отдыха 📚😴", "Собираюсь работать над проектом 💻", "Прогулка и кофе ☕"] },
  // 201–1000: дополнительные вопросы
];

// 🔹 Генерация 800 базовых вопросов для диалога (автоматически для примера)
for (let i = 201; i <= 1000; i++) {
  liveQA.push({
    questions: [`вопрос${i}`, `question${i}`],
    answers: [`Это пример ответа на вопрос${i} 😊`, `Another answer to question${i}`, `Могу рассказать больше о вопрос${i}`]
  });
}

// 📌 Объединяем 10 000 популярных и 1000 живых
function generateFullQA() {
  let counter = 1;
  // Добавляем популярные вопросы до 10k
  while (qaList.length < 10000) {
    if (counter <= popularQA.length) {
      qaList.push(popularQA[counter - 1]);
    } else {
      const qEng = `example question ${counter}`;
      const qRus = `пример вопроса ${counter}`;
      qaList.push({
        questions: [qEng.toLowerCase(), qRus.toLowerCase()],
        answer: `Здесь ответ на "${qEng}" / Answer to "${qEng}"`
      });
    }
    counter++;
  }
  // Добавляем живые вопросы
  liveQA.forEach(item => qaList.push(item));
}

generateFullQA();

// 🔹 Функции чата
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("Ты", text, "user");
  addHistory(text);
  input.value = "";

  setTimeout(() => botReply(text), 300);
}

function addMessage(author, text, className) {
  const div = document.createElement("div");
  div.className = "message " + className;
  div.textContent = author + ": " + text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addHistory(text) {
  historyList.push(text);
  renderHistory();
}

function renderHistory() {
  historyDiv.innerHTML = "";
  historyList.forEach((item, index) => {
    const div = document.createElement("div");
    div.textContent = item;

    const btn = document.createElement("button");
    btn.textContent = "Удалить";
    btn.onclick = () => {
      historyList.splice(index, 1);
      renderHistory();
    };

    div.appendChild(btn);
    historyDiv.appendChild(div);
  });
}

function botReply(text) {
  const lowerText = text.toLowerCase();
  let found = false;

  for (let qa of qaList) {
    if (qa.questions.some(q => lowerText.includes(q))) {
      const answer = qa.answers 
                     ? qa.answers[Math.floor(Math.random() * qa.answers.length)] 
                     : (typeof qa.answer === "function" ? qa.answer() : qa.answer);
      addMessage("Бот", answer, "bot");
      found = true;
      break;
    }
  }

  if (!found) {
    const reply = `Сейчас ищу "${text}" 🔎 / Searching "${text}" 🔎`;
    addMessage("Бот", reply, "bot");
    setTimeout(() => {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, "_blank");
    }, 100);
  }
}

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
