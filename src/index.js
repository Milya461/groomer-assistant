const TELEGRAM_API = "https://api.telegram.org";
const TIME_ZONE = "Europe/Moscow";
const DAY_MINUTES = 24 * 60;

const START_TEXT = [
  "Привет! 🐾",
  "",
  "Я твой личный Groomer Assistant.",
  "",
  "🐾 Карточки собак и кошек",
  "📋 Расписание на сегодня",
  "⏰ Напоминания о приходе клиентов",
  "✂️ Учёт времени и услуг",
  "💰 Расчёт твоего заработка",
  "",
  "Команды:",
  "/start — главное меню",
  "/help — помощь"
].join("\n");

const HELP_TEXT = [
  "❔ ПОМОЩЬ ПО GROOMER ASSISTANT",
  "",
  "📱 КНОПКИ ГЛАВНОГО МЕНЮ",
  "",
  "📅 Рабочий день",
  "Работа с расписанием на сегодня, очередью клиентов и визитами. Здесь можно проверить очередь, выбрать питомца для визита и посмотреть визиты, которые ещё не завершены.",
  "",
  "🐾 Питомцы",
  "Просмотр списка питомцев, поиск по имени и открытие карточек. Можно добавить нового питомца и посмотреть его данные: породу, особенности шерсти, склонность к колтунам, чувствительные зоны, реакцию на инструменты, предупреждения и заметки.",
  "",
  "💰 Мой заработок",
  "Просмотр заработка за сегодня, за период и за месяц. Здесь также можно внести услугу, оказанную без предварительной записи.",
  "",
  "❔ Помощь",
  "Эта справка с описанием команд и возможностей бота.",
  "",
  "⌨️ КОМАНДЫ",
  "",
  "/start — открыть главное меню и приветствие.",
  "/help — открыть эту справку.",
  "/grafik — составить или изменить график рабочих смен на следующий месяц.",
  "Кнопка «📅  График работы» также открывает ввод графика.",
  "/add — начать добавление питомца в базу.",
  "/pets — показать список питомцев.",
  "/pet ID — открыть карточку питомца по его ID.",
  "/find имя — найти питомца по имени.",
  "/visit имя — начать визит выбранного питомца.",
  "/visits — показать визиты, которые сейчас в работе.",
  "/finish ID — завершить визит по ID.",
  "/duration ID 150 — установить плановую длительность визита в минутах.",
  "/time ID 150 — исправить фактическую длительность визита в минутах.",
  "/queue — показать очередь на сегодня.",
  "/queueclear — очистить очередь незапущенных визитов.",
  "/plus — внести услугу без записи.",
  "/today — посмотреть заработок за сегодня.",
  "/period — посмотреть заработок за текущий расчётный период.",
  "/month — посмотреть заработок за месяц.",
  "/cancel — отменить текущий ввод.",
  "/skip — пропустить необязательное поле при заполнении карточки.",
  "",
  "📋 КАК СОЗДАТЬ ОЧЕРЕДЬ",
  "",
  "Отправь список клиентов со временем.",
  "",
  "Очередь создаётся только на текущий день.",
  "",
  "🐾 КАК РАБОТАТЬ С ПИТОМЦЕМ",
  "",
  "Добавь питомца через кнопку «🐾 Питомцы» или команду /add. Заполни обязательные поля, а необязательные можно пропустить командой /skip.",
  "",
  "✂️ УЧЁТ ВИЗИТОВ",
  "",
  "Начни визит через кнопку рабочего дня или команду /visit. После завершения визита укажи фактическую длительность, если бот её запрашивает. Для изменения времени используй команду /time.",
  "",
  "💰 УЧЁТ ЗАРАБОТКА",
  "",
  "Для просмотра заработка используй раздел «💰 Мой заработок» или команды /today, /period и /month. Для услуги без записи используй /plus.",
  "",
  "Чтобы вернуться к главному меню, отправь /start."
].join("\n");

const STEPS = [
  { key: "name", prompt: "Как зовут питомца? Напиши имя:", optional: false },
  {
    key: "species",
    prompt: "Кто это — собака или кошка? Напиши «собака» или «кошка»:",
    optional: false
  },
  { key: "breed", prompt: "Какая порода? Или /skip.", optional: true },
  { key: "age", prompt: "Сколько питомцу лет? Или /skip.", optional: true },
  {
    key: "coat_features",
    prompt: "Особенности шерсти. Или /skip.",
    optional: true
  },
  {
    key: "matting_tendency",
    prompt: "Есть ли склонность к колтунам? Или /skip.",
    optional: true
  },
  {
    key: "sensitive_areas",
    prompt: "Какие зоны чувствительные? Или /skip.",
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
    prompt: "Важные предупреждения для грумера. Или /skip.",
    optional: true
  },
  { key: "notes", prompt: "Дополнительные заметки. Или /skip.", optional: true }
];

function mainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📅  Рабочий день", callback_data: "workday" },
        { text: "🐾  Питомцы", callback_data: "pets_menu" }
      ],
      [
        { text: "💰 Мой заработок", callback_data: "earnings" },
        { text: "❔ Помощь", callback_data: "help" }
      ],
      [
        { text: "📅  График работы", callback_data: "schedule_start" }
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

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS assistant_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS assistant_appointment_state (
      appointment_id INTEGER PRIMARY KEY,
      arrival_prompted INTEGER NOT NULL DEFAULT 0,
      duration_reminded INTEGER NOT NULL DEFAULT 0,
      planned_end_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id)
        REFERENCES appointments(id) ON DELETE CASCADE
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS assistant_work_shifts (
      shift_date TEXT PRIMARY KEY,
      start_time TEXT NOT NULL DEFAULT '10:00',
      end_time TEXT NOT NULL DEFAULT '20:00',
      reminders_sent TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS visit_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
      telegram_file_id TEXT NOT NULL,
      caption TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id)
        REFERENCES appointments(id) ON DELETE CASCADE
    )
  `).run();
  try {
    await env.DB.prepare(`
      ALTER TABLE dogs
      ADD COLUMN is_temporary INTEGER NOT NULL DEFAULT 0
    `).run();
  } catch (error) {
    if (!String(error?.message || error).includes("duplicate column name")) {
      throw error;
    }
  }
  const initialShifts = [
    "2026-10-15",
    "2026-10-16",
    "2026-10-19",
    "2026-10-20",
    "2026-10-23",
    "2026-10-24",
    "2026-10-27",
    "2026-10-28",
    "2026-10-31"
  ];

  for (const shiftDate of initialShifts) {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO assistant_work_shifts (
        shift_date, start_time, end_time, reminders_sent
      ) VALUES (?, '10:00', '20:00', '[]')
    `).bind(shiftDate).run();
  }
}

async function rememberChat(env, chatId) {
  await env.DB.prepare(`
    INSERT INTO assistant_settings (setting_key, setting_value, updated_at)
    VALUES ('chat_id', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value = excluded.setting_value,
      updated_at = CURRENT_TIMESTAMP
  `).bind(String(chatId)).run();
}

async function getReminderChat(env) {
  const row = await env.DB.prepare(`
    SELECT setting_value
    FROM assistant_settings
    WHERE setting_key = 'chat_id'
  `).first();

  return row?.setting_value || null;
}

async function getSession(env, chatId) {
  const row = await env.DB.prepare(`
    SELECT session_data
    FROM user_sessions
    WHERE chat_id = ?
  `).bind(String(chatId)).first();

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
  await env.DB.prepare(`
    DELETE FROM user_sessions WHERE chat_id = ?
  `).bind(String(chatId)).run();
}

function localParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function localDate() {
  const p = localParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function localTime() {
  const p = localParts();
  return `${p.hour}:${p.minute}`;
}

function localDateTime(date = localDate(), time = localTime()) {
  return `${date} ${time}`;
}

function localDateTimeMs(date, time) {
  // Moscow is UTC+3. Treat both endpoints consistently for duration calculation.
  return Date.parse(`${date}T${time}:00+03:00`);
}

function money(value) {
  return Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }) + " ₽";
}

function displaySpecies(species, name = "") {
  if (species !== "cat") return "Собака 🐕";

  if (String(name).trim().toLowerCase() === "янтарь") {
    return "Кот 🐈";
  }

  return "Кошка 🐈";
}
function shouldHavePhotoArchive(pet) {
  const species = String(pet.species || "")
    .toLowerCase()
    .trim();

  if (species !== "dog") return false;

  const breed = String(pet.breed || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]/g, "");

  const photoBreeds = [
    "бишон",
    "вестхайленд",
    "вестхайлендуайттерьер",
    "мальтезе",
    "мальтийскаяболонка",
    "пудель",
    "шитцу",
    "шитсу",
    "ши-тцу",
    "ши-тсу",
    "гриффон",
    "грифон",
    "папильон",
    "папийон",
    "пекинес",
    "пекинская",
    "японскийхин",
    "мальтипу",
    "кокапу",
    "кавапу",
    "помапу"
  ];

  return photoBreeds.some(name => breed.includes(name));
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
    `🐾 Создаём карточку нового питомца!\n\n${STEPS[0].prompt}`
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
      await sendMessage(env, chatId, "Это обязательное поле. Заполни его.");
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
      `Принято: ${value || "не указано"}.\n\n${STEPS[session.step].prompt}`
    );
    return;
  }

  const d = session.data;
  let petId;

  if (session.temporaryPetId) {
    const result = await env.DB.prepare(`
      UPDATE dogs
      SET name = ?,
          species = ?,
          breed = ?,
          age = ?,
          coat_features = ?,
          matting_tendency = ?,
          sensitive_areas = ?,
          clipper_reaction = ?,
          dryer_reaction = ?,
          nail_clipper_reaction = ?,
          warnings = ?,
          notes = ?,
          is_temporary = 0
      WHERE id = ? AND is_temporary = 1
    `).bind(
      d.name,
      d.species,
      d.breed || null,
      d.age || null,
      d.coat_features || null,
      d.matting_tendency || null,
      d.sensitive_areas || null,
      d.clipper_reaction || null,
      d.dryer_reaction || null,
      d.nail_clipper_reaction || null,
      d.warnings || null,
      d.notes || null,
      Number(session.temporaryPetId)
    ).run();

    if (!result.meta?.changes) {
      await sendMessage(
        env,
        chatId,
        "Не удалось обновить временную карточку. Визит и заработок сохранены; попробуй ещё раз."
      );
      return;
    }

    petId = Number(session.temporaryPetId);
  } else {
    const result = await env.DB.prepare(`
      INSERT INTO dogs (
        name, species, breed, age, coat_features, matting_tendency,
        sensitive_areas, clipper_reaction, dryer_reaction,
        nail_clipper_reaction, warnings, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      d.name,
      d.species,
      d.breed || null,
      d.age || null,
      d.coat_features || null,
      d.matting_tendency || null,
      d.sensitive_areas || null,
      d.clipper_reaction || null,
      d.dryer_reaction || null,
      d.nail_clipper_reaction || null,
      d.warnings || null,
      d.notes || null
    ).run();

    petId = result.meta.last_row_id;
  }

  await deleteSession(env, chatId);

  const pet = { id: petId, ...d, is_temporary: 0 };

  await sendMessage(
    env,
    chatId,
    `✅ Карточка питомца «${d.name}» создана!\n\n${formatPet(pet)}`,
    mainKeyboard()
  );
}

async function listPets(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    WHERE COALESCE(is_temporary, 0) = 0
    ORDER BY name COLLATE NOCASE, id
    LIMIT 50
  `).all();

  const pets = result.results || [];

  if (!pets.length) {
    await sendMessage(env, chatId, "Пока карточек нет 🐾\nДобавить питомца: /add");
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
        [{ text: "▶️ Начать визит", callback_data: "visit_choose" }]
      ]
    }
  );
}

async function showPet(env, chatId, id) {
  let pet;

  if (/^\d+$/.test(String(id))) {
    pet = await env.DB.prepare(`
      SELECT * FROM dogs
      WHERE id = ? AND COALESCE(is_temporary, 0) = 0
    `).bind(Number(id)).first();
  } else {
    pet = await env.DB.prepare(`
      SELECT * FROM dogs
      WHERE name = ? COLLATE NOCASE
        AND COALESCE(is_temporary, 0) = 0
      ORDER BY id LIMIT 1
    `).bind(String(id)).first();
  }

  if (!pet) {
    await sendMessage(env, chatId, `Питомец «${id}» не найден.`);
    return;
  }

    const keyboard = [
    [
      { text: "▶️  Начать визит", callback_data: `visit:${pet.id}` }
    ]
  ];

  if (shouldHavePhotoArchive(pet)) {
    keyboard.push([
      {
        text: "🖼 История фотографий",
        callback_data: `photos:${pet.id}`
      }
    ]);
  }

  await sendMessage(
    env,
    chatId,
    formatPet(pet),
    { inline_keyboard: keyboard }
  );
}
async function searchPets(env, chatId, query) {
  const normalizedQuery = String(query || "")
    .trim()
    .toLocaleLowerCase("ru-RU");

  if (!normalizedQuery) {
    await sendMessage(
      env,
      chatId,
      "Напиши имя, породу или их сочетание. Например: /find шпиц Месси"
    );
    return;
  }

  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  const result = await env.DB.prepare(`
    SELECT * FROM dogs
    WHERE COALESCE(is_temporary, 0) = 0
    ORDER BY name
  `).all();

  const pets = (result.results || []).filter(pet => {
    const searchableText = `${pet.name || ""} ${pet.breed || ""}`
      .toLocaleLowerCase("ru-RU");

    return words.every(word => searchableText.includes(word));
  });

  if (!pets.length) {
    await sendMessage(
      env,
      chatId,
      `По запросу «${query}» ничего не найдено.`,
      mainKeyboard()
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
    `🔎 Найдены питомцы (${pets.length}):`,
    {
      inline_keyboard: [
        ...pets.slice(0, 20).map(pet => [{
          text: `📋 ${pet.name}${pet.breed ? ` — ${pet.breed}` : ""} · №${pet.id}`,
          callback_data: `pet:${pet.id}`
        }]),
        [{ text: "🏠 Главное меню", callback_data: "home" }]
      ]
    }
  );
}

async function findPets(env, chatId, query) {
  await searchPets(env, chatId, query);
}

async function findByPlainName(env, chatId, query) {
  await searchPets(env, chatId, query);
}

function extractQueueBreed(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/^сегодня\s+/i, "");

  const match = normalized.match(
    /^(йоркширский терьер|йорк|мальтипу|шпиц|пудель|мальтезе|бишон|ши-тцу|пекинес|гриффон|чихуахуа|мопс|такса|спаниель|джек-рассел|бульдог)\s+/i
  );

  return match ? match[1] : "";
}

function cleanQueueName(value) {
  return String(value || "")
    .replace(/^[\s,;—–-]+|[\s,;—–-]+$/g, "")
    .replace(/^сегодня\s+/i, "")
    .replace(/^в\s+/i, "")
    .replace(/\s+в$/i, "")
    .replace(/^(собака|пёс|пес|шпиц|йоркширский терьер|йорк|пудель|мальтипу|мальтезе|бишон|ши-тцу|пекинес|гриффон|чихуахуа|мопс|такса|спаниель|джек-рассел|бульдог|кошка|кот)\s+/i, "")
    .trim();
}

function parseDailyQueue(input) {
  const timePattern = /(?:^|\s)(\d{1,2}):([0-5]\d)(?=\s|$|[,;])/g;
  const matches = [];
  let match;

  while ((match = timePattern.exec(input)) !== null) {
    const full = match[0];
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const timeIndex = match.index + full.lastIndexOf(match[1]);

    if (hour < 0 || hour > 23) {
      return { error: `Проверь время «${match[1]}:${match[2]}».` };
    }

    matches.push({
      hour,
      minute,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      start: timeIndex,
      end: timeIndex + `${match[1]}:${match[2]}`.length
    });
  }

  if (!matches.length) {
    return { error: "Не вижу времени записей. Пример: 10:00 Месси, 12:30 Боня." };
  }

  const startsWithTime = /^\s*\d{1,2}:[0-5]\d/.test(input);
  const entries = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const previous = matches[i - 1];
    const next = matches[i + 1];

    let rawName;

    if (startsWithTime) {
      rawName = input.slice(current.end, next ? next.start : input.length);
    } else {
      rawName = input.slice(previous ? previous.end : 0, current.start);
    }

    const name = cleanQueueName(rawName);

    if (!name) {
      return {
        error: `Не удалось определить имя для времени ${current.time}. Напиши время и имя каждой собаки.`
      };
    }

  entries.push({
    time: current.time,
    name,
    breed: extractQueueBreed(rawName)
  });
  }
  
  entries.sort((a, b) => a.time.localeCompare(b.time));

  for (let i = 1; i < entries.length; i++) {
    if (entries[i].time === entries[i - 1].time) {
      return { error: `Время ${entries[i].time} указано дважды.` };
    }
  }

  return { entries };
}

async function resolvePetByQueueName(env, queueName) {
  const result = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    WHERE COALESCE(is_temporary, 0) = 0
    ORDER BY name COLLATE NOCASE
  `).all();

  const pets = result.results || [];
  const q = String(queueName || "").toLocaleLowerCase("ru-RU").trim();

  const exact = pets.filter(
    p => p.name.toLocaleLowerCase("ru-RU") === q
  );
  if (exact.length === 1) return exact[0];

  const suffix = pets.filter(p => {
    const name = p.name.toLocaleLowerCase("ru-RU");
    return q.endsWith(name);
  });
  if (suffix.length === 1) return suffix[0];

  const contains = pets.filter(p => {
    const name = p.name.toLocaleLowerCase("ru-RU");
    return q.includes(name);
  });
  if (contains.length === 1) return contains[0];

  return null;
}

async function createDailyQueue(env, chatId, input) {
  const parsed = parseDailyQueue(input);

  if (parsed.error) {
    await sendMessage(env, chatId, parsed.error);
    return;
  }

  const date = localDate();

  const active = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM appointments
    WHERE appointment_date = ?
      AND status IN ('scheduled', 'waiting', 'in_progress')
  `).bind(date).first();

  if (Number(active?.count || 0) > 0) {
    await sendMessage(
      env,
      chatId,
      "На сегодня уже есть незавершённая очередь.\n\nПосмотри её через /queue. Чтобы удалить незапущенную очередь и составить новую, используй /queueclear.\n\nУже начатые визиты не удаляются."
    );
    return;
  }

  const resolved = [];

  for (const entry of parsed.entries) {
    const pet = await resolvePetByQueueName(env, entry.name
);

    if (pet) {
      resolved.push({
        ...entry,
        pet,
        temporary: false
      });
      continue;
    }

    const breed = entry.breed || null;

    const result = await env.DB.prepare(`
      INSERT INTO dogs (
        name, species, breed, is_temporary
      ) VALUES (?, 'dog', ?, 1)
    `).bind(entry.name
, breed).run();

    resolved.push({
      ...entry,
      pet: {
        id: result.meta.last_row_id,
        name: entry.name
,
        species: "dog",
        breed
      },
      temporary: true
    });
  }

  for (let i = 0; i < resolved.length; i++) {
    const entry = resolved[i];

    const result = await env.DB.prepare(`
      INSERT INTO appointments (
        dog_id, appointment_date, appointment_time,
        queue_position, status, procedures
      ) VALUES (?, ?, ?, ?, 'scheduled', '')
    `).bind(
      entry.pet.id
,
      date,
      entry.time,
      i + 1
    ).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO assistant_appointment_state (appointment_id)
      VALUES (?)
    `).bind(result.meta.last_row_id).run();
  }

  await sendMessage(
    env,
    chatId,
    "✅ Очередь на сегодня сохранена!\n\n" +
      resolved.map
((entry, i) =>
        `${i + 1}. ${entry.time} — ${entry.pet.name
}${entry.pet.breed ? ` (${entry.pet.breed})` : ""}${entry.temporary ? " · без карточки" : ""}`
      ).join("\n") +
      "\n\nВ назначенное время я спрошу, пришёл ли клиент. Будущие даты не создаются.",
    mainKeyboard()
  );
}

async function clearDailyQueue(env, chatId) {
  const date = localDate();

  await env.DB.prepare(`
    DELETE FROM assistant_appointment_state
    WHERE appointment_id IN (
      SELECT id FROM appointments
      WHERE appointment_date = ?
        AND status IN ('scheduled', 'waiting')
    )
  `).bind(date).run();

  await env.DB.prepare(`
    DELETE FROM appointments
    WHERE appointment_date = ?
      AND status IN ('scheduled', 'waiting')
  `).bind(date).run();

  await sendMessage(
    env,
    chatId,
    "Незапущенная очередь на сегодня очищена. Начатые и завершённые визиты сохранены.",
    mainKeyboard()
  );
}

async function showDailyQueue(env, chatId, remainingOnly = false) {
  const date = localDate();

  const result = await env.DB.prepare(`
    SELECT a.id
, a.appointment_time, a.status, a.queue_position,
           d.name
, d.breed
    FROM appointments a
    JOIN dogs d ON d.id
 = a.dog_id
    WHERE a.appointment_date = ?
      AND (? = 0 OR a.status IN ('scheduled', 'waiting', 'in_progress'))
    ORDER BY a.queue_position, a.appointment_time, a.id
  `).bind(date, remainingOnly ? 1 : 0).all();

  const rows = result.results || [];

  if (!rows.length) {
    await sendMessage(
      env,
      chatId,
      remainingOnly
        ? "✅ На сегодня больше нет активных записей."
        : "На сегодня очередь пока не создана.",
      mainKeyboard()
    );
    return;
  }

  const labels = {
    scheduled: "ожидается",
    waiting: "ждём подтверждения",
    in_progress: "в работе",
    completed: "завершён",
    cancelled: "отменён",
    rescheduled: "перенесён",
    skipped: "пропущен"
  };

  const lines = rows.map(row =>
    `${row.appointment_time || "—"} — ${row.name}${row.breed ? ` (${row.breed})` : ""}\nСтатус: ${labels[row.status] || row.status}`
  );

    const buttons = rows
    .filter(row => ["scheduled", "waiting"].includes(row.status))
    .flatMap(row => [
      [{
        text: `▶️ Пришёл: ${row.name}`,
        callback_data: `arrived:${row.id}`
      }],
      [{
        text: `❌ Отменить: ${row.name}`,
        callback_data: `cancel_queue:${row.id}`
      }]
    ]);

  await sendMessage(
    env,
    chatId,
    `📅 Очередь на ${date}\n\n${lines.join("\n\n")}`,
    { inline_keyboard: [...buttons, [{ text: "Главное меню", callback_data: "home" }]] }
  );
}

async function getPetForAppointment(env, appointmentId) {
  return env.DB.prepare(`
    SELECT a.*, d.name, d.breed, d.species, d.coat_features, d.warnings,
           d.sensitive_areas, d.clipper_reaction, d.dryer_reaction,
           d.nail_clipper_reaction, d.notes AS pet_notes
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    WHERE a.id = ?
  `).bind(Number(appointmentId)).first();
}
async function startPhotoCapture(env, chatId, appointmentId, photoType) {
  const visit = await getPetForAppointment(env, appointmentId);

  if (!visit || !["in_progress", "completed"].includes(visit.status)) {
    await sendMessage(env, chatId, "Не удалось найти подходящий визит для фотографии.");
    return;
  }

  if (!shouldHavePhotoArchive(visit)) {
    await sendMessage(env, chatId, "Для этого питомца фотоархив не предусмотрен.");
    return;
  }

  await saveSession(env, chatId, {
    type: "visit_photo",
    appointmentId: Number(appointmentId),
    photoType,
    petName: visit.name
  });

  const label = photoType === "before" ? "ДО" : "ПОСЛЕ";

  await sendMessage(
    env,
    chatId,
    `📸  Фото ${label}: ${visit.name
}\n\nОтправь фотографию следующим сообщением. Она сохранится в истории этого визита.\n\n/cancel — отмена`
  );
}

async function saveVisitPhoto(env, chatId, session, message) {
  const photos = message.photo
 || [];

  if (!photos.length) {
    await sendMessage(env, chatId, "Не вижу фотографию. Отправь именно фото, а не текстовый файл.");
    return;
  }

  const photo = photos[photos.length - 1];
  const caption = message.caption || null;

  await env.DB.prepare(`
    INSERT INTO visit_photos (
      appointment_id, photo_type, telegram_file_id, caption
    ) VALUES (?, ?, ?, ?)
  `).bind(
    session.appointmentId,
    session.photoType,
    photo.file_id,
    caption
  ).run();

  await deleteSession(env, chatId);

  const label = session.photoType === "before" ? "ДО" : "ПОСЛЕ";

  await sendMessage(
    env,
    chatId,
    `✅ Фото ${label} сохранено!\n\nПитомец: ${session.petName}\nВизит №${session.appointmentId}`,
    mainKeyboard()
  );
}

async function showPetPhotoHistory(env, chatId, petId) {
  const pet = await env.DB.prepare(`
    SELECT id, name, species, breed, coat_features
    FROM dogs
    WHERE id = ?
      AND COALESCE(is_temporary, 0) = 0
  `).bind(Number(petId)).first();

  if (!pet) {
    await sendMessage(env, chatId, "Питомец не найден.");
    return;
  }
  if (!shouldHavePhotoArchive(pet)) {
    await sendMessage(
      env,
      chatId,
      "Для этого питомца фотоархив не предусмотрен.",
      mainKeyboard()
    );
    return;
  }
  const result = await env.DB.prepare(`
    SELECT
      p.telegram_file_id,
      p.photo_type,
      p.caption,
      p.created_at,
      a.appointment_date,
      a.id
 AS appointment_id
    FROM visit_photos p
    JOIN appointments a ON a.id
 = p.appointment_id
    WHERE a.dog_id = ?
    ORDER BY a.appointment_date DESC, p.id
 DESC
    LIMIT 10
  `).bind(Number(petId)).all();

  const photos = result.results || [];

  if (!photos.length) {
    await sendMessage(
      env,
      chatId,
      `🖼 В истории «${pet.name
}» пока нет фотографий.`,
      mainKeyboard()
    );
    return;
  }

  await sendMessage(
    env,
    chatId,
    `🖼 Фотоархив: ${pet.name
}\n\nПоследние фотографии по визитам:`
  );

  for (const item of photos) {
    const label = item.photo_type === "before" ? "ДО" : "ПОСЛЕ";
    const date = item.appointment_date || item.created_at;

    await telegram(env, "sendPhoto", {
      chat_id: chatId,
      photo: item.telegram_file_id,
      caption:
        `${pet.name
} · ${label}\n` +
        `Дата визита: ${date}\n` +
        `Визит №${item.appointment_id}` +
        (item.caption ? `\n${item.caption}` : "")
    });
  }
}
async function startVisit(env, chatId, petId, appointmentId = null) {
  const pet = await env.DB.prepare(`
    SELECT * FROM dogs WHERE id = ?
  `).bind(Number(petId)).first();

  if (!pet) {
    await sendMessage(env, chatId, "Питомец не найден. Проверь карточку.");
    return;
  }

  const date = localDate();
  const now = localTime();
  let id = appointmentId;

  if (id) {
    const appointment = await env.DB.prepare(`
      SELECT * FROM appointments WHERE id = ?
    `).bind(Number(id)).first();

    if (!appointment) {
      await sendMessage(env, chatId, "Запись не найдена.");
      return;
    }

    if (appointment.status === "in_progress") {
      await sendMessage(env, chatId, `Визит ${pet.name} уже находится в работе.`);
      return;
    }

    if (["completed", "cancelled", "skipped"].includes(appointment.status)) {
      await sendMessage(env, chatId, "Эту запись уже нельзя запустить.");
      return;
    }

    // Если подтверждение близко к времени записи, фиксируем плановое начало.
    const scheduledMs = localDateTimeMs(appointment.appointment_date, appointment.appointment_time);
    const nowMs = Date.parse(`${date}T${now}:00+03:00`);
    const startTime = nowMs >= scheduledMs && nowMs <= scheduledMs + 10 * 60 * 1000
      ? appointment.appointment_time
      : now;

    await env.DB.prepare(`
      UPDATE appointments
      SET status = 'in_progress',
          actual_start_time = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(startTime, Number(id)).run();
  } else {
    const result = await env.DB.prepare(`
      INSERT INTO appointments (
        dog_id, appointment_date, appointment_time,
        status, procedures, actual_start_time
      ) VALUES (?, ?, ?, 'in_progress', '', ?)
    `).bind(pet.id, date, now, now).run();

    id = result.meta.last_row_id;

    await env.DB.prepare(`
      INSERT OR IGNORE INTO assistant_appointment_state (appointment_id)
      VALUES (?)
    `).bind(Number(id)).run();
  }

  const appointment = await env.DB.prepare(`
    SELECT actual_start_time FROM appointments WHERE id = ?
  `).bind(Number(id)).first();

  const lines = [
    `▶️ Визит начат: ${pet.name}`,
    pet.breed ? `Порода: ${pet.breed}` : null,
    `Начало: ${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)} ${appointment?.actual_start_time || now}`,
    "",
    shouldHavePhotoArchive(pet)
      ? "Перед работой не забудь сделать фото ДО."
      : null,
    "После визита можно сохранить услуги и заработок.",
    "",
    "Плановое время можно указать кнопкой ниже.",
    Number(pet.is_temporary || 0) === 1
      ? "\nУ питомца нет карточки, не забудь заполнить ее после окончания визита."
      : null
  ].filter(Boolean);

  if (pet.warnings) lines.push("", `⚠️ Предупреждения: ${pet.warnings}`);
  if (pet.sensitive_areas) lines.push(`Чувствительные зоны: ${pet.sensitive_areas}`);
  if (pet.clipper_reaction) lines.push(`Машинка: ${pet.clipper_reaction}`);
  if (pet.dryer_reaction) lines.push(`Фен: ${pet.dryer_reaction}`);
  if (pet.nail_clipper_reaction) {
    lines.push(`Когти: ${pet.nail_clipper_reaction}`);
  }

    const keyboard = [
    [
      { text: "⏱ Указать плановое время", callback_data: `duration:${id}` }
    ]
  ];

  if (shouldHavePhotoArchive(pet)) {
    keyboard.push([
      { text: "📸  Фото ДО сделано", callback_data: `photo_before:${id}` }
    ]);
  }

  keyboard.push([
    { text: "✅ Завершить визит", callback_data: `finish:${id}` }
  ]);

  await sendMessage(
    env,
    chatId,
    lines.join("\n"),
    { inline_keyboard: keyboard }
  );
}

async function choosePetForVisit(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT id, name, breed
    FROM dogs
    WHERE COALESCE(is_temporary, 0) = 0
    ORDER BY name COLLATE NOCASE
    LIMIT 50
  `).all();

  const pets = result.results || [];

  if (!pets.length) {
    await sendMessage(env, chatId, "Сначала добавь питомца командой /add.");
    return;
  }

  await sendMessage(
    env,
    chatId,
    "Выбери питомца, который пришёл:",
    {
      inline_keyboard: pets.map(pet => [{
        text: `${pet.name}${pet.breed ? " — " + pet.breed : ""}`,
        callback_data: `visit:${pet.id}`
      }])
    }
  );
}

async function listVisits(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT a.id, a.dog_id, a.appointment_date, a.appointment_time,
           a.actual_start_time, a.planned_duration_minutes,
           d.name, d.breed
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    WHERE a.status = 'in_progress'
    ORDER BY a.appointment_date, a.appointment_time, a.id
    LIMIT 50
  `).all();

  const visits = result.results || [];

  if (!visits.length) {
    await sendMessage(env, chatId, "Сейчас нет визитов в работе.", mainKeyboard());
    return;
  }

  const lines = visits.map(v =>
    `${v.name}${v.breed ? ` (${v.breed})` : ""}\nНачало: ${v.appointment_date} ${v.actual_start_time || v.appointment_time || ""}` +
    (v.planned_duration_minutes ? `\nПлан: ${formatDuration(v.planned_duration_minutes)}` : "")
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

function formatDuration(minutes) {
  const value = Number(minutes || 0);
  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (hours && mins) return `${hours} ч ${mins} мин`;
  if (hours) return `${hours} ч`;
  return `${mins} мин`;
}

function parseDuration(input) {
  const value = input.trim().toLowerCase().replace(/ё/g, "е");

  let match = value.match(/^(\d{1,2}):([0-5]\d)$/);
  if (match) return Number(match[1]) * 60 + Number(match[2]);

  match = value.match(/^(\d+(?:[.,]\d+)?)\s*(?:ч|час|часа|часов)\s*(?:(\d+)\s*(?:м|мин|минута|минуты|минут))?$/);
  if (match) {
    return Math.round(Number(match[1].replace(",", ".")) * 60) + Number(match[2] || 0);
  }

  match = value.match(/^(\d+)\s*(?:м|мин|минута|минуты|минут)$/);
  if (match) return Number(match[1]);

  if (/^\d+$/.test(value)) return Number(value);

  return null;
}

async function beginDurationInput(env, chatId, appointmentId) {
  const visit = await getPetForAppointment(env, appointmentId);

  if (!visit || visit.status !== "in_progress") {
    await sendMessage(env, chatId, "Этот визит не находится в работе.");
    return;
  }

  await saveSession(env, chatId, {
    type: "visit_duration",
    appointmentId: Number(appointmentId),
    petName: visit.name
  });

  await sendMessage(
    env,
    chatId,
    `Сколько времени выделено на ${visit.name}?\n\n/cancel — отмена`
  );
}

async function savePlannedDuration(env, chatId, session, input) {
  const minutes = parseDuration(input);

  if (!minutes || minutes < 1 || minutes > 24 * 60) {
    await sendMessage(
      env,
      chatId,
      "Не удалось распознать время. Примеры: 2:30, 150 минут, 2 ч 30 мин."
    );
    return;
  }

  const visit = await env.DB.prepare(`
    SELECT id, appointment_date, actual_start_time, status
    FROM appointments
    WHERE id = ?
  `).bind(session.appointmentId).first();

  if (!visit || visit.status !== "in_progress") {
    await deleteSession(env, chatId);
    await sendMessage(env, chatId, "Визит уже не находится в работе.");
    return;
  }

  const startMs = localDateTimeMs(
    visit.appointment_date,
    visit.actual_start_time || localTime()
  );

  const end = new Date(startMs + minutes * 60 * 1000);
  const endParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(end);

  const p = Object.fromEntries(endParts.map(part => [part.type, part.value]));
  const plannedEnd = `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;

  await env.DB.prepare(`
    UPDATE appointments
    SET planned_duration_minutes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(minutes, session.appointmentId).run();

  await env.DB.prepare(`
    INSERT INTO assistant_appointment_state (
      appointment_id, planned_end_at, duration_reminded, updated_at
    ) VALUES (?, ?, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(appointment_id) DO UPDATE SET
      planned_end_at = excluded.planned_end_at,
      duration_reminded = 0,
      updated_at = CURRENT_TIMESTAMP
  `).bind(session.appointmentId, plannedEnd).run();

  await deleteSession(env, chatId);

  await sendMessage(
    env,
    chatId,
    `⏱ Плановое время для ${session.petName}: ${formatDuration(minutes)}.\nОриентировочное завершение: ${p.hour}:${p.minute}.`,
    mainKeyboard()
  );
}

async function beginFinishVisit(env, chatId, appointmentId) {
  const visit = await getPetForAppointment(env, appointmentId);

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
    `Завершаем визит питомца «${visit.name}».\n\n` +
      "Напиши выполненные услуги по одной на строке, указав сумму.\n" +
      "/cancel — отмена ввода"
  );
}

function parseServiceLines(input) {
  const lines = input.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const services = [];

  for (const line of lines) {
    const match = line.match(
  /^(?:(.+?)\s+(\d+(?:[.,]\d{1,2})?)|(\d+(?:[.,]\d{1,2})?)\s+(.+?))\s*(?:₽|руб(?:лей|ля)?\.?)?$/i
);

    if (!match) {
      return {
        error:
          `Не удалось разобрать строку:\n«${line}»\n\n` +
          "Напиши название услуги и сумму, например: Комплекс 3200"
      };
    }

    const description = (match[1] || match[4]).trim();
    const amount = Number((match[2] || match[3]).replace(",", "."));

    if (!description || !Number.isFinite(amount) || amount < 0) {
      return { error: `Проверь название и сумму в строке:\n«${line}»` };
    }

    services.push({ description, amount });
  }

  if (!services.length) {
    return { error: "Укажи хотя бы одну услугу и её сумму." };
  }

  return { services };
}
async function promptTemporaryPetCard(env, chatId, appointmentId, petId) {
  const pet = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    WHERE id = ? AND is_temporary = 1
  `).bind(Number(petId)).first();

  if (!pet) return;

  const matches = await env.DB.prepare(`
    SELECT id, name, species, breed
    FROM dogs
    WHERE is_temporary = 0
      AND LOWER(TRIM(name)) = LOWER(TRIM(?))
    ORDER BY id
    LIMIT 10
  `).bind(pet.name
).all();

  const existingPets = matches.results || [];
  const keyboard = [];

  for (const existing of existingPets) {
    keyboard.push([{
      text: `📋 Использовать карточку: ${existing.name
}${existing.breed ? " — " + existing.breed : ""}`,
      callback_data: `tempattach:${appointmentId}:${existing.id
}:${pet.id
}`
    }]);
  }

  keyboard.push([{
    text: "➕ Заполнить карточку",
    callback_data: `tempcreate:${appointmentId}:${pet.id
}`
  }]);

  keyboard.push([{
    text: "⏭ Заполнить позже",
    callback_data: `tempskip:${pet.id
}`
  }]);

  await sendMessage(
    env,
    chatId,
    "🐾  Визит и заработок сохранены.\n\n" +
      `Для питомца «${pet.name
}» пока нет полной карточки.` +
      (existingPets.length
        ? "\n\nНашла карточку с таким именем. Можно привязать визит к ней или заполнить новую карточку."
        : "\n\nМожно заполнить карточку сейчас или сделать это позже."),
    { inline_keyboard: keyboard }
  );
}

async function handleTemporaryPetAction(env, chatId, action, values) {
  if (action === "create") {
    const [appointmentId, petId] = values;

    const pet = await env.DB.prepare(`
      SELECT id, name, species, breed
      FROM dogs
      WHERE id = ? AND is_temporary = 1
    `).bind(Number(petId)).first();

    if (!pet) {
      await sendMessage(env, chatId, "Временная карточка не найдена. Визит и заработок сохранены.");
      return;
    }

    await saveSession(env, chatId, {
      type: "add_pet",
      step: 3,
      data: {
        name: pet.name
,
        species: pet.species || "собака",
        breed: pet.breed || ""
      },
      temporaryPetId: Number(pet.id
)
    });

    await sendMessage(
      env,
      chatId,
      `🐾  Заполняем карточку «${pet.name
}».\n` +
        "Имя, вид и порода уже внесены.\n\n" +
        `${STEPS[3].prompt}\n\n` +
        "На необязательных шагах можно отправлять /skip."
    );
    return;
  }

  if (action === "skip") {
    await sendMessage(
      env,
      chatId,
      "Хорошо, временная карточка сохранена. Визит и заработок не потеряются. Полную карточку можно заполнить позже."
    );
    return;
  }

  if (action === "attach") {
    const [appointmentId, existingPetId, temporaryPetId] = values;

    const existing = await env.DB.prepare(`
      SELECT id
      FROM dogs
      WHERE id = ? AND COALESCE(is_temporary, 0) = 0
    `).bind(Number(existingPetId)).first();

    const temporary = await env.DB.prepare(`
      SELECT id
      FROM dogs
      WHERE id = ? AND is_temporary = 1
    `).bind(Number(temporaryPetId)).first();

    if (!existing || !temporary) {
      await sendMessage(env, chatId, "Не удалось привязать визит. Визит и заработок сохранены.");
      return;
    }

    await env.DB.prepare(`
      UPDATE appointments
      SET dog_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(Number(existingPetId), Number(appointmentId)).run();

    await env.DB.prepare(`
      DELETE FROM dogs
      WHERE id = ?
        AND is_temporary = 1
        AND NOT EXISTS (
          SELECT 1 FROM appointments WHERE dog_id = dogs.id
        )
    `).bind(Number(temporaryPetId)).run();

    await sendMessage(
      env,
      chatId,
      "✅ Визит привязан к существующей карточке. Записанные услуги и заработок сохранены."
    );
  }
}
async function saveVisitEarnings(env, chatId, session, input) {
  const parsed = parseServiceLines(input);

  if (parsed.error) {
    await sendMessage(env, chatId, parsed.error);
    return;
  }

  const visit = await env.DB.prepare(`
    SELECT
      a.id,
      a.status,
      a.appointment_date,
      a.actual_start_time,
      a.appointment_time,
      d.id AS dog_id,
      d.name,
      d.is_temporary,
      d.species,
      d.breed,
      d.coat_features
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    WHERE a.id = ?
  `).bind(session.appointmentId).first();

  if (!visit || visit.status !== "in_progress") {
    await deleteSession(env, chatId);
    await sendMessage(env, chatId, "Визит уже закрыт или не найден. Проверь /visits.");
    return;
  }

  const services = parsed.services;
  const date = session.serviceDate || localDate();
  const endTime = localTime();
  const startTime = visit.actual_start_time || visit.appointment_time || endTime;

  const startMs = localDateTimeMs(visit.appointment_date, startTime);
  const endMs = localDateTimeMs(localDate(), endTime);
  const durationMinutes = Math.max(0, Math.round((endMs - startMs) / 60000));

  const totalEarned = services.reduce(
    (sum, service) => sum + Math.round(service.amount * 0.35 * 100) / 100,
    0
  );

  try {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];

      await env.DB.prepare(`
        INSERT OR IGNORE INTO earnings_entries (
          service_date, description, amount, rate, earned,
          appointment_id, source, source_id
        ) VALUES (?, ?, ?, 35, ?, ?, 'visit', ?)
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
          actual_end_time = ?,
          actual_duration_minutes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'in_progress'
    `).bind(
      services.map(service => `${service.description}: ${service.amount}`).join("; "),
      endTime,
      durationMinutes,
      session.appointmentId
    ).run();

    await deleteSession(env, chatId);

    await sendMessage(
      env,
      chatId,
      `✅ Визит завершён: ${session.petName}\n\n` +
        `⏱ Фактическое время: ${formatDuration(durationMinutes)}\n\n` +
        `💰 Твой заработок за визит: ${money(totalEarned)}`,
      {
        inline_keyboard: [
          ...(shouldHavePhotoArchive(visit)
            ? [[
                {
                  text: "📸  Сохранить фото ПОСЛЕ",
                  callback_data: `photo_after:${session.appointmentId}`
                }
              ]]
            : []),
          [
            { text: "🏠 Главное меню", callback_data: "home" }
          ]
        ]
      }
    );
    if (Number(visit.is_temporary || 0) === 1) {
      await promptTemporaryPetCard(
        env,
        chatId,
        session.appointmentId,
        visit.dog_id
      );
    }

    await showDailyQueue(env, chatId, true);
  } catch (error) {
    console.error("Could not save visit earnings:", error);

    await sendMessage(
      env,
      chatId,
      "Не удалось сохранить визит. Перед повторным вводом проверь /visits, чтобы не задвоить записи."
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

  if (/когт|коготк/.test(name)) return 100;
  if (/параанальн/.test(name)) return 100;
  if (/чаев/.test(name)) return 100;

  return 35;
}
async function savePlusEarnings(env, chatId, input) {
  const parsed = parseServiceLines(input);

  if (parsed.error) {
    await sendMessage(env, chatId, parsed.error);
    return;
  }

  const date = localDate();
  let totalEarned = 0;

  try {
    for (const service of parsed.services) {
      const rate = rateForUnscheduled(service.description);
      const earned = Math.round(service.amount * rate) / 100;
      totalEarned += earned;

      await env.DB.prepare(`
        INSERT INTO earnings_entries (
          service_date, description, amount, rate, earned, source, source_id
        ) VALUES (?, ?, ?, ?, ?, 'plus', ?)
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

    const lines = parsed.services.map(service => {
      const rate = rateForUnscheduled(service.description);
      const earned = Math.round(service.amount * rate) / 100;
      return `${service.description} (${rate}%) — ${money(earned)}`;
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
      "Не удалось сохранить все услуги. Перед повторным вводом проверь /today."
    );
  }
}

async function setManualDuration(env, chatId, argument) {
  const match = argument.match(/^(\d+)\s+(.+)$/);

  if (!match) {
    await sendMessage(
      env,
      chatId,
      "Формат: /time ID 150\n150 — фактическая длительность в минутах."
    );
    return;
  }

  const appointmentId = Number(match[1]);
  const minutes = parseDuration(match[2]);

  if (!minutes || minutes < 1 || minutes > DAY_MINUTES) {
    await sendMessage(env, chatId, "Укажи длительность от 1 до 1440 минут.");
    return;
  }

  const visit = await env.DB.prepare(`
    SELECT id, status, actual_start_time, appointment_date
    FROM appointments WHERE id = ?
  `).bind(appointmentId).first();

  if (!visit) {
    await sendMessage(env, chatId, "Визит не найден.");
    return;
  }

  const startMs = localDateTimeMs(
    visit.appointment_date,
    visit.actual_start_time || "00:00"
  );
  const end = new Date(startMs + minutes * 60000);
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(end);

  await env.DB.prepare(`
    UPDATE appointments
    SET actual_duration_minutes = ?,
        actual_end_time = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(minutes, p, appointmentId).run();

  await sendMessage(
    env,
    chatId,
    `Фактическая длительность визита №${appointmentId} сохранена: ${formatDuration(minutes)}.`
  );
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
  const start = day <= 15 ? `${date.slice(0, 7)}-01` : `${date.slice(0, 7)}-16`;
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
  const month = localDate().slice(0, 7);

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
async function showWorkdayMenu(env, chatId) {
  await sendMessage(
    env,
    chatId,
    "📅 Рабочий день\n\nВыбери нужное действие:",
    {
      inline_keyboard: [
        [
          { text: "📋 Очередь на сегодня", callback_data: "queue" }
        ],
        [
          { text: "🐾 Начать визит", callback_data: "visit_choose" },
          { text: "✂️ Визиты в работе", callback_data: "visits" }
        ],
        [
          { text: "➕ Услуга без записи", callback_data: "plus" }
        ],
        [
          { text: "🏠 Главное меню", callback_data: "home" }
        ]
      ]
    }
  );
}

async function showPetsMenu(env, chatId) {
  await sendMessage(
    env,
    chatId,
    "🐾 Питомцы\n\nВыбери действие.\n\nЧтобы найти питомца по имени, используй команду /find имя.",
    {
      inline_keyboard: [
        [
          { text: "📋 Список питомцев", callback_data: "pets" }
        ],
        [
          { text: "➕ Добавить питомца", callback_data: "add" }
        ],
        [
          { text: "🏠 Главное меню", callback_data: "home" }
        ]
      ]
    }
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
          { text: "📅 Сегодня", callback_data: "today" },
          { text: "📊 Период", callback_data: "period" }
        ],
        [
          { text: "🗓 Месяц", callback_data: "month" }
        ],
        [
          { text: "🏠 Главное меню", callback_data: "home" }
        ]
      ]
    }
  );
}
async function startScheduleInput(env, chatId) {
  const today = localDate();
  const currentMonth = Number(today.slice(5, 7));
  const currentYear = Number(today.slice(0, 4));
  const nextDate = new Date(Date.UTC(currentYear, currentMonth, 1));
  const targetMonth =
    `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, "0")}`;

  await saveSession(env, chatId, {
    type: "work_schedule",
    targetMonth
  });

  await sendMessage(
    env,
    chatId,
    `📅 График смен на ${targetMonth.slice(5, 7)}.${targetMonth.slice(0, 4)}\n\n` +
    "Отправь рабочие даты — по одной на строку.\n\n" +
    "Можно указать только дату: 05.11\n" +
    "Или дату со временем: 05.11 10:00-20:00\n\n" +
    "Если время не указано, будет сохранено 10:00–20:00.\n" +
    "Чтобы отменить ввод, отправь /cancel."
  );
}

async function processWorkSchedule(env, chatId, input) {
  const session = await getSession(env, chatId);

  if (!session || session.type !== "work_schedule") {
    await sendMessage(env, chatId, "Начни ввод графика командой /grafik или кнопкой «📅  График работы».");
    return;
  }

  const targetMonth = session.targetMonth;
  const lines = input.split(/\n+/).map(line => line.trim()).filter(Boolean);

  if (!lines.length) {
    await sendMessage(env, chatId, "Отправь хотя бы одну рабочую дату.");
    return;
  }

  const shifts = [];
  const errors = [];
  const seen = new Set();

  for (const line of lines) {
    const match = line.match(
      /^(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{4}))?(?:\s+(\d{1,2}):([0-5]\d)(?:\s*[-–]\s*(\d{1,2}):([0-5]\d))?)?$/
    );

    if (!match) {
      errors.push(`• ${line} — неверный формат`);
      continue;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = match[3] ? Number(match[3]) : Number(targetMonth.slice(0, 4));
    const targetYear = Number(targetMonth.slice(0, 4));
    const targetMonthNumber = Number(targetMonth.slice(5, 7));

    if (year !== targetYear || month !== targetMonthNumber) {
      errors.push(`• ${line} — нужна дата именно за ${targetMonth.slice(5, 7)}.${targetYear}`);
      continue;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      errors.push(`• ${line} — такой даты не существует`);
      continue;
    }

    const shiftDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const startTime = match[4] !== undefined
      ? `${String(Number(match[4])).padStart(2, "0")}:${match[5]}`
      : "10:00";
    const endTime = match[6] !== undefined
      ? `${String(Number(match[6])).padStart(2, "0")}:${match[7]}`
      : "20:00";

    if (
      Number(startTime.slice(0, 2)) > 23 ||
      Number(endTime.slice(0, 2)) > 23 ||
      startTime >= endTime
    ) {
      errors.push(`• ${line} — проверь время начала и окончания`);
      continue;
    }

    if (seen.has(shiftDate)) {
      errors.push(`• ${line} — дата указана повторно`);
      continue;
    }

    seen.add(shiftDate);
    shifts.push({ shiftDate, startTime, endTime });
  }

  if (errors.length) {
    await sendMessage(
      env,
      chatId,
      "Не сохранила график: проверь строки с ошибками.\n\n" +
      errors.join("\n") +
      "\n\nОтправь весь список заново. Пока ничего не изменено."
    );
    return;
  }

  if (!shifts.length) {
    await sendMessage(env, chatId, "Не нашла рабочих дат. Отправь список ещё раз.");
    return;
  }

  for (const shift of shifts) {
    await env.DB.prepare(`
      INSERT INTO assistant_work_shifts (
        shift_date, start_time, end_time, reminders_sent
      ) VALUES (?, ?, ?, '[]')
      ON CONFLICT(shift_date) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        reminders_sent = '[]',
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      shift.shiftDate,
      shift.startTime,
      shift.endTime
    ).run();
  }

  await env.DB.prepare(`
    DELETE FROM assistant_work_shifts
    WHERE shift_date LIKE ?
      AND shift_date NOT IN (${shifts.map(() => "?").join(",")})
  `).bind(`${targetMonth}-%`, ...shifts.map(shift => shift.shiftDate)).run();

  await env.DB.prepare(`
    INSERT INTO assistant_settings (
      setting_key, setting_value, updated_at
    ) VALUES (?, '1', CURRENT_TIMESTAMP)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value = '1',
      updated_at = CURRENT_TIMESTAMP
  `).bind(`schedule_submitted_${targetMonth}`).run();

  await env.DB.prepare(`
    DELETE FROM assistant_settings
    WHERE setting_key = ?
  `).bind(`schedule_prompt_${targetMonth}`).run();

  await deleteSession(env, chatId);

  await sendMessage(
    env,
    chatId,
    `✅ График на ${targetMonth.slice(5, 7)}.${targetMonth.slice(0, 4)} сохранён!\n\n` +
    shifts
      .sort((a, b) => a.shiftDate.localeCompare(b.shiftDate))
      .map(shift =>
        `${shift.shiftDate.slice(8, 10)}.${shift.shiftDate.slice(5, 7)} — ${shift.startTime}–${shift.endTime}`
      )
      .join("\n") +
    "\n\nНапоминания будут приходить только в рабочие дни."
  );
}

async function processSession(env, chatId, input, session) {
  if (session.type === "work_schedule") {
    await processWorkSchedule(env, chatId, input);
    return;
  }
  if (session.type === "add_pet") {
    await processPetForm(env, chatId, input, session);
    return;
  }

  if (session.type === "visit_duration") {
    await savePlannedDuration(env, chatId, session, input);
    return;
  }

  if (session.type === "visit_earnings") {
    if (input === "/skip") {
      await sendMessage(
        env,
        chatId,
        "Для завершения визита укажи хотя бы одну услугу с суммой или /cancel."
      );
      return;
    }

    await saveVisitEarnings(env, chatId, session, input);
    return;
  }

  if (session.type === "plus_earnings") {
    if (input === "/skip") {
      await sendMessage(env, chatId, "Укажи услугу с суммой или /cancel.");
      return;
    }

    await savePlusEarnings(env, chatId, input);
    return;
  }
  if (session.type === "visit_photo") {
    await sendMessage(
      env,
      chatId,
      "Жду фотографию. Отправь фото сообщением или /cancel для отмены."
    );
    return;
  }
  await deleteSession(env, chatId);
  await sendMessage(env, chatId, "Неизвестный шаг. Начни заново через меню.", mainKeyboard());
}

async function handleArrival(env, chatId, appointmentId) {
  const appointment = await getPetForAppointment(env, appointmentId);

  if (!appointment) {
    await sendMessage(env, chatId, "Запись не найдена.");
    return;
  }

  if (appointment.status === "in_progress") {
    await sendMessage(env, chatId, `${appointment.name
} уже в работе.`);
    return;
  }

  if (["completed", "cancelled", "skipped"].includes(appointment.status)) {
    await sendMessage(env, chatId, "Эту запись уже нельзя запустить.");
    return;
  }

  const result = await env.DB.prepare(`
    SELECT id, name, breed
    FROM dogs
    WHERE COALESCE(is_temporary, 0) = 0
    ORDER BY name COLLATE NOCASE
    LIMIT 50
  `).all();

  const pets = result.results || [];
  const keyboard = pets.map
(pet => [{
    text: `${pet.name
}${pet.breed ? " — " + pet.breed : ""}`,
    callback_data: `arrivalpet:${appointmentId}:${pet.id
}`
  }]);

  keyboard.push([{
    text: "➕ Нет карточки",
    callback_data: `arrivalnone:${appointmentId}`
  }]);

  await sendMessage(
    env,
    chatId,
    `🐾  Кто пришёл на запись ${appointment.appointment_time || ""}?\n\n` +
      `По очереди: ${appointment.name
}` +
      (appointment.breed ? ` (${appointment.breed})` : "") +
      "\n\nВыбери существующую карточку или нажми «Нет карточки».",
    { inline_keyboard: keyboard }
  );
}

async function handleArrivalWithPet(env, chatId, appointmentId, petId) {
  const appointment = await getPetForAppointment(env, appointmentId);

  if (!appointment) {
    await sendMessage(env, chatId, "Запись не найдена.");
    return;
  }

  const pet = await env.DB.prepare(`
    SELECT id, is_temporary
    FROM dogs
    WHERE id = ?
  `).bind(Number(petId)).first();

  if (!pet || Number(pet.is_temporary || 0) === 1) {
    await sendMessage(env, chatId, "Карточка не найдена. Выбери питомца ещё раз.");
    return;
  }

  if (!["scheduled", "waiting"].includes(appointment.status)) {
    await sendMessage(env, chatId, "Статус записи уже изменился. Проверь очередь.");
    return;
  }

  const previousPetId = Number(appointment.dog_id);

  await env.DB.prepare(`
    UPDATE appointments
    SET dog_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status IN ('scheduled', 'waiting')
  `).bind(Number(petId), Number(appointmentId)).run();

  if (previousPetId !== Number(petId)) {
    await env.DB.prepare(`
      DELETE FROM dogs
      WHERE id = ?
        AND is_temporary = 1
        AND NOT EXISTS (
          SELECT 1 FROM appointments WHERE dog_id = dogs.id
        )
    `).bind(previousPetId).run();
  }

  await startVisit(env, chatId, Number(petId), Number(appointmentId));
}
async function handleArrivalWithoutCard(env, chatId, appointmentId) {
  const appointment = await getPetForAppointment(env, appointmentId);

  if (!appointment) {
    await sendMessage(env, chatId, "Запись не найдена.");
    return;
  }

  if (!["scheduled", "waiting"].includes(appointment.status)) {
    await sendMessage(env, chatId, "Статус записи уже изменился. Проверь очередь.");
    return;
  }

  let pet = await env.DB.prepare(`
    SELECT id, name, species, breed, is_temporary
    FROM dogs
    WHERE id = ?
  `).bind(Number(appointment.dog_id)).first();

  if (!pet) {
    await sendMessage(env, chatId, "Карточка питомца не найдена. Проверь очередь.");
    return;
  }

  if (Number(pet.is_temporary || 0) !== 1) {
    const result = await env.DB.prepare(`
      INSERT INTO dogs (name, species, breed, is_temporary)
      VALUES (?, ?, ?, 1)
    `).bind(
      pet.name
,
      pet.species || "dog",
      pet.breed || null
    ).run();

    const temporaryPetId = Number(result.meta.last_row_id);

    await env.DB.prepare(`
      UPDATE appointments
      SET dog_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status IN ('scheduled', 'waiting')
    `).bind(temporaryPetId, Number(appointmentId)).run();

    pet = {
      id: temporaryPetId,
      name: pet.name
,
      species: pet.species || "dog",
      breed: pet.breed,
      is_temporary: 1
    };
  }

  await startVisit(env, chatId, Number(pet.id
), Number(appointmentId));
}
async function handleNotArrived(env, chatId, appointmentId) {
  const appointment = await getPetForAppointment(env, appointmentId);

  if (!appointment) {
    await sendMessage(env, chatId, "Запись не найдена.");
    return;
  }

  await env.DB.prepare(`
    UPDATE appointments SET status = 'scheduled', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status IN ('scheduled', 'waiting')
  `).bind(Number(appointmentId)).run();

  await env.DB.prepare(`
    INSERT INTO assistant_appointment_state (appointment_id, arrival_prompted)
    VALUES (?, 1)
    ON CONFLICT(appointment_id) DO UPDATE SET
      arrival_prompted = 1,
      updated_at = CURRENT_TIMESTAMP
  `).bind(Number(appointmentId)).run();

  await sendMessage(
    env,
    chatId,
    `Хорошо, отмечаю, что ${appointment.name} пока не пришёл.\n\nКогда он появится, нажми кнопку ниже или напиши «${appointment.name} пришёл».`,
    {
      inline_keyboard: [[
        { text: `🐾 ${appointment.name} пришёл`, callback_data: `arrived:${appointmentId}` }
      ]]
    }
  );
}

async function handlePlainArrival(env, chatId, input) {
  const match = input.match(/^(.+?)\s+(?:приш[её]л|пришла|на месте|прибыл[а]?)\s*$/i);

  if (!match) return false;

  const name = match[1].trim();
  const pet = await resolvePetByQueueName(env, name);

  if (!pet) {
    await sendMessage(env, chatId, `Не нашла карточку питомца «${name}».`);
    return true;
  }

  const appointment = await env.DB.prepare(`
    SELECT id, status FROM appointments
    WHERE dog_id = ?
      AND appointment_date = ?
      AND status IN ('scheduled', 'waiting')
    ORDER BY queue_position, appointment_time
    LIMIT 1
  `).bind(pet.id, localDate()).first();

  if (!appointment) {
    await sendMessage(env, chatId, `Для ${pet.name} нет ожидающей записи на сегодня.`);
    return true;
  }

  await handleArrival(env, chatId, appointment.id);
  return true;
}
async function confirmQueueCancellation(env, chatId, appointmentId) {
  const appointment = await getPetForAppointment(env, appointmentId);

  if (!appointment) {
    await sendMessage(env, chatId, "Запись не найдена.");
    return;
  }

  if (!["scheduled", "waiting"].includes(appointment.status)) {
    await sendMessage(
      env,
      chatId,
      "Эту запись нельзя отменить из очереди: её статус уже изменился."
    );
    return;
  }

  await sendMessage(
    env,
    chatId,
    `Отменить запись?\n\n${appointment.appointment_time || "—"} — ${appointment.name}`,
    {
      inline_keyboard: [
        [
          {
            text: "✅ Да, отменить",
            callback_data: `cancel_queue_confirm:${appointment.id}`
          },
          {
            text: "↩️ Нет",
            callback_data: "queue"
          }
        ]
      ]
    }
  );
}
async function handleCallback(env, callback) {
  const chatId = callback.message?.chat?.id;
  const data = callback.data || "";

  await answerCallback(env, callback.id);

  if (!chatId) return;

  if (data === "home") {
  return sendMessage(env, chatId, "Главное меню 🐾", mainKeyboard());
  }

  if (data === "workday") {
  return showWorkdayMenu(env, chatId);
  }

  if (data === "pets_menu") {
  return showPetsMenu(env, chatId);
  }
  if (data === "schedule_start") {
    return startScheduleInput(env, chatId);
  }
  if (data === "help") {
  return sendMessage(env, chatId, HELP_TEXT, mainKeyboard());
  }

  if (data === "pets") return listPets(env, chatId);
  if (data === "queue") return showDailyQueue(env, chatId);
  if (data.startsWith("cancel_queue_confirm:")) {
  const appointmentId = data.slice("cancel_queue_confirm:".length);

  const appointment = await getPetForAppointment(env, appointmentId);

  if (!appointment) {
    await sendMessage(env, chatId, "Запись не найдена.");
    return;
  }

  if (!["scheduled", "waiting"].includes(appointment.status)) {
    await sendMessage(
      env,
      chatId,
      "Запись уже изменилась. Обнови очередь."
    );
    return;
  }

  await env.DB.prepare(`
    UPDATE appointments
    SET status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND status IN ('scheduled', 'waiting')
  `).bind(Number(appointmentId)).run();

  await sendMessage(
    env,
    chatId,
    `❌ Запись ${appointment.name} отменена.`
  );

  return showDailyQueue(env, chatId);
}

if (data.startsWith("cancel_queue:")) {
  return confirmQueueCancellation(
    env,
    chatId,
    data.slice("cancel_queue:".length)
  );
}
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

  if (data.startsWith("arrived:")) {
    return handleArrival(env, chatId, data.slice(8));
  }
  if (data.startsWith("tempcreate:")) {
    const [, appointmentId, petId] = data.split(":");
    return handleTemporaryPetAction(
      env,
      chatId,
      "create",
      [appointmentId, petId]
    );
  }

  if (data.startsWith("tempskip:")) {
    return handleTemporaryPetAction(
      env,
      chatId,
      "skip",
      [data.slice("tempskip:".length)]
    );
  }

  if (data.startsWith("tempattach:")) {
    const [, appointmentId, existingPetId, temporaryPetId] = data.split(":");
    return handleTemporaryPetAction(
      env,
      chatId,
      "attach",
      [appointmentId, existingPetId, temporaryPetId]
    );
  }
  if (data.startsWith("arrivalpet:")) {
    const [, appointmentId, petId] = data.split(":");
    return handleArrivalWithPet(env, chatId, appointmentId, petId);
  }

  if (data.startsWith("arrivalnone:")) {
    return handleArrivalWithoutCard(
      env,
      chatId,
      data.slice("arrivalnone:".length)
    );
   }
  if (data.startsWith("absent:")) {
    return handleNotArrived(env, chatId, data.slice(7));
  }

  if (data.startsWith("duration:")) {
    return beginDurationInput(env, chatId, data.slice(9));
  }

  if (data.startsWith("finish:")) {
    return beginFinishVisit(env, chatId, data.slice(7));
  }

  if (data.startsWith("photo_before:")) {
    const id = Number(data.slice("photo_before:".length));
    return startPhotoCapture(env, chatId, id, "before");
  }

  if (data.startsWith("photo_after:")) {
    const id = Number(data.slice("photo_after:".length));
    return startPhotoCapture(env, chatId, id, "after");
  }

  if (data.startsWith("photos:")) {
    const id = Number(data.slice("photos:".length));
    return showPetPhotoHistory(env, chatId, id);
  }

  if (data.startsWith("duration_done:")) {
    return beginFinishVisit(env, chatId, data.slice("duration_done:".length));
  }

  if (data.startsWith("duration_working:")) {
    const id = Number(data.slice("duration_working:".length));

    await env.DB.prepare(`
      UPDATE assistant_appointment_state
      SET duration_reminded = 1, updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `).bind(id).run();

    return sendMessage(env, chatId, "Хорошо, продолжаем работу. Больше напоминать об этом времени не буду.");
  }
}

async function processScheduledReminders(env) {
  const chatId = await getReminderChat(env);

  if (!chatId) return;

  const date = localDate();
  const now = localTime();
  const shift = await env.DB.prepare(`
    SELECT shift_date, start_time, end_time, reminders_sent
    FROM assistant_work_shifts
    WHERE shift_date = ?
  `).bind(date).first();

  if (shift && now >= shift.start_time && now < shift.end_time) {
    const reminderTimes = [
      shift.start_time,
      "12:00",
      "14:00",
      "16:00",
      "18:00"
    ].filter((time, index, all) =>
      time < shift.end_time && all.indexOf(time) === index
    );

    let sent = [];

    try {
      sent = JSON.parse(shift.reminders_sent || "[]");
      if (!Array.isArray(sent)) sent = [];
    } catch {
      sent = [];
    }

    for (const reminderTime of reminderTimes) {
      if (now < reminderTime || sent.includes(reminderTime)) continue;

      sent.push(reminderTime);

      await env.DB.prepare(`
        UPDATE assistant_work_shifts
        SET reminders_sent = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE shift_date = ?
      `).bind(JSON.stringify(sent), date).run();

      await sendMessage(
        env,
        chatId,
        `🐾  Рабочий день — ${reminderTime}\n\n` +
        "Не забудь записывать выполненные услуги и суммы, " +
        "время работы, фотографии ДО и ПОСЛЕ, поведение питомца " +
        "и заметки для следующего визита."
      );
    }
  }
  const dayOfMonth = Number(date.slice(8, 10));

  if (dayOfMonth >= 20 && dayOfMonth <= 25) {
    const currentYear = Number(date.slice(0, 4));
    const currentMonth = Number(date.slice(5, 7));
    const nextDate = new Date(Date.UTC(currentYear, currentMonth, 1));
    const targetMonth =
      `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, "0")}`;

    const submitted = await env.DB.prepare(`
      SELECT setting_value
      FROM assistant_settings
      WHERE setting_key = ?
    `).bind(`schedule_submitted_${targetMonth}`).first();

    const alreadyPrompted = await env.DB.prepare(`
      SELECT setting_value
      FROM assistant_settings
      WHERE setting_key = ?
    `).bind(`schedule_prompt_${targetMonth}`).first();

    if (!submitted && !alreadyPrompted) {
      await env.DB.prepare(`
        INSERT INTO assistant_settings (
          setting_key, setting_value, updated_at
        ) VALUES (?, '1', CURRENT_TIMESTAMP)
      `).bind(`schedule_prompt_${targetMonth}`).run();

      await sendMessage(
        env,
        chatId,
        `📅  Пора составить график смен на ${targetMonth.slice(5, 7)}.${targetMonth.slice(0, 4)}.\n\n` +
        "Нажми кнопку и отправь рабочие даты.",
        {
          inline_keyboard: [[
            { text: "📅  Составить график", callback_data: "schedule_start" }
          ]]
        }
      );
    }
  }
  // Напоминание о приходе по записям текущего дня.
  const arrivals = await env.DB.prepare(`
    SELECT a.id, a.appointment_time, a.status, d.name, d.breed
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    LEFT JOIN assistant_appointment_state s ON s.appointment_id = a.id
    WHERE a.appointment_date = ?
      AND a.status = 'scheduled'
      AND a.appointment_time <= ?
      AND COALESCE(s.arrival_prompted, 0) = 0
    ORDER BY a.queue_position, a.appointment_time
    LIMIT 20
  `).bind(date, now).all();

  for (const appointment of arrivals.results || []) {
    const claimed = await env.DB.prepare(`
      UPDATE appointments
      SET status = 'waiting', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'scheduled'
    `).bind(appointment.id).run();

    await env.DB.prepare(`
      INSERT INTO assistant_appointment_state (appointment_id, arrival_prompted)
      VALUES (?, 1)
      ON CONFLICT(appointment_id) DO UPDATE SET
        arrival_prompted = 1,
        updated_at = CURRENT_TIMESTAMP
    `).bind(appointment.id).run();

    if (claimed.meta?.changes) {
      await sendMessage(
        env,
        chatId,
        `🐾 Время записи ${appointment.appointment_time}\n\nПришёл ли ${appointment.name}${appointment.breed ? ` (${appointment.breed})` : ""}?`,
        {
          inline_keyboard: [
            [
              { text: "✅ Да, пришёл", callback_data: `arrived:${appointment.id}` },
              { text: "⏳ Ещё нет", callback_data: `absent:${appointment.id}` }
            ]
          ]
        }
      );
    }
  }

  // Напоминание о завершении планового времени.
  const due = await env.DB.prepare(`
    SELECT a.id, a.status, d.name, s.planned_end_at
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    JOIN assistant_appointment_state s ON s.appointment_id = a.id
    WHERE a.status = 'in_progress'
      AND s.planned_end_at IS NOT NULL
      AND s.planned_end_at <= ?
      AND s.duration_reminded = 0
    LIMIT 20
  `).bind(localDateTime(date, now)).all();

  for (const visit of due.results || []) {
    const updated = await env.DB.prepare(`
      UPDATE assistant_appointment_state
      SET duration_reminded = 1, updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ? AND duration_reminded = 0
    `).bind(visit.id).run();

    if (updated.meta?.changes) {
      await sendMessage(
        env,
        chatId,
        `⏰ Плановое время для ${visit.name} закончилось.\n\nТы уже закончила?`,
        {
          inline_keyboard: [[
            { text: "✅ Да, завершить визит", callback_data: `duration_done:${visit.id}` },
            { text: "✂️ Ещё работаю", callback_data: `duration_working:${visit.id}` }
          ]]
        }
      );
    }
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
        await rememberChat(env, update.callback_query.message?.chat?.id);
        await handleCallback(env, update.callback_query);
        return new Response("OK");
      }

      const message = update.message;

      if (!message?.chat) return new Response("OK");

      const chatId = message.chat.id;
      await rememberChat(env, chatId);

      const text = typeof message.text === "string" ? message.text.trim() : "";
      if (message.photo?.length)  {
        const photoSession = await getSession(env, chatId);

        if (photoSession?.type === "visit_photo") {
          await saveVisitPhoto(env, chatId, photoSession, message);
          return new Response("OK");
        }
      }
      if (!text) {
        return new Response("OK");
      }

      const command = text.split(/\s+/)[0].split("@")[0];
      const argument = text.split(/\s+/).slice(1).join(" ").trim();

      if (command === "/start") {
        await sendMessage(env, chatId, START_TEXT, mainKeyboard());
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
          "Текущий ввод отменён. Уже начатые визиты остаются в работе.",
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
        if (argument) {
          await showPet(env, chatId, argument);
        } else {
          await sendMessage(env, chatId, "Напиши /pet 1 или /pet Янтарь.");
        }
        return new Response("OK");
      }

      if (command === "/find") {
        await findPets(env, chatId, argument);
        return new Response("OK");
      }

      if (command === "/queue") {
        await showDailyQueue(env, chatId);
        return new Response("OK");
      }

      if (command === "/queueclear") {
        await clearDailyQueue(env, chatId);
        return new Response("OK");
      }

      if (command === "/visits") {
        await listVisits(env, chatId);
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
          ORDER BY id LIMIT 2
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
              inline_keyboard: pets.map(pet => [{
                text: `📋 Открыть карточку: ${pet.name} · №${pet.id}`,
                callback_data: `visit:${pet.id}`
              }])
            }
          );
        } else {
          await sendMessage(env, chatId, `Не нашла питомца «${argument}».`);
        }

        return new Response("OK");
      }

      if (command === "/finish") {
        if (!/^\d+$/.test(argument)) {
          await sendMessage(env, chatId, "Укажи номер визита. Например: /finish 12\nСписок: /visits");
        } else {
          await beginFinishVisit(env, chatId, Number(argument));
        }
        return new Response("OK");
      }

      if (command === "/duration") {
        const match = argument.match(/^(\d+)\s+(.+)$/);

        if (!match) {
          await sendMessage(env, chatId, "Формат: /duration ID 150\nВремя указывается в минутах.");
        } else {
          await savePlannedDuration(
            env,
            chatId,
            { type: "visit_duration", appointmentId: Number(match[1]), petName: `визита №${match[1]}` },
            match[2]
          );
        }

        return new Response("OK");
      }

      if (command === "/time") {
        await setManualDuration(env, chatId, argument);
        return new Response("OK");
      }
      if (command === "/grafik") {
        await startScheduleInput(env, chatId);
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

      // Активный ввод имеет приоритет над распознаванием очереди.
      if (session) {
        await processSession(env, chatId, text, session);
        return new Response("OK");
      }

      if (await handlePlainArrival(env, chatId, text)) {
        return new Response("OK");
      }

      // Расписание распознаётся по наличию времени в сообщении.
      if (/\b\d{1,2}:[0-5]\d\b/.test(text)) {
        await createDailyQueue(env, chatId, text);
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
  },

  async scheduled(controller, env, ctx) {
    try {
      await initializeDatabase(env);
      ctx.waitUntil(processScheduledReminders(env));
    } catch (error) {
      console.error("Scheduled reminder error:", error);
    }
  }
};
