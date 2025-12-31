const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Твой ключ Groq
const GROQ_KEY = "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";

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    console.log("Пришло сообщение:", message);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Ошибка от Groq:", data.error.message);
            return res.status(400).json({ error: data.error.message });
        }

        res.json({ text: data.choices[0].message.content });
    } catch (error) {
        console.error("Критическая ошибка сервера:", error);
        res.status(500).json({ error: "Локальный сервер не смог отправить запрос" });
    }
});

app.listen(3000, () => {
    console.log('✅ ЛОКАЛЬНЫЙ СЕРВЕР ЗАПУЩЕН!');
    console.log('🔗 Ссылка для script.js: http://localhost:3000/chat');
    console.log('--- Ожидаю сообщений ---');
});