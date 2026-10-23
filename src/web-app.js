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
:root{color-scheme:light;--ink:#111;--muted:#767676;--line:#e7e7e7;--soft:#f5f5f5;--white:#fff;--black:#111;--radius:16px}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:#fff;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
body{padding:0;overscroll-behavior-y:contain}
button,input,textarea,select{font:inherit}
button{cursor:pointer}
button:focus-visible,[role=button]:focus-visible{outline:2px solid #111;outline-offset:3px}
.shell{display:grid;grid-template-columns:238px minmax(0,1fr);min-height:100vh}
.sidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:29px 17px 20px 22px;border-right:1px solid var(--line);background:#fff}
.logo-lockup{display:flex;gap:11px;align-items:center;padding:0 9px 35px}
.logo-mark{display:grid;place-items:center;width:38px;height:38px;background:#111;color:#fff;border-radius:12px;font-size:12px;font-weight:800;letter-spacing:-.06em}
.logo-name{font-size:12px;font-weight:800;letter-spacing:.13em}
.logo-caption{margin-top:5px;font-size:9px;color:#8b8b8b;letter-spacing:.12em}
.nav-label{font-size:9px;letter-spacing:.16em;color:#929292;padding:0 10px 12px;font-weight:750}
.side-nav{display:grid;gap:5px}
.tab{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:#666;text-align:left;padding:13px 12px;border-radius:10px;font-size:12px;font-weight:650;transition:background .14s,color .14s}
.tab-symbol{width:20px;flex:0 0 20px;font-size:18px;line-height:1;text-align:center;font-weight:400}
.tab.active{background:#111;color:#fff}
.sidebar-bottom{margin-top:auto;padding:16px 10px 4px;border-top:1px solid var(--line)}
.statusline{display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.04em;color:#858585}
.status-dot{width:6px;height:6px;border-radius:50%;background:#111}
.sidebar-footnote{font-size:10px;line-height:1.5;color:#a0a0a0;margin-top:10px}
.app-main{min-width:0;width:100%;max-width:1260px;margin:0 auto;padding:0 46px 32px}
.page-header{padding:33px 0 25px;border-bottom:1px solid var(--line)}
.header-overline{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:9px;font-weight:750;letter-spacing:.15em;color:#8a8a8a;text-transform:uppercase}
.header-date{font-size:10px;letter-spacing:.04em;color:#777;font-weight:500;text-transform:none}
h1{font-size:37px;line-height:1.06;letter-spacing:-.055em;margin:26px 0 7px;font-weight:780}
.subtitle{font-size:13px;line-height:1.5;color:var(--muted)}
.mobile-nav{display:none}
main{min-height:300px;padding-top:25px}
.loading,.empty,.notice{padding:34px 20px;text-align:center;border:1px solid var(--line);border-radius:var(--radius);color:var(--muted);font-size:13px;line-height:1.5;background:#fff}
.notice{color:#222;text-align:left;max-width:600px;line-height:1.65}
.error{margin:10px 0;padding:12px 14px;border:1px solid #d5d5d5;border-radius:10px;font-size:13px}
.dashboard-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(250px,.9fr);gap:14px;align-items:stretch}
.hero{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius);padding:24px;background:#fff;margin-bottom:14px}
.hero.dark{background:#111;color:#fff;border-color:#111}
.hero .eyebrow{color:#888}
.hero.dark .eyebrow{color:#b7b7b7}
.hero-heading{font-size:23px;font-weight:760;letter-spacing:-.045em;margin:12px 0 9px;line-height:1.16}
.hero-desc{font-size:12px;line-height:1.55;color:#777;max-width:400px}
.hero.dark .hero-desc{color:#b8b8b8}
.hero-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:22px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #e6e6e6;border-radius:999px;font-size:10px;color:#555;background:#fff}
.hero.dark .chip{border-color:#414141;background:#1d1d1d;color:#ededed}
.eyebrow{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:750}
.money{font-size:38px;letter-spacing:-.06em;font-weight:790;margin:12px 0 3px;font-variant-numeric:tabular-nums;line-height:1.1}
.smallmuted{color:var(--muted);font-size:11px;line-height:1.5}
.metricgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0 30px}
.metric{border:1px solid var(--line);border-radius:13px;padding:16px 15px;min-width:0;background:#fff}
.metric .value{font-size:25px;font-weight:780;letter-spacing:-.05em;margin-bottom:8px;line-height:1}
.metric .label{font-size:10px;color:var(--muted);line-height:1.3}
.sectionhead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:27px 0 13px}
h2{font-size:18px;letter-spacing:-.04em;margin:0;font-weight:760}
.count{font-size:10px;color:var(--muted)}
.list{border-top:1px solid var(--line)}
.item{display:flex;align-items:center;gap:13px;padding:16px 2px;border-bottom:1px solid var(--line);min-width:0}
.time{flex:0 0 48px;font-size:12px;font-weight:760;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.itembody{min-width:0;flex:1}
.itemtitle{font-size:13px;font-weight:720;overflow-wrap:anywhere}
.itemmeta{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.45}
.status{font-size:9px;letter-spacing:.02em;border:1px solid #dedede;padding:6px 8px;border-radius:7px;white-space:nowrap;color:#555;background:#fff}
.btn{border:1px solid var(--black);background:var(--black);color:#fff;border-radius:10px;padding:12px 15px;font-size:12px;font-weight:720;transition:opacity .15s}
.btn.secondary{background:#fff;color:#111;border-color:var(--line)}
.btn.full{width:100%;margin-top:15px}
.btn:disabled{opacity:.5;cursor:default}
.inlineaction{display:inline-block;margin-top:9px;padding:8px 11px;border:1px solid #d8d8d8;border-radius:8px;background:#fff;color:#111;font-size:10px;font-weight:750}
.searchbar{display:flex;gap:8px;margin-bottom:18px}
.searchbar input,.field input,.field textarea,.field select,.range{width:100%;border:1px solid var(--line);background:#fff;color:#111;border-radius:10px;padding:12px 13px;outline:none;font-size:13px}
.searchbar input:focus,.field input:focus,.field textarea:focus,.field select:focus{border-color:#777}
.searchbar button{border:1px solid #111;background:#111;color:#fff;border-radius:10px;padding:0 17px;font-size:12px;font-weight:700}
.pet-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}
.pet-card{border:1px solid var(--line);border-radius:14px;overflow:hidden;cursor:pointer;min-width:0;background:#fff;transition:transform .16s,border-color .16s}
.pet-card:hover{border-color:#bababa;transform:translateY(-2px)}
.pet-cover{aspect-ratio:1.17;background:#f3f3f3;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.pet-cover img{width:100%;height:100%;object-fit:cover;display:block}
.pet-cover-placeholder{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:31px;font-weight:800;letter-spacing:-.09em;color:#b6b6b6}
.pet-cover-label{position:absolute;bottom:9px;left:9px;background:#fff;color:#111;border-radius:6px;padding:5px 7px;font-size:9px;font-weight:750}
.pet-card-body{padding:13px}
.petname{font-size:14px;font-weight:760;letter-spacing:-.025em;overflow-wrap:anywhere}
.petbreed{font-size:10px;line-height:1.45;color:var(--muted);margin-top:5px;min-height:15px}
.pet-foot{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:13px;padding-top:10px;border-top:1px solid #eee;color:#999;font-size:9px}
.arrow{font-size:17px;color:#777}
.back{border:0;padding:0;margin:0 0 22px;background:transparent;color:#666;font-size:12px}
.profile-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:end;margin-bottom:22px;padding:23px;border:1px solid var(--line);border-radius:var(--radius)}
.detailtitle{font-size:32px;font-weight:790;letter-spacing:-.055em;margin:10px 0 8px;line-height:1.1}
.detailbreed{font-size:12px;color:var(--muted);margin-bottom:0}
.profile-mark{width:86px;height:86px;border-radius:12px;background:var(--soft);display:grid;place-items:center;overflow:hidden;font-size:24px;color:#aaa;font-weight:800;letter-spacing:-.08em}
.profile-mark img{width:100%;height:100%;object-fit:cover}
.detailsection{padding:20px 0;border-top:1px solid var(--line)}
.detailsection h3{font-size:9px;color:var(--muted);font-weight:780;letter-spacing:.14em;text-transform:uppercase;margin:0 0 13px}
.detailrow{display:grid;grid-template-columns:36% 1fr;gap:14px;padding:9px 0;font-size:12px;line-height:1.5}
.detailrow .key{color:var(--muted)}
.detailrow .val{white-space:pre-wrap;overflow-wrap:anywhere}
.periods{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px}
.pill{padding:9px 12px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:11px;color:#555}
.pill.active{background:#111;border-color:#111;color:#fff}
.earning-overview{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,.65fr);gap:12px}
.earningrow{display:grid;grid-template-columns:1fr auto;gap:10px;padding:15px 1px;border-bottom:1px solid var(--line)}
.earningname{font-size:12px;font-weight:700}
.earningdate{font-size:10px;color:var(--muted);margin-top:5px}
.earningamount{text-align:right;font-size:12px;font-weight:780;white-space:nowrap}
.earningbase{font-size:10px;color:var(--muted);margin-top:5px}
.photo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0 15px}
.photo-tile{aspect-ratio:1;overflow:hidden;border-radius:9px;border:1px solid var(--line);background:var(--soft);display:flex;align-items:center;justify-content:center}
.photo-tile img{width:100%;height:100%;object-fit:cover;display:block}
.filelabel{display:inline-flex;position:relative;overflow:hidden;align-items:center;justify-content:center}
.filelabel input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer}
.formtextarea{width:100%;min-height:95px;resize:vertical;border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:12px;line-height:1.5;color:#111;background:#fff}
.cardform,.petform{margin-top:14px}
.cardform .field,.petform .field{display:block;margin:13px 0}
.cardform .field span,.petform .field span{display:block;font-size:10px;color:var(--muted);margin-bottom:6px}
.petform .field input,.petform .field select{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff;color:#111;font:inherit;font-size:13px}
.metricgrid.compact{margin-top:12px;margin-bottom:19px}
.visits-date{font-size:10px;letter-spacing:.12em;color:#888;text-transform:uppercase;font-weight:750;margin:23px 0 6px}
.history-card{border:1px solid var(--line);border-radius:12px;padding:15px;margin:9px 0;background:#fff}
.history-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.history-name{font-size:13px;font-weight:760}
.history-meta{font-size:10px;color:var(--muted);margin-top:5px;line-height:1.5}
.history-time{text-align:right;font-size:12px;font-weight:760;white-space:nowrap}
.history-procedures{font-size:11px;line-height:1.55;color:#555;margin-top:12px;padding-top:10px;border-top:1px solid #eee;white-space:pre-wrap}
.action-form{padding:18px;border:1px solid var(--line);border-radius:13px;margin:17px 0}
footer{border-top:1px solid var(--line);margin-top:38px;padding-top:14px;color:#a0a0a0;font-size:9px;letter-spacing:.12em;display:flex;justify-content:space-between}
@media(max-width:980px){.shell{grid-template-columns:205px minmax(0,1fr)}.sidebar{padding-left:13px;padding-right:12px}.app-main{padding-left:26px;padding-right:26px}.pet-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:1fr}}
@media(max-width:660px){
  body{padding-bottom:calc(70px + env(safe-area-inset-bottom))}
  .shell{display:block;min-height:100vh}
  .sidebar{display:none}
  .app-main{padding:0 18px 18px}
  .page-header{padding:23px 0 18px}
  .header-overline{font-size:8px}
  h1{font-size:31px;margin:21px 0 7px}
  .subtitle{font-size:12px}
  main{padding-top:19px;min-height:280px}
  .mobile-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));position:fixed;z-index:20;bottom:0;left:0;right:0;padding:8px 8px calc(8px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid var(--line);gap:3px}
  .mobile-nav .tab{display:flex;flex-direction:column;justify-content:center;gap:5px;padding:7px 2px;border-radius:9px;font-size:9px;text-align:center;align-items:center}
  .mobile-nav .tab-symbol{font-size:17px;width:auto;flex:none}
  .metricgrid{gap:7px;margin-bottom:24px}
  .metric{padding:13px 10px;border-radius:12px}
  .metric .value{font-size:22px}
  .metric .label{font-size:9px}
  .hero{padding:19px;border-radius:14px}
  .hero-heading{font-size:21px}
  .money{font-size:34px}
  .dashboard-grid{gap:0}
  .pet-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .pet-card{border-radius:12px}
  .pet-cover{aspect-ratio:.98}
  .pet-card-body{padding:10px}
  .petname{font-size:13px}
  .petbreed{font-size:10px}
  .profile-hero{padding:17px;gap:12px}
  .detailtitle{font-size:28px}
  .profile-mark{width:70px;height:70px}
  .detailrow{grid-template-columns:40% 1fr;font-size:11px;gap:9px}
  .photo-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  .earning-overview{grid-template-columns:1fr}
  .history-card{padding:13px}
  footer{margin-top:28px;font-size:8px}
}
@media(min-width:661px) and (max-width:820px){.app-main{padding-left:20px;padding-right:20px}.shell{grid-template-columns:185px minmax(0,1fr)}.logo-name{font-size:10px}.tab{gap:8px;padding:12px 9px}.tab-symbol{width:16px;flex-basis:16px}.pet-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important}}
</style>
</head>
<body>
<div class="shell">
  <aside class="sidebar">
    <div class="logo-lockup"><div class="logo-mark">PD</div><div><div class="logo-name">PRETTY DOGS</div><div class="logo-caption">GROOMER SPACE</div></div></div>
    <div class="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
    <nav class="side-nav" aria-label="Основная навигация">
      <button class="tab active" data-screen="today"><span class="tab-symbol">⌂</span><span>Обзор</span></button>
      <button class="tab" data-screen="pets"><span class="tab-symbol">◈</span><span>Питомцы</span></button>
      <button class="tab" data-screen="visits"><span class="tab-symbol">↗</span><span>Визиты</span></button>
      <button class="tab" data-screen="earnings"><span class="tab-symbol">₽</span><span>Заработок</span></button>
    </nav>
    <div class="sidebar-bottom"><div class="statusline"><span class="status-dot"></span><span>Личное рабочее пространство</span></div><div class="sidebar-footnote">Все данные остаются в базе Pretty Dogs.</div></div>
  </aside>
  <div class="app-main">
    <header class="page-header">
      <div class="header-overline"><span>PRETTY DOGS / STUDIO</span><span class="header-date" id="header-date"></span></div>
      <h1 id="page-title">Обзор</h1>
      <div class="subtitle" id="page-subtitle">Твой рабочий день — в одном месте.</div>
    </header>
    <main id="content"><div class="loading">Загружаю данные…</div></main>
    <footer><span>PRETTY DOGS · GROOMER SPACE</span><span>МИНИМУМ ЛИШНЕГО</span></footer>
  </div>
  <nav class="mobile-nav" aria-label="Основная навигация">
    <button class="tab active" data-screen="today"><span class="tab-symbol">⌂</span><span>Обзор</span></button>
    <button class="tab" data-screen="pets"><span class="tab-symbol">◈</span><span>Питомцы</span></button>
    <button class="tab" data-screen="visits"><span class="tab-symbol">↗</span><span>Визиты</span></button>
    <button class="tab" data-screen="earnings"><span class="tab-symbol">₽</span><span>Доход</span></button>
  </nav>
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
