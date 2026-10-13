
const TELEGRAM_API = "https://api.telegram.org";

const HELP_TEXT = [
  "Привет! 🐈‍⬛🐈",
  "",
  "Я твой личный 🐾 помощник грумера 🐾",
  "",
  "Я помогу вести карточки собак и кошек, расписание и историю визитов.",
  "",
  "Команды:",
  "/start — начать работу",
  "/help — помощь"
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
      case "/help":
        reply = HELP_TEXT;
        break;

      default:
        reply = "Пожалуйста, используй команды /start или /help.";
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
