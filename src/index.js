
const TELEGRAM_API = "https://api.telegram.org";

const HELP_TEXT = [
  "🐾 Помощник грумера",
  "",
  "Я помогу вести карточки собак, расписание и историю визитов.",
  "",
  "На данный момент доступны команды:",
  "/start — начать работу",
  "/help — помощь",
  "",
  "Следующим этапом мы добавим карточки собак, очередь записей,",
  "напоминания, фотографии до и после стрижки и учёт времени."
].join("\n");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response("Groomer Assistant is running.", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405
      });
    }

    if (!env.BOT_TOKEN) {
      return new Response("Bot token is not configured.", {
        status: 500
      });
    }

    let update;

    try {
      update = await request.json();
    } catch {
      return new Response("Invalid JSON", {
        status: 400
      });
    }

    const message = update.message;

    if (!message || !message.chat || typeof message.text !== "string") {
      return new Response("OK", {
        status: 200
      });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const command = text.split(/\s+/)[0].split("@")[0];

    let reply;

    switch (command) {
      case "/start":
        reply = [
          "Привет! 🐾",
          "",
          "Я твой личный помощник грумера.",
          "Будем постепенно настраивать меня для работы.",
          "",
          HELP_TEXT
        ].join("\n");
        break;

      case "/help":
        reply = HELP_TEXT;
        break;

      default:
        reply = [
          "Пока я умею отвечать на команды /start и /help.",
          "",
          "Остальные функции добавим следующими этапами."
        ].join("\n");
        break;
    }

    const telegramResponse = await fetch(
      `${TELEGRAM_API}/bot${env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    if (!telegramResponse.ok) {
      return new Response("Telegram API request failed.", {
        status: 502
      });
    }

    return new Response("OK", {
      status: 200
    });
  }
};
