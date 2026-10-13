
const TELEGRAM_API = "https://api.telegram.org";
const TIME_ZONE = "Europe/Moscow";

const HELP_TEXT = [
  "Привет! 🐾",
  "",
  "Я твой личный Groomer Assistant",
  "",
  "Я помогу:",
  "🐶 Вести карточки собак и кошек.",
  "📅 Следить за расписанием и визитами.",
  "✂️ Записывать выполненные услуги.",
  "💰 Рассчитывать твой заработок за день, период и месяц.",
  "",
  "Команды:",
  "/start — главное меню",
  "/help — помощь",
  "/add — добавить питомца",
  "/pets — список питомцев",
  "/pet ID — открыть карточку",
  "/find имя — найти питомца",
  "/visit имя — начать визит",
  "/visits — визиты в работе",
  "/finish ID — завершить визит",
  "/plus — услуга без записи",
  "/today — заработок за сегодня",
  "/period — заработок за период",
  "/month — заработок за месяц",
  "/cancel — отменить текущий ввод",
  "/skip — пропустить необязательное поле"
].join("\n");

const STEPS = [
  { key: "name", prompt: "Как зовут питомца? Напиши имя:", optional: false },
  { key: "species", prompt: "Кто это — собака или кошка? Напиши «собака» или «кошка»:", optional: false },
  { key: "breed", prompt: "Какая порода? Если неизвестна, напиши /skip.", optional: true },
  { key: "age", prompt: "Сколько питомцу лет? Или /skip.", optional: true },
  { key: "coat_features", prompt: "Особенности шерсти. Или /skip.", optional: true },
  { key: "matting_tendency", prompt: "Есть ли склонность к колтунам? Или /skip.", optional: true },
  { key: "sensitive_areas", prompt: "Какие зоны чувствительные? Или /skip.", optional: true },
  { key: "clipper_reaction", prompt: "Как питомец реагирует на машинку? Или /skip.", optional: true },
  { key: "dryer_reaction", prompt: "Как питомец реагирует на фен? Или /skip.", optional: true },
  { key: "nail_clipper_reaction", prompt: "Как переносит стрижку когтей? Или /skip.", optional: true },
  { key: "warnings", prompt: "Важные предупреждения для грумера. Или /skip.", optional: true },
  { key: "notes", prompt: "Дополнительные заметки. Или /skip.", optional: true }
];

function mainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🐾 Питомцы", callback_data: "pets" },
        { text: "📋 Визиты в работе", callback_data: "visits" }
      ],
      [
        { text: "➕ Услуга без записи", callback_data: "plus" },
        { text: "💰 Мой заработок", callback_data: "earnings" }
      ],
      [
        { text: "➕ Добавить питомца", callback_data: "add" }
      ]
    ]
  };
}

async function telegram(env, method, payload) {
  const response = await fetch(
    `${TELEGRAM_API}/bot${env.BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    console.error(`Telegram ${method} error:`, result);
    throw new Error(`Telegram API ${method} failed`);
  }

  return result.result;
}

async function sendMessage(env, chatId, text, replyMarkup = null) {
  const payload = { chat_id: chatId, text };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  return telegram(env, "sendMessage", payload);
}

async function answerCallback(env, callbackId, text = "") {
  try {
    await telegram(env, "answerCallbackQuery", {
      callback_query_id: callbackId,
      text
    });
  } catch (error) {
    console.error("Callback answer error:", error);
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

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS earnings_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      rate INTEGER NOT NULL,
      earned REAL NOT NULL,
      appointment_id INTEGER,
      source TEXT NOT NULL DEFAULT 'manual',
      source_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id)
        REFERENCES appointments(id) ON DELETE SET NULL,
      UNIQUE (source, source_id)
    )
  `).run();
}

async function getSession(env, chatId) {
  const row = await env.DB.prepare(
    "SELECT session_data FROM user_sessions WHERE chat_id = ?"
  ).bind(String(chatId)).first();

  if (!row) return null;

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
  `).bind(String(chatId), JSON.stringify(session)).run();
}

async function deleteSession(env, chatId) {
  await env.DB.prepare(
    "DELETE FROM user_sessions WHERE chat_id = ?"
  ).bind(String(chatId)).run();
}

function localDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(p => [p.type, p.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function money(value) {
  return Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }) + " ₽";
}

function displaySpecies(species, name = "") {
  if (species !== "cat") return "Собака 🐕";

  // Пол Янтаря отображается правильно, не меняя данные других питомцев.
  if (String(name).trim().toLowerCase() === "янтарь") {
    return "Кот 🐈";
  }

  return "Кошка 🐈";
}

function parseSpecies(value) {
  const normalized = value.trim().toLowerCase();

  if ([
    "собака", "собаку", "пёс", "пес", "пёсик", "песик", "dog"
  ].includes(normalized)) {
    return "dog";
  }

  if ([
    "кошка", "кошку", "кот", "кота", "котик", "cat"
  ].includes(normalized)) {
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

  const lines = [
    "🐾 Карточка питомца",
    "",
    `Имя: ${pet.name}`,
    `Вид: ${displaySpecies(pet.species, pet.name)}`
  ];

  for (const [label, value] of fields) {
    if (value && String(value).trim()) {
      lines.push(`${label}: ${value}`);
    }
  }

  return lines.join("\n");
}

async function startAdding(env, chatId) {
  await saveSession(env, chatId, {
    type: "add_pet",
    step: 0,
    data: {}
  });

  await sendMessage(
    env,
    chatId,
    "🐾 Создаём карточку нового питомца!\n\n" + STEPS[0].prompt
  );
}

async function processPetForm(env, chatId, input, session) {
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
      await sendMessage(env, chatId, "Напиши «собака» или «кошка».");
      return;
    }

    value = species;
  } else if (!value && !step.optional) {
    await sendMessage(
      env,
      chatId,
      "Это поле обязательно. Попробуй ещё раз."
    );
    return;
  }

  session.data[step.key] = value;
  session.step += 1;

  if (session.step < STEPS.length) {
    await saveSession(env, chatId, session);

    await sendMessage(
      env,
      chatId,
      `Принято: ${value || "не указано"}.\n\n${STEPS[session.step].prompt}`
    );

    return;
  }

  const data = session.data;

  const result = await env.DB.prepare(`
    INSERT INTO dogs (
      name, species, breed, age, coat_features, matting_tendency,
      sensitive_areas, clipper_reaction, dryer_reaction,
      nail_clipper_reaction, warnings, notes
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

  const pet = { id: result.meta.last_row_id, ...data };

  await sendMessage(
    env,
    chatId,
    `✅ Карточка питомца «${data.name}» создана!\n\n${formatPet(pet)}`,
    mainKeyboard()
  );
}

async function listPets(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    ORDER BY name COLLATE NOCASE, id
    LIMIT 50
  `).all();

  const pets = result.results || [];

  if (!pets.length) {
    await sendMessage(
      env,
      chatId,
      "Пока карточек нет 🐾\nДобавить питомца: /add"
    );
    return;
  }

  const keyboard = pets.map(pet => [{
    text: `📋 Открыть карточку: ${pet.name}`,
    callback_data: `pet:${pet.id}`
  }]);

  await sendMessage(
    env,
    chatId,
    "🐾 Твои питомцы:\n\n" + pets.map(p =>
      `${p.name} (${displaySpecies(p.species, p.name)})${p.breed ? ", " + p.breed : ""}`
    ).join("\n"),
    {
      inline_keyboard: [
        ...keyboard,
        [{ text: "➕ Начать визит", callback_data: "visit_choose" }]
      ]
    }
  );
}

async function showPet(env, chatId, id) {
  if (!/^\d+$/.test(String(id))) {
    await sendMessage(
      env,
      chatId,
      "Укажи номер карточки или имя питомца."
    );
    return;
  }

  const pet = await env.DB.prepare(
    "SELECT * FROM dogs WHERE id = ?"
  ).bind(Number(id)).first();

  if (!pet) {
    await sendMessage(env, chatId, `Питомец №${id} не найден.`);
    return;
  }

  await sendMessage(
    env,
    chatId,
    formatPet(pet),
    {
      inline_keyboard: [[
        {
          text: "▶️ Начать визит",
          callback_data: `visit:${pet.id}`
        }
      ]]
    }
  );
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
    SELECT * FROM dogs
    WHERE name LIKE ? COLLATE NOCASE
    ORDER BY name COLLATE NOCASE, id
    LIMIT 20
  `).bind(`%${query}%`).all();

  const pets = result.results || [];

  if (!pets.length) {
    await sendMessage(
      env,
      chatId,
      `По запросу «${query}» ничего не найдено.`
    );
    return;
  }

  if (pets.length === 1) {
    await showPet(env, chatId, pets[0].id);
    return;
  }

  await sendMessage(
    env,
    chatId,
    "🔎 Найдены питомцы:\n\n" +
      pets.map(p => `${p.name}${p.breed ? ", " + p.breed : ""}`).join("\n") +
      "\n\nОткрой нужную карточку командой /pet ID."
  );
}

async function findByPlainName(env, chatId, query) {
  const result = await env.DB.prepare(`
    SELECT * FROM dogs
    WHERE name = ? COLLATE NOCASE
    ORDER BY id
    LIMIT 20
  `).bind(query).all();

  const pets = result.results || [];

  if (pets.length === 1) {
    await showPet(env, chatId, pets[0].id);
  } else if (pets.length > 1) {
    await sendMessage(
      env,
      chatId,
      "Нашла несколько питомцев с таким именем:\n" +
        pets.map(p => p.name).join("\n") +
        "\nОткрой нужного командой /pet ID."
    );
  } else {
    await sendMessage(
      env,
      chatId,
      `Не нашла питомца «${query}».\n\nДобавить питомца: /add`,
      mainKeyboard()
    );
  }
}

async function startVisit(env, chatId, petId) {
  const pet = await env.DB.prepare(
    "SELECT id, name, breed FROM dogs WHERE id = ?"
  ).bind(Number(petId)).first();

  if (!pet) {
    await sendMessage(env, chatId, "Питомец не найден. Проверь карточку.");
    return;
  }

  const date = localDate();

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());

  const result = await env.DB.prepare(`
    INSERT INTO appointments (
      dog_id, appointment_date, appointment_time, status, procedures
    ) VALUES (?, ?, ?, 'in_progress', '')
  `).bind(pet.id, date, time).run();

  const appointmentId = result.meta.last_row_id;

  await sendMessage(
    env,
    chatId,
    `▶️ Визит начат!\n\nПитомец: ${pet.name}${pet.breed ? " (" + pet.breed + ")" : ""}\n\nКогда закончишь, нажми кнопку ниже.`,
    {
      inline_keyboard: [[
        {
          text: "✅ Завершить этот визит",
          callback_data: `finish:${appointmentId}`
        }
      ]]
    }
  );
}

async function choosePetForVisit(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT id, name, breed
    FROM dogs
    ORDER BY name COLLATE NOCASE
    LIMIT 50
  `).all();

  const pets = result.results || [];

  if (!pets.length) {
    await sendMessage(
      env,
      chatId,
      "Сначала добавь питомца командой /add."
    );
    return;
  }

  await sendMessage(
    env,
    chatId,
    "Выбери питомца, который пришёл:",
    {
      inline_keyboard: pets.map(p => [{
        text: `${p.name}${p.breed ? " — " + p.breed : ""}`,
        callback_data: `visit:${p.id}`
      }])
    }
  );
}

async function listVisits(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT a.id, a.dog_id, a.appointment_date, a.appointment_time,
           d.name, d.breed
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    WHERE a.status = 'in_progress'
    ORDER BY a.appointment_date, a.appointment_time, a.id
    LIMIT 50
  `).all();

  const visits = result.results || [];

  if (!visits.length) {
    await sendMessage(
      env,
      chatId,
      "Сейчас нет визитов в работе.",
      mainKeyboard()
    );
    return;
  }

  const lines = visits.map(v =>
    `${v.name}${v.breed ? " (" + v.breed + ")" : ""}\nНачало: ${v.appointment_date} ${v.appointment_time || ""}`
  );

  const keyboard = visits.map(v => [{
    text: `✅ Завершить: ${v.name}`,
    callback_data: `finish:${v.id}`
  }]);

  await sendMessage(
    env,
    chatId,
    "📋 Визиты в работе:\n\n" + lines.join("\n\n"),
    { inline_keyboard: keyboard }
  );
}

async function beginFinishVisit(env, chatId, appointmentId) {
  const visit = await env.DB.prepare(`
    SELECT a.id, a.dog_id, a.appointment_date, a.status, d.name, d.breed
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    WHERE a.id = ?
  `).bind(Number(appointmentId)).first();

  if (!visit) {
    await sendMessage(env, chatId, "Визит не найден.");
    return;
  }

  if (visit.status === "completed") {
    await sendMessage(
      env,
      chatId,
      "Этот визит уже завершён. Повторно начислять заработок нельзя."
    );
    return;
  }

  if (visit.status !== "in_progress") {
    await sendMessage(env, chatId, "Этот визит не находится в работе.");
    return;
  }

  await saveSession(env, chatId, {
    type: "visit_earnings",
    appointmentId: Number(appointmentId),
    petName: visit.name,
    serviceDate: visit.appointment_date,
    lines: []
  });

  await sendMessage(
    env,
    chatId,
    `Завершаем визит питомца «${visit.name}».\n\nНапиши выполненные услуги по одной на строке, указав сумму\n\nОтправь /cancel, если пока не хочешь завершать визит.`
  );
}

function parseServiceLines(input) {
  const lines = input.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const services = [];

  for (const line of lines) {
    const match = line.match(
      /^(.+?)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:₽|руб(?:лей|ля)?\.?)?$/i
    );

    if (!match) {
      return {
        error: `Не удалось разобрать строку:\n«${line}»\n\nНапиши название услуги и сумму, например: Комплекс 3200`
      };
    }

    const description = match[1].trim();
    const amount = Number(match[2].replace(",", "."));

    if (!description || !Number.isFinite(amount) || amount < 0) {
      return {
        error: `Проверь название и сумму в строке:\n«${line}»`
      };
    }

    services.push({ description, amount });
  }

  if (!services.length) {
    return { error: "Укажи хотя бы одну услугу и её сумму." };
  }

  return { services };
}

async function saveVisitEarnings(env, chatId, session, input) {
  const parsed = parseServiceLines(input);

  if (parsed.error) {
    await sendMessage(env, chatId, parsed.error);
    return;
  }

  const visit = await env.DB.prepare(
    "SELECT id, status FROM appointments WHERE id = ?"
  ).bind(session.appointmentId).first();

  if (!visit || visit.status !== "in_progress") {
    await deleteSession(env, chatId);
    await sendMessage(
      env,
      chatId,
      "Визит уже закрыт или не найден. Проверь /visits."
    );
    return;
  }

  const services = parsed.services;
  const totalEarned = services.reduce(
    (sum, s) => sum + s.amount * 0.35,
    0
  );

  const date = session.serviceDate || localDate();

  try {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];

      await env.DB.prepare(`
        INSERT OR IGNORE INTO earnings_entries
          (service_date, description, amount, rate, earned,
           appointment_id, source, source_id)
        VALUES (?, ?, ?, 35, ?, ?, 'visit', ?)
      `).bind(
        date,
        service.description,
        service.amount,
        Math.round(service.amount * 0.35 * 100) / 100,
        session.appointmentId,
        `${session.appointmentId}:${i + 1}`
      ).run();
    }

    await env.DB.prepare(`
      UPDATE appointments
      SET status = 'completed',
          procedures = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'in_progress'
    `).bind(
      services.map(s => `${s.description}: ${s.amount}`).join("; "),
      session.appointmentId
    ).run();

    await deleteSession(env, chatId);

    await sendMessage(
      env,
      chatId,
      `✅ Визит завершён: ${session.petName}\n\n💰 Твой заработок за визит: ${money(totalEarned)}`,
      mainKeyboard()
    );
  } catch (error) {
    console.error("Could not save visit earnings:", error);

    await sendMessage(
      env,
      chatId,
      "Не удалось сохранить визит. Не отправляй данные повторно, пока не проверим статус через /visits."
    );
  }
}

async function beginPlus(env, chatId) {
  await saveSession(env, chatId, { type: "plus_earnings" });

  await sendMessage(
    env,
    chatId,
    "➕ Услуга без записи\n\nВведи услугу и сумму, каждую с новой строки.\n\n/cancel — отмена"
  );
}

function rateForUnscheduled(description) {
  const name = description.toLowerCase().replace(/ё/g, "е");

  if (/\bкогт(?:и|ей|ями|ях|ю|я|ь)\b|\bкоготк(?:и|ов|ами|ах|у)\b/.test(name)) {
    return 100;
  }

  if (/параанальн/.test(name)) {
    return 100;
  }

  if (/\bчаевые\b|\bчаевыми\b|\bчаевых\b/.test(name)) {
    return 100;
  }

  return 35;
}

async function savePlusEarnings(env, chatId, input) {
  const parsed = parseServiceLines(input);

  if (parsed.error) {
    await sendMessage(env, chatId, parsed.error);
    return;
  }

  const date = localDate();
  const services = parsed.services;
  let totalEarned = 0;

  try {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const rate = rateForUnscheduled(service.description);
      const earned = Math.round(service.amount * rate) / 100;

      totalEarned += earned;

      await env.DB.prepare(`
        INSERT INTO earnings_entries
          (service_date, description, amount, rate, earned, source, source_id)
        VALUES (?, ?, ?, ?, ?, 'plus', ?)
      `).bind(
        date,
        service.description,
        service.amount,
        rate,
        earned,
        crypto.randomUUID()
      ).run();
    }

    await deleteSession(env, chatId);

    const lines = services.map(s => {
      const rate = rateForUnscheduled(s.description);
      const earned = s.amount * rate / 100;

      return `${s.description} (${rate}%) — ${money(earned)}`;
    });

    await sendMessage(
      env,
      chatId,
      `✅ Услуги сохранены\n\n${lines.join("\n")}\n\n💰 Твой заработок: ${money(totalEarned)}`,
      mainKeyboard()
    );
  } catch (error) {
    console.error("Could not save unscheduled earnings:", error);

    await sendMessage(
      env,
      chatId,
      "Не удалось сохранить все услуги. Перед повторным вводом проверь /today, чтобы не задвоить записи."
    );
  }
}

async function earningsToday(env, chatId) {
  const date = localDate();

  const result = await env.DB.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS earned
    FROM earnings_entries
    WHERE service_date = ?
  `).bind(date).first();

  await sendMessage(
    env,
    chatId,
    `💰 Заработок за сегодня (${date})\n\nЗаписей услуг: ${result.count}\nТвой заработок: ${money(result.earned)}`,
    mainKeyboard()
  );
}

async function earningsPeriod(env, chatId) {
  const date = localDate();
  const day = Number(date.slice(8, 10));
  const start = day <= 15
    ? `${date.slice(0, 7)}-01`
    : `${date.slice(0, 7)}-16`;

  const end = day <= 15
    ? `${date.slice(0, 7)}-15`
    : `${date.slice(0, 7)}-${new Date(
        Number(date.slice(0, 4)),
        Number(date.slice(5, 7)),
        0
      ).getDate()}`;

  const result = await env.DB.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS earned
    FROM earnings_entries
    WHERE service_date BETWEEN ? AND ?
  `).bind(start, end).first();

  await sendMessage(
    env,
    chatId,
    `💰 Заработок за период ${start.slice(8, 10)}–${end.slice(8, 10)}.${end.slice(5, 7)}.${end.slice(0, 4)}\n\nЗаписей услуг: ${result.count}\nТвой заработок: ${money(result.earned)}`,
    mainKeyboard()
  );
}

async function earningsMonth(env, chatId) {
  const date = localDate();
  const month = date.slice(0, 7);

  const result = await env.DB.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS earned
    FROM earnings_entries
    WHERE service_date LIKE ?
  `).bind(`${month}%`).first();

  await sendMessage(
    env,
    chatId,
    `📊 Заработок за месяц ${month.slice(5, 7)}.${month.slice(0, 4)}\n\nЗаписей услуг: ${result.count}\nТвой заработок: ${money(result.earned)}`,
    mainKeyboard()
  );
}

async function showEarningsMenu(env, chatId) {
  await sendMessage(
    env,
    chatId,
    "💰 Мой заработок\n\nВыбери период:",
    {
      inline_keyboard: [
        [
          { text: "Сегодня", callback_data: "today" },
          { text: "Период", callback_data: "period" }
        ],
        [
          { text: "Месяц", callback_data: "month" }
        ]
      ]
    }
  );
}

async function processSession(env, chatId, input, session) {
  if (session.type === "add_pet") {
    await processPetForm(env, chatId, input, session);
    return;
  }

  if (session.type === "visit_earnings") {
    if (input === "/skip") {
      await sendMessage(
        env,
        chatId,
        "Для завершения визита нужно указать хотя бы одну услугу. Введи услуги с суммами или /cancel."
      );
      return;
    }

    await saveVisitEarnings(env, chatId, session, input);
    return;
  }

  if (session.type === "plus_earnings") {
    if (input === "/skip") {
      await sendMessage(
        env,
        chatId,
        "Укажи хотя бы одну услугу с суммой или /cancel."
      );
      return;
    }

    await savePlusEarnings(env, chatId, input);
    return;
  }

  await deleteSession(env, chatId);

  await sendMessage(
    env,
    chatId,
    "Неизвестный шаг. Начни заново через меню.",
    mainKeyboard()
  );
}

async function handleCallback(env, callback) {
  const chatId = callback.message?.chat?.id;
  const data = callback.data || "";

  await answerCallback(env, callback.id);

  if (!chatId) return;

  if (data === "pets") return listPets(env, chatId);
  if (data === "visits") return listVisits(env, chatId);
  if (data === "plus") return beginPlus(env, chatId);
  if (data === "earnings") return showEarningsMenu(env, chatId);
  if (data === "add") return startAdding(env, chatId);
  if (data === "visit_choose") return choosePetForVisit(env, chatId);
  if (data === "today") return earningsToday(env, chatId);
  if (data === "period") return earningsPeriod(env, chatId);
  if (data === "month") return earningsMonth(env, chatId);

  if (data.startsWith("pet:")) {
    return showPet(env, chatId, data.slice(4));
  }

  if (data.startsWith("visit:")) {
    return startVisit(env, chatId, data.slice(6));
  }

  if (data.startsWith("finish:")) {
    return beginFinishVisit(env, chatId, data.slice(7));
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response("Groomer Assistant is running.", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!env.BOT_TOKEN) {
      return new Response("Bot token is not configured.", { status: 500 });
    }

    if (!env.DB) {
      return new Response("D1 database binding DB is not configured.", { status: 500 });
    }

    let update;

    try {
      update = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    try {
      await initializeDatabase(env);

      if (update.callback_query) {
        await handleCallback(env, update.callback_query);
        return new Response("OK");
      }

      const message = update.message;

      if (!message || !message.chat || typeof message.text !== "string") {
        return new Response("OK");
      }

      const chatId = message.chat.id;
      const text = message.text.trim();
      const command = text.split(/\s+/)[0].split("@")[0];
      const argument = text.split(/\s+/).slice(1).join(" ").trim();

      if (command === "/start") {
        await sendMessage(env, chatId, HELP_TEXT, mainKeyboard());
        return new Response("OK");
      }

      if (command === "/help") {
        await sendMessage(env, chatId, HELP_TEXT, mainKeyboard());
        return new Response("OK");
      }

      if (command === "/cancel") {
        await deleteSession(env, chatId);

        await sendMessage(
          env,
          chatId,
          "Текущий ввод отменён. Визиты, которые уже начаты, остаются в работе.",
          mainKeyboard()
        );

        return new Response("OK");
      }

      if (command === "/add") {
        await startAdding(env, chatId);
        return new Response("OK");
      }

      if (command === "/pets") {
        await listPets(env, chatId);
        return new Response("OK");
      }

      if (command === "/pet") {
        if (/^\d+$/.test(argument)) {
          await showPet(env, chatId, argument);
        } else if (argument) {
          await findByPlainName(env, chatId, argument);
        } else {
          await sendMessage(env, chatId, "Напиши /pet 1 или /pet Янтарь.");
        }

        return new Response("OK");
      }

      if (command === "/find") {
        await findPets(env, chatId, argument);
        return new Response("OK");
      }

      if (command === "/visit") {
        if (!argument) {
          await choosePetForVisit(env, chatId);
          return new Response("OK");
        }

        const result = await env.DB.prepare(`
          SELECT id, name FROM dogs
          WHERE name = ? COLLATE NOCASE
          ORDER BY id
          LIMIT 2
        `).bind(argument).all();

        const pets = result.results || [];

        if (pets.length === 1) {
          await startVisit(env, chatId, pets[0].id);
        } else if (pets.length > 1) {
          await sendMessage(
            env,
            chatId,
            "Нашла несколько питомцев с таким именем. Выбери карточку:",
            {
              inline_keyboard: pets.map(p => [{
                text: p.name,
                callback_data: `visit:${p.id}`
              }])
            }
          );
        } else {
          await sendMessage(
            env,
            chatId,
            `Не нашла питомца «${argument}». Проверь имя или используй /pets.`
          );
        }

        return new Response("OK");
      }

      if (command === "/visits") {
        await listVisits(env, chatId);
        return new Response("OK");
      }

      if (command === "/finish") {
        if (!/^\d+$/.test(argument)) {
          await sendMessage(
            env,
            chatId,
            "Укажи номер визита. Например: /finish 12\nСписок визитов: /visits"
          );
        } else {
          await beginFinishVisit(env, chatId, Number(argument));
        }

        return new Response("OK");
      }

      if (command === "/plus") {
        await beginPlus(env, chatId);
        return new Response("OK");
      }

      if (command === "/today") {
        await earningsToday(env, chatId);
        return new Response("OK");
      }

      if (command === "/period") {
        await earningsPeriod(env, chatId);
        return new Response("OK");
      }

      if (command === "/month") {
        await earningsMonth(env, chatId);
        return new Response("OK");
      }

      const session = await getSession(env, chatId);

      if (session) {
        await processSession(env, chatId, text, session);
        return new Response("OK");
      }

      await findByPlainName(env, chatId, text);
      return new Response("OK");
    } catch (error) {
      console.error("Groomer Assistant error:", error);

      try {
        const chatId =
          update.message?.chat?.id ||
          update.callback_query?.message?.chat?.id;

        if (chatId) {
          await sendMessage(
            env,
            chatId,
            "Возникла техническая ошибка. Попробуй ещё раз чуть позже. Если повторится, сообщи мне."
          );
        }
      } catch (sendError) {
        console.error("Could not send error message:", sendError);
      }

      return new Response("Internal error", { status: 500 });
    }
  }
};
