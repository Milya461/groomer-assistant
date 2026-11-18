import { WEB_APP_HTML } from "./web-app.js";
import { getBreedVariantOptions, getServiceOptions, resolveServiceSelection } from "./service-catalog.js";

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
  "«сегодня не работаю» — отметить выходной и отключить автоматические напоминания на сегодня.",
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






async function migrateLegacyPetComments(env) {
  const settingKey = "pet_card_comment_migration_v2";
  const current = await env.DB.prepare(
    "SELECT setting_value, updated_at FROM assistant_settings WHERE setting_key = ?"
  ).bind(settingKey).first();

  if (current) {
    let status = null;
    try { status = JSON.parse(current.setting_value); } catch {}
    if (status?.status === "completed") return status;
    if (status?.status === "running") {
      const updatedAt = Date.parse(String(current.updated_at || "").replace(" ", "T") + "Z");
      const age = Date.now() - updatedAt;
      if (Number.isFinite(age) && age < 10 * 60 * 1000) return status;
    }
  }

  const token = crypto.randomUUID();
  const runningValue = JSON.stringify({ status: "running", token });
  if (!current) {
    const claim = await env.DB.prepare(`
      INSERT OR IGNORE INTO assistant_settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(settingKey, runningValue).run();
    if (!claim.meta?.changes) return null;
  } else {
    const claim = await env.DB.prepare(`
      UPDATE assistant_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ? AND setting_value = ?
    `).bind(runningValue, settingKey, current.setting_value).run();
    if (!claim.meta?.changes) return null;
  }

  try {
    const rows = await env.DB.prepare(`
      SELECT d.id, d.comment, d.coat_features, d.matting_tendency, d.sensitive_areas,
             d.clipper_reaction, d.dryer_reaction, d.nail_clipper_reaction,
             d.warnings, d.notes,
             gc.face_length, gc.tail_length, gc.head_shape, gc.paws_shape,
             gc.attachments, gc.blades, gc.owner_preferences, gc.next_visit_changes
      FROM dogs d
      LEFT JOIN grooming_cards gc ON gc.dog_id = d.id
    `).all();

    const fields = [
      ["coat_features", "Особенности шерсти"],
      ["matting_tendency", "Склонность к колтунам"],
      ["sensitive_areas", "Чувствительные зоны"],
      ["clipper_reaction", "Реакция на машинку"],
      ["dryer_reaction", "Реакция на фен"],
      ["nail_clipper_reaction", "Реакция на когтерез"],
      ["warnings", "Предупреждения"],
      ["notes", "Заметки"],
      ["face_length", "Старая длина морды"],
      ["tail_length", "Старая длина хвоста"],
      ["head_shape", "Старая форма головы"],
      ["paws_shape", "Старая форма лап"],
      ["attachments", "Старые насадки"],
      ["blades", "Старые ножи"],
      ["owner_preferences", "Старые пожелания владельца"],
      ["next_visit_changes", "Старые изменения к следующему визиту"]
    ];

    let migratedPets = 0;
    let migratedValues = 0;
    for (const row of rows.results || []) {
      const existingComment = String(row.comment || "").trim();
      const additions = [];
      for (const [field, label] of fields) {
        const value = String(row[field] || "").trim();
        if (!value) continue;
        const entry = label + " — " + value;
        if (!existingComment.includes(entry) && !additions.includes(entry)) {
          additions.push(entry);
        }
      }

      if (!additions.length) continue;
      const comment = [existingComment, ...additions].filter(Boolean).join("\n");
      await env.DB.prepare("UPDATE dogs SET comment = ? WHERE id = ?")
        .bind(comment, Number(row.id)).run();
      migratedPets++;
      migratedValues += additions.length;
    }

    const completedValue = JSON.stringify({
      status: "completed",
      migratedPets,
      migratedValues
    });
    await env.DB.prepare(`
      UPDATE assistant_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ? AND setting_value = ?
    `).bind(completedValue, settingKey, runningValue).run();
    return JSON.parse(completedValue);
  } catch (error) {
    await env.DB.prepare(`
      DELETE FROM assistant_settings
      WHERE setting_key = ? AND setting_value = ?
    `).bind(settingKey, runningValue).run();
    throw error;
  }
}

async function seedWorkScheduleDec2026Jan2027(env) {
  const settingKey = "work_schedule_dec2026_jan2027_v1";
  const existing = await env.DB.prepare(
    "SELECT setting_value FROM assistant_settings WHERE setting_key = ?"
  ).bind(settingKey).first();
  if (existing?.setting_value === "done") return;

  const workDays = [
    "2026-12-03", "2026-12-04", "2026-12-07", "2026-12-08",
    "2026-12-11", "2026-12-12", "2026-12-15", "2026-12-16",
    "2026-12-19", "2026-12-20", "2026-12-23", "2026-12-24",
    "2026-12-27", "2026-12-28", "2026-12-30",
    "2027-01-05", "2027-01-08", "2027-01-09", "2027-01-12",
    "2027-01-13", "2027-01-16", "2027-01-17", "2027-01-20",
    "2027-01-21", "2027-01-24", "2027-01-25", "2027-01-28",
    "2027-01-29"
  ];

  const statements = [
    env.DB.prepare(
      "DELETE FROM assistant_work_shifts WHERE shift_date >= ? AND shift_date <= ?"
    ).bind("2026-12-01", "2027-01-31")
  ];

  for (const shiftDate of workDays) {
    statements.push(env.DB.prepare(`
      INSERT INTO assistant_work_shifts (
        shift_date, start_time, end_time, reminders_sent, updated_at
      ) VALUES (?, '10:00', '20:00', '[]', CURRENT_TIMESTAMP)
      ON CONFLICT(shift_date) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        reminders_sent = '[]',
        updated_at = CURRENT_TIMESTAMP
    `).bind(shiftDate));
  }

  statements.push(env.DB.prepare(`
    INSERT INTO assistant_settings (setting_key, setting_value, updated_at)
    VALUES (?, 'done', CURRENT_TIMESTAMP)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value = 'done',
      updated_at = CURRENT_TIMESTAMP
  `).bind(settingKey));

  await env.DB.batch(statements);
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
  CREATE TABLE IF NOT EXISTS grooming_cards (
    dog_id INTEGER PRIMARY KEY,
    body_length TEXT,
    legs_length TEXT,
    face_length TEXT,
    tail_length TEXT,
    head_shape TEXT,
    paws_shape TEXT,
    attachments TEXT,
    blades TEXT,
    owner_preferences TEXT,
    next_visit_changes TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dog_id)
      REFERENCES dogs(id) ON DELETE CASCADE
  )
`).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grooming_card_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dog_id INTEGER NOT NULL,
      telegram_file_id TEXT NOT NULL,
      caption TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dog_id)
        REFERENCES dogs(id) ON DELETE CASCADE
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pet_cover_photos (
      dog_id INTEGER PRIMARY KEY,
      telegram_file_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dog_id)
        REFERENCES dogs(id) ON DELETE CASCADE
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
    CREATE TABLE IF NOT EXISTS service_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      services_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
  try {
    await env.DB.prepare("ALTER TABLE dogs ADD COLUMN breed_variant TEXT").run();
  } catch (error) {
    if (!String(error?.message || error).includes("duplicate column name")) throw error;
  }
  try {
    await env.DB.prepare("ALTER TABLE dogs ADD COLUMN comment TEXT").run();
  } catch (error) {
    if (!String(error?.message || error).includes("duplicate column name")) throw error;
  }

  await env.DB.batch([
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_dogs_name_nocase ON dogs(name COLLATE NOCASE, id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_appointments_date_queue ON appointments(appointment_date, queue_position, appointment_time, id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_appointments_calendar_date_time ON appointments(appointment_date, appointment_time, queue_position, id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_appointments_history ON appointments(appointment_date DESC, id DESC)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_appointments_dog_history ON appointments(dog_id, appointment_date DESC, id DESC)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_earnings_entries_service_date ON earnings_entries(service_date, id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_earnings_entries_appointment ON earnings_entries(appointment_id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_visit_photos_appointment ON visit_photos(appointment_id, photo_type, created_at DESC, id DESC)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_grooming_card_photos_dog ON grooming_card_photos(dog_id, id)")
  ]);

  await migrateLegacyPetComments(env);
  await seedWorkScheduleDec2026Jan2027(env);
}

const HISTORICAL_EARNINGS_2026 = [
  ["2026-01-05", 3115],
  ["2026-01-08", 2820],
  ["2026-01-09", 4535],
  ["2026-01-12", 3990],
  ["2026-01-17", 4850],
  ["2026-01-18", 4187.5],
  ["2026-01-20", 4605],
  ["2026-01-24", 3447.5],
  ["2026-01-25", 5182.5],
  ["2026-01-29", 4130],
  ["2026-01-30", 1052.5],
  ["2026-02-01", 5550],
  ["2026-02-02", 1015],
  ["2026-02-05", 3237.5],
  ["2026-02-06", 4605],
  ["2026-02-07", 5917.5],
  ["2026-02-09", 6315],
  ["2026-02-12", 4462.5],
  ["2026-02-13", 1315],
  ["2026-02-17", 3255],
  ["2026-02-18", 2207.5],
  ["2026-02-21", 5705],
  ["2026-02-22", 4870],
  ["2026-02-25", 3980],
  ["2026-02-26", 4500],
  ["2026-03-02", 3342.5],
  ["2026-03-03", 910],
  ["2026-03-04", 2522.5],
  ["2026-03-09", 2100],
  ["2026-03-10", 3867.5],
  ["2026-03-12", 2695],
  ["2026-03-13", 1400],
  ["2026-03-23", 5182.5],
  ["2026-03-24", 4340],
  ["2026-03-27", 3905],
  ["2026-03-28", 4410],
  ["2026-03-31", 3992.5],
  ["2026-04-01", 4025],
  ["2026-04-04", 5215],
  ["2026-04-05", 4360],
  ["2026-04-08", 5082.5],
  ["2026-04-09", 2555],
  ["2026-04-12", 5987.5],
  ["2026-04-16", 3535],
  ["2026-04-17", 3607.5],
  ["2026-04-20", 3972.5],
  ["2026-04-21", 910],
  ["2026-04-24", 3167.5],
  ["2026-04-25", 4374],
  ["2026-04-28", 2030],
  ["2026-04-29", 4342.5],
  ["2026-05-01", 3800],
  ["2026-05-05", 4515],
  ["2026-05-06", 3780],
  ["2026-05-09", 3150],
  ["2026-05-10", 4060],
  ["2026-05-13", 600],
  ["2026-05-14", 3440],
  ["2026-05-15", 3222.5],
  ["2026-05-17", 5775],
  ["2026-05-18", 3447.5],
  ["2026-05-21", 4410],
  ["2026-05-22", 3937.5],
  ["2026-05-23", 630],
  ["2026-05-25", 3536],
  ["2026-05-29", 4167.5],
  ["2026-05-30", 5657.5],
  ["2026-05-31", 4375],
  ["2026-06-02", 4760],
  ["2026-06-03", 4590],
  ["2026-06-05", 5182.5],
  ["2026-06-09", 5542.5],
  ["2026-06-10", 4290],
  ["2026-06-17", 2275],
  ["2026-06-18", 2837.5],
  ["2026-06-21", 3135],
  ["2026-06-22", 6127.5],
  ["2026-06-25", 6157.5],
  ["2026-06-26", 3640],
  ["2026-06-27", 1750],
  ["2026-06-30", 5317.5],
  ["2026-07-01", 4920],
  ["2026-07-04", 4095],
  ["2026-07-05", 2415],
  ["2026-07-08", 2905],
  ["2026-07-09", 4622.5],
  ["2026-07-13", 4132.5],
  ["2026-07-16", 4777.5],
  ["2026-07-17", 3710],
  ["2026-07-20", 3972.5],
  ["2026-07-21", 4252.5],
  ["2026-07-24", 2747.5],
  ["2026-07-25", 3001.25],
  ["2026-07-29", 3640],
  ["2026-07-30", 4760],
  ["2026-07-31", 2135],
  ["2026-08-03", 4322.5],
  ["2026-08-04", 4287.5],
  ["2026-08-06", 3710],
  ["2026-08-07", 1295],
  ["2026-08-10", 2992.5],
  ["2026-08-11", 3517.5],
  ["2026-08-14", 980],
  ["2026-08-15", 4777.5],
  ["2026-08-19", 3697.5],
  ["2026-08-20", 2642.5],
  ["2026-08-21", 2520],
  ["2026-08-25", 3605],
  ["2026-08-26", 840],
  ["2026-08-27", 4270],
  ["2026-08-30", 4095],
  ["2026-08-31", 2397.5],
  ["2026-09-02", 1557.5],
  ["2026-09-04", 2170],
  ["2026-09-15", 3710],
  ["2026-09-16", 3412.5],
  ["2026-09-19", 4410],
  ["2026-09-20", 3242.75],
  ["2026-09-23", 3585],
  ["2026-09-24", 2065],
  ["2026-09-28", 2170],
  ["2026-09-30", 4882.5]
];

const HISTORICAL_EARNINGS_ADJUSTMENTS_2026 = [
  { date: "2026-02-21", description: "Архив: чаевые", amount: 1500, key: "tip-feb-21" },
  { date: "2026-03-28", description: "Архив: вычет за ножницы (период до 28.03)", amount: -486, key: "scissors-mar" },
  { date: "2026-04-05", description: "Архив: вычет за ножницы (период до 05.04)", amount: -400, key: "scissors-apr" },
  { date: "2026-04-25", description: "Архив: чаевые за неделю 20–25.04 (дата получения не указана)", amount: 500, key: "tip-apr-week" },
  { date: "2026-05-17", description: "Архив: вычет за ножницы (период до 17.05)", amount: -900, key: "scissors-may" },
  { date: "2026-06-05", description: "Архив: чаевые за неделю 02–05.06 (дата получения не указана)", amount: 150, key: "tip-jun-week" },
  { date: "2026-07-17", description: "Архив: вычет за ножницы (период до 17.07)", amount: -450, key: "scissors-jul" }
];

async function importHistoricalEarnings2026(env) {
  const settingKey = "historical_earnings_import_2026_v1";
  const current = await env.DB.prepare(
    "SELECT setting_value, updated_at FROM assistant_settings WHERE setting_key = ?"
  ).bind(settingKey).first();

  if (current) {
    let status = null;
    try { status = JSON.parse(current.setting_value); } catch {}
    if (status?.status === "completed" || status?.status === "completed_with_conflicts") return status;
    if (status?.status === "running") {
      const age = Date.now() - Date.parse(current.updated_at || "");
      if (Number.isFinite(age) && age < 10 * 60 * 1000) return status;
    }
  }

  const token = crypto.randomUUID();
  const runningValue = JSON.stringify({ status: "running", token });
  if (!current) {
    const claim = await env.DB.prepare(`
      INSERT OR IGNORE INTO assistant_settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(settingKey, runningValue).run();
    if (!claim.meta?.changes) return null;
  } else {
    const claim = await env.DB.prepare(`
      UPDATE assistant_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ? AND setting_value = ?
    `).bind(runningValue, settingKey, current.setting_value).run();
    if (!claim.meta?.changes) return null;
  }

  try {
    const rowsByDate = new Map();
    for (const [date, amount] of HISTORICAL_EARNINGS_2026) {
      if (!rowsByDate.has(date)) rowsByDate.set(date, []);
      rowsByDate.get(date).push({
        description: "Архив: заработок за день",
        amount,
        key: date + ":day"
      });
    }
    for (const item of HISTORICAL_EARNINGS_ADJUSTMENTS_2026) {
      if (!rowsByDate.has(item.date)) rowsByDate.set(item.date, []);
      rowsByDate.get(item.date).push({
        description: item.description,
        amount: item.amount,
        key: item.date + ":" + item.key
      });
    }

    let importedDays = 0;
    let insertedRows = 0;
    let matchedExistingDays = 0;
    let importedEarnedCents = 0;
    const conflicts = [];

    for (const [serviceDate, dayRows] of rowsByDate.entries()) {
      const expectedCents = dayRows.reduce(
        (sum, item) => sum + Math.round(Number(item.amount) * 100), 0
      );
      const existing = await env.DB.prepare(`
        SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS total
        FROM earnings_entries
        WHERE service_date = ?
      `).bind(serviceDate).first();
      const existingCount = Number(existing?.count || 0);
      const existingCents = Math.round(Number(existing?.total || 0) * 100);

      if (existingCount > 0) {
        if (existingCents === expectedCents) {
          matchedExistingDays += 1;
        } else {
          conflicts.push({
            date: serviceDate,
            existing: existingCents / 100,
            expected: expectedCents / 100
          });
        }
        continue;
      }

      const statements = dayRows.map(item => env.DB.prepare(`
        INSERT OR IGNORE INTO earnings_entries (
          service_date, description, amount, rate, earned, appointment_id, source, source_id
        ) VALUES (?, ?, ?, 100, ?, NULL, 'archive_2026', ?)
      `).bind(serviceDate, item.description, item.amount, item.amount, item.key));

      await env.DB.batch(statements);
      const verify = await env.DB.prepare(`
        SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS total
        FROM earnings_entries
        WHERE service_date = ?
      `).bind(serviceDate).first();
      const verifiedCents = Math.round(Number(verify?.total || 0) * 100);

      if (verifiedCents === expectedCents && Number(verify?.count || 0) >= dayRows.length) {
        importedDays += 1;
        insertedRows += dayRows.length;
        importedEarnedCents += expectedCents;
      } else {
        conflicts.push({
          date: serviceDate,
          existing: verifiedCents / 100,
          expected: expectedCents / 100
        });
      }
    }

    const result = {
      status: conflicts.length ? "completed_with_conflicts" : "completed",
      importedDays,
      insertedRows,
      matchedExistingDays,
      importedEarned: importedEarnedCents / 100,
      conflicts
    };
    await env.DB.prepare(`
      UPDATE assistant_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ?
    `).bind(JSON.stringify(result), settingKey).run();
    return result;
  } catch (error) {
    const result = { status: "failed", message: String(error?.message || error).slice(0, 300) };
    await env.DB.prepare(`
      UPDATE assistant_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ?
    `).bind(JSON.stringify(result), settingKey).run();
    throw error;
  }
}

// Database migrations are versioned in D1: after the first successful migration,
// later cold isolates perform only a small version check instead of repeating
// every CREATE/ALTER statement and the legacy-data migration.
// Bump this value whenever initializeDatabase receives a new schema migration.
const WEB_API_SCHEMA_VERSION = "2026-11-19-v1";
let webApiDatabaseInitializationPromise = null;
let webApiHistoricalImportPromise = null;

async function ensureWebApiDatabaseReady(env) {
  if (!webApiDatabaseInitializationPromise) {
    webApiDatabaseInitializationPromise = (async () => {
      const settingKey = "pretty_dogs_web_schema_version";
      let currentVersion = null;

      try {
        const row = await env.DB.prepare(
          "SELECT setting_value FROM assistant_settings WHERE setting_key = ?"
        ).bind(settingKey).first();
        currentVersion = row?.setting_value || null;
      } catch (error) {
        // A database being initialized for the first time does not have this table yet.
        if (!String(error?.message || error).toLowerCase().includes("no such table")) {
          throw error;
        }
      }

      if (currentVersion !== WEB_API_SCHEMA_VERSION) {
        await initializeDatabase(env);
        await env.DB.prepare(`
          INSERT INTO assistant_settings (setting_key, setting_value, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(setting_key) DO UPDATE SET
            setting_value = excluded.setting_value,
            updated_at = CURRENT_TIMESTAMP
        `).bind(settingKey, WEB_API_SCHEMA_VERSION).run();
      }
    })().catch(error => {
      webApiDatabaseInitializationPromise = null;
      throw error;
    });
  }

  await webApiDatabaseInitializationPromise;

  if (!webApiHistoricalImportPromise) {
    webApiHistoricalImportPromise = importHistoricalEarnings2026(env).then(result => {
      if (!["completed", "completed_with_conflicts"].includes(result?.status)) {
        webApiHistoricalImportPromise = null;
      }
      return result;
    }).catch(error => {
      webApiHistoricalImportPromise = null;
      throw error;
    });
  }

  await webApiHistoricalImportPromise;
}

async function getGroomingCard(env, dogId) {
  return env.DB.prepare(`
    SELECT dog_id, body_length, legs_length, updated_at
    FROM grooming_cards
    WHERE dog_id = ?
  `).bind(dogId).first();
}

async function saveGroomingCard(env, dogId, data) {
  await env.DB.prepare(`
    INSERT INTO grooming_cards (
      dog_id, body_length, legs_length, updated_at
    )
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(dog_id) DO UPDATE SET
      body_length = excluded.body_length,
      legs_length = excluded.legs_length,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    dogId,
    data.body_length || null,
    data.legs_length || null
  ).run();
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


function localDateTimeMs(date, time) {
  // Moscow is UTC+3. Treat both endpoints consistently for duration calculation.
  return Date.parse(`${date}T${time}:00+03:00`);
}


function shouldShowWebGroomingCard(pet) {
  if (String(pet?.species || "").toLowerCase().trim() !== "dog") return false;
  const breed = String(pet.breed || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zа-я0-9]/g, "");
  const excludedBreeds = [
    "йорк", "york", "мопс", "pug", "чихуахуа", "chihuahua",
    "бульдог", "bulldog", "кхс", "китайскаяхохлатая", "chinesecrested",
    "джекрассел", "jackrussell", "кавалер", "cavalier",
    "такса", "dachshund", "тойтерьер", "русскийтой", "toyterrier",
    "фокстерьер", "foxterrier", "басенджи", "basenji",
    "баварскаягончая", "bavarianmountainhound", "bayerischgebirgsschweisshund",
    "американскийкокер", "americancockerspaniel", "americancock",
    "спаниель", "spaniel", "птибрабансон", "petitbrabancon", "brabancon"
  ];
  return !excludedBreeds.some(name => breed.includes(name));
}




function petEditPrompt(session) {
  const step = STEPS[session.step];

  if (!step) return "";

  const currentValue = step.key === "species"
    ? displaySpecies(session.data.species, session.data.name
)
    : session.data
[step.key];

  return [
    `✏️  Редактирование карточки «${session.data.name
}»`,
    "",
    `Поле ${session.step + 1} из ${STEPS.length}:`,
    step.prompt,
    "",
    `Текущее значение: ${currentValue || "не указано"}`,
    "",
    "Отправь новое значение.",
    "/skip — оставить текущее значение.",
    "/cancel — отменить редактирование."
  ].join("\n");
}


async function processPetEdit(env, chatId, input, session) {
  const step = STEPS[session.step];

  if (!step) {
    await deleteSession(env, chatId);
    await sendMessage(
      env,
      chatId,
      "Шаг редактирования не найден. Открой карточку и начни заново."
    );
    return;
  }

  const value = input.trim();

  if (value !== "/skip") {
    if (!value && !step.optional) {
      await sendMessage(
        env,
        chatId,
        "Это обязательное поле. Введи значение или отправь /skip, чтобы оставить прежнее."
      );
      return;
    }

    if (step.key === "name" && value.length > 100) {
      await sendMessage(
        env,
        chatId,
        "Имя слишком длинное. Используй не более 100 символов."
      );
      return;
    }

    if (step.key === "species") {
      const species = parseSpecies(value);

      if (!species) {
        await sendMessage(
          env,
          chatId,
          "Укажи «собака» или «кошка». Для сохранения текущего вида отправь /skip."
        );
        return;
      }

      session.data.species = species;
    } else {
      session.data
[step.key] = value;
    }
  }

  session.step += 1;

  if (session.step < STEPS.length) {
    await saveSession(env, chatId, session);
    await sendMessage(env, chatId, petEditPrompt(session));
    return;
  }

  const d = session.data
;

  try {
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
          notes = ?
      WHERE id = ?
        AND COALESCE(is_temporary, 0) = 0
    `).bind(
      d.name
,
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
      Number(session.dogId)
    ).run();

    if (!result.meta?.changes) {
      await deleteSession(env, chatId);
      await sendMessage(
        env,
        chatId,
        "Карточка не найдена или не обновлена. Проверь список питомцев."
      );
      return;
    }

    await deleteSession(env, chatId);

    await sendMessage(
      env,
      chatId,
      `✅ Карточка питомца «${d.name
}» обновлена.`
    );

    await showPet(env, chatId, session.dogId);
  } catch (error) {
    console.error("Could not update pet card:", error);

    await sendMessage(
      env,
      chatId,
      "Не удалось сохранить карточку. Изменения не подтверждены. Повтори отправку последнего поля или используй /cancel."
    );
  }
}


const GROOMING_CARD_FIELDS = [
  {
    key: "body_length",
    label: "Длина корпуса",
    prompt: "Укажи длину шерсти на корпусе."
  },
  {
    key: "legs_length",
    label: "Длина лап",
    prompt: "Укажи длину шерсти на лапах."
  },
  {
    key: "face_length",
    label: "Длина морды",
    prompt: "Укажи длину шерсти на морде."
  },
  {
    key: "tail_length",
    label: "Длина хвоста",
    prompt: "Укажи длину шерсти на хвосте."
  },
  {
    key: "head_shape",
    label: "Форма головы",
    prompt: "Опиши желаемую форму головы."
  },
  {
    key: "paws_shape",
    label: "Форма лап",
    prompt: "Опиши желаемую форму лап."
  },
  {
    key: "attachments",
    label: "Насадки",
    prompt: "Укажи используемые насадки."
  },
  {
    key: "blades",
    label: "Ножи",
    prompt: "Укажи используемые ножи."
  },
  {
    key: "owner_preferences",
    label: "Пожелания владельца",
    prompt: "Запиши постоянные пожелания владельца."
  },
  {
    key: "next_visit_changes",
    label: "Изменения к следующему визиту",
    prompt: "Что нужно изменить в следующий раз?"
  }
];














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



async function startPhotoCapture(env, chatId, appointmentId, photoType) {
  if (photoType !== "after") {
    await sendMessage(env, chatId, "Фото ДО больше не используется. Можно сохранить только фото ПОСЛЕ визита.");
    return;
  }

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
      ORDER BY id
      LIMIT 1
    `).bind(String(id)).first();
  }

  if (!pet) {
    await sendMessage(env, chatId, `Питомец «${id}» не найден.`);
    return;
  }

  const keyboard = [
    [{
      text: "✏️  Изменить карточку",
      callback_data: `pet_edit:${pet.id
}`
    }],
    [{
      text: "▶️  Начать визит",
      callback_data: `visit:${pet.id
}`
    }],
    [{
      text: "⏱ Время по датам",
      callback_data: `pet_time:${pet.id
}`
    }]
  ];

  if (pet.species === "dog") {
    keyboard.push([{
      text: "✂️  Карта стрижки",
      callback_data: `grooming_card:${pet.id
}`
    }]);
  }

  if (shouldHavePhotoArchive(pet)) {
    keyboard.push([{
      text: "🖼 История фотографий",
      callback_data: `photos:${pet.id
}`
    }]);
  }

  await sendMessage(
    env,
    chatId,
    formatPet(pet),
    { inline_keyboard: keyboard }
  );
}
async function showPetTimeHistory(env, chatId, dogId) {
  const pet = await env.DB.prepare(`
    SELECT id, name, breed
    FROM dogs
    WHERE id = ?
      AND COALESCE(is_temporary, 0) = 0
  `).bind(Number(dogId)).first();

  if (!pet) {
    await sendMessage(env, chatId, "Карточка питомца не найдена.");
    return;
  }

  const result = await env.DB.prepare(`
    SELECT
      appointment_date,
      COUNT(*) AS visits_count,
      COUNT(actual_duration_minutes) AS timed_visits_count,
      SUM(actual_duration_minutes) AS total_minutes
    FROM appointments
    WHERE dog_id = ?
      AND status = 'completed'
    GROUP BY appointment_date
    ORDER BY appointment_date DESC
    LIMIT 30
  `).bind(Number(dogId)).all();

  const dates = result.results || [];

  if (!dates.length) {
    await sendMessage(
      env,
      chatId,
      `⏱ История времени: ${pet.name
}\n\nЗавершённых визитов пока нет.`,
      {
        inline_keyboard: [[
          {
            text: "⬅️  Карточка питомца",
            callback_data: `pet:${pet.id
}`
          }
        ]]
      }
    );
    return;
  }

  const lines = dates.map
(row => {
    const date = row.appointment_date || "";
    const formattedDate = date.length >= 10
      ? `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}`
      : date;

    let duration = "время не сохранено";

    if (row.timed_visits_count > 0) {
      duration = formatDuration(row.total_minutes);

      if (row.timed_visits_count < row.visits_count) {
        duration += "\\n⚠️  Не у всех визитов за эту дату сохранено время";
      }
    }

    return `${formattedDate} — ${duration}`;
  });

  await sendMessage(
    env,
    chatId,
    `⏱ Время по датам: ${pet.name
}` +
      `${pet.breed ? ` (${pet.breed})` : ""}\n\n` +
      lines.join("\n\n") +
      "\n\nПоказаны последние 30 дат с завершёнными визитами.",
    {
      inline_keyboard: [[
        {
          text: "⬅️  Карточка питомца",
          callback_data: `pet:${pet.id
}`
        }
      ]]
    }
  );
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


function rateForUnscheduled(description) {
  const name = description.toLowerCase().replace(/ё/g, "е");

  if (/когт|коготк/.test(name)) return 100;
  if (/параанальн/.test(name)) return 100;
  if (/чаев/.test(name)) return 100;

  return 35;
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
  if (data.startsWith("reschedule_queue:")) {
  return startAppointmentReschedule(
    env,
    chatId,
    data.slice("reschedule_queue:".length)
  );
}
  if (data === "visits") return listVisits(env, chatId);
  if (data === "visit_history") {
  return listVisitHistory(env, chatId);
}
  if (data === "plus") return beginPlus(env, chatId);
  if (data === "earnings") return showEarningsMenu(env, chatId);
  if (data === "add") return startAdding(env, chatId);
  if (data === "visit_choose") return choosePetForVisit(env, chatId);
  if (data === "visit_none") {
    return startVisitWithoutCard(env, chatId);
  }
  if (data === "today") return earningsToday(env, chatId);
  if (data === "period") return earningsPeriod(env, chatId);
  if (data === "month") return earningsMonth(env, chatId);

  if (data.startsWith("pet:")) {
    return showPet(env, chatId, data.slice(4));
  }
  if (data.startsWith("pet_time:")) {
  return showPetTimeHistory(
    env,
    chatId,
    data.slice("pet_time:".length)
  );
}
  if (data.startsWith("pet_edit:")) {
    return startPetEdit(
      env,
      chatId,
      data.slice("pet_edit:".length)
    );
  }
  if (data.startsWith("grooming_card_photo_add:")) {
    return startGroomingCardPhotoCapture(
      env,
      chatId,
      data.slice("grooming_card_photo_add:".length)
    );
  }

  if (data.startsWith("grooming_card_photos:")) {
    return showGroomingCardPhotos(
      env,
      chatId,
      data.slice("grooming_card_photos:".length)
    );
  }

  if (data.startsWith("grooming_card:")) {
    return showGroomingCard(
      env,
      chatId,
      data.slice("grooming_card:".length)
    );
  }

  if (data.startsWith("grooming_edit:")) {
    return startGroomingCardEdit(
      env,
      chatId,
      data.slice("grooming_edit:".length)
    );
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


async function isMarkedDayOff(env, date) {
  const result = await env.DB.prepare(`
    SELECT setting_value
    FROM assistant_settings
    WHERE setting_key = ?
  `).bind(`day_off_${date}`).first();

  return result?.setting_value === "1";
}



function webApiResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

async function hmacSha256(keyBytes, valueBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, valueBytes));
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeHexEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let i = 0; i < left.length; i += 1) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}

const WEB_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

async function authenticateWebApp(request, env) {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return { error: "Войди в приложение с помощью веб-пароля.", status: 401 };
  }

  const password = String(env.WEB_APP_PASSWORD || "");
  if (password.length < 16) {
    return { error: "Веб-вход не настроен. Добавь секрет WEB_APP_PASSWORD длиной не менее 16 символов в настройках Worker.", status: 503 };
  }

  const token = header.slice(7).trim();
  const parts = token.split(".");
  const expiresAt = Number(parts[0] || 0);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds ||
      expiresAt > nowSeconds + WEB_SESSION_TTL_SECONDS + 60 || parts.length !== 2) {
    return { error: "Сеанс истёк. Войди ещё раз.", status: 401 };
  }

  const expected = bytesToHex(await hmacSha256(
    new TextEncoder().encode(password),
    new TextEncoder().encode("pretty-dogs-session:" + expiresAt)
  ));
  if (!constantTimeHexEqual(expected, parts[1].toLowerCase())) {
    return { error: "Недействительный сеанс. Войди ещё раз.", status: 401 };
  }

  return { user: { id: "web-app" }, standalone: true };
}

async function validateWebAppointmentSlot(env, targetDate, targetTime, ignoreId = 0, plannedDuration = 0) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return { error: "Укажи дату записи.", status: 400 };
  }
  const dateParts = targetDate.split("-").map(Number);
  const checkedDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
  if (
    checkedDate.getUTCFullYear() !== dateParts[0] ||
    checkedDate.getUTCMonth() !== dateParts[1] - 1 ||
    checkedDate.getUTCDate() !== dateParts[2]
  ) {
    return { error: "Такой даты не существует.", status: 400 };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(targetTime)) {
    return { error: "Укажи время в формате ЧЧ:ММ.", status: 400 };
  }
  const shift = await env.DB.prepare(`
    SELECT start_time, end_time
    FROM assistant_work_shifts
    WHERE shift_date = ?
  `).bind(targetDate).first();
  if (!shift) {
    return { error: "На эту дату нет рабочей смены. Сначала добавь её в календаре.", status: 400 };
  }
  if (targetTime < shift.start_time || targetTime >= shift.end_time) {
    return { error: "Это время вне рабочей смены " + shift.start_time + "–" + shift.end_time + ".", status: 400 };
  }

  const occupied = await env.DB.prepare(`
    SELECT id, appointment_time, planned_duration_minutes
    FROM appointments
    WHERE appointment_date = ?
      AND status IN ('scheduled', 'waiting', 'in_progress')
      AND id != ?
  `).bind(targetDate, Number(ignoreId || 0)).all();
  const [hour, minute] = targetTime.split(":").map(Number);
  const targetStart = hour * 60 + minute;
  const targetEnd = targetStart + Math.max(0, Number(plannedDuration || 0));
  const shiftEndMinutes = Number(shift.end_time.slice(0, 2)) * 60 + Number(shift.end_time.slice(3, 5));
  if (plannedDuration > 0 && targetEnd > shiftEndMinutes) {
    return { error: "Плановая продолжительность визита выходит за пределы смены.", status: 400 };
  }
  for (const other of occupied.results || []) {
    if (other.appointment_time === targetTime) {
      return { error: "На это время уже есть запись. Выбери другое время.", status: 409 };
    }
    const otherDuration = Number(other.planned_duration_minutes || 0);
    if (plannedDuration > 0 && otherDuration > 0) {
      const [otherHour, otherMinute] = other.appointment_time.split(":").map(Number);
      const otherStart = otherHour * 60 + otherMinute;
      if (targetStart < otherStart + otherDuration && otherStart < targetEnd) {
        return { error: "Это время пересекается с другим визитом. Выбери свободный интервал.", status: 409 };
      }
    }
  }
  return { shift };
}


const R2_PHOTO_PREFIX = "r2:";
const DB_PHOTO_PREFIX = "dbphoto:";
const MAX_DB_PHOTO_VALUE_BYTES = 1_900_000;
const MAX_DB_PHOTO_BINARY_BYTES = 1_400_000;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function savePhotoToR2(env, key, photoFile) {
  const contentType = String(photoFile.type || "image/jpeg").slice(0, 100);
  if (env.PHOTOS) {
    await env.PHOTOS.put(key, await photoFile.arrayBuffer(), {
      httpMetadata: { contentType }
    });
    return { storedValue: R2_PHOTO_PREFIX + key };
  }

  // No R2 bucket is configured in this project. Keep web photos inside D1
  // so publishing does not depend on Telegram or an uncreated R2 bucket.
  const buffer = await photoFile.arrayBuffer();
  if (buffer.byteLength > MAX_DB_PHOTO_BINARY_BYTES) {
    return {
      error: "Фотография слишком большая. Выбери её ещё раз — приложение автоматически уменьшит изображение.",
      status: 413
    };
  }
  const storedValue = DB_PHOTO_PREFIX + contentType + ";base64," + arrayBufferToBase64(buffer);
  if (storedValue.length > MAX_DB_PHOTO_VALUE_BYTES) {
    return {
      error: "Фотография слишком большая для сохранения. Выбери её ещё раз, чтобы приложение уменьшило размер.",
      status: 413
    };
  }
  return { storedValue };
}

async function readStoredPhotoResponse(env, storedValue, notFoundMessage, loadErrorMessage) {
  if (!storedValue) return webApiResponse({ error: notFoundMessage }, 404);

  if (storedValue.startsWith(DB_PHOTO_PREFIX)) {
    try {
      const data = storedValue.slice(DB_PHOTO_PREFIX.length);
      const marker = data.indexOf(";base64,");
      if (marker <= 0) return webApiResponse({ error: loadErrorMessage }, 500);
      const contentType = data.slice(0, marker);
      const base64 = data.slice(marker + ";base64,".length);
      if (!/^image\/[a-z0-9.+-]+$/i.test(contentType) || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
        return webApiResponse({ error: loadErrorMessage }, 500);
      }
      const bytes = base64ToUint8Array(base64);
      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=300",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer"
        }
      });
    } catch (error) {
      console.error("D1 photo decode error:", error);
      return webApiResponse({ error: loadErrorMessage }, 500);
    }
  }

  if (storedValue.startsWith(R2_PHOTO_PREFIX)) {
    if (!env.PHOTOS) {
      return webApiResponse({
        error: "Эта фотография хранится в отключённом хранилище. Загрузи её заново в веб-приложении."
      }, 410);
    }
    const object = await env.PHOTOS.get(storedValue.slice(R2_PHOTO_PREFIX.length));
    if (!object) return webApiResponse({ error: notFoundMessage }, 404);
    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
      }
    });
  }

  return webApiResponse({
    error: "У этой записи нет файла фотографии в веб-хранилище. Загрузи изображение заново в веб-приложении."
  }, 410);
}

async function finishWebVisitWithoutBot(env, appointmentId, appointmentDate, body) {
  const appointment = await env.DB.prepare(`
    SELECT a.id, a.dog_id, a.status, a.appointment_date, a.appointment_time,
           a.actual_start_time, d.name, d.species, d.breed, d.breed_variant
    FROM appointments a
    JOIN dogs d ON d.id = a.dog_id
    WHERE a.id = ?
  `).bind(appointmentId).first();
  if (!appointment) return { error: "Визит не найден.", status: 404 };
  if (appointment.appointment_date !== appointmentDate) {
    return { error: "Из веб-приложения можно завершать только сегодняшние визиты.", status: 400 };
  }
  if (appointment.status !== "in_progress") {
    return { error: "Визит не находится в работе.", status: 409 };
  }

  const selected = resolveServiceSelection(appointment, body?.selectedServices);
  if (selected.error) return selected;
  const services = selected.services;
  if (!services.some(service => String(service.id || "").startsWith("groom:"))) {
    return { error: "Выбери одну основную услугу.", status: 400 };
  }
  if (services.some(service => !Number.isFinite(Number(service.amount)) || Number(service.amount) <= 0)) {
    return { error: "Укажи цену больше нуля для каждой выбранной услуги.", status: 400 };
  }
  const finalTotal = Number(body?.finalTotal);
  if (!Number.isFinite(finalTotal) || finalTotal <= 0 || finalTotal > 100000) {
    return { error: "Укажи итоговую сумму визита больше нуля.", status: 400 };
  }
  const roundedTotal = Math.round(finalTotal * 100) / 100;
  const selectedTotal = Math.round(services.reduce((sum, service) => sum + service.amount, 0) * 100) / 100;
  const correction = Math.round((roundedTotal - selectedTotal) * 100) / 100;
  const requestedEndTime = String(body?.actualEndTime || "").trim();
  const endTime = requestedEndTime || localTime();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
    return { error: "Укажи корректное фактическое время окончания в формате ЧЧ:ММ.", status: 400 };
  }
  const startTime = appointment.actual_start_time || appointment.appointment_time || endTime;
  const startMs = localDateTimeMs(appointment.appointment_date, startTime);
  const endMs = localDateTimeMs(appointment.appointment_date, endTime);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return { error: "Время окончания не может быть раньше времени начала визита.", status: 400 };
  }
  const durationMinutes = Math.round((endMs - startMs) / 60000);

  const entries = services.map(service => ({
    description: service.label,
    amount: service.amount,
    rate: service.rate || 35,
    earned: Math.round(service.amount * (service.rate || 35)) / 100
  }));
  if (Math.abs(correction) >= 0.01) {
    entries.push({
      description: "Корректировка итоговой суммы",
      amount: correction,
      rate: 35,
      earned: Math.round(correction * 35) / 100
    });
  }

  const statements = entries.map((entry, index) =>
    env.DB.prepare(`
      INSERT OR IGNORE INTO earnings_entries (
        service_date, description, amount, rate, earned,
        appointment_id, source, source_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'visit', ?)
    `).bind(
      appointment.appointment_date,
      entry.description,
      entry.amount,
      entry.rate,
      entry.earned,
      appointmentId,
      Math.abs(correction) >= 0.01 && index === entries.length - 1
        ? `${appointmentId}:adjustment`
        : `${appointmentId}:${index + 1}`
    )
  );
  const procedures = entries.map(entry => {
    const amount = Number(entry.amount.toFixed(2)).toString();
    return `${entry.description}: ${amount}`;
  }).join("; ");
  statements.push(env.DB.prepare(`
    UPDATE appointments
    SET status = 'completed',
        procedures = ?,
        actual_end_time = ?,
        actual_duration_minutes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'in_progress'
  `).bind(procedures, endTime, durationMinutes, appointmentId));

  await env.DB.batch(statements);
  const updated = await env.DB.prepare("SELECT status, actual_duration_minutes FROM appointments WHERE id = ?")
    .bind(appointmentId).first();
  if (updated?.status !== "completed") return { error: "Не удалось завершить визит.", status: 500 };
  const earned = Math.round(entries.reduce((sum, entry) => sum + entry.earned, 0) * 100) / 100;
  return {
    appointmentId,
    actualDurationMinutes: Number(updated.actual_duration_minutes || 0),
    actualEndTime: endTime,
    finalTotal: roundedTotal,
    earned
  };
}
async function handleWebApi(request, env) {
  if (!env.DB) {
    return webApiResponse({ error: "Не подключена база данных D1." }, 500);
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "POST" && path === "/api/login") {
      const configuredPassword = String(env.WEB_APP_PASSWORD || "");
      if (configuredPassword.length < 16) {
        return webApiResponse({
          error: "Веб-вход не настроен. В Cloudflare Worker добавь секрет WEB_APP_PASSWORD длиной не менее 16 символов."
        }, 503);
      }

      let loginBody;
      try {
        loginBody = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать форму входа." }, 400);
      }
      const submittedPassword = String(loginBody.password || "");
      if (!constantTimeHexEqual(configuredPassword, submittedPassword)) {
        return webApiResponse({ error: "Пароль не подошёл. Проверь его и попробуй ещё раз." }, 401);
      }

      const expiresAt = Math.floor(Date.now() / 1000) + WEB_SESSION_TTL_SECONDS;
      const signature = bytesToHex(await hmacSha256(
        new TextEncoder().encode(configuredPassword),
        new TextEncoder().encode("pretty-dogs-session:" + expiresAt)
      ));
      return webApiResponse({ ok: true, token: expiresAt + "." + signature, expiresAt });
    }

    const auth = await authenticateWebApp(request, env);
    if (auth.error) return webApiResponse({ error: auth.error }, auth.status);

    await ensureWebApiDatabaseReady(env);
    if (auth.standalone) auth.user = { id: "web-app" };

    const date = localDate();
    const month = date.slice(0, 7);
    const todayDisplay = date.slice(8, 10) + "." + date.slice(5, 7) + "." + date.slice(0, 4);

    if (request.method === "GET" && path === "/api/backup") {
      const [petsResult, appointmentsResult, earningsResult, shiftsResult, groomingCardsResult, templatesResult, visitPhotosResult, groomingPhotosResult, coverPhotosResult] = await Promise.all([
        env.DB.prepare("SELECT * FROM dogs ORDER BY id").all(),
        env.DB.prepare("SELECT * FROM appointments ORDER BY appointment_date, appointment_time, id").all(),
        env.DB.prepare("SELECT * FROM earnings_entries ORDER BY service_date, id").all(),
        env.DB.prepare("SELECT * FROM assistant_work_shifts ORDER BY shift_date").all(),
        env.DB.prepare("SELECT * FROM grooming_cards ORDER BY dog_id").all(),
        env.DB.prepare("SELECT id, name, services_json, created_at, updated_at FROM service_templates ORDER BY id").all(),
        env.DB.prepare("SELECT id, appointment_id, photo_type, caption, created_at, telegram_file_id FROM visit_photos ORDER BY id").all(),
        env.DB.prepare("SELECT id, dog_id, caption, created_at, telegram_file_id FROM grooming_card_photos ORDER BY id").all(),
        env.DB.prepare("SELECT dog_id AS id, updated_at AS created_at, telegram_file_id FROM pet_cover_photos ORDER BY dog_id").all()
      ]);
      const photoFiles = [];
      let photosWithoutEmbeddedFiles = 0;
      async function embedPhoto(collection, row, storedValue) {
        if (!storedValue) { photosWithoutEmbeddedFiles++; return; }
        if (storedValue.startsWith(DB_PHOTO_PREFIX)) {
          const data = storedValue.slice(DB_PHOTO_PREFIX.length);
          const marker = data.indexOf(";base64,");
          if (marker > 0) {
            const contentType = data.slice(0, marker);
            const base64 = data.slice(marker + 8);
            if (/^image\/[a-z0-9.+-]+$/i.test(contentType) && /^[A-Za-z0-9+/=]+$/.test(base64)) {
              photoFiles.push({ collection, recordId: Number(row.id), contentType, base64 });
              return;
            }
          }
        } else if (storedValue.startsWith(R2_PHOTO_PREFIX) && env.PHOTOS) {
          const object = await env.PHOTOS.get(storedValue.slice(R2_PHOTO_PREFIX.length));
          if (object) {
            photoFiles.push({ collection, recordId: Number(row.id), contentType: object.httpMetadata?.contentType || "image/jpeg", base64: arrayBufferToBase64(await object.arrayBuffer()) });
            return;
          }
        }
        photosWithoutEmbeddedFiles++;
      }
      const visitPhotos = visitPhotosResult.results || [];
      const groomingPhotos = groomingPhotosResult.results || [];
      const coverPhotos = coverPhotosResult.results || [];
      for (const row of visitPhotos) await embedPhoto("visitPhotos", row, row.telegram_file_id);
      for (const row of groomingPhotos) await embedPhoto("groomingPhotos", row, row.telegram_file_id);
      for (const row of coverPhotos) await embedPhoto("coverPhotos", row, row.telegram_file_id);
      const embedded = (collection, id) => photoFiles.some(photo => photo.collection === collection && photo.recordId === Number(id));
      return webApiResponse({
        backupFormat: "pretty-dogs-json-v1",
        createdAt: new Date().toISOString(),
        contents: {
          pets: petsResult.results || [],
          appointments: appointmentsResult.results || [],
          visits: (appointmentsResult.results || []).filter(item => ["completed", "in_progress", "cancelled", "no_show"].includes(item.status)),
          earnings: earningsResult.results || [],
          workShifts: shiftsResult.results || [],
          groomingCards: groomingCardsResult.results || [],
          serviceTemplates: templatesResult.results || [],
          visitPhotos: visitPhotos.map(({ telegram_file_id, ...row }) => ({ ...row, imageEmbedded: embedded("visitPhotos", row.id) })),
          groomingPhotos: groomingPhotos.map(({ telegram_file_id, ...row }) => ({ ...row, imageEmbedded: embedded("groomingPhotos", row.id) })),
          coverPhotos: coverPhotos.map(({ telegram_file_id, ...row }) => ({ ...row, imageEmbedded: embedded("coverPhotos", row.id) })),
          photoFiles
        },
        photoFilesIncluded: photoFiles.length,
        photoFilesUnavailable: photosWithoutEmbeddedFiles,
        note: photosWithoutEmbeddedFiles ? "Часть старых фотографий хранится только по внешним ссылкам и не вложена в копию." : "Фотографии, доступные в веб-хранилище, вложены в копию."
      });
    }
    if (request.method === "POST" && path === "/api/restore") {
      const contentLength = Number(request.headers.get("Content-Length") || 0);
      if (contentLength > 45 * 1024 * 1024) {
        return webApiResponse({ error: "Файл копии слишком большой. Максимальный размер — 45 МБ." }, 413);
      }

      let backup;
      try {
        backup = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать файл резервной копии." }, 400);
      }

      if (backup?.backupFormat !== "pretty-dogs-json-v1" || !backup.contents || typeof backup.contents !== "object") {
        return webApiResponse({ error: "Формат файла не распознан. Выбери резервную копию Pretty Dogs." }, 400);
      }

      const contents = backup.contents;
      const collections = [
        "pets", "appointments", "earnings", "workShifts",
        "groomingCards", "serviceTemplates", "visitPhotos",
        "groomingPhotos", "coverPhotos", "photoFiles"
      ];
      for (const name of collections) {
        if (contents[name] != null && !Array.isArray(contents[name])) {
          return webApiResponse({ error: "В резервной копии повреждён раздел: " + name + "." }, 400);
        }
      }
      const totalRows = collections.reduce((sum, name) => sum + (contents[name] || []).length, 0);
      if (totalRows > 30000) {
        return webApiResponse({ error: "В копии слишком много записей для одного восстановления." }, 413);
      }

      const photoFiles = contents.photoFiles || [];
      const photoMap = new Map();
      let totalPhotoBase64Length = 0;
      for (const photo of photoFiles) {
        const collection = String(photo?.collection || "");
        const recordId = Number(photo?.recordId);
        const contentType = String(photo?.contentType || "");
        const base64 = String(photo?.base64 || "");
        if (!["visitPhotos", "groomingPhotos", "coverPhotos"].includes(collection) ||
            !Number.isSafeInteger(recordId) || recordId <= 0 ||
            !contentType.toLowerCase().startsWith("image/") ||
            !base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64) ||
            base64.length > 1_900_000) {
          return webApiResponse({ error: "В копии обнаружена некорректная фотография." }, 400);
        }
        totalPhotoBase64Length += base64.length;
        if (totalPhotoBase64Length > 38 * 1024 * 1024) {
          return webApiResponse({ error: "Общий размер фотографий в копии превышает 38 МБ." }, 413);
        }
        const key = collection + ":" + recordId;
        if (photoMap.has(key)) {
          return webApiResponse({ error: "В копии повторяется одна и та же фотография." }, 400);
        }
        const storedValue = DB_PHOTO_PREFIX + contentType + ";base64," + base64;
        if (storedValue.length > MAX_DB_PHOTO_VALUE_BYTES) {
          return webApiResponse({ error: "Одна из фотографий превышает допустимый размер для базы данных." }, 413);
        }
        try {
          if (base64ToUint8Array(base64).byteLength > MAX_DB_PHOTO_BINARY_BYTES) {
            return webApiResponse({ error: "Одна из фотографий слишком большая для восстановления." }, 413);
          }
        } catch {
          return webApiResponse({ error: "В копии повреждены данные фотографии." }, 400);
        }
        photoMap.set(key, storedValue);
      }

      const tableSpecs = [
        { key: "pets", table: "dogs", conflict: "id" },
        { key: "appointments", table: "appointments", conflict: "id" },
        { key: "earnings", table: "earnings_entries", conflict: "id" },
        { key: "workShifts", table: "assistant_work_shifts", conflict: "shift_date" },
        { key: "groomingCards", table: "grooming_cards", conflict: "dog_id" },
        { key: "serviceTemplates", table: "service_templates", conflict: "name" }
      ];

      const counts = {};
      let importedPhotoRows = 0;
      let skippedPhotoRows = 0;

      async function applyRows(table, conflictColumn, rows) {
        if (!rows.length) {
          counts[table] = 0;
          return;
        }
        const info = await env.DB.prepare("PRAGMA table_info(" + table + ")").all();
        const allowedColumns = new Set((info.results || []).map(column => String(column.name)));
        if (!allowedColumns.size || !allowedColumns.has(conflictColumn)) {
          throw new Error("Не удалось определить структуру таблицы " + table + ".");
        }

        const statements = [];
        for (const row of rows) {
          if (!row || typeof row !== "object" || Array.isArray(row)) continue;
          const sourceRow = table === "service_templates"
            ? Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id"))
            : row;
          const entries = Object.entries(sourceRow).filter(([key, value]) =>
            allowedColumns.has(key) && value !== undefined
          );
          if (!entries.some(([key]) => key === conflictColumn)) continue;
          const columns = entries.map(([key]) => key);
          const values = entries.map(([, value]) => value);
          const updates = columns.filter(column => column !== conflictColumn);
          const placeholders = columns.map(() => "?").join(", ");
          const updateSql = updates.length
            ? " DO UPDATE SET " + updates.map(column => column + " = excluded." + column).join(", ")
            : " DO NOTHING";
          const sql = "INSERT INTO " + table + " (" + columns.join(", ") + ") VALUES (" +
            placeholders + ") ON CONFLICT(" + conflictColumn + ")" + updateSql;
          statements.push(env.DB.prepare(sql).bind(...values));
        }
        for (let offset = 0; offset < statements.length; offset += 40) {
          await env.DB.batch(statements.slice(offset, offset + 40));
        }
        counts[table] = statements.length;
      }

      try {
        for (const spec of tableSpecs) {
          await applyRows(spec.table, spec.conflict, contents[spec.key] || []);
        }

        const photoSpecs = [
          { key: "visitPhotos", table: "visit_photos", conflict: "id", fileCollection: "visitPhotos" },
          { key: "groomingPhotos", table: "grooming_card_photos", conflict: "id", fileCollection: "groomingPhotos" },
          { key: "coverPhotos", table: "pet_cover_photos", conflict: "dog_id", fileCollection: "coverPhotos" }
        ];
        for (const spec of photoSpecs) {
          const rows = [];
          for (const source of contents[spec.key] || []) {
            const recordId = Number(spec.key === "coverPhotos" ? source?.id : source?.id);
            if (!source || source.imageEmbedded !== true || !Number.isSafeInteger(recordId) || recordId <= 0) {
              skippedPhotoRows++;
              continue;
            }
            const storedValue = photoMap.get(spec.fileCollection + ":" + recordId);
            if (!storedValue) {
              skippedPhotoRows++;
              continue;
            }
            if (spec.key === "coverPhotos") {
              rows.push({
                dog_id: recordId,
                updated_at: source.created_at || source.updated_at || new Date().toISOString(),
                telegram_file_id: storedValue
              });
            } else {
              rows.push({
                ...source,
                telegram_file_id: storedValue
              });
            }
          }
          await applyRows(spec.table, spec.conflict, rows);
          importedPhotoRows += rows.length;
        }
      } catch (error) {
        console.error("Pretty Dogs restore error:", error);
        return webApiResponse({
          error: "Восстановление прервалось на одном из разделов. Повторная загрузка того же файла безопасна — записи обновляются по ID."
        }, 500);
      }

      return webApiResponse({
        ok: true,
        mode: "merge",
        counts,
        importedPhotoRows,
        skippedPhotoRows,
        message: "Данные из копии добавлены или обновлены. Записи, которых нет в копии, не удалялись."
      });
    }

    if (request.method === "GET" && path === "/api/breed-variants") {
      const breed = String(url.searchParams.get("breed") || "").trim().slice(0, 120);
      const species = String(url.searchParams.get("species") || "dog");
      return webApiResponse(getBreedVariantOptions(breed, species));
    }

    if (request.method === "GET" && path === "/api/service-options") {
      const dogId = Number(url.searchParams.get("dogId") || 0);
      if (!Number.isSafeInteger(dogId) || dogId <= 0) {
        return webApiResponse({ error: "Не удалось определить питомца для расчёта." }, 400);
      }
      const pet = await env.DB.prepare(`
        SELECT id, name, species, breed, breed_variant, is_temporary
        FROM dogs
        WHERE id = ?
      `).bind(dogId).first();
      if (!pet) return webApiResponse({ error: "Питомец для записи не найден." }, 404);
      return webApiResponse(getServiceOptions(pet));
    }

    if (request.method === "GET" && path === "/api/service-templates") {
      const result = await env.DB.prepare("SELECT id, name, services_json FROM service_templates ORDER BY name COLLATE NOCASE, id").all();
      return webApiResponse({
        templates: (result.results || []).map(row => {
          let services = [];
          try { const parsed = JSON.parse(row.services_json || "[]"); if (Array.isArray(parsed)) services = parsed; } catch {}
          return { id: Number(row.id), name: row.name, services };
        })
      });
    }

    if (request.method === "POST" && path === "/api/service-templates") {
      let body;
      try { body = await request.json(); }
      catch { return webApiResponse({ error: "Не удалось прочитать шаблон услуг." }, 400); }
      const name = String(body.name || "").trim().slice(0, 60);
      const rawServices = Array.isArray(body.services) ? body.services : [];
      if (!name) return webApiResponse({ error: "Укажи название набора." }, 400);
      if (rawServices.length < 1 || rawServices.length > 20) return webApiResponse({ error: "В наборе должно быть от 1 до 20 услуг." }, 400);
      const services = rawServices.map(item => ({ id: String(item && item.id || "").trim().slice(0, 100), size: String(item && item.size || "").trim().slice(0, 50) || null }));
      if (services.some(item => !/^[a-z0-9:_-]+$/i.test(item.id))) return webApiResponse({ error: "В наборе есть некорректная услуга." }, 400);
      if (services.filter(item => item.id.startsWith("groom:")).length !== 1) return webApiResponse({ error: "В наборе должна быть ровно одна основная услуга." }, 400);
      await env.DB.prepare("INSERT INTO service_templates (name, services_json) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET services_json = excluded.services_json, updated_at = CURRENT_TIMESTAMP").bind(name, JSON.stringify(services)).run();
      const saved = await env.DB.prepare("SELECT id, name, services_json FROM service_templates WHERE name = ? COLLATE NOCASE").bind(name).first();
      return webApiResponse({ ok: true, template: { id: Number(saved.id), name: saved.name, services: JSON.parse(saved.services_json || "[]") } });
    }

    if (request.method === "DELETE" && path === "/api/service-templates") {
      const id = Number(url.searchParams.get("id") || 0);
      if (!Number.isSafeInteger(id) || id <= 0) return webApiResponse({ error: "Не удалось определить набор." }, 400);
      const removed = await env.DB.prepare("DELETE FROM service_templates WHERE id = ?").bind(id).run();
      if (!removed.meta?.changes) return webApiResponse({ error: "Набор не найден." }, 404);
      return webApiResponse({ ok: true, id });
    }
    if (request.method === "GET" && path === "/api/work-shifts") {
      const targetMonth = String(url.searchParams.get("month") || month);
      if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
        return webApiResponse({ error: "Укажи месяц в формате ГГГГ-ММ." }, 400);
      }
      const monthNumber = Number(targetMonth.slice(5, 7));
      if (monthNumber < 1 || monthNumber > 12) {
        return webApiResponse({ error: "Такого месяца не существует." }, 400);
      }
      const nextMonthDate = new Date(Date.UTC(
        Number(targetMonth.slice(0, 4)),
        monthNumber,
        1
      ));
      const nextMonth = `${nextMonthDate.getUTCFullYear()}-${String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0")}-01`;
      const result = await env.DB.prepare(`
        SELECT shift_date, start_time, end_time
        FROM assistant_work_shifts
        WHERE shift_date >= ? AND shift_date < ?
        ORDER BY shift_date
      `).bind(targetMonth + "-01", nextMonth).all();
      return webApiResponse({
        month: targetMonth,
        shifts: result.results || []
      });
    }

    if (request.method === "GET" && path === "/api/appointments") {
      const from = String(url.searchParams.get("from") || date);
      const to = String(url.searchParams.get("to") || from);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
        return webApiResponse({ error: "Укажи корректный период календаря." }, 400);
      }
      const result = await env.DB.prepare(`
        SELECT a.id, a.dog_id, a.appointment_date, a.appointment_time,
               a.status, a.queue_position, a.procedures, a.planned_duration_minutes,
               d.name, d.breed, d.species, d.breed_variant, d.is_temporary
        FROM appointments a
        JOIN dogs d ON d.id = a.dog_id
        WHERE a.status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show')
          AND a.appointment_date >= ? AND a.appointment_date <= ?
        ORDER BY a.appointment_date, a.appointment_time, a.queue_position, a.id
        LIMIT 300
      `).bind(from, to).all();
      return webApiResponse({ appointments: result.results || [], from, to });
    }

    if (request.method === "GET" && path === "/api/dashboard") {
      const queueResult = await env.DB.prepare(`
        SELECT a.id, a.appointment_time, a.status, a.queue_position,
               a.procedures, a.actual_start_time, a.actual_end_time,
               a.actual_duration_minutes, a.planned_duration_minutes,
               COALESCE((
                 SELECT SUM(e.amount)
                 FROM earnings_entries e
                 WHERE e.appointment_id = a.id
               ), 0) AS services_total,
               COALESCE((
                 SELECT SUM(e.earned)
                 FROM earnings_entries e
                 WHERE e.appointment_id = a.id
               ), 0) AS earned,
               d.id AS dog_id, d.name, d.breed, d.breed_variant, d.species
        FROM appointments a
        JOIN dogs d ON d.id = a.dog_id
        WHERE a.appointment_date = ?
          AND a.status IN ('scheduled', 'waiting', 'in_progress', 'completed')
        ORDER BY a.queue_position, a.appointment_time, a.id
        LIMIT 100
      `).bind(date).all();

      const queue = queueResult.results || [];
      const earningRow = await env.DB.prepare(`
        SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS earned
        FROM earnings_entries
        WHERE service_date = ?
      `).bind(date).first();

      return webApiResponse({
        date,
        dateDisplay: todayDisplay,
        dayOff: await isMarkedDayOff(env, date),
        earnedToday: Number(earningRow?.earned || 0),
        earningsCount: Number(earningRow?.count || 0),
        counts: {
          total: queue.length,
          inProgress: queue.filter(item => item.status === "in_progress").length,
          completed: queue.filter(item => item.status === "completed").length
        },
        queue
      });
    }

    if (request.method === "POST" && path === "/api/appointments") {
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать запись." }, 400);
      }
      const rawDogId = String(body.dogId || "");
      const isNoCard = rawDogId === "none";
      let dogId = Number(rawDogId);
      const noCardName = String(body.noCardName || "").trim().slice(0, 100);
      const noCardBreed = String(body.noCardBreed || "").trim().slice(0, 120);
      const noCardBreedVariant = String(body.noCardBreedVariant || "").trim().slice(0, 80);
      const targetDate = String(body.date || "");
      const targetTime = String(body.time || "");
      if (isNoCard) {
        if (!noCardName) return webApiResponse({ error: "Укажи имя нового питомца." }, 400);
        const options = getBreedVariantOptions(noCardBreed, "dog");
        if (options.requiresVariant && !options.options.some(option => option.value === noCardBreedVariant)) {
          return webApiResponse({ error: "Выбери размер или разновидность питомца для правильного прайса." }, 400);
        }
      } else {
        if (!Number.isSafeInteger(dogId) || dogId <= 0) {
          return webApiResponse({ error: "Выбери существующего питомца или создай карточку нового." }, 400);
        }
        const pet = await env.DB.prepare(`
          SELECT id FROM dogs
          WHERE id = ? AND COALESCE(is_temporary, 0) = 0
        `).bind(dogId).first();
        if (!pet) return webApiResponse({ error: "Питомец не найден. Обнови список питомцев." }, 404);
      }

      const slotCheck = await validateWebAppointmentSlot(env, targetDate, targetTime);
      if (slotCheck.error) return webApiResponse({ error: slotCheck.error }, slotCheck.status);

      if (isNoCard) {
        const newPet = await env.DB.prepare(`
          INSERT INTO dogs (name, species, breed, breed_variant, is_temporary)
          VALUES (?, 'dog', ?, ?, 0)
        `).bind(noCardName, noCardBreed || null, noCardBreedVariant || null).run();
        dogId = Number(newPet.meta.last_row_id);
      }

      const position = await env.DB.prepare(`
        SELECT COALESCE(MAX(queue_position), 0) AS max_position
        FROM appointments
        WHERE appointment_date = ?
          AND status IN ('scheduled', 'waiting', 'in_progress')
      `).bind(targetDate).first();
      const queuePosition = Number(position?.max_position || 0) + 1;
      const result = await env.DB.prepare(`
        INSERT INTO appointments (
          dog_id, appointment_date, appointment_time, queue_position, status, procedures
        ) VALUES (?, ?, ?, ?, 'scheduled', '')
      `).bind(dogId, targetDate, targetTime, queuePosition).run();
      const appointmentId = Number(result.meta.last_row_id);
      await env.DB.prepare(`
        INSERT OR IGNORE INTO assistant_appointment_state (appointment_id)
        VALUES (?)
      `).bind(appointmentId).run();
      return webApiResponse({
        ok: true,
        id: appointmentId,
        petId: dogId,
        petCardSaved: isNoCard,
        message: isNoCard ? "Запись добавлена, карточка питомца сохранена." : "Запись добавлена."
      }, 201);
    }

    const editCompletedPriceMatch = path.match(/^\/api\/appointments\/(\d+)\/price$/);
    if (request.method === "PUT" && editCompletedPriceMatch) {
      const appointmentId = Number(editCompletedPriceMatch[1]);
      let body;
      try { body = await request.json(); }
      catch { return webApiResponse({ error: "Не удалось прочитать новую сумму." }, 400); }
      const targetTotal = Math.round(Number(body.total) * 100) / 100;
      if (!Number.isFinite(targetTotal) || targetTotal <= 0 || targetTotal > 100000) {
        return webApiResponse({ error: "Укажи сумму больше 0 и не больше 100 000 ₽." }, 400);
      }
      const appointment = await env.DB.prepare(
        "SELECT id, status, procedures FROM appointments WHERE id = ?"
      ).bind(appointmentId).first();
      if (!appointment) return webApiResponse({ error: "Визит не найден." }, 404);
      if (appointment.status !== "completed") return webApiResponse({ error: "Изменять стоимость можно только у завершённого визита." }, 409);

      const entriesResult = await env.DB.prepare(
        "SELECT id, description, amount, rate FROM earnings_entries WHERE appointment_id = ? AND source = 'visit' ORDER BY id"
      ).bind(appointmentId).all();
      const entries = entriesResult.results || [];
      if (!entries.length) return webApiResponse({ error: "Для этого визита не найдены сохранённые услуги." }, 404);

      const correctionLabel = "Корректировка итоговой суммы";
      const baseEntries = entries.filter(entry => !String(entry.description || "").startsWith(correctionLabel));
      const baseTotal = baseEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      const correction = Math.round((targetTotal - baseTotal) * 100) / 100;
      const procedures = baseEntries.map(entry =>
        String(entry.description) + ": " + Number(entry.amount || 0).toFixed(2).replace(/\\.?0+$/, "")
      );
      if (Math.abs(correction) >= 0.01) procedures.push(correctionLabel + ": " + correction.toFixed(2).replace(/\\.?0+$/, ""));

      const statements = baseEntries.map(entry => env.DB.prepare(
        "UPDATE earnings_entries SET earned = ROUND(amount * rate / 100, 2) WHERE id = ?"
      ).bind(entry.id));
      const oldCorrection = entries.find(entry => String(entry.description || "").startsWith(correctionLabel));
      if (oldCorrection && Math.abs(correction) >= 0.01) {
        statements.push(env.DB.prepare(
          "UPDATE earnings_entries SET amount = ?, earned = ROUND(? * rate / 100, 2) WHERE id = ?"
        ).bind(correction, correction, oldCorrection.id));
      } else if (oldCorrection) {
        statements.push(env.DB.prepare("DELETE FROM earnings_entries WHERE id = ?").bind(oldCorrection.id));
      } else if (Math.abs(correction) >= 0.01) {
        statements.push(env.DB.prepare(`
          INSERT INTO earnings_entries (service_date, description, amount, rate, earned, appointment_id, source, source_id)
          VALUES (?, ?, ?, 35, ROUND(? * 35 / 100, 2), ?, 'visit', ?)
        `).bind(
          (await env.DB.prepare("SELECT appointment_date FROM appointments WHERE id = ?").bind(appointmentId).first()).appointment_date,
          correctionLabel, correction, correction, appointmentId, appointmentId + ":adjustment"
        ));
      }
      statements.push(env.DB.prepare(
        "UPDATE appointments SET procedures = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'completed'"
      ).bind(procedures.join("; "), appointmentId));
      await env.DB.batch(statements);
      const updated = await env.DB.prepare(
        "SELECT COALESCE(SUM(amount),0) AS total, COALESCE(SUM(earned),0) AS earned FROM earnings_entries WHERE appointment_id = ? AND source = 'visit'"
      ).bind(appointmentId).first();
      return webApiResponse({ ok: true, id: appointmentId, total: Number(updated.total || 0), earned: Number(updated.earned || 0) });
    }

    const appointmentStatusMatch = path.match(/^\/api\/appointments\/(\d+)\/status$/);
    if (request.method === "POST" && appointmentStatusMatch) {
      const appointmentId = Number(appointmentStatusMatch[1]);
      let body;
      try { body = await request.json(); }
      catch { return webApiResponse({ error: "Не удалось прочитать статус записи." }, 400); }
      const nextStatus = String(body.status || "");
      if (!["cancelled", "no_show"].includes(nextStatus)) return webApiResponse({ error: "Можно выбрать только отмену или неявку." }, 400);
      const appointment = await env.DB.prepare("SELECT id, status, appointment_date, appointment_time FROM appointments WHERE id = ?").bind(appointmentId).first();
      if (!appointment) return webApiResponse({ error: "Запись не найдена." }, 404);
      if (!["scheduled", "waiting"].includes(appointment.status)) return webApiResponse({ error: "Отменить или отметить неявку можно только до начала визита." }, 409);
      if (nextStatus === "no_show" && (appointment.appointment_date > date || (appointment.appointment_date === date && String(appointment.appointment_time || "00:00") > localTime()))) {
        return webApiResponse({ error: "Неявку можно отметить только после назначенного времени." }, 400);
      }
      const updated = await env.DB.prepare("UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('scheduled','waiting')").bind(nextStatus, appointmentId).run();
      if (!updated.meta?.changes) return webApiResponse({ error: "Запись уже изменилась. Обнови страницу." }, 409);
      return webApiResponse({ ok: true, id: appointmentId, status: nextStatus, message: nextStatus === "cancelled" ? "Запись отменена и сохранена в истории." : "Неявка сохранена в истории." });
    }
    const editAppointmentMatch = path.match(/^\/api\/appointments\/(\d+)$/);
    if (request.method === "PUT" && editAppointmentMatch) {
      const appointmentId = Number(editAppointmentMatch[1]);
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать изменения записи." }, 400);
      }
      const rawDogId = String(body.dogId || "");
      const isNoCard = rawDogId === "none";
      let dogId = Number(rawDogId);
      const noCardName = String(body.noCardName || "").trim().slice(0, 100);
      const noCardBreed = String(body.noCardBreed || "").trim().slice(0, 120);
      const noCardBreedVariant = String(body.noCardBreedVariant || "").trim().slice(0, 80);
      const targetDate = String(body.date || "");
      const targetTime = String(body.time || "");
      if (isNoCard && !noCardName) {
        return webApiResponse({ error: "Укажи имя нового питомца." }, 400);
      }
      const appointment = await env.DB.prepare(`
        SELECT id, dog_id, status, planned_duration_minutes
        FROM appointments
        WHERE id = ?
      `).bind(appointmentId).first();
      if (!appointment) return webApiResponse({ error: "Запись не найдена." }, 404);
      if (!["scheduled", "waiting"].includes(appointment.status)) {
        return webApiResponse({ error: "Можно изменить только запись, которая ещё не началась." }, 409);
      }
      if (isNoCard) {
        const options = getBreedVariantOptions(noCardBreed, "dog");
        if (options.requiresVariant && !options.options.some(option => option.value === noCardBreedVariant)) {
          return webApiResponse({ error: "Выбери размер или разновидность питомца для правильного прайса." }, 400);
        }
      } else {
        if (!Number.isSafeInteger(dogId) || dogId <= 0) {
          return webApiResponse({ error: "Выбери существующего питомца или создай карточку нового." }, 400);
        }
        const pet = await env.DB.prepare(`
          SELECT id FROM dogs
          WHERE id = ? AND COALESCE(is_temporary, 0) = 0
        `).bind(dogId).first();
        if (!pet) return webApiResponse({ error: "Питомец не найден. Обнови список питомцев." }, 404);
      }

      const slotCheck = await validateWebAppointmentSlot(
        env, targetDate, targetTime, appointmentId, Number(appointment.planned_duration_minutes || 0)
      );
      if (slotCheck.error) return webApiResponse({ error: slotCheck.error }, slotCheck.status);

      if (isNoCard) {
        const oldPet = await env.DB.prepare("SELECT id, is_temporary FROM dogs WHERE id = ?")
          .bind(Number(appointment.dog_id)).first();
        if (oldPet && Number(oldPet.is_temporary) === 1) {
          dogId = Number(oldPet.id);
          await env.DB.prepare(`
            UPDATE dogs
            SET name = ?, breed = ?, breed_variant = ?, is_temporary = 0
            WHERE id = ? AND is_temporary = 1
          `).bind(noCardName, noCardBreed || null, noCardBreedVariant || null, dogId).run();
        } else {
          const newPet = await env.DB.prepare(`
            INSERT INTO dogs (name, species, breed, breed_variant, is_temporary)
            VALUES (?, 'dog', ?, ?, 0)
          `).bind(noCardName, noCardBreed || null, noCardBreedVariant || null).run();
          dogId = Number(newPet.meta.last_row_id);
        }
      }

      const position = await env.DB.prepare(`
        SELECT COALESCE(MAX(queue_position), 0) AS max_position
        FROM appointments
        WHERE appointment_date = ?
          AND status IN ('scheduled', 'waiting', 'in_progress')
          AND id != ?
      `).bind(targetDate, appointmentId).first();
      const queuePosition = Number(position?.max_position || 0) + 1;
      const updated = await env.DB.prepare(`
        UPDATE appointments
        SET dog_id = ?, appointment_date = ?, appointment_time = ?,
            queue_position = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status IN ('scheduled', 'waiting')
      `).bind(dogId, targetDate, targetTime, queuePosition, appointmentId).run();
      if (!updated.meta?.changes) {
        return webApiResponse({ error: "Запись уже изменилась. Обнови календарь и попробуй снова." }, 409);
      }
      await env.DB.prepare(`
        INSERT OR IGNORE INTO assistant_appointment_state (appointment_id)
        VALUES (?)
      `).bind(appointmentId).run();
      await env.DB.prepare(`
        UPDATE assistant_appointment_state
        SET arrival_prompted = 0, duration_reminded = 0,
            planned_end_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE appointment_id = ?
      `).bind(appointmentId).run();
      return webApiResponse({
        ok: true,
        id: appointmentId,
        petId: dogId,
        petCardSaved: isNoCard,
        message: isNoCard ? "Запись обновлена, карточка питомца сохранена." : "Запись обновлена."
      });
    }

    if (request.method === "DELETE" && editAppointmentMatch) {
      const appointmentId = Number(editAppointmentMatch[1]);
      const appointment = await env.DB.prepare(`
        SELECT id, status
        FROM appointments
        WHERE id = ?
      `).bind(appointmentId).first();

      if (!appointment) {
        return webApiResponse({ error: "Запись не найдена." }, 404);
      }
      if (!["scheduled", "waiting"].includes(appointment.status)) {
        return webApiResponse({
          error: "Нельзя удалить визит, который уже начался или завершён."
        }, 409);
      }

      const earnings = await env.DB.prepare(`
        SELECT id
        FROM earnings_entries
        WHERE appointment_id = ?
        LIMIT 1
      `).bind(appointmentId).first();
      if (earnings) {
        return webApiResponse({
          error: "К этой записи уже привязан заработок. Сначала проверь историю визита."
        }, 409);
      }

      const deleted = await env.DB.prepare(`
        DELETE FROM appointments
        WHERE id = ?
          AND status IN ('scheduled', 'waiting')
          AND NOT EXISTS (
            SELECT 1
            FROM earnings_entries
            WHERE appointment_id = ?
          )
      `).bind(appointmentId, appointmentId).run();

      if (!deleted.meta?.changes) {
        return webApiResponse({
          error: "Запись уже изменилась. Обнови календарь и попробуй снова."
        }, 409);
      }

      return webApiResponse({
        ok: true,
        id: appointmentId,
        message: "Запись удалена. Карточка питомца сохранена."
      });
    }

    if (request.method === "POST" && path === "/api/work-shifts") {
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать рабочий день." }, 400);
      }
      const shiftDate = String(body.date || "");
      const startTime = String(body.startTime || "");
      const endTime = String(body.endTime || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
        return webApiResponse({ error: "Укажи дату рабочего дня." }, 400);
      }
      const dateParts = shiftDate.split("-").map(Number);
      const checkedDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
      if (
        checkedDate.getUTCFullYear() !== dateParts[0] ||
        checkedDate.getUTCMonth() !== dateParts[1] - 1 ||
        checkedDate.getUTCDate() !== dateParts[2]
      ) {
        return webApiResponse({ error: "Такой даты не существует." }, 400);
      }
      const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
      if (!validTime(startTime) || !validTime(endTime) || startTime >= endTime) {
        return webApiResponse({ error: "Проверь время начала и окончания смены." }, 400);
      }
      await env.DB.prepare(`
        INSERT INTO assistant_work_shifts (
          shift_date, start_time, end_time, reminders_sent, updated_at
        ) VALUES (?, ?, ?, '[]', CURRENT_TIMESTAMP)
        ON CONFLICT(shift_date) DO UPDATE SET
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          reminders_sent = '[]',
          updated_at = CURRENT_TIMESTAMP
      `).bind(shiftDate, startTime, endTime).run();
      return webApiResponse({ ok: true, date: shiftDate, startTime, endTime });
    }

    if (request.method === "DELETE" && path === "/api/work-shifts") {
      const shiftDate = String(url.searchParams.get("date") || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) {
        return webApiResponse({ error: "Укажи дату рабочего дня." }, 400);
      }
      const result = await env.DB.prepare(`
        DELETE FROM assistant_work_shifts WHERE shift_date = ?
      `).bind(shiftDate).run();
      if (!result.meta?.changes) {
        return webApiResponse({ error: "Рабочий день не найден." }, 404);
      }
      return webApiResponse({ ok: true, date: shiftDate });
    }

    if (request.method === "GET" && path === "/api/pets") {
      const query = String(url.searchParams.get("q") || "").trim().slice(0, 100);
      const pattern = "%" + query + "%";
      const result = await env.DB.prepare(`
        SELECT d.id, d.name, d.species, d.breed, d.breed_variant,
               pcp.dog_id AS cover_photo_id,
               CASE WHEN pcp.dog_id IS NOT NULL THEN 'cover' ELSE NULL END AS cover_photo_type
        FROM dogs d
        LEFT JOIN pet_cover_photos pcp ON pcp.dog_id = d.id
        WHERE COALESCE(d.is_temporary, 0) = 0
          AND (? = '' OR d.name LIKE ? COLLATE NOCASE OR COALESCE(d.breed, '') LIKE ? COLLATE NOCASE)
        ORDER BY d.name COLLATE NOCASE, d.id
        LIMIT 100
      `).bind(query, pattern, pattern).all();

      return webApiResponse({ pets: result.results || [] });
    }

    if (request.method === "POST" && path === "/api/pets") {
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать карточку." }, 400);
      }

      const name = String(body.name || "").trim();
      const species = String(body.species || "");
      if (!name || name.length > 100) {
        return webApiResponse({ error: "Укажи имя питомца (до 100 символов)." }, 400);
      }
      if (!["dog", "cat"].includes(species)) {
        return webApiResponse({ error: "Выбери вид питомца." }, 400);
      }

      const fieldValue = key => String(body[key] || "").trim()
        .slice(0, key === "comment" ? 10000 : 500) || null;
      const result = await env.DB.prepare(`
        INSERT INTO dogs (
          name, species, breed, breed_variant, age, comment
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        name, species, fieldValue("breed"), fieldValue("breed_variant"),
        fieldValue("age"), fieldValue("comment")
      ).run();

      return webApiResponse({ ok: true, id: Number(result.meta.last_row_id) }, 201);
    }

    const coverPhotoImageMatch = path.match(/^\/api\/pet-cover-photos\/(\d+)\/image$/);
    if (request.method === "GET" && coverPhotoImageMatch) {
      const photo = await env.DB.prepare("SELECT telegram_file_id FROM pet_cover_photos WHERE dog_id = ?")
        .bind(Number(coverPhotoImageMatch[1])).first();
      return readStoredPhotoResponse(env, photo?.telegram_file_id, "Главное фото питомца не найдено.", "Не удалось загрузить главное фото питомца.");
    }

    const petPhotoImageMatch = path.match(/^\/api\/grooming-photos\/(\d+)\/image$/);
    if (request.method === "GET" && petPhotoImageMatch) {
      const photo = await env.DB.prepare("SELECT telegram_file_id FROM grooming_card_photos WHERE id = ?")
        .bind(Number(petPhotoImageMatch[1])).first();
      return readStoredPhotoResponse(env, photo?.telegram_file_id, "Фотография не найдена.", "Не удалось загрузить фотографию.");
    }

    const visitPhotoImageMatch = path.match(/^\/api\/visit-photos\/(\d+)\/image$/);
    if (request.method === "GET" && visitPhotoImageMatch) {
      const photo = await env.DB.prepare("SELECT telegram_file_id FROM visit_photos WHERE id = ? AND photo_type IN ('before', 'after')")
        .bind(Number(visitPhotoImageMatch[1])).first();
      return readStoredPhotoResponse(env, photo?.telegram_file_id, "Фотография визита не найдена.", "Не удалось загрузить фотографию визита.");
    }

    const petCoverUploadMatch = path.match(/^\/api\/pets\/(\d+)\/cover-photo$/);
    if (request.method === "POST" && petCoverUploadMatch) {
      const petId = Number(petCoverUploadMatch[1]);
      const pet = await env.DB.prepare("SELECT id FROM dogs WHERE id = ? AND COALESCE(is_temporary, 0) = 0")
        .bind(petId).first();
      if (!pet) return webApiResponse({ error: "Питомец не найден." }, 404);
      let form;
      try { form = await request.formData(); }
      catch { return webApiResponse({ error: "Не удалось прочитать главное фото." }, 400); }
      const photoFile = form.get("photo");
      if (!photoFile || typeof photoFile.arrayBuffer !== "function") return webApiResponse({ error: "Выбери главное фото питомца." }, 400);
      if (!String(photoFile.type || "").startsWith("image/")) return webApiResponse({ error: "Нужно выбрать файл изображения." }, 415);
      if (photoFile.size > 10 * 1024 * 1024) return webApiResponse({ error: "Размер фотографии должен быть не больше 10 МБ." }, 413);
      const stored = await savePhotoToR2(env, "covers/" + petId, photoFile);
      if (stored.error) return webApiResponse({ error: stored.error }, stored.status);
      await env.DB.prepare(`
        INSERT INTO pet_cover_photos (dog_id, telegram_file_id, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(dog_id) DO UPDATE SET
          telegram_file_id = excluded.telegram_file_id,
          updated_at = CURRENT_TIMESTAMP
      `).bind(petId, stored.storedValue).run();
      return webApiResponse({ ok: true, petId, message: "Главное фото сохранено." }, 201);
    }

    const petPhotosMatch = path.match(/^\/api\/pets\/(\d+)\/grooming-photos$/);
    if (request.method === "POST" && petPhotosMatch) {
      const petId = Number(petPhotosMatch[1]);
      const pet = await env.DB.prepare("SELECT id, name, species, breed FROM dogs WHERE id = ? AND COALESCE(is_temporary, 0) = 0")
        .bind(petId).first();
      if (!pet) return webApiResponse({ error: "Питомец не найден." }, 404);
      if (!shouldShowWebGroomingCard(pet)) return webApiResponse({ error: "Фото к карте стрижки недоступны для этого питомца." }, 400);
      let form;
      try { form = await request.formData(); }
      catch { return webApiResponse({ error: "Не удалось прочитать фотографию." }, 400); }
      const photoFile = form.get("photo");
      if (!photoFile || typeof photoFile.arrayBuffer !== "function") return webApiResponse({ error: "Выбери фотографию." }, 400);
      if (!String(photoFile.type || "").startsWith("image/")) return webApiResponse({ error: "Нужно выбрать файл изображения." }, 415);
      if (photoFile.size > 10 * 1024 * 1024) return webApiResponse({ error: "Размер фотографии должен быть не больше 10 МБ." }, 413);
      const key = "grooming/" + petId + "/" + crypto.randomUUID();
      const stored = await savePhotoToR2(env, key, photoFile);
      if (stored.error) return webApiResponse({ error: stored.error }, stored.status);
      const caption = String(form.get("caption") || "").trim().slice(0, 1000) || null;
      await env.DB.prepare("INSERT INTO grooming_card_photos (dog_id, telegram_file_id, caption) VALUES (?, ?, ?)")
        .bind(petId, stored.storedValue, caption).run();
      return webApiResponse({ ok: true, petId, caption });
    }

    const beforeVisitPhotosMatch = path.match(/^\/api\/appointments\/(\d+)\/before-photos$/);
    if (request.method === "POST" && beforeVisitPhotosMatch) {
      const appointmentId = Number(beforeVisitPhotosMatch[1]);
      const appointment = await env.DB.prepare("SELECT id, status FROM appointments WHERE id = ?").bind(appointmentId).first();
      if (!appointment) return webApiResponse({ error: "Визит не найден." }, 404);
      if (["cancelled", "no_show"].includes(appointment.status)) return webApiResponse({ error: "Для отменённой записи фото не добавляются." }, 409);
      let form;
      try { form = await request.formData(); }
      catch { return webApiResponse({ error: "Не удалось прочитать фотографию." }, 400); }
      const photoFile = form.get("photo");
      if (!photoFile || typeof photoFile.arrayBuffer !== "function") return webApiResponse({ error: "Выбери фотографию." }, 400);
      if (!String(photoFile.type || "").startsWith("image/")) return webApiResponse({ error: "Нужно выбрать файл изображения." }, 415);
      if (photoFile.size > 10 * 1024 * 1024) return webApiResponse({ error: "Размер фотографии должен быть не больше 10 МБ." }, 413);
      const key = "visits/" + appointmentId + "/before/" + crypto.randomUUID();
      const stored = await savePhotoToR2(env, key, photoFile);
      if (stored.error) return webApiResponse({ error: stored.error }, stored.status);
      const caption = String(form.get("caption") || "").trim().slice(0, 1000) || null;
      const inserted = await env.DB.prepare("INSERT INTO visit_photos (appointment_id, photo_type, telegram_file_id, caption) VALUES (?, 'before', ?, ?)").bind(appointmentId, stored.storedValue, caption).run();
      return webApiResponse({ ok: true, appointmentId, photoId: Number(inserted.meta.last_row_id), message: "Фото до визита сохранено." }, 201);
    }
    const afterVisitPhotosMatch = path.match(/^\/api\/appointments\/(\d+)\/after-photos$/);
    if (request.method === "POST" && afterVisitPhotosMatch) {
      const appointmentId = Number(afterVisitPhotosMatch[1]);
      const appointment = await env.DB.prepare("SELECT id, status FROM appointments WHERE id = ?")
        .bind(appointmentId).first();
      if (!appointment) return webApiResponse({ error: "Визит не найден." }, 404);
      if (appointment.status !== "completed") return webApiResponse({ error: "Добавить фото после визита можно после его завершения." }, 409);
      let form;
      try { form = await request.formData(); }
      catch { return webApiResponse({ error: "Не удалось прочитать фотографию." }, 400); }
      const photoFile = form.get("photo");
      if (!photoFile || typeof photoFile.arrayBuffer !== "function") return webApiResponse({ error: "Выбери фотографию." }, 400);
      if (!String(photoFile.type || "").startsWith("image/")) return webApiResponse({ error: "Нужно выбрать файл изображения." }, 415);
      if (photoFile.size > 10 * 1024 * 1024) return webApiResponse({ error: "Размер фотографии должен быть не больше 10 МБ." }, 413);
      const key = "visits/" + appointmentId + "/" + crypto.randomUUID();
      const stored = await savePhotoToR2(env, key, photoFile);
      if (stored.error) return webApiResponse({ error: stored.error }, stored.status);
      const caption = String(form.get("caption") || "").trim().slice(0, 1000) || null;
      const inserted = await env.DB.prepare("INSERT INTO visit_photos (appointment_id, photo_type, telegram_file_id, caption) VALUES (?, 'after', ?, ?)")
        .bind(appointmentId, stored.storedValue, caption).run();
      return webApiResponse({ ok: true, appointmentId, photoId: Number(inserted.meta.last_row_id), message: "Фото после визита сохранено." }, 201);
    }

    const cardEditMatch = path.match(/^\/api\/pets\/(\d+)\/grooming-card$/);
    if (request.method === "POST" && cardEditMatch) {
      const petId = Number(cardEditMatch[1]);
      const pet = await env.DB.prepare(`
        SELECT id, species
        FROM dogs
        WHERE id = ? AND COALESCE(is_temporary, 0) = 0
      `).bind(petId).first();

      if (!pet) return webApiResponse({ error: "Питомец не найден." }, 404);
      if (pet.species !== "dog") return webApiResponse({ error: "Карта стрижки доступна только для собак." }, 400);

      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать данные карты." }, 400);
      }

      const fields = ["body_length", "legs_length"];
      const card = {};
      for (const field of fields) {
        card[field] = String(body[field] || "").trim().slice(0, 500);
      }

      await saveGroomingCard(env, petId, card);
      return webApiResponse({ ok: true });
    }

    if (request.method === "GET" && path === "/api/service-time-stats") {
      const result = await env.DB.prepare(`
        SELECT a.appointment_date, a.procedures, a.actual_duration_minutes,
               d.breed, d.breed_variant
        FROM appointments a
        JOIN dogs d ON d.id = a.dog_id
        WHERE a.status = 'completed'
          AND COALESCE(a.actual_duration_minutes, 0) > 0
          AND TRIM(COALESCE(d.breed, '')) <> ''
          AND TRIM(COALESCE(a.procedures, '')) <> ''
        ORDER BY a.appointment_date DESC, a.id DESC
      `).all();

      const groups = new Map();
      let visitsCount = 0;
      for (const visit of result.results || []) {
        const breed = String(visit.breed || "").trim();
        const rawVariant = String(visit.breed_variant || "").trim();
        const variantAlreadyInBreed = rawVariant &&
          breed.toLocaleLowerCase("ru-RU").includes(rawVariant.toLocaleLowerCase("ru-RU"));
        const variantLabel = rawVariant && !variantAlreadyInBreed
          ? rawVariant.charAt(0).toLocaleUpperCase("ru-RU") + rawVariant.slice(1)
          : "";
        const breedLabel = [breed, variantLabel].filter(Boolean).join(" ");
        const duration = Number(visit.actual_duration_minutes || 0);
        const firstProcedure = String(visit.procedures || "").split(";")[0].trim();
        const separator = firstProcedure.indexOf(":");
        const rawService = (separator >= 0 ? firstProcedure.slice(0, separator) : firstProcedure).trim();
        const service = /^комплекс$/i.test(rawService) ? "По красивой" : rawService;

        if (!breedLabel || !service || !Number.isFinite(duration) || duration <= 0) continue;
        if (service.toLocaleLowerCase("ru-RU").startsWith("корректировка итоговой суммы")) continue;

        const key = breedLabel.toLocaleLowerCase("ru-RU") + "::" + service.toLocaleLowerCase("ru-RU");
        let group = groups.get(key);
        if (!group) {
          group = { breed: breedLabel, service, totalMinutes: 0, visitsCount: 0, lastVisit: visit.appointment_date || null };
          groups.set(key, group);
        }
        group.totalMinutes += duration;
        group.visitsCount += 1;
        if (visit.appointment_date && (!group.lastVisit || visit.appointment_date > group.lastVisit)) {
          group.lastVisit = visit.appointment_date;
        }
        visitsCount += 1;
      }

      const stats = Array.from(groups.values()).map(group => ({
        breed: group.breed,
        service: group.service,
        averageMinutes: Math.round(group.totalMinutes / group.visitsCount),
        visitsCount: group.visitsCount,
        lastVisit: group.lastVisit
      })).sort((a, b) =>
        a.breed.localeCompare(b.breed, "ru") || a.service.localeCompare(b.service, "ru")
      );

      return webApiResponse({ stats, visitsCount });
    }

    if (request.method === "GET" && path === "/api/visits") {
      const requestedLimit = Number(url.searchParams.get("limit") || 50);
      const requestedOffset = Number(url.searchParams.get("offset") || 0);
      const limit = Number.isInteger(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 50;
      const offset = Number.isInteger(requestedOffset) ? Math.min(1000000, Math.max(0, requestedOffset)) : 0;
      const dogIdText = String(url.searchParams.get("dogId") || "").trim();
      const dogId = dogIdText ? Number(dogIdText) : 0;
      if (dogIdText && (!Number.isInteger(dogId) || dogId <= 0)) {
        return webApiResponse({ error: "Некорректный питомец." }, 400);
      }
      const searchName = String(url.searchParams.get("q") || "").trim().slice(0, 100);
      const requestedStatus = String(url.searchParams.get("status") || "").trim();
      const allowedStatuses = ["completed", "in_progress", "cancelled", "no_show"];
      const selectedMonth = String(url.searchParams.get("month") || "").trim();
      const filters = ["a.status IN ('completed', 'in_progress', 'cancelled', 'no_show')"];
      const filterBindings = [];
      if (dogId) {
        filters.push("a.dog_id = ?");
        filterBindings.push(dogId);
      }
      if (searchName) {
        filters.push("LOWER(d.name) LIKE LOWER(?)");
        filterBindings.push("%" + searchName + "%");
      }
      if (requestedStatus && requestedStatus !== "all") {
        if (!allowedStatuses.includes(requestedStatus)) {
          return webApiResponse({ error: "Некорректный фильтр статуса." }, 400);
        }
        filters.push("a.status = ?");
        filterBindings.push(requestedStatus);
      }
      if (selectedMonth) {
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
          return webApiResponse({ error: "Выбери корректный месяц." }, 400);
        }
        const [year, monthNumber] = selectedMonth.split("-").map(Number);
        const nextMonth = new Date(Date.UTC(year, monthNumber, 1));
        const nextMonthStart = nextMonth.getUTCFullYear() + "-" +
          String(nextMonth.getUTCMonth() + 1).padStart(2, "0") + "-01";
        filters.push("a.appointment_date >= ? AND a.appointment_date < ?");
        filterBindings.push(selectedMonth + "-01", nextMonthStart);
      }
      const whereSql = filters.join(" AND ");
      const countResult = await env.DB.prepare(
        "SELECT COUNT(*) AS total FROM appointments a JOIN dogs d ON d.id = a.dog_id WHERE " + whereSql
      ).bind(...filterBindings).first();
      const result = await env.DB.prepare(
        "SELECT a.id, a.dog_id, a.appointment_date, a.appointment_time, " +
        "a.status, a.procedures, a.actual_start_time, a.actual_end_time, " +
        "a.actual_duration_minutes, a.planned_duration_minutes, " +
        "d.name, d.breed, d.species, d.breed_variant, d.is_temporary, " +
        "COALESCE((SELECT SUM(e.earned) FROM earnings_entries e WHERE e.appointment_id = a.id), 0) AS earned " +
        "FROM appointments a JOIN dogs d ON d.id = a.dog_id " +
        "WHERE " + whereSql + " " +
        "ORDER BY a.appointment_date DESC, " +
        "COALESCE(a.actual_end_time, a.actual_start_time, a.appointment_time, '') DESC, a.id DESC " +
        "LIMIT ? OFFSET ?"
      ).bind(...filterBindings, limit, offset).all();
      const visits = result.results || [];
      const visitIds = visits.map(item => Number(item.id)).filter(Number.isFinite);
      let photosByVisit = Object.create(null);
      if (visitIds.length) {
        const placeholders = visitIds.map(() => "?").join(", ");
        const photoResult = await env.DB.prepare(
          "SELECT id, appointment_id, photo_type, caption, created_at FROM visit_photos " +
          "WHERE photo_type IN ('before', 'after') AND appointment_id IN (" + placeholders + ") " +
          "ORDER BY created_at DESC, id DESC"
        ).bind(...visitIds).all();
        for (const photo of photoResult.results || []) {
          const visitId = Number(photo.appointment_id);
          if (!photosByVisit[visitId]) photosByVisit[visitId] = [];
          photosByVisit[visitId].push(photo);
        }
      }
      const total = Number(countResult?.total || 0);
      return webApiResponse({
        visits: visits.map(item => ({
          ...item,
          photos: photosByVisit[Number(item.id)] || []
        })),
        total,
        limit,
        offset,
        hasMore: offset + visits.length < total
      });
    }

    const petMatch = path.match(/^\/api\/pets\/(\d+)$/);
    if (request.method === "POST" && petMatch) {
      const petId = Number(petMatch[1]);
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать карточку." }, 400);
      }

      const name = String(body.name || "").trim();
      const species = String(body.species || "");
      if (!name || name.length > 100) {
        return webApiResponse({ error: "Укажи имя питомца (до 100 символов)." }, 400);
      }
      if (!["dog", "cat"].includes(species)) {
        return webApiResponse({ error: "Выбери вид питомца." }, 400);
      }

      const fieldValue = key => String(body[key] || "").trim()
        .slice(0, key === "comment" ? 10000 : 500) || null;
      const updated = await env.DB.prepare(`
        UPDATE dogs
        SET name = ?, species = ?, breed = ?, breed_variant = ?, age = ?, comment = ?
        WHERE id = ? AND COALESCE(is_temporary, 0) = 0
      `).bind(
        name, species, fieldValue("breed"), fieldValue("breed_variant"),
        fieldValue("age"), fieldValue("comment"), petId
      ).run();

      if (!updated.meta?.changes) return webApiResponse({ error: "Карточка не найдена или не изменена." }, 404);
      return webApiResponse({ ok: true, id: petId });
    }

    if (request.method === "GET" && petMatch) {
      const petId = Number(petMatch[1]);
      const pet = await env.DB.prepare(`
        SELECT id, name, species, breed, breed_variant, age, comment
        FROM dogs
        WHERE id = ? AND COALESCE(is_temporary, 0) = 0
      `).bind(petId).first();

      if (!pet) return webApiResponse({ error: "Питомец не найден." }, 404);

      let groomingCard = null;
      if (pet.species === "dog") groomingCard = await getGroomingCard(env, petId);

      const photoResult = await env.DB.prepare(`
        SELECT id, caption, created_at
        FROM grooming_card_photos
        WHERE dog_id = ?
        ORDER BY id DESC
        LIMIT 12
      `).bind(petId).all();

      const photos = photoResult.results || [];
      const profilePhoto = await env.DB.prepare(`
        SELECT dog_id AS id, updated_at AS created_at
        FROM pet_cover_photos
        WHERE dog_id = ?
      `).bind(petId).first();
      const visitCoverPhoto = await env.DB.prepare(`
        SELECT vp.id, vp.caption, vp.created_at
        FROM visit_photos vp
        JOIN appointments a ON a.id = vp.appointment_id
        WHERE a.dog_id = ? AND vp.photo_type = 'after'
        ORDER BY vp.created_at DESC, vp.id DESC
        LIMIT 1
      `).bind(petId).first();

      return webApiResponse({
        pet,
        groomingCard,
        photoArchiveAllowed: shouldShowWebGroomingCard(pet),
        photos,
        profilePhoto: profilePhoto || null,
        visitCoverPhoto: visitCoverPhoto || null,
        groomingPhotoCount: photos.length
      });
    }

    if (request.method === "POST" && path === "/api/earnings/manual") {
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать данные услуги." }, 400);
      }
      const description = String(body.description || "").trim().slice(0, 120);
      const rawAmount = Number(body.amount);
      if (!description) {
        return webApiResponse({ error: "Укажи название услуги." }, 400);
      }
      if (!Number.isFinite(rawAmount) || rawAmount <= 0 || rawAmount > 100000) {
        return webApiResponse({ error: "Стоимость должна быть больше 0 и не превышать 100 000 ₽." }, 400);
      }
      const amount = Math.round(rawAmount * 100) / 100;
      const rate = rateForUnscheduled(description);
      const earned = Math.round(amount * rate) / 100;
      await env.DB.prepare(`
        INSERT INTO earnings_entries (
          service_date, description, amount, rate, earned, source, source_id
        ) VALUES (?, ?, ?, ?, ?, 'plus', ?)
      `).bind(
        date,
        description,
        amount,
        rate,
        earned,
        crypto.randomUUID()
      ).run();
      return webApiResponse({
        ok: true,
        serviceDate: date,
        description,
        amount,
        rate,
        earned
      });
    }

    if (request.method === "GET" && path === "/api/earnings/archive-import-status") {
      const row = await env.DB.prepare(
        "SELECT setting_value FROM assistant_settings WHERE setting_key = ?"
      ).bind("historical_earnings_import_2026_v1").first();
      let status = null;
      try { status = row ? JSON.parse(row.setting_value) : null; } catch {}
      return webApiResponse({ status });
    }

    if (request.method === "GET" && path === "/api/earnings") {
      const range = url.searchParams.get("range") || "today";
      let start = date;
      let end = date;
      let periodLabel = "Сегодня";

      const currentYear = Number(date.slice(0, 4));
      const selectedYear = Number(url.searchParams.get("year") || currentYear);
      const selectedMonth = Number(url.searchParams.get("month") || date.slice(5, 7));
      if (!Number.isInteger(selectedYear) || selectedYear < 2000 || selectedYear > currentYear + 1 ||
          !Number.isInteger(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
        return webApiResponse({ error: "Некорректный месяц или год." }, 400);
      }
      const selectedMonthText = String(selectedMonth).padStart(2, "0");
      const selectedMonthStart = String(selectedYear) + "-" + selectedMonthText + "-01";
      const selectedMonthEndDay = new Date(Date.UTC(selectedYear, selectedMonth, 0)).getUTCDate();
      const selectedMonthEnd = String(selectedMonthEndDay).padStart(2, "0");
      const selectedMonthEndDate = String(selectedYear) + "-" + selectedMonthText + "-" + selectedMonthEnd;
      const currentMonth = Number(date.slice(5, 7));
      if ((range === "first-half" || range === "second-half") &&
          (selectedYear !== currentYear || selectedMonth !== currentMonth)) {
        return webApiResponse({ error: "Разделение на две половины доступно только для текущего месяца." }, 400);
      }

      if (range === "year") {
        start = String(selectedYear) + "-01-01";
        end = String(selectedYear) + "-12-31";
        periodLabel = String(selectedYear) + " год";
      } else if (range === "month") {
        start = selectedMonthStart;
        end = selectedMonthEndDate;
        periodLabel = "01." + selectedMonthText + "–" + selectedMonthEnd + "." + selectedMonthText + "." + selectedYear;
      } else if (range === "first-half") {
        start = selectedMonthStart;
        end = String(selectedYear) + "-" + selectedMonthText + "-15";
        periodLabel = "01–15." + selectedMonthText + "." + selectedYear;
      } else if (range === "second-half") {
        start = String(selectedYear) + "-" + selectedMonthText + "-16";
        end = selectedMonthEndDate;
        periodLabel = "16–" + selectedMonthEnd + "." + selectedMonthText + "." + selectedYear;
      } else if (range === "today") {
        start = date;
        end = date;
      } else {
        return webApiResponse({ error: "Неизвестный период." }, 400);
      }

      const summary = await env.DB.prepare(`
        SELECT COUNT(*) AS count, COALESCE(SUM(earned), 0) AS totalEarned
        FROM earnings_entries
        WHERE service_date >= ? AND service_date <= ?
      `).bind(start, end).first();

      const entriesResult = await env.DB.prepare(`
        SELECT id, service_date, description, amount, rate, earned, appointment_id, source
        FROM earnings_entries
        WHERE service_date >= ? AND service_date <= ?
        ORDER BY service_date DESC, id DESC
        LIMIT ${range === "year" ? 1000 : 500}
      `).bind(start, end).all();

      let months = [];
      if (range === "year") {
        const monthlyResult = await env.DB.prepare(
          "SELECT CAST(substr(service_date, 6, 2) AS INTEGER) AS month, " +
          "COUNT(*) AS count, COALESCE(SUM(earned), 0) AS totalEarned " +
          "FROM earnings_entries WHERE service_date >= ? AND service_date <= ? " +
          "GROUP BY substr(service_date, 1, 7) ORDER BY substr(service_date, 1, 7)"
        ).bind(start, end).all();
        months = monthlyResult.results || [];
      }

      return webApiResponse({
        range,
        start,
        end,
        periodLabel,
        count: Number(summary?.count || 0),
        totalEarned: Number(summary?.totalEarned || 0),
        months,
        entries: entriesResult.results || []
      });
    }

    const editVisitStartTimeMatch = path.match(/^\/api\/visits\/(\d+)\/start-time$/);
    if (request.method === "PUT" && editVisitStartTimeMatch) {
      const appointmentId = Number(editVisitStartTimeMatch[1]);
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать новое время начала." }, 400);
      }

      const startTime = String(body.startTime || "").trim();
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
        return webApiResponse({ error: "Укажи корректное время начала в формате ЧЧ:ММ." }, 400);
      }

      const appointment = await env.DB.prepare(`
        SELECT id, appointment_date, appointment_time, actual_start_time,
               actual_duration_minutes, planned_duration_minutes,
               status, actual_end_time
        FROM appointments
        WHERE id = ?
      `).bind(appointmentId).first();

      if (!appointment) {
        return webApiResponse({ error: "Визит не найден." }, 404);
      }

      if (["scheduled", "waiting"].includes(appointment.status)) {
        const slotCheck = await validateWebAppointmentSlot(
          env,
          appointment.appointment_date,
          startTime,
          appointmentId,
          Number(appointment.planned_duration_minutes || 0)
        );
        if (slotCheck.error) {
          return webApiResponse({ error: slotCheck.error }, slotCheck.status || 400);
        }

        await env.DB.prepare(`
          UPDATE appointments
          SET appointment_time = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status IN ('scheduled', 'waiting')
        `).bind(startTime, appointmentId).run();

        return webApiResponse({
          ok: true,
          appointmentId,
          startTime,
          timeField: "appointment_time"
        });
      }

      if (!["in_progress", "completed"].includes(appointment.status)) {
        return webApiResponse({ error: "Время начала нельзя изменить для этого статуса визита." }, 409);
      }

      if (appointment.status === "completed") {
        const newStartMs = localDateTimeMs(appointment.appointment_date, startTime);
        let endMs;

        if (appointment.actual_end_time) {
          const endTime = String(appointment.actual_end_time || "").slice(0, 5);
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
            return webApiResponse({ error: "Не удалось определить время окончания визита." }, 400);
          }
          endMs = localDateTimeMs(appointment.appointment_date, endTime);
        } else {
          // Older completed records may not have actual_end_time stored.
          // Reconstruct the end instant from the original start and saved duration.
          const oldStartTime = String(
            appointment.actual_start_time || appointment.appointment_time || ""
          ).slice(0, 5);
          const oldDuration = Number(appointment.actual_duration_minutes || 0);
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(oldStartTime) ||
              !Number.isFinite(oldDuration) || oldDuration <= 0) {
            return webApiResponse({
              error: "У этого визита не сохранено время окончания или длительность, поэтому длительность нельзя пересчитать автоматически."
            }, 400);
          }
          endMs = localDateTimeMs(appointment.appointment_date, oldStartTime) + oldDuration * 60000;
        }

        if (!Number.isFinite(newStartMs) || !Number.isFinite(endMs) || newStartMs >= endMs) {
          return webApiResponse({ error: "Время начала должно быть раньше времени окончания визита." }, 400);
        }

        const durationMinutes = Math.round((endMs - newStartMs) / 60000);
        await env.DB.prepare(`
          UPDATE appointments
          SET actual_start_time = ?,
              actual_duration_minutes = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status = 'completed'
        `).bind(startTime, durationMinutes, appointmentId).run();

        return webApiResponse({
          ok: true,
          appointmentId,
          startTime,
          timeField: "actual_start_time",
          actualDurationMinutes: durationMinutes
        });
      }

      await env.DB.prepare(`
        UPDATE appointments
        SET actual_start_time = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'in_progress'
      `).bind(startTime, appointmentId).run();

      return webApiResponse({
        ok: true,
        appointmentId,
        startTime,
        timeField: "actual_start_time"
      });
    }

const startVisitMatch = path.match(/^\/api\/visits\/(\d+)\/start$/);
    if (request.method === "POST" && startVisitMatch) {
      const appointmentId = Number(startVisitMatch[1]);
      const appointment = await env.DB.prepare(`
        SELECT id, dog_id, appointment_date, appointment_time, status
        FROM appointments
        WHERE id = ?
      `).bind(appointmentId).first();

      if (!appointment) return webApiResponse({ error: "Запись не найдена." }, 404);
      if (appointment.appointment_date !== date) {
        return webApiResponse({ error: "Из веб-приложения можно запускать только сегодняшние записи." }, 400);
      }
      if (!["scheduled", "waiting"].includes(appointment.status)) {
        return webApiResponse({ error: "Эта запись уже не ожидает начала визита." }, 409);
      }

      const now = localTime();
      const scheduledMs = localDateTimeMs(appointment.appointment_date, appointment.appointment_time || now);
      const nowMs = localDateTimeMs(date, now);
      const startTime = nowMs >= scheduledMs && nowMs <= scheduledMs + 10 * 60 * 1000
        ? appointment.appointment_time
        : now;
      await env.DB.prepare(`
        UPDATE appointments
        SET status = 'in_progress', actual_start_time = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status IN ('scheduled', 'waiting')
      `).bind(startTime, appointmentId).run();
      await env.DB.prepare(`
        INSERT OR IGNORE INTO assistant_appointment_state (appointment_id)
        VALUES (?)
      `).bind(appointmentId).run();
      const updated = await env.DB.prepare(`
        SELECT status, actual_start_time
        FROM appointments
        WHERE id = ?
      `).bind(appointmentId).first();

      if (updated?.status !== "in_progress") {
        return webApiResponse({ error: "Не удалось начать визит. Обнови страницу и проверь запись." }, 409);
      }

      return webApiResponse({ ok: true, appointmentId, startTime: updated.actual_start_time });
    }

    const finishVisitMatch = path.match(/^\/api\/visits\/(\d+)\/finish$/);
    if (request.method === "POST" && finishVisitMatch) {
      const appointmentId = Number(finishVisitMatch[1]);
      let body;
      try {
        body = await request.json();
      } catch {
        return webApiResponse({ error: "Не удалось прочитать услуги." }, 400);
      }
      const result = await finishWebVisitWithoutBot(env, appointmentId, date, body);
      if (result.error) return webApiResponse({ error: result.error }, result.status || 400);
      return webApiResponse({
        ok: true,
        appointmentId,
        actualDurationMinutes: result.actualDurationMinutes,
        finalTotal: result.finalTotal,
        earned: result.earned
      });
    }

    if (request.method === "POST" && path === "/api/day-off") {
      await env.DB.prepare(`
        INSERT INTO assistant_settings (setting_key, setting_value, updated_at)
        VALUES (?, '1', CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = '1', updated_at = CURRENT_TIMESTAMP
      `).bind("day_off_" + date).run();
      return webApiResponse({ ok: true, dayOff: true, date, dateDisplay: todayDisplay });
    }

    return webApiResponse({ error: "Метод или раздел не найден." }, 404);
  } catch (error) {
    console.error("Web app API error:", error);
    return webApiResponse({ error: "Не удалось выполнить запрос. Попробуй ещё раз." }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/manifest.webmanifest") {
      const manifest = {
        id: "/",
        name: "Pretty Dogs — Groomer Assistant",
        short_name: "Pretty Dogs",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/apple-touch-icon-v3.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any"
          }
        ]
      };
      return new Response(JSON.stringify(manifest), {
        status: 200,
        headers: {
          "Content-Type": "application/manifest+json; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    if (request.method === "GET" && url.pathname === "/apple-touch-icon-v3.png") {
      const asset = await fetch(
        "https://raw.githubusercontent.com/Milya461/groomer-assistant/08c83b74d5252e404fd9f8d98e521079fa8e6d0b/icons/apple-touch-icon.png"
      );
      if (!asset.ok) {
        return new Response("App icon unavailable.", {
          status: 502,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      return new Response(asset.body, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return new Response("Pretty Dogs web app is running.", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/app")) {
      return new Response(WEB_APP_HTML, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer"
        }
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return handleWebApi(request, env);
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};
