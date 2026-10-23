export const WEB_APP_HTML = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<meta name="referrer" content="no-referrer">
<title>Pretty Dogs — Groomer Assistant</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root{color-scheme:light;--ink:#111;--muted:#737373;--line:#e5e5e5;--soft:#f6f6f6;--white:#fff;--black:#111}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--white);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
body{padding:0 0 env(safe-area-inset-bottom)}
button,input{font:inherit}
button{cursor:pointer}
.shell{max-width:840px;margin:0 auto;padding:0 18px 32px}
header{padding:24px 0 22px;border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:11px;letter-spacing:.15em;font-weight:750}
.brand .subbrand{font-weight:500;color:var(--muted);letter-spacing:.08em}
h1{font-size:29px;line-height:1.15;letter-spacing:-.045em;margin:30px 0 6px;font-weight:750}
.subtitle{font-size:13px;color:var(--muted)}
.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:18px 0 24px;padding:4px;background:#f1f1f1;border-radius:12px}
.tab{border:0;background:transparent;color:#555;padding:11px 7px;border-radius:9px;font-size:13px;font-weight:650}
.tab.active{background:#fff;color:#111;box-shadow:0 1px 3px #00000012}
main{min-height:260px}
.loading,.empty,.notice{padding:28px 18px;text-align:center;border:1px solid var(--line);border-radius:14px;color:var(--muted);font-size:14px}
.notice{color:#222;text-align:left;line-height:1.55}
.error{margin:10px 0;padding:12px 14px;border:1px solid #d5d5d5;border-radius:10px;font-size:13px}
.hero{border:1px solid var(--line);border-radius:16px;padding:21px;margin-bottom:12px}
.eyebrow{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}
.money{font-size:37px;letter-spacing:-.055em;font-weight:760;margin:9px 0 3px;font-variant-numeric:tabular-nums}
.smallmuted{color:var(--muted);font-size:12px}
.metricgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 25px}
.metric{border:1px solid var(--line);border-radius:13px;padding:14px 13px;min-width:0}
.metric .value{font-size:23px;font-weight:750;letter-spacing:-.04em;margin-bottom:5px}
.metric .label{font-size:11px;color:var(--muted)}
.sectionhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:25px 0 11px}
h2{font-size:17px;letter-spacing:-.025em;margin:0;font-weight:750}
.count{font-size:12px;color:var(--muted)}
.list{border-top:1px solid var(--line)}
.item{display:flex;align-items:center;gap:13px;padding:15px 2px;border-bottom:1px solid var(--line);min-width:0}
.time{flex:0 0 51px;font-size:13px;font-weight:750;font-variant-numeric:tabular-nums}
.itembody{min-width:0;flex:1}
.itemtitle{font-size:14px;font-weight:650;overflow-wrap:anywhere}
.itemmeta{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.35}
.status{font-size:10px;text-transform:uppercase;letter-spacing:.045em;border:1px solid #d8d8d8;padding:5px 7px;border-radius:6px;white-space:nowrap;color:#444}
.btn{border:1px solid var(--black);background:var(--black);color:#fff;border-radius:10px;padding:12px 15px;font-size:13px;font-weight:700}
.btn.secondary{background:#fff;color:#111;border-color:var(--line)}
.btn.full{width:100%;margin-top:20px}
.btn:disabled{opacity:.5;cursor:default}
.searchbar{display:flex;gap:8px;margin-bottom:15px}
.searchbar input,.field input,.field textarea,.range{width:100%;border:1px solid var(--line);background:#fff;color:#111;border-radius:10px;padding:12px 13px;outline:none;font-size:14px}
.searchbar input:focus,.field input:focus,.field textarea:focus{border-color:#777}
.searchbar button{border:1px solid #111;background:#111;color:#fff;border-radius:10px;padding:0 16px;font-size:13px;font-weight:700}
.petrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 1px;border-bottom:1px solid var(--line);cursor:pointer}
.petrow:first-child{border-top:1px solid var(--line)}
.petname{font-size:15px;font-weight:700}
.petbreed{font-size:12px;color:var(--muted);margin-top:4px}
.arrow{font-size:21px;color:#777}
.back{border:0;padding:0;margin:0 0 19px;background:transparent;color:#555;font-size:13px}
.detailtitle{font-size:25px;font-weight:760;letter-spacing:-.04em;margin:0 0 6px}
.detailbreed{font-size:13px;color:var(--muted);margin-bottom:22px}
.detailsection{padding:17px 0;border-top:1px solid var(--line)}
.detailsection h3{font-size:12px;color:var(--muted);font-weight:750;letter-spacing:.09em;text-transform:uppercase;margin:0 0 12px}
.detailrow{display:grid;grid-template-columns:42% 1fr;gap:14px;padding:8px 0;font-size:13px;line-height:1.45}
.detailrow .key{color:var(--muted)}
.detailrow .val{white-space:pre-wrap;overflow-wrap:anywhere}
.periods{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 17px}
.pill{padding:8px 12px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:12px;color:#555}
.pill.active{background:#111;border-color:#111;color:#fff}
.earningrow{display:grid;grid-template-columns:1fr auto;gap:10px;padding:14px 1px;border-bottom:1px solid var(--line)}
.earningname{font-size:13px;font-weight:650}
.earningdate{font-size:11px;color:var(--muted);margin-top:5px}
.earningamount{text-align:right;font-size:13px;font-weight:750;white-space:nowrap}
.earningbase{font-size:11px;color:var(--muted);margin-top:5px}
footer{border-top:1px solid var(--line);margin-top:30px;padding-top:15px;color:#999;font-size:10px;letter-spacing:.11em;display:flex;justify-content:space-between}
.inlineaction{display:inline-block;margin-top:8px;padding:7px 10px;border:1px solid #d8d8d8;border-radius:8px;background:#fff;color:#111;font-size:11px;font-weight:700}
.formtextarea{width:100%;min-height:110px;resize:vertical;border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:13px;line-height:1.5;color:#111;background:#fff}
.cardform{margin-top:15px}
.cardform .field{display:block;margin:12px 0}
.petform{margin-top:14px}
.petform .field{display:block;margin:12px 0}
.petform .field span{display:block;font-size:12px;color:var(--muted);margin-bottom:6px}
.petform .field input,.petform .field select{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff;color:#111;font:inherit;font-size:14px}

.cardform .field span{display:block;font-size:12px;color:var(--muted);margin-bottom:6px}
.photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0 15px}
.photo-tile{aspect-ratio:1;overflow:hidden;border-radius:8px;border:1px solid var(--line);background:var(--soft);display:flex;align-items:center;justify-content:center}
.photo-tile img{width:100%;height:100%;object-fit:cover}
.filelabel{display:inline-flex;position:relative;overflow:hidden;align-items:center;justify-content:center}
.filelabel input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer}
button:focus-visible{outline:2px solid #111;outline-offset:2px}
@media(min-width:620px){.shell{padding-left:26px;padding-right:26px}header{padding-top:30px}h1{font-size:34px}.hero{padding:25px}.metricgrid{gap:12px}.metric{padding:17px}}
</style>
</head>
<body>
<div class="shell">
<header>
  <div class="brand"><span>PRETTY DOGS</span><span class="subbrand">GROOMER ASSISTANT</span></div>
  <h1 id="page-title">Сегодня</h1>
  <div class="subtitle" id="page-subtitle">Рабочая панель</div>
</header>
<nav class="tabs" aria-label="Разделы">
  <button class="tab active" data-screen="today">Сегодня</button>
  <button class="tab" data-screen="pets">Питомцы</button>
  <button class="tab" data-screen="earnings">Заработок</button>
</nav>
<main id="content"><div class="loading">Загружаю данные…</div></main>
<footer><span>PRETTY DOGS</span><span>МИНИМУМ ЛИШНЕГО</span></footer>
</div>
<script>
(function(){
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const initData = tg ? tg.initData : "";
  const content = document.getElementById("content");
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");
  let currentScreen = "today";
  let petQuery = "";
  let earningsRange = "today";
  let lastDashboard = null;
  let objectUrls = [];

  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor("#ffffff");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#ffffff");
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
    });
  }
  function money(value) {
    return new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(Number(value || 0)) + " ₽";
  }
  function dateText(value) {
    if (!value || value.length < 10) return value || "";
    return value.slice(8,10) + "." + value.slice(5,7) + "." + value.slice(0,4);
  }
  function setHead(name, sub) {
    title.textContent = name;
    subtitle.textContent = sub || "";
    const activeScreen = currentScreen === "pet-detail" ? "pets" : currentScreen;
    document.querySelectorAll(".tab").forEach(function(tab){
      tab.classList.toggle("active", tab.dataset.screen === activeScreen);
    });
  }
  async function api(path, options) {
    if (!initData) throw new Error("Открой приложение через Telegram: чат с ботом → /start → «Открыть приложение».");
    const opts = options || {};
    const headers = Object.assign({},opts.headers || {},{"Authorization":"tma " + initData});
    if (opts.body && !(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
    const response = await fetch(path,Object.assign({},opts,{headers:headers,credentials:"same-origin",cache:"no-store"}));
    let data = {};
    try { data = await response.json(); } catch(e) {}
    if (!response.ok) throw new Error(data.error || "Не удалось загрузить данные.");
    return data;
  }
  function showError(error) {
    content.innerHTML = '<div class="notice"><strong>Не удалось открыть приложение</strong><p>' + esc(error && error.message ? error.message : "Попробуй открыть его ещё раз.") + '</p></div>';
  }
  function statusText(status) {
    return ({scheduled:"Запланирован",waiting:"Ожидаем",in_progress:"В работе",completed:"Завершён",cancelled:"Отменён",rescheduled:"Перенесён",skipped:"Пропущен"})[status] || status || "—";
  }
  function rowForVisit(item) {
    const petLabel = item.name + (item.breed ? " · " + item.breed : "");
    let action = "";
    if (item.status === "scheduled" || item.status === "waiting") {
      action = '<button class="inlineaction" data-start-visit="' + Number(item.id) + '">Начать визит</button>';
    } else if (item.status === "in_progress") {
      action = '<button class="inlineaction" data-finish-visit="' + Number(item.id) + '" data-pet-name="' + esc(item.name) + '">Завершить</button>';
    }
    return '<div class="item"><div class="time">' + esc(item.appointment_time || "—") + '</div><div class="itembody"><div class="itemtitle">' + esc(petLabel) + '</div><div class="itemmeta">' + esc(statusText(item.status)) + (item.actual_duration_minutes ? " · " + esc(formatDuration(item.actual_duration_minutes)) : "") + '</div>' + action + '</div><span class="status">' + esc(statusText(item.status)) + '</span></div>';
  }
  function formatDuration(value) {
    const n = Math.max(0,Number(value || 0));
    const h = Math.floor(n/60), m = n%60;
    if (h && m) return h + " ч " + m + " мин";
    if (h) return h + " ч";
    return m + " мин";
  }
  async function renderToday() {
    currentScreen = "today";
    setHead("Сегодня","Рабочая панель");
    content.innerHTML = '<div class="loading">Загружаю данные…</div>';
    const data = await api("/api/dashboard");
    lastDashboard = data;
    const counts = data.counts || {};
    const dayOff = !!data.dayOff;
    const rows = data.queue || [];
    content.innerHTML =
      '<section class="hero"><div class="eyebrow">Заработок сегодня</div><div class="money">' + money(data.earnedToday) + '</div><div class="smallmuted">' + esc(data.dateDisplay) + '</div></section>' +
      '<div class="metricgrid">' +
        '<div class="metric"><div class="value">' + Number(counts.total || 0) + '</div><div class="label">Записей</div></div>' +
        '<div class="metric"><div class="value">' + Number(counts.inProgress || 0) + '</div><div class="label">В работе</div></div>' +
        '<div class="metric"><div class="value">' + Number(counts.completed || 0) + '</div><div class="label">Завершено</div></div>' +
      '</div>' +
      '<div class="sectionhead"><h2>Очередь на сегодня</h2><span class="count">' + rows.length + '</span></div>' +
      (rows.length ? '<div class="list">' + rows.map(rowForVisit).join("") + '</div>' : '<div class="empty">На сегодня записей нет</div>') +
      '<div id="visit-action-panel"></div>' +
      '<button class="btn full" id="day-off" ' + (dayOff ? 'disabled' : '') + '>' + (dayOff ? 'Сегодня отмечено как выходной' : 'Сегодня не работаю') + '</button>' +
      '<div class="smallmuted" style="margin-top:9px;line-height:1.45">' + (dayOff ? 'Автоматические напоминания на сегодня отключены.' : 'Отметь выходной, чтобы отключить автоматические рабочие и клиентские напоминания на сегодня. Записи не удаляются.') + '</div>';

    const dayOffButton = document.getElementById("day-off");
    if (dayOffButton && !dayOff) dayOffButton.addEventListener("click", async function(){
      dayOffButton.disabled = true;
      dayOffButton.textContent = "Сохраняю…";
      try {
        await api("/api/day-off",{method:"POST",body:"{}"});
        await renderToday();
      } catch(error) { showError(error); }
    });

    content.querySelectorAll("[data-start-visit]").forEach(function(button) {
      button.addEventListener("click", async function() {
        button.disabled = true;
        button.textContent = "Запускаю…";
        try {
          await api("/api/visits/" + button.dataset.startVisit + "/start", {
            method: "POST",
            body: "{}"
          });
          await renderToday();
        } catch(error) {
          showError(error);
        }
      });
    });

    content.querySelectorAll("[data-finish-visit]").forEach(function(button) {
      button.addEventListener("click", function() {
        const panel = document.getElementById("visit-action-panel");
        panel.innerHTML =
          '<section class="hero actionform">' +
            '<div class="eyebrow">Завершение визита</div>' +
            '<h2 style="margin:8px 0 6px">' + esc(button.dataset.petName) + '</h2>' +
            '<div class="smallmuted" style="margin-bottom:14px">Введи выполненные услуги и стоимость — по одной на строку.</div>' +
            '<form id="finish-visit-form">' +
              '<textarea class="formtextarea" id="finish-services" rows="4" required placeholder="Комплекс 3200&#10;Когти 300"></textarea>' +
              '<button class="btn full" id="finish-save">Сохранить услуги и завершить</button>' +
              '<button class="btn secondary full" type="button" id="finish-cancel">Отмена</button>' +
            '</form>' +
          '</section>';
        document.getElementById("finish-cancel").addEventListener("click",function(){panel.innerHTML="";});
        document.getElementById("finish-visit-form").addEventListener("submit",async function(event) {
          event.preventDefault();
          const saveButton = document.getElementById("finish-save");
          const servicesText = document.getElementById("finish-services").value;
          saveButton.disabled = true;
          saveButton.textContent = "Сохраняю…";
          try {
            await api("/api/visits/" + button.dataset.finishVisit + "/finish", {
              method: "POST",
              body: JSON.stringify({servicesText:servicesText})
            });
            await renderToday();
          } catch(error) {
            showError(error);
          }
        });
        panel.scrollIntoView({behavior:"smooth",block:"start"});
      });
    });
  }
  const PET_CARD_FIELDS = [
    ["name","Имя","input"],
    ["species","Вид","select"],
    ["breed","Порода","input"],
    ["age","Возраст","input"],
    ["coat_features","Особенности шерсти","textarea"],
    ["matting_tendency","Склонность к колтунам","textarea"],
    ["sensitive_areas","Чувствительные зоны","textarea"],
    ["clipper_reaction","Реакция на машинку","textarea"],
    ["dryer_reaction","Реакция на фен","textarea"],
    ["nail_clipper_reaction","Реакция на когтерез","textarea"],
    ["warnings","Предупреждения","textarea"],
    ["notes","Заметки","textarea"]
  ];

  function petCardFormHtml(pet) {
    const fieldsHtml = PET_CARD_FIELDS.map(function(field) {
      const key = field[0], label = field[1], type = field[2];
      if (type === "select") {
        return '<label class="field"><span>' + esc(label) + '</span><select name="species" required>' +
          '<option value="dog" ' + (pet.species !== "cat" ? "selected" : "") + '>Собака</option>' +
          '<option value="cat" ' + (pet.species === "cat" ? "selected" : "") + '>Кошка</option>' +
          '</select></label>';
      }
      if (type === "textarea") {
        return '<label class="field"><span>' + esc(label) + '</span><textarea class="formtextarea" name="' + key + '" rows="2">' + esc(pet[key] || "") + '</textarea></label>';
      }
      return '<label class="field"><span>' + esc(label) + '</span><input name="' + key + '" value="' + esc(pet[key] || "") + '" ' + (key === "name" ? 'required maxlength="100"' : "") + '></label>';
    }).join("");
    return '<form class="petform" id="pet-card-form">' + fieldsHtml +
      '<button class="btn full" type="submit" id="pet-card-save">Сохранить карточку</button>' +
      '<button class="btn secondary full" type="button" id="pet-card-cancel">Отмена</button>' +
      '</form>';
  }

  function bindPetCardForm(slot, pet, petId) {
    slot.innerHTML = petCardFormHtml(pet || {});
    document.getElementById("pet-card-cancel").addEventListener("click",function(){slot.innerHTML="";});
    document.getElementById("pet-card-form").addEventListener("submit",async function(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const body = {};
      PET_CARD_FIELDS.forEach(function(field) {
        body[field[0]] = form.elements[field[0]].value;
      });
      const saveButton = document.getElementById("pet-card-save");
      saveButton.disabled = true;
      saveButton.textContent = "Сохраняю…";
      try {
        const result = await api(petId ? "/api/pets/" + petId : "/api/pets", {
          method: "POST",
          body: JSON.stringify(body)
        });
        await renderPet(Number(petId || result.id));
      } catch(error) {
        showError(error);
      }
    });
    slot.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function renderPets() {
    currentScreen = "pets";
    setHead("Питомцы","Карточки собак и кошек");
    content.innerHTML =
      '<div class="searchbar"><input id="pet-search" placeholder="Поиск по имени или породе" value="' + esc(petQuery) + '" autocomplete="off"><button id="pet-search-btn">Найти</button></div>' +
      '<button class="btn secondary full" type="button" id="add-pet">＋ Добавить питомца</button>' +
      '<div id="pet-editor-slot"></div>' +
      '<div id="pet-list" class="list"><div class="loading">Загружаю карточки…</div></div>';

    const searchInput = document.getElementById("pet-search");
    const searchButton = document.getElementById("pet-search-btn");
    document.getElementById("add-pet").addEventListener("click",function() {
      bindPetCardForm(document.getElementById("pet-editor-slot"), {name:"",species:"dog"}, null);
    });

    async function runSearch() {
      petQuery = searchInput.value.trim();
      const host = document.getElementById("pet-list");
      host.innerHTML = '<div class="loading">Ищу…</div>';
      try {
        const data = await api("/api/pets?q=" + encodeURIComponent(petQuery));
        const pets = data.pets || [];
        host.innerHTML = pets.length ? pets.map(function(pet) {
          const description = [
            pet.species === "cat" ? "Кошка" : "Собака",
            pet.breed
          ].filter(Boolean).join(" · ");
          return '<div class="petrow" role="button" tabindex="0" data-pet-id="' + Number(pet.id) + '">' +
            '<div><div class="petname">' + esc(pet.name) + '</div>' +
            '<div class="petbreed">' + esc(description) + '</div></div>' +
            '<div class="arrow">›</div></div>';
        }).join("") : '<div class="empty">Ничего не найдено</div>';
      } catch(error) {
        showError(error);
      }
    }

    searchButton.addEventListener("click", runSearch);
    searchInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") runSearch();
    });

    content.onclick = function(e) {
      const row = e.target.closest("[data-pet-id]");
      if (row) renderPet(Number(row.dataset.petId)).catch(showError);
    };
    content.onkeydown = function(e) {
      const row = e.target.closest("[data-pet-id]");
      if (row && (e.key === "Enter" || e.key === " ")) {
        renderPet(Number(row.dataset.petId)).catch(showError);
      }
    };

    await runSearch();
  }
  function detailRow(label,value) {
    return '<div class="detailrow"><div class="key">' + esc(label) + '</div><div class="val">' + esc(value || "—") + '</div></div>';
  }
  async function renderPet(id) {
    currentScreen = "pet-detail";
    setHead("Карточка","Данные питомца");
    objectUrls.forEach(function(url){ URL.revokeObjectURL(url); });
    objectUrls = [];
    content.innerHTML = '<div class="loading">Открываю карточку…</div>';

    const data = await api("/api/pets/" + id);
    const pet = data.pet || {};
    const card = data.groomingCard || {};
    const photos = data.photos || [];
    const cardFields = [
      ["body_length","Длина корпуса"],
      ["legs_length","Длина лап"],
      ["face_length","Длина морды"],
      ["tail_length","Длина хвоста"],
      ["head_shape","Форма головы"],
      ["paws_shape","Форма лап"],
      ["attachments","Насадки"],
      ["blades","Ножи"],
      ["owner_preferences","Пожелания владельца"],
      ["next_visit_changes","К следующему визиту"]
    ];

    const cardSection = pet.species === "dog"
      ? '<section class="detailsection"><div class="sectionhead" style="margin:0 0 12px"><h3 style="margin:0">Карта стрижки</h3></div>' +
        detailRow("Длина корпуса",card.body_length) +
        detailRow("Длина лап",card.legs_length) +
        detailRow("Длина морды",card.face_length) +
        detailRow("Длина хвоста",card.tail_length) +
        detailRow("Форма головы",card.head_shape) +
        detailRow("Форма лап",card.paws_shape) +
        detailRow("Насадки",card.attachments) +
        detailRow("Ножи",card.blades) +
        detailRow("Пожелания владельца",card.owner_preferences) +
        detailRow("К следующему визиту",card.next_visit_changes) +
        '<button class="btn secondary full" type="button" id="edit-card">Редактировать карту</button>' +
        '<div id="card-form-slot"></div>' +
        '</section>'
      : "";

    const photoSection = data.photoArchiveAllowed
      ? '<section class="detailsection"><h3>Фото к карте стрижки</h3>' +
        (photos.length
          ? '<div class="photo-grid">' + photos.map(function(photo) {
              return '<div class="photo-tile"><img alt="Фото к карте стрижки" loading="lazy" data-photo-id="' + Number(photo.id) + '" src=""></div>';
            }).join("") + '</div>'
          : '<div class="smallmuted" style="margin:10px 0 14px">Фотографий пока нет.</div>') +
        '<label class="btn secondary filelabel">Добавить фото<input id="photo-upload" type="file" accept="image/*"></label>' +
        '<div class="smallmuted" style="margin-top:9px">Изображение до 10 МБ. Фото хранится отдельно от истории визитов.</div>' +
        '</section>'
      : "";

    content.innerHTML =
      '<button class="back" id="back-pets">← Все питомцы</button>' +
      '<div class="detailtitle">' + esc(pet.name) + '</div>' +
      '<div class="detailbreed">' + esc([pet.species === "cat" ? "Кошка" : "Собака",pet.breed].filter(Boolean).join(" · ")) + '</div>' +
      '<section class="detailsection"><h3>О питомце</h3>' +
      detailRow("Особенности шерсти",pet.coat_features) +
      detailRow("Предупреждения",pet.warnings) +
      detailRow("Чувствительные зоны",pet.sensitive_areas) +
      detailRow("Реакция на машинку",pet.clipper_reaction) +
      detailRow("Реакция на фен",pet.dryer_reaction) +
      detailRow("Реакция на когтерез",pet.nail_clipper_reaction) +
      detailRow("Заметки",pet.notes) + '</section>' +
      '<button class="btn secondary full" type="button" id="edit-pet">Редактировать карточку питомца</button>' +
      '<div id="pet-card-editor-slot"></div>' +
      cardSection +
      photoSection +
      '<button class="btn secondary full" id="back-pets-bottom">Вернуться к питомцам</button>';

    document.getElementById("back-pets").addEventListener("click",function(){renderPets().catch(showError);});
    document.getElementById("back-pets-bottom").addEventListener("click",function(){renderPets().catch(showError);});
    document.getElementById("edit-pet").addEventListener("click",function() {
      bindPetCardForm(document.getElementById("pet-card-editor-slot"), pet, id);
    });

    const editCardButton = document.getElementById("edit-card");
    if (editCardButton) {
      editCardButton.addEventListener("click",function() {
        const slot = document.getElementById("card-form-slot");
        slot.innerHTML =
          '<form id="card-edit-form" class="cardform">' +
          cardFields.map(function(field) {
            return '<label class="field"><span>' + esc(field[1]) + '</span><textarea class="formtextarea" name="' + esc(field[0]) + '" rows="2">' + esc(card[field[0]] || "") + '</textarea></label>';
          }).join("") +
          '<button class="btn full" type="submit" id="card-save">Сохранить карту</button>' +
          '<button class="btn secondary full" type="button" id="card-cancel">Отмена</button>' +
          '</form>';
        document.getElementById("card-cancel").addEventListener("click",function(){slot.innerHTML="";});
        document.getElementById("card-edit-form").addEventListener("submit",async function(event) {
          event.preventDefault();
          const form = event.currentTarget;
          const body = {};
          cardFields.forEach(function(field) {
            body[field[0]] = form.elements[field[0]].value;
          });
          const saveButton = document.getElementById("card-save");
          saveButton.disabled = true;
          saveButton.textContent = "Сохраняю…";
          try {
            await api("/api/pets/" + id + "/grooming-card",{
              method:"POST",
              body:JSON.stringify(body)
            });
            await renderPet(id);
          } catch(error) {
            showError(error);
          }
        });
        slot.scrollIntoView({behavior:"smooth",block:"start"});
      });
    }

    const photoInput = document.getElementById("photo-upload");
    if (photoInput) {
      photoInput.addEventListener("change",async function() {
        const imageFile = photoInput.files && photoInput.files[0];
        if (!imageFile) return;
        if (!String(imageFile.type || "").startsWith("image/")) {
          showError(new Error("Выбери изображение."));
          return;
        }
        if (imageFile.size > 10 * 1024 * 1024) {
          showError(new Error("Размер фотографии должен быть не больше 10 МБ."));
          return;
        }
        photoInput.disabled = true;
        try {
          const formData = new FormData();
          formData.append("photo",imageFile,imageFile.name);
          await api("/api/pets/" + id + "/grooming-photos",{
            method:"POST",
            body:formData
          });
          await renderPet(id);
        } catch(error) {
          showError(error);
        }
      });
    }

    await Promise.all(photos.map(async function(photo) {
      const image = content.querySelector('[data-photo-id="' + Number(photo.id) + '"]');
      if (!image) return;
      try {
        const response = await fetch("/api/grooming-photos/" + Number(photo.id) + "/image",{
          headers:{"Authorization":"tma " + initData},
          cache:"no-store",
          credentials:"same-origin"
        });
        if (!response.ok) return;
        const imageUrl = URL.createObjectURL(await response.blob());
        objectUrls.push(imageUrl);
        image.src = imageUrl;
      } catch(error) {
        console.error("Could not load grooming photo:",error);
      }
    }));
  }
  async function renderEarnings() {
    currentScreen = "earnings";
    setHead("Заработок","Учёт услуг и начислений");
    content.innerHTML = '<div class="loading">Загружаю заработок…</div>';
    const data = await api("/api/earnings?range=" + encodeURIComponent(earningsRange));
    const entries = data.entries || [];
    content.innerHTML =
      '<div class="periods">' +
        '<button class="pill ' + (earningsRange==="today"?"active":"") + '" data-range="today">Сегодня</button>' +
        '<button class="pill ' + (earningsRange==="month"?"active":"") + '" data-range="month">Этот месяц</button>' +
        '<button class="pill ' + (earningsRange==="first-half"?"active":"") + '" data-range="first-half">1–15</button>' +
        '<button class="pill ' + (earningsRange==="second-half"?"active":"") + '" data-range="second-half">16–конец</button>' +
      '</div>' +
      '<section class="hero"><div class="eyebrow">Твой заработок</div><div class="money">' + money(data.totalEarned) + '</div><div class="smallmuted">' + Number(data.count || 0) + ' услуг · ' + esc(data.periodLabel || "") + '</div></section>' +
      '<div class="sectionhead"><h2>Услуги</h2><span class="count">' + entries.length + (entries.length===100?"+":"") + '</span></div>' +
      (entries.length ? '<div>' + entries.map(function(item){
        return '<div class="earningrow"><div><div class="earningname">' + esc(item.description) + '</div><div class="earningdate">' + esc(dateText(item.service_date)) + ' · ' + Number(item.rate || 0) + '%</div></div><div><div class="earningamount">' + money(item.earned) + '</div><div class="earningbase">из ' + money(item.amount) + '</div></div></div>';
      }).join("") + '</div>' : '<div class="empty">За этот период услуг пока нет</div>');
    content.querySelectorAll("[data-range]").forEach(function(button){
      button.addEventListener("click",function(){
        earningsRange = button.dataset.range;
        renderEarnings().catch(showError);
      });
    });
  }
  async function navigate(screen) {
    currentScreen = screen;
    try {
      if(screen==="today") await renderToday();
      else if(screen==="pets") await renderPets();
      else if(screen==="earnings") await renderEarnings();
    } catch(error){showError(error);}
  }
  document.querySelectorAll(".tab").forEach(function(button){
    button.addEventListener("click",function(){navigate(button.dataset.screen);});
  });
  if (!initData) {
    setHead("Pretty Dogs","Мини-приложение");
    content.innerHTML = '<div class="notice"><strong>Открой через Telegram</strong><p>В чате с ботом Pretty Dogs отправь <b>/start</b> и нажми кнопку «Открыть приложение».</p></div>';
    return;
  }
  navigate("today");
})();
</script>
</body>
</html>`;
