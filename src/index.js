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
  "/help — помощь",
  "/add — добавить питомца",
  "/pets — список питомцев",
  "/pet ID — карточка питомца",
  "/find имя — поиск питомца",
  "/cancel — отменить заполнение",
  "/skip — пропустить необязательное поле"
].join("\n");

const STEPS = [
  {
    key: "name",
    prompt: "Как зовут питомца? Напиши имя:",
    optional: false
  },
  {
    key: "species",
    prompt: "Кто это — собака или кошка? Напиши «собака» или «кошка»:",
    optional: false
  },
  {
    key: "breed",
    prompt: "Какая порода? Если неизвестна, напиши /skip.",
    optional: true
  },
  {
    key: "age",
    prompt: "Сколько питомцу лет? Можно указать возраст приблизительно. Или /skip.",
    optional: true
  },
  {
    key: "coat_features",
    prompt: "Особенности шерсти: тип, густота, длина и другие нюансы. Или /skip.",
    optional: true
  },
  {
    key: "matting_tendency",
    prompt: "Есть ли склонность к колтунам? Укажи проблемные зоны или напиши /skip.",
    optional: true
  },
  {
    key: "sensitive_areas",
    prompt: "Какие зоны чувствительные? Например, лапы, морда, живот. Или /skip.",
    optional: true
  },
  {
    key: "clipper_reaction",
    prompt: "Как питомец реагирует на машинку? Или /skip.",
    optional: true
  },
  {
    key: "dryer_reaction",
    prompt: "Как питомец реагирует на фен? Или /skip.",
    optional: true
  },
  {
    key: "nail_clipper_reaction",
    prompt: "Как переносит стрижку когтей? Или /skip.",
    optional: true
  },
  {
    key: "warnings",
    prompt: "Важные предупреждения для грумера: страхи, ограничения, особенности поведения. Или /skip.",
    optional: true
  },
  {
    key: "notes",
    prompt: "Дополнительные заметки о питомце. Или /skip.",
    optional: true
  }
];

async function sendMessage(env, chatId, text) {
  const response = await fetch(
    `${TELEGRAM_API}/bot${env.BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    }
  );

  if (!response.ok) {
    const details = await response.text();
    console.error("Telegram sendMessage error:", details);
    throw new Error("Telegram API request failed");
  }
}

async function initializeDatabase(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      chat_id TEXT PRIMARY KEY,
      session_data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function getSession(env, chatId) {
  const row = await env.DB.prepare(
    "SELECT session_data FROM user_sessions WHERE chat_id = ?"
  ).bind(String(chatId)).first();

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.session_data);
  } catch {
    await deleteSession(env, chatId);
    return null;
  }
}

async function saveSession(env, chatId, session) {
  await env.DB.prepare(`
    INSERT INTO user_sessions (chat_id, session_data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(chat_id) DO UPDATE SET
      session_data = excluded.session_data,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    String(chatId),
    JSON.stringify(session)
  ).run();
}

async function deleteSession(env, chatId) {
  await env.DB.prepare(
    "DELETE FROM user_sessions WHERE chat_id = ?"
  ).bind(String(chatId)).run();
}

function displaySpecies(species) {
  return species === "cat" ? "Кошка 🐈" : "Собака 🐕";
}

function parseSpecies(value) {
  const normalized = value.trim().toLowerCase();

  if (["собака", "собаку", "пёс", "пес", "песик", "пёсик", "dog"].includes(normalized)) {
    return "dog";
  }

  if (["кошка", "кошку", "кот", "кота", "котик", "cat"].includes(normalized)) {
    return "cat";
  }

  return null;
}

function formatPet(pet) {
  const fields = [
    ["Порода", pet.breed],
    ["Возраст", pet.age],
    ["Особенности шерсти", pet.coat_features],
    ["Склонность к колтунам", pet.matting_tendency],
    ["Чувствительные зоны", pet.sensitive_areas],
    ["Реакция на машинку", pet.clipper_reaction],
    ["Реакция на фен", pet.dryer_reaction],
    ["Реакция на стрижку когтей", pet.nail_clipper_reaction],
    ["Предупреждения", pet.warnings],
    ["Заметки", pet.notes]
  ];

  const result = [
    `🐾 Карточка питомца №${pet.id}`,
    "",
    `Имя: ${pet.name}`,
    `Вид: ${displaySpecies(pet.species)}`
  ];

  for (const [label, value] of fields) {
    if (value && String(value).trim()) {
      result.push(`${label}: ${value}`);
    }
  }

  return result.join("\n");
}

async function startAdding(env, chatId) {
  await saveSession(env, chatId, {
    step: 0,
    data: {}
  });

  await sendMessage(
    env,
    chatId,
    "🐾 Создаём карточку нового питомца!\n\n" + STEPS[0].prompt
  );
}

async function processForm(env, chatId, input, session) {
  const step = STEPS[session.step];

  if (!step) {
    await deleteSession(env, chatId);
    await sendMessage(
      env,
      chatId,
      "Произошла ошибка заполнения. Начни заново командой /add."
    );
    return;
  }

  let value = input.trim();

  if (value === "/skip") {
    if (!step.optional) {
      await sendMessage(
        env,
        chatId,
        "Это обязательное поле. Пожалуйста, заполни его."
      );
      return;
    }

    value = "";
  } else if (step.key === "species") {
    const species = parseSpecies(value);

    if (!species) {
      await sendMessage(
        env,
        chatId,
        "Не удалось определить вид. Напиши «собака» или «кошка»."
      );
      return;
    }

    value = species;
  } else if (!value && !step.optional) {
    await sendMessage(env, chatId, "Это поле обязательно. Попробуй ещё раз.");
    return;
  }

  session.data[step.key] = value;
  session.step += 1;

  if (session.step < STEPS.length) {
    await saveSession(env, chatId, session);

    await sendMessage(
      env,
      chatId,
      `Сохранено в заполнении: ${step.key === "species" ? displaySpecies(value) : (value || "не указано")}.\n\n${STEPS[session.step].prompt}`
    );
    return;
  }

  const data = session.data;

  try {
    const result = await env.DB.prepare(`
      INSERT INTO dogs (
        name,
        species,
        breed,
        age,
        coat_features,
        matting_tendency,
        sensitive_areas,
        clipper_reaction,
        dryer_reaction,
        nail_clipper_reaction,
        warnings,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.species,
      data.breed || null,
      data.age || null,
      data.coat_features || null,
      data.matting_tendency || null,
      data.sensitive_areas || null,
      data.clipper_reaction || null,
      data.dryer_reaction || null,
      data.nail_clipper_reaction || null,
      data.warnings || null,
      data.notes || null
    ).run();

    await deleteSession(env, chatId);

    const petId = result.meta?.last_row_id;

    await sendMessage(
      env,
      chatId,
      `✅ Карточка успешно сохранена!\n\n${formatPet({
        id: petId ?? "—",
        ...data
      })}\n\nПосмотреть карточку можно командой /pet ${petId ?? ""}\nСписок питомцев: /pets`
    );
  } catch (error) {
    console.error("Failed to save pet:", error);

    await sendMessage(
      env,
      chatId,
      "Не удалось сохранить карточку в базу данных. Заполнение пока сохранено. Попробуй снова отправить последнее сообщение или напиши /cancel, чтобы отменить."
    );
  }
}

async function listPets(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    ORDER BY name COLLATE NOCASE, id
    LIMIT 50
  `).all();

  const pets = result.results || [];

  if (pets.length === 0) {
    await sendMessage(
      env,
      chatId,
      "Пока карточек нет 🐾\n\nДобавить питомца: /add"
    );
    return;
  }

  const lines = [
    "🐾 Твои питомцы:",
    "",
    ...pets.map((pet) =>
      `№${pet.id} — ${pet.name} (${pet.species === "cat" ? "кошка" : "собака"})${pet.breed ? ", " + pet.breed : ""}`
    ),
    "",
    "Чтобы открыть карточку, напиши /pet ID.",
    "Например: /pet 1"
  ];

  if (pets.length === 50) {
    lines.push("", "Показаны первые 50 карточек.");
  }

  await sendMessage(env, chatId, lines.join("\n"));
}

async function showPet(env, chatId, id) {
  if (!/^\d+$/.test(id)) {
    await sendMessage(env, chatId, "Укажи номер карточки. Например: /pet 1");
    return;
  }

  const pet = await env.DB.prepare(
    "SELECT * FROM dogs WHERE id = ?"
  ).bind(Number(id)).first();

  if (!pet) {
    await sendMessage(env, chatId, `Питомец №${id} не найден.`);
    return;
  }

  await sendMessage(env, chatId, formatPet(pet));
}

async function findPets(env, chatId, query) {
  if (!query) {
    await sendMessage(
      env,
      chatId,
      "Напиши имя для поиска. Например: /find Белла"
    );
    return;
  }

  const result = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    WHERE name LIKE ? COLLATE NOCASE
    ORDER BY name COLLATE NOCASE, id
    LIMIT 20
  `).bind(`%${query}%`).all();

  const pets = result.results || [];

  if (pets.length === 0) {
    await sendMessage(
      env,
      chatId,
      `По запросу «${query}» ничего не найдено.`
    );
    return;
  }

  const lines = [
    `🔎 Результаты поиска: ${query}`,
    "",
    ...pets.map((pet) =>
      `№${pet.id} — ${pet.name} (${pet.species === "cat" ? "кошка" : "собака"})${pet.breed ? ", " + pet.breed : ""}`
    ),
    "",
    "Открыть карточку: /pet ID"
  ];

  await sendMessage(env, chatId, lines.join("\n"));
}

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

    if (!env.DB) {
      return new Response("D1 database binding DB is not configured.", {
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
    const firstToken = text.split(/\s+/)[0];
    const command = firstToken.split("@")[0];

    try {
      await initializeDatabase(env);

      if (command === "/start") {
        await deleteSession(env, chatId);
        await sendMessage(env, chatId, HELP_TEXT);
        return new Response("OK");
      }

      if (command === "/help") {
        await sendMessage(env, chatId, HELP_TEXT);
        return new Response("OK");
      }

      if (command === "/add") {
        await startAdding(env, chatId);
        return new Response("OK");
      }

      if (command === "/cancel") {
        await deleteSession(env, chatId);
        await sendMessage(
          env,
          chatId,
          "Заполнение отменено. Данные карточки не сохранены.\n\nЧтобы начать заново, напиши /add."
        );
        return new Response("OK");
      }

      if (command === "/pets") {
        await listPets(env, chatId);
        return new Response("OK");
      }

      if (command === "/pet") {
        const id = text.split(/\s+/)[1] || "";
        await showPet(env, chatId, id);
        return new Response("OK");
      }

      if (command === "/find") {
        const query = text.split(/\s+/).slice(1).join(" ");
        await findPets(env, chatId, query);
        return new Response("OK");
      }

      const session = await getSession(env, chatId);

      if (session) {
        await processForm(env, chatId, text, session);
        return new Response("OK");
      }

      await sendMessage(
        env,
        chatId,
        "Не знаю такую команду. Напиши /help, чтобы увидеть список команд."
      );

      return new Response("OK");
    } catch (error) {
      console.error("Groomer Assistant error:", error);

      try {
        await sendMessage(
          env,
          chatId,
          "Возникла техническая ошибка. Попробуй ещё раз чуть позже. Если проблема повторится, сообщи мне."
        );
      } catch (sendError) {
        console.error("Could not send error message:", sendError);
      }

      return new Response("Internal error", {
        status: 500
      });
    }
  }
};
