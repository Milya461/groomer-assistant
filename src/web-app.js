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
.visit-record-trigger{display:block;width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left}
.visit-record-trigger .itemtitle{display:block}
.visit-record-trigger .itemmeta{display:block}
.visit-record-hint{display:block;margin-top:8px;color:#666;font-size:10px;font-weight:650}
.visit-detail-panel{margin-top:12px;padding:13px;border:1px solid var(--line);border-radius:10px;background:#fafafa}
.visit-detail-panel[hidden]{display:none}
.visit-detail-heading{font-size:11px;font-weight:800;margin-bottom:9px}
.visit-service-line,.visit-detail-total{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #e9e9e9;font-size:11px;line-height:1.4}
.visit-service-line strong,.visit-detail-total strong{white-space:nowrap;font-size:11px}
.visit-detail-total{font-weight:750;border-bottom:0;padding-bottom:2px}
.visit-detail-meta{font-size:10px;line-height:1.5;color:#666;margin-top:9px}
.visit-detail-empty{font-size:11px;line-height:1.5;color:#666}
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
.history-photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:12px}
.history-photo{aspect-ratio:1;border-radius:8px}
.history-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.history-name{font-size:13px;font-weight:760}
.history-meta{font-size:10px;color:var(--muted);margin-top:5px;line-height:1.5}
.history-time{text-align:right;font-size:12px;font-weight:760;white-space:nowrap}
.history-procedures{font-size:11px;line-height:1.55;color:#555;margin-top:12px;padding-top:10px;border-top:1px solid #eee;white-space:pre-wrap}
.action-form{padding:18px;border:1px solid var(--line);border-radius:13px;margin:17px 0}
footer{border-top:1px solid var(--line);margin-top:38px;padding-top:14px;color:#a0a0a0;font-size:9px;letter-spacing:.12em;display:flex;justify-content:space-between}
.auth-card{max-width:460px;margin:0 auto;padding:26px}
.auth-logo{display:grid;place-items:center;width:46px;height:46px;margin-bottom:26px;border-radius:14px;background:#111;color:#fff;font-size:14px;font-weight:800;letter-spacing:-.07em}
.auth-copy{font-size:12px;line-height:1.65;color:var(--muted);margin:11px 0 23px}
.auth-field{display:block;margin:18px 0}
.auth-field span{display:block;font-size:10px;color:var(--muted);margin-bottom:7px}
.auth-field input{width:100%;border:1px solid var(--line);border-radius:10px;padding:14px;font-size:14px;background:#fff;color:#111}
.auth-error{display:none;padding:11px 13px;margin:10px 0 4px;border:1px solid #d5d5d5;border-radius:9px;color:#333;font-size:12px;line-height:1.5}
.logged-out .shell{grid-template-columns:minmax(0,1fr)}
.logged-out .sidebar,.logged-out .mobile-nav,.logged-out .app-main footer,.logged-out .logout-btn{display:none}
.logged-out .app-main{max-width:850px;padding:0 24px}
.logged-out .page-header{margin-bottom:0}
.logout-btn{border:0;background:transparent;color:#8a8a8a;font-size:10px;padding:5px 0}
.logout-btn:hover{color:#111}
.header-date{margin-left:auto}
@media(max-width:980px){.shell{grid-template-columns:205px minmax(0,1fr)}.sidebar{padding-left:13px;padding-right:12px}.app-main{padding-left:26px;padding-right:26px}.pet-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:1fr}}
@media(max-width:660px){
  .history-photos{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  body{padding-bottom:calc(70px + env(safe-area-inset-bottom))}
  .header-date{display:none}
  .shell{display:block;min-height:100vh}
  .sidebar{display:none}
  .app-main{padding:0 18px 18px}
  .page-header{padding:23px 0 18px}
  .header-overline{font-size:8px}
  h1{font-size:31px;margin:21px 0 7px}
  .subtitle{font-size:12px}
  main{padding-top:19px;min-height:280px}
  .mobile-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;z-index:20;bottom:0;left:0;right:0;padding:8px 8px calc(8px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid var(--line);gap:3px}
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
.calendar-toolbar{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:10px;margin:0 0 14px}
.calendar-month-title{text-align:center;font-size:18px;font-weight:780;letter-spacing:-.035em;text-transform:capitalize}
.calendar-month-btn{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--line);border-radius:11px;background:#fff;color:#111;font-size:22px}
.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.calendar-weekdays{margin-bottom:6px}
.calendar-weekday{text-align:center;padding:8px 0;font-size:10px;color:var(--muted);font-weight:750}
.calendar-day{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;min-height:76px;padding:8px 3px;border:1px solid var(--line);border-radius:10px;background:#fff;color:#111;text-align:center}
.calendar-day.is-working{border-color:#111;background:#f7f7f7}
.calendar-day.is-selected{outline:2px solid #111;outline-offset:1px}
.calendar-day.is-empty{border-color:transparent;background:transparent;pointer-events:none}
.calendar-day-number{font-size:13px;font-weight:780}
.calendar-day-time{font-size:9px;color:#555;line-height:1.2;font-variant-numeric:tabular-nums}
.calendar-day-dot{width:5px;height:5px;border-radius:50%;background:#111;display:block}
.calendar-day.is-selected .calendar-day-number{background:#111;color:#fff;border-radius:50%;width:24px;height:24px;display:grid;place-items:center}
.calendar-summary{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:14px 0 22px;padding:13px 14px;border:1px solid var(--line);border-radius:12px;font-size:12px}
.calendar-editor{padding:18px;border:1px solid var(--line);border-radius:14px;margin-top:18px}
.calendar-editor-title{font-size:17px;font-weight:780;letter-spacing:-.035em;margin:7px 0}
.calendar-time-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}
.calendar-time-field{display:block;min-width:0}
.calendar-time-field span{display:block;margin-bottom:7px;font-size:10px;color:var(--muted)}
.calendar-time-input{width:100%;min-width:0;border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff;color:#111;font:inherit;font-size:14px}
.calendar-editor-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.calendar-editor-actions .btn{margin-top:0}
.calendar-helper{margin-top:12px;font-size:11px;line-height:1.5;color:var(--muted)}
.calendar-day.is-weekend:not(.is-working) .calendar-day-number{color:#898989}
.calendar-day.is-weekend:not(.is-working){background:#fafafa}
.calendar-day.is-today{box-shadow:inset 0 0 0 1px #777}
.calendar-day.is-today .calendar-day-number{border:1px solid #111;border-radius:50%;width:25px;height:25px;display:grid;place-items:center}
.calendar-day.is-working .calendar-day-number{background:#111;color:#fff;border-radius:50%;width:25px;height:25px;display:grid;place-items:center}
.calendar-day.is-working .calendar-day-dot{background:#111}
.calendar-day.is-working.is-selected .calendar-day-number{background:#fff;color:#111}
.calendar-day-dot{width:6px;height:6px;border-radius:50%;background:#111;display:block}
.calendar-appointment-count{font-size:8px;font-weight:750;color:#555;line-height:1}
.calendar-day.is-selected{outline:2px solid #111;outline-offset:1px}
.calendar-legend{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0 4px;color:#666;font-size:10px}
.calendar-legend-item{display:inline-flex;align-items:center;gap:6px}
.calendar-legend-mark{display:inline-block;width:10px;height:10px;border:1px solid #ccc;border-radius:3px;background:#fff}
.calendar-legend-mark.working{background:#111;border-color:#111}
.calendar-legend-mark.today{border:2px solid #777;border-radius:50%}
.calendar-day-appointments{margin:20px 0 25px;padding-top:16px;border-top:1px solid var(--line)}
.appointment-card{display:grid;grid-template-columns:56px minmax(0,1fr) auto;align-items:center;gap:11px;padding:13px 0;border-bottom:1px solid var(--line)}
.appointment-card-time{font-size:13px;font-weight:780;font-variant-numeric:tabular-nums}
.appointment-card-name{font-size:12px;font-weight:750;overflow-wrap:anywhere}
.appointment-card-meta{font-size:10px;line-height:1.45;color:var(--muted);margin-top:4px}
.appointment-card .inlineaction{margin-top:0;white-space:nowrap}
.appointment-form{padding:18px;border:1px solid var(--line);border-radius:14px;margin:17px 0 24px;background:#fff}
.appointment-form h2{font-size:17px;margin:7px 0}
.appointment-form .field{display:block;margin:13px 0}
.appointment-form .field span{display:block;font-size:10px;color:var(--muted);margin-bottom:6px}
.appointment-form .field input,.appointment-form .field select{width:100%;min-width:0;border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff;color:#111;font:inherit;font-size:13px}
.appointment-form-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.appointment-form-actions .btn{margin-top:0}
.appointment-form-error{display:none;margin:10px 0 0;padding:10px 12px;border:1px solid #d9d9d9;border-radius:9px;color:#222;font-size:11px;line-height:1.5}
.inlineaction.primary-action{border-color:#111;background:#111;color:#fff;padding:9px 12px;font-size:11px}
.calendar-time-help{margin-top:10px;padding:11px 12px;border-radius:10px;background:#f7f7f7;font-size:10px;line-height:1.5;color:#555}
.history-photo-label{margin-top:12px}
.photo-purpose .filelabel{margin-top:12px}
.photo-purpose .btn.full{margin-top:12px}
@media(max-width:480px){.sectionhead:has(#add-appointment){align-items:stretch;flex-direction:column}.sectionhead #add-appointment{width:100%}.appointment-card{grid-template-columns:46px minmax(0,1fr);gap:8px}.appointment-card>.inlineaction,.appointment-card>.status{grid-column:2;justify-self:start}.calendar-day{min-height:62px}}
/* Clear calendar states: work day, weekend, today and selected date. */
.calendar-day{min-height:72px;transition:background .12s,outline-color .12s}
.calendar-day.is-working{background:#f0f0f0;border-color:#bdbdbd;border-bottom:2px solid #111}
.calendar-day.is-working .calendar-day-number{background:#111;color:#fff;border-radius:50%;width:25px;height:25px;display:grid;place-items:center}
.calendar-day.is-weekend:not(.is-working){background:#fafafa}
.calendar-day.is-weekend:not(.is-working) .calendar-day-number{color:#999}
.calendar-day.is-today{box-shadow:inset 0 0 0 2px #999}
.calendar-day.is-selected{outline:2px solid #111;outline-offset:1px}
.calendar-day.is-working.is-selected .calendar-day-number{background:#fff;color:#111}
.calendar-legend-mark.selected{outline:2px solid #111;outline-offset:1px}
@media(max-width:660px){
  .calendar-grid{gap:4px}
  .calendar-day{min-height:58px;padding:6px 1px;border-radius:8px;gap:3px}
  .calendar-day-number{font-size:12px}
  .calendar-day.is-working .calendar-day-number{width:22px;height:22px}
  .calendar-day-dot{width:5px;height:5px}
  .calendar-appointment-count{font-size:7px}
  .calendar-month-title{font-size:15px}
  .calendar-legend{gap:9px;font-size:9px}
  .appointment-card{grid-template-columns:43px minmax(0,1fr);gap:8px}
  .appointment-card .inlineaction,.appointment-card .status{grid-column:2;justify-self:start}
  .appointment-form{padding:14px}
}
#add-appointment{white-space:nowrap}
@media(max-width:660px){#add-appointment{padding:10px 9px;font-size:10px}}
.calendar-legend-mark.selected{outline:2px solid #111;outline-offset:1px}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important}}
</style>
</head>
<body>
<div class="shell">
  <aside class="sidebar">
    <div class="logo-lockup"><div class="logo-mark">PD</div><div><div class="logo-name">PRETTY DOGS</div><div class="logo-caption">GROOMER SPACE</div></div></div>
    <div class="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
    <nav class="side-nav" aria-label="Основная навигация">
      <button class="tab active" data-screen="today"><span class="tab-symbol">⌂</span><span>Главное</span></button>
      <button class="tab" data-screen="calendar"><span class="tab-symbol">▦</span><span>Календарь</span></button>
      <button class="tab" data-screen="pets"><span class="tab-symbol">◈</span><span>Питомцы</span></button>
      <button class="tab" data-screen="visits"><span class="tab-symbol">↗</span><span>Визиты</span></button>
      <button class="tab" data-screen="earnings"><span class="tab-symbol">₽</span><span>Заработок</span></button>
    </nav>
    <div class="sidebar-bottom"><div class="statusline"><span class="status-dot"></span><span>Личное рабочее пространство</span></div><div class="sidebar-footnote">Все данные остаются в базе Pretty Dogs.</div></div>
  </aside>
  <div class="app-main">
    <header class="page-header">
      <div class="header-overline"><span>PRETTY DOGS / STUDIO</span><span class="header-date" id="header-date"></span><button class="logout-btn" id="logout-btn" type="button">Выйти ↗</button></div>
      <h1 id="page-title">Главное</h1>
      <div class="subtitle" id="page-subtitle">Твой рабочий день — в одном месте.</div>
    </header>
    <main id="content"><div class="loading">Загружаю данные…</div></main>
    <footer><span>PRETTY DOGS · GROOMER SPACE</span></footer>
  </div>
  <nav class="mobile-nav" aria-label="Основная навигация">
    <button class="tab active" data-screen="today"><span class="tab-symbol">⌂</span><span>Главное</span></button>
    <button class="tab" data-screen="calendar"><span class="tab-symbol">▦</span><span>Календарь</span></button>
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
  let calendarMonth = "";
  let calendarSelectedDate = "";
  let lastDashboard = null;
  let objectUrls = [];
  let sessionToken = "";
  try { sessionToken = localStorage.getItem("pretty-dogs-session") || ""; } catch(e) {}

  const headerDate = document.getElementById("header-date");
  if (headerDate) {
    headerDate.textContent = new Intl.DateTimeFormat("ru-RU", {
      weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Moscow"
    }).format(new Date());
  }
  const logoutButton = document.getElementById("logout-btn");
  if (logoutButton) {
    if (initData) {
      logoutButton.style.display = "none";
    } else {
      logoutButton.addEventListener("click",function() {
        sessionToken = "";
        try { localStorage.removeItem("pretty-dogs-session"); } catch(e) {}
        clearObjectUrls();
        renderLogin();
      });
    }
  }

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
  function authHeaders() {
    if (initData) return {"Authorization":"tma " + initData};
    if (sessionToken) return {"Authorization":"Bearer " + sessionToken};
    return {};
  }
  function clearObjectUrls() {
    objectUrls.forEach(function(url) { URL.revokeObjectURL(url); });
    objectUrls = [];
  }
  async function loadPrivatePhoto(image, photoId, photoType) {
    if (!image || !photoId) return;
    const collection = photoType === "visit" ? "visit-photos" : photoType === "cover" ? "pet-cover-photos" : "grooming-photos";
    try {
      const response = await fetch("/api/" + collection + "/" + Number(photoId) + "/image", {
        headers: authHeaders(), cache: "no-store", credentials: "same-origin"
      });
      if (!response.ok) return;
      const imageUrl = URL.createObjectURL(await response.blob());
      objectUrls.push(imageUrl);
      image.src = imageUrl;
      image.style.display = "block";
      const fallback = image.parentNode && image.parentNode.querySelector("[data-photo-fallback]");
      if (fallback) fallback.style.display = "none";
    } catch(error) {
      console.error("Could not load grooming photo:", error);
    }
  }
  async function api(path, options) {
    const opts = options || {};
    const headers = Object.assign({},opts.headers || {},authHeaders());
    if (opts.body && !(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
    const response = await fetch(path,Object.assign({},opts,{headers:headers,credentials:"same-origin",cache:"no-store"}));
    let data = {};
    try { data = await response.json(); } catch(e) {}
    if (!response.ok) {
      const error = new Error(data.error || "Не удалось загрузить данные.");
      error.status = response.status;
      if (!initData && response.status === 401 && path !== "/api/login") {
        sessionToken = "";
        try { localStorage.removeItem("pretty-dogs-session"); } catch(e) {}
      }
      throw error;
    }
    return data;
  }
  function renderLogin(message) {
    currentScreen = "login";
    document.body.classList.add("logged-out");
    setHead("Войти в Pretty Dogs","Личное рабочее пространство грумера");
    content.innerHTML =
      '<section class="hero auth-card">' +
        '<div class="auth-logo">PD</div>' +
        '<div class="eyebrow">PRIVATE GROOMER SPACE</div>' +
        '<h2 style="font-size:26px;line-height:1.12;letter-spacing:-.05em;margin-top:12px">Всё для твоей работы.</h2>' +
        '<p class="auth-copy">Расписание, карточки питомцев, история визитов и заработок — в одном спокойном пространстве.</p>' +
        '<form id="login-form">' +
          '<label class="auth-field"><span>ПАРОЛЬ ДОСТУПА</span><input type="password" name="password" autocomplete="current-password" placeholder="Введи пароль" required></label>' +
          '<div class="auth-error" id="login-error">' + esc(message || "") + '</div>' +
          '<button class="btn full" type="submit" id="login-submit">Открыть приложение</button>' +
        '</form>' +
      '</section>';
    const alertBox = document.getElementById("login-error");
    if (message) alertBox.style.display = "block";
    document.getElementById("login-form").addEventListener("submit",async function(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const pass = form.elements.password.value;
      const submit = document.getElementById("login-submit");
      const alert = document.getElementById("login-error");
      submit.disabled = true;
      submit.textContent = "Проверяю…";
      alert.style.display = "none";
      try {
        const result = await api("/api/login",{method:"POST",body:JSON.stringify({password:pass})});
        sessionToken = result.token;
        try { localStorage.setItem("pretty-dogs-session", sessionToken); } catch(e) {}
        document.body.classList.remove("logged-out");
        await navigate("today");
      } catch(error) {
        alert.textContent = error.message || "Не удалось войти.";
        alert.style.display = "block";
        submit.disabled = false;
        submit.textContent = "Открыть приложение";
      }
    });
  }
  function showError(error) {
    if (!initData && error && error.status === 401) {
      renderLogin("Сеанс истёк. Введи пароль ещё раз.");
      return;
    }
    content.innerHTML = '<div class="notice"><strong>Не удалось открыть приложение</strong><p>' + esc(error && error.message ? error.message : "Попробуй открыть его ещё раз.") + '</p></div>';
  }
  function statusText(status) {
    return ({scheduled:"Запланирован",waiting:"Ожидаем",in_progress:"В работе",completed:"Завершён",cancelled:"Отменён",rescheduled:"Перенесён",skipped:"Пропущен"})[status] || status || "—";
  }
  function rowForVisit(item) {
    const petLabel = item.name + (item.breed ? " · " + item.breed : "");
    const id = Number(item.id);
    let action = "";
    if (item.status === "scheduled" || item.status === "waiting") {
      action = '<button class="inlineaction primary-action" data-start-visit="' + id + '">▶ Начать визит</button>';
    } else if (item.status === "in_progress") {
      action = '<button class="inlineaction primary-action" data-finish-visit="' + id + '" data-pet-name="' + esc(item.name) + '">Завершить и внести услуги</button>';
    }
    return '<div class="item"><div class="time">' + esc(item.appointment_time || "—") + '</div><div class="itembody">' +
      '<button type="button" class="visit-record-trigger" data-toggle-visit-detail="' + id + '" aria-expanded="false">' +
        '<span class="itemtitle">' + esc(petLabel) + '</span>' +
        '<span class="itemmeta">' + esc(statusText(item.status)) + (item.actual_duration_minutes ? " · " + esc(formatDuration(item.actual_duration_minutes)) : "") + '</span>' +
        '<span class="visit-record-hint">Открыть запись · услуги ↓</span>' +
      '</button>' + action +
      '<div class="visit-detail-panel" id="visit-detail-' + id + '" hidden></div>' +
    '</div></div>';
  }
  function formatDuration(value) {
    const n = Math.max(0,Number(value || 0));
    const h = Math.floor(n/60), m = n%60;
    if (h && m) return h + " ч " + m + " мин";
    if (h) return h + " ч";
    return m + " мин";
  }
  function visitDetailsHtml(item) {
    const raw = String(item.procedures || "").trim();
    const entries = raw ? raw.split(/;\s*|\n+/).map(function(value){ return value.trim(); }).filter(Boolean) : [];
    const parsed = entries.map(function(entry) {
      const match = entry.match(/^(.+?):\s*(\d+(?:[.,]\d{1,2})?)\s*(?:₽|руб(?:лей|ля)?\.?)?$/i);
      return {
        label: match ? match[1].trim() : entry,
        amount: match ? Number(match[2].replace(",", ".")) : null
      };
    });
    const servicesHtml = parsed.map(function(service) {
      return '<div class="visit-service-line"><span>' + esc(service.label) + '</span>' +
        (service.amount === null ? '<span>—</span>' : '<strong>' + money(service.amount) + '</strong>') +
      '</div>';
    }).join("");
    const inferredTotal = parsed.reduce(function(sum, service){ return sum + (service.amount === null ? 0 : service.amount); },0);
    const serviceTotal = Number(item.services_total || 0) || inferredTotal;
    const earned = Number(item.earned || 0);
    const duration = Number(item.actual_duration_minutes || 0);
    const timeDetails = [];
    if (item.appointment_date) timeDetails.push("Дата · " + dateText(item.appointment_date));
    const startTime = item.actual_start_time || item.appointment_time;
    if (startTime) timeDetails.push("Начало · " + startTime);
    if (item.actual_end_time) timeDetails.push("Окончание · " + item.actual_end_time);
    return '<div class="visit-detail-panel-inner">' +
      '<div class="visit-detail-heading">Что сделали</div>' +
      (servicesHtml || '<div class="visit-detail-empty">Услуги ещё не внесены. После завершения визита здесь появятся комплекс, гигиена, зубы и другие выполненные процедуры.</div>') +
      (duration ? '<div class="visit-detail-meta">Фактическая длительность · ' + esc(formatDuration(duration)) + '</div>' : '') +
      (timeDetails.length ? '<div class="visit-detail-meta">' + timeDetails.map(esc).join(' · ') + '</div>' : '') +
      ((serviceTotal > 0 || earned > 0)
        ? '<div class="visit-detail-total"><span>Стоимость услуг</span><strong>' + money(serviceTotal) + '</strong></div>' +
          (earned > 0 ? '<div class="visit-detail-total"><span>Твой заработок</span><strong>' + money(earned) + '</strong></div>' : '')
        : '') +
    '</div>';
  }
  async function renderToday() {
    currentScreen = "today";
    setHead("Главное","Очередь, визиты и заработок за день");
    content.innerHTML = '<div class="loading">Загружаю данные…</div>';
    const data = await api("/api/dashboard");
    lastDashboard = data;
    const counts = data.counts || {};
    const rows = data.queue || [];
    content.innerHTML =
      '<div class="dashboard-grid">' +
        '<section class="hero dark"><div class="eyebrow">PRETTY DOGS · WORKSPACE</div><div class="hero-heading">День начинается с заботы.</div><div class="hero-desc">Все важное под рукой: очередь, питомцы, визиты и твои результаты за день.</div><div class="hero-meta"><span class="chip">' + esc(data.dateDisplay) + '</span><span class="chip">' + Number(counts.total || 0) + ' записей на сегодня</span></div></section>' +
        '<section class="hero"><div class="eyebrow">Заработок сегодня</div><div class="money">' + money(data.earnedToday) + '</div><div class="smallmuted">' + Number(data.earningsCount || 0) + ' услуг учтено</div><div class="hero-meta"><span class="chip">Прогресс рабочего дня</span></div></section>' +
      '</div>' +
      '<div class="metricgrid">' +
        '<div class="metric"><div class="value">' + Number(counts.total || 0) + '</div><div class="label">Записей сегодня</div></div>' +
        '<div class="metric"><div class="value">' + Number(counts.inProgress || 0) + '</div><div class="label">В работе</div></div>' +
        '<div class="metric"><div class="value">' + Number(counts.completed || 0) + '</div><div class="label">Завершено</div></div>' +
      '</div>' +
      '<div class="sectionhead"><div><h2>Очередь на сегодня</h2><div class="smallmuted" style="margin-top:5px">Текущие записи и действия по визитам</div><div class="count" style="margin-top:5px">' + rows.length + ' ЗАПИСЕЙ</div></div><button type="button" class="btn" id="add-appointment">＋ Добавить запись</button></div>' +
      (rows.length ? '<div class="list">' + rows.map(rowForVisit).join("") + '</div>' : '<div class="empty">На сегодня записей нет</div>') +
      '<div id="visit-action-panel"></div><div id="appointment-editor-slot"></div>';


    content.querySelectorAll("[data-toggle-visit-detail]").forEach(function(button) {
      button.addEventListener("click",function() {
        const id = Number(button.dataset.toggleVisitDetail);
        const item = rows.find(function(row){ return Number(row.id) === id; });
        const panel = content.querySelector("#visit-detail-" + id);
        if (!item || !panel) return;
        const opening = panel.hidden;
        if (opening) panel.innerHTML = visitDetailsHtml(item);
        panel.hidden = !opening;
        button.setAttribute("aria-expanded",String(opening));
        const hint = button.querySelector(".visit-record-hint");
        if (hint) hint.textContent = opening ? "Скрыть подробности ↑" : "Открыть запись · услуги ↓";
      });
    });

    document.getElementById("add-appointment").addEventListener("click",function() {
      openAppointmentEditor(null, moscowISODate()).catch(showError);
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
  async function openAppointmentEditor(appointment, defaultDate, selectedShift) {
    const slot = document.getElementById("appointment-editor-slot");
    if (!slot) return;
    slot.innerHTML = '<div class="loading">Загружаю питомцев…</div>';
    const petsData = await api("/api/pets");
    const pets = petsData.pets || [];
    if (!pets.length) {
      slot.innerHTML = '<div class="notice">Сначала добавь питомца в разделе «Питомцы», затем можно будет создать запись.</div>';
      return;
    }
    const editing = !!appointment;
    const dateValue = appointment
      ? appointment.appointment_date
      : defaultDate || (currentScreen === "calendar" ? calendarSelectedDate : moscowISODate());
    const timeValue = appointment
      ? appointment.appointment_time
      : selectedShift ? selectedShift.start_time : "10:00";
    slot.innerHTML =
      '<section class="appointment-form">' +
        '<div class="eyebrow">' + (editing ? 'РЕДАКТИРОВАНИЕ ЗАПИСИ' : 'НОВАЯ ЗАПИСЬ') + '</div>' +
        '<h2>' + (editing ? 'Изменить запись' : 'Добавить запись') + '</h2>' +
        '<div class="smallmuted">Выбери питомца, рабочую дату и свободное время. Запись можно будет изменить позже.</div>' +
        '<form id="appointment-edit-form">' +
          '<label class="field"><span>ПИТОМЕЦ</span><select name="dogId" required>' +
            pets.map(function(pet) {
              const selected = Number(pet.id) === Number(appointment && appointment.dog_id) ? ' selected' : '';
              return '<option value="' + Number(pet.id) + '"' + selected + '>' + esc(pet.name) + (pet.breed ? ' · ' + esc(pet.breed) : '') + '</option>';
            }).join("") +
          '</select></label>' +
          '<label class="field"><span>ДАТА</span><input name="date" type="date" min="' + moscowISODate() + '" value="' + esc(dateValue) + '" required></label>' +
          '<label class="field"><span>ВРЕМЯ</span><input name="time" type="time" value="' + esc(timeValue) + '" required></label>' +
          '<div class="calendar-time-help">Записи создаются только на даты, отмеченные рабочими в календаре, и в пределах времени смены. Одно время нельзя занять двумя записями.</div>' +
          '<div class="appointment-form-error" id="appointment-form-error"></div>' +
          '<div class="appointment-form-actions" style="margin-top:14px">' +
            '<button type="submit" class="btn" id="appointment-form-save">' + (editing ? 'Сохранить изменения' : 'Добавить запись') + '</button>' +
            '<button type="button" class="btn secondary" id="appointment-form-cancel">Отмена</button>' +
          '</div>' +
        '</form>' +
      '</section>';
    document.getElementById("appointment-form-cancel").addEventListener("click",function(){slot.innerHTML="";});
    document.getElementById("appointment-edit-form").addEventListener("submit",async function(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const body = {
        dogId:Number(form.elements.dogId.value),
        date:form.elements.date.value,
        time:form.elements.time.value
      };
      const saveButton = document.getElementById("appointment-form-save");
      const errorBox = document.getElementById("appointment-form-error");
      saveButton.disabled = true;
      saveButton.textContent = "Сохраняю…";
      errorBox.style.display = "none";
      try {
        await api(editing ? "/api/appointments/" + Number(appointment.id) : "/api/appointments", {
          method:editing ? "PUT" : "POST",
          body:JSON.stringify(body)
        });
        if (currentScreen === "calendar" || body.date !== moscowISODate()) {
          calendarSelectedDate = body.date;
          calendarMonth = body.date.slice(0,7);
          await renderCalendar();
        } else {
          await renderToday();
        }
      } catch(error) {
        errorBox.textContent = error.message || "Не удалось сохранить запись.";
        errorBox.style.display = "block";
        saveButton.disabled = false;
        saveButton.textContent = editing ? "Сохранить изменения" : "Добавить запись";
      }
    });
    slot.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function moscowISODate(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone:"Europe/Moscow", year:"numeric", month:"2-digit", day:"2-digit"
    }).formatToParts(date || new Date());
    const values = {};
    parts.forEach(function(part){ if (part.type !== "literal") values[part.type] = part.value; });
    return values.year + "-" + values.month + "-" + values.day;
  }
  function calendarMonthLabel(monthValue) {
    return new Intl.DateTimeFormat("ru-RU", {
      month:"long", year:"numeric", timeZone:"UTC"
    }).format(new Date(monthValue + "-01T12:00:00Z"));
  }
  function calendarDateLabel(dateValue) {
    return new Intl.DateTimeFormat("ru-RU", {
      weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"UTC"
    }).format(new Date(dateValue + "T12:00:00Z"));
  }
  function moveCalendarMonth(delta) {
    const parts = calendarMonth.split("-").map(Number);
    const next = new Date(Date.UTC(parts[0], parts[1] - 1 + delta, 1));
    calendarMonth = next.getUTCFullYear() + "-" + String(next.getUTCMonth() + 1).padStart(2, "0");
    calendarSelectedDate = calendarMonth + "-01";
    renderCalendar().catch(showError);
  }
  async function renderCalendar() {
    currentScreen = "calendar";
    if (!calendarMonth) {
      const today = moscowISODate();
      calendarMonth = today.slice(0,7);
      calendarSelectedDate = today;
    }
    if (!calendarSelectedDate || calendarSelectedDate.slice(0,7) !== calendarMonth) {
      calendarSelectedDate = calendarMonth + "-01";
    }
    setHead("Календарь","Рабочие дни и время смен");
    content.innerHTML = '<div class="loading">Загружаю календарь…</div>';
    const data = await api("/api/work-shifts?month=" + encodeURIComponent(calendarMonth));
    const shifts = {};
    (data.shifts || []).forEach(function(shift){ shifts[shift.shift_date] = shift; });
    const monthParts = calendarMonth.split("-").map(Number);
    const year = monthParts[0], monthNumber = monthParts[1];
    const monthLastDate = new Date(Date.UTC(year, monthNumber, 0));
    const rangeEnd = year + "-" + String(monthNumber).padStart(2,"0") + "-" + String(monthLastDate.getUTCDate()).padStart(2,"0");
    const appointmentData = await api("/api/appointments?from=" + encodeURIComponent(calendarMonth + "-01") + "&to=" + encodeURIComponent(rangeEnd));
    const appointmentsByDate = {};
    (appointmentData.appointments || []).forEach(function(item) {
      if (!appointmentsByDate[item.appointment_date]) appointmentsByDate[item.appointment_date] = [];
      appointmentsByDate[item.appointment_date].push(item);
    });
    const selectedDateAppointments = appointmentsByDate[calendarSelectedDate] || [];
    const todayDate = moscowISODate();
    const firstWeekday = (new Date(Date.UTC(year,monthNumber-1,1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year,monthNumber,0)).getUTCDate();
    const cells = [];
    for (let blank = 0; blank < firstWeekday; blank++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(calendarMonth + "-" + String(day).padStart(2,"0"));
    }
    const selectedShift = shifts[calendarSelectedDate] || null;
    const selectedDateLabel = calendarDateLabel(calendarSelectedDate);
    const selectedHeading = selectedDateLabel.charAt(0).toUpperCase() + selectedDateLabel.slice(1);
    const weekdays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(function(day){
      return '<div class="calendar-weekday">' + day + '</div>';
    }).join("");
    const dayCells = cells.map(function(dateValue) {
      if (!dateValue) return '<div class="calendar-day is-empty" aria-hidden="true"></div>';
      const dayNumber = Number(dateValue.slice(8,10));
      const shift = shifts[dateValue];
      const active = dateValue === calendarSelectedDate;
      const dayOfWeek = new Date(Date.UTC(year, monthNumber - 1, dayNumber)).getUTCDay();
      const weekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = dateValue === todayDate;
      const dayAppointments = appointmentsByDate[dateValue] || [];
      return '<button type="button" class="calendar-day' +
        (shift ? ' is-working' : '') +
        (weekend ? ' is-weekend' : '') +
        (isToday ? ' is-today' : '') +
        (active ? ' is-selected' : '') +
        '" data-calendar-date="' + dateValue + '" aria-label="' + esc(calendarDateLabel(dateValue)) +
        (shift ? ', рабочий день' : ', выходной') +
        (dayAppointments.length ? ', записей: ' + dayAppointments.length : '') + '">' +
        '<span class="calendar-day-number">' + dayNumber + '</span>' +
        (shift ? '<span class="calendar-day-dot"></span>' : '') +
        (dayAppointments.length ? '<span class="calendar-appointment-count">' + dayAppointments.length + ' зап.</span>' : '') +
        '</button>';
    }).join("");
    content.innerHTML =
      '<div class="calendar-toolbar">' +
        '<button type="button" class="calendar-month-btn" id="calendar-prev" aria-label="Предыдущий месяц">‹</button>' +
        '<div class="calendar-month-title">' + esc(calendarMonthLabel(calendarMonth)) + '</div>' +
        '<button type="button" class="calendar-month-btn" id="calendar-next" aria-label="Следующий месяц">›</button>' +
      '</div>' +
      '<div class="calendar-grid calendar-weekdays">' + weekdays + '</div>' +
      '<div class="calendar-grid">' + dayCells + '</div>' +
      '<div class="calendar-legend">' +
        '<span class="calendar-legend-item"><i class="calendar-legend-mark working"></i>Рабочий день</span>' +
        '<span class="calendar-legend-item"><i class="calendar-legend-mark today"></i>Сегодня</span>' +
        '<span class="calendar-legend-item"><i class="calendar-legend-mark selected"></i>Выбрана дата</span>' +
        '<span class="calendar-legend-item"><i class="calendar-legend-mark"></i>Выходной</span>' +
      '</div>' +
      '<div class="calendar-summary"><span>Рабочих дней в месяце</span><strong>' + Object.keys(shifts).length + '</strong></div>' +
      '<section class="calendar-day-appointments">' +
        '<div class="sectionhead" style="margin:0 0 8px"><div><h2>Записи на дату</h2><div class="smallmuted" style="margin-top:5px">' + esc(selectedHeading) + '</div></div><button type="button" class="btn" id="calendar-add-appointment" ' + (selectedShift ? '' : 'disabled') + '>' + (selectedShift ? '＋ Добавить запись' : 'Сначала добавь смену') + '</button></div>' +
        (selectedDateAppointments.length ? selectedDateAppointments.map(function(item) {
          return '<article class="appointment-card">' +
            '<div class="appointment-card-time">' + esc(item.appointment_time || "—") + '</div>' +
            '<div><div class="appointment-card-name">' + esc(item.name) + '</div><div class="appointment-card-meta">' + esc([item.breed, item.species === "cat" ? "кошка" : "собака", statusText(item.status)].filter(Boolean).join(" · ")) + '</div></div>' +
            ([ "scheduled", "waiting" ].includes(item.status) ? '<button type="button" class="inlineaction" data-edit-appointment="' + Number(item.id) + '">Изменить</button>' : '<span class="status">' + esc(statusText(item.status)) + '</span>') +
          '</article>';
        }).join("") : '<div class="empty">На эту дату пока нет записей.</div>') +
        '<div id="appointment-editor-slot"></div>' +
      '</section>' +
      '<section class="calendar-editor">' +
        '<div class="eyebrow">' + (selectedShift ? 'РАБОЧАЯ СМЕНА' : 'ВЫХОДНОЙ') + '</div>' +
        '<div class="calendar-editor-title">' + esc(selectedHeading) + '</div>' +
        '<div class="smallmuted">' + (selectedShift ? 'Измени часы смены или убери этот рабочий день.' : 'Добавь рабочий день и задай время приёма. Для создания записи сначала укажи смену.') + '</div>' +
        '<div class="calendar-time-fields">' +
          '<label class="calendar-time-field"><span>НАЧАЛО СМЕНЫ</span><input type="time" class="calendar-time-input" id="calendar-start" value="' + esc(selectedShift ? selectedShift.start_time : '10:00') + '" required></label>' +
          '<label class="calendar-time-field"><span>КОНЕЦ СМЕНЫ</span><input type="time" class="calendar-time-input" id="calendar-end" value="' + esc(selectedShift ? selectedShift.end_time : '20:00') + '" required></label>' +
        '</div>' +
        '<div class="calendar-editor-actions">' +
          '<button type="button" class="btn" id="calendar-save">' + (selectedShift ? 'Сохранить изменения' : 'Добавить рабочий день') + '</button>' +
          (selectedShift ? '<button type="button" class="btn secondary" id="calendar-remove">Убрать рабочий день</button>' : '<button type="button" class="btn secondary" id="calendar-today">К текущему месяцу</button>') +
        '</div>' +
        '<div class="calendar-helper">При удалении рабочего дня записи клиентов не удаляются — меняется только график смен.</div>' +
      '</section>';
    document.getElementById("calendar-add-appointment").addEventListener("click",function() {
      openAppointmentEditor(null, calendarSelectedDate, selectedShift).catch(showError);
    });
    content.querySelectorAll("[data-edit-appointment]").forEach(function(button) {
      button.addEventListener("click",function() {
        const appointment = selectedDateAppointments.find(function(item){return Number(item.id) === Number(button.dataset.editAppointment);});
        if (appointment) openAppointmentEditor(appointment, calendarSelectedDate, selectedShift).catch(showError);
      });
    });
    document.getElementById("calendar-prev").addEventListener("click",function(){moveCalendarMonth(-1);});
    document.getElementById("calendar-next").addEventListener("click",function(){moveCalendarMonth(1);});
    content.querySelectorAll("[data-calendar-date]").forEach(function(button) {
      button.addEventListener("click",function() {
        calendarSelectedDate = button.dataset.calendarDate;
        renderCalendar().catch(showError);
      });
    });
    document.getElementById("calendar-save").addEventListener("click",async function() {
      const startTime = document.getElementById("calendar-start").value;
      const endTime = document.getElementById("calendar-end").value;
      if (!startTime || !endTime || startTime >= endTime) {
        showError(new Error("Проверь время начала и окончания смены."));
        return;
      }
      const saveButton = document.getElementById("calendar-save");
      saveButton.disabled = true;
      saveButton.textContent = "Сохраняю…";
      try {
        await api("/api/work-shifts", {
          method:"POST",
          body:JSON.stringify({date:calendarSelectedDate,startTime:startTime,endTime:endTime})
        });
        await renderCalendar();
      } catch(error) {
        showError(error);
      }
    });
    const removeButton = document.getElementById("calendar-remove");
    if (removeButton) {
      removeButton.addEventListener("click",async function() {
        if (!confirm("Убрать рабочий день " + calendarDateLabel(calendarSelectedDate) + "? Записи клиентов останутся.")) return;
        removeButton.disabled = true;
        removeButton.textContent = "Убираю…";
        try {
          await api("/api/work-shifts?date=" + encodeURIComponent(calendarSelectedDate), {method:"DELETE"});
          await renderCalendar();
        } catch(error) {
          showError(error);
        }
      });
    } else {
      document.getElementById("calendar-today").addEventListener("click",function() {
        const today = moscowISODate();
        calendarMonth = today.slice(0,7);
        calendarSelectedDate = today;
        renderCalendar().catch(showError);
      });
    }
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
    setHead("Питомцы","Карточки, особенности и история ухода");
    clearObjectUrls();
    content.innerHTML =
      '<div class="searchbar"><input id="pet-search" placeholder="Найти питомца по имени или породе" value="' + esc(petQuery) + '" autocomplete="off"><button id="pet-search-btn">Найти</button></div>' +
      '<div class="sectionhead" style="margin-top:4px"><div><h2>Коллекция питомцев</h2><div class="count" id="pet-count" style="margin-top:5px">Загрузка карточек</div></div><button class="btn" type="button" id="add-pet">＋ Добавить</button></div>' +
      '<div id="pet-editor-slot"></div>' +
      '<div id="pet-list" class="pet-grid"><div class="loading">Загружаю карточки…</div></div>';

    const searchInput = document.getElementById("pet-search");
    const searchButton = document.getElementById("pet-search-btn");
    document.getElementById("add-pet").addEventListener("click",function() {
      bindPetCardForm(document.getElementById("pet-editor-slot"), {name:"",species:"dog"}, null);
    });

    async function runSearch() {
      petQuery = searchInput.value.trim();
      const host = document.getElementById("pet-list");
      const count = document.getElementById("pet-count");
      host.innerHTML = '<div class="loading">Ищу питомцев…</div>';
      try {
        const data = await api("/api/pets?q=" + encodeURIComponent(petQuery));
        const pets = data.pets || [];
        if (count) count.textContent = pets.length + (pets.length === 100 ? "+" : "") + (pets.length === 1 ? " питомец" : pets.length > 1 && pets.length < 5 ? " питомца" : " питомцев");
        host.innerHTML = pets.length ? pets.map(function(pet) {
          const description = [pet.species === "cat" ? "Кошка" : "Собака", pet.breed].filter(Boolean).join(" · ");
          const initials = String(pet.name || "?").trim().split(/\s+/).slice(0,2).map(function(part){return part.charAt(0);}).join("").toUpperCase();
          const cover = pet.cover_photo_id
            ? '<div class="pet-cover-placeholder" data-photo-fallback>' + esc(initials) + '</div><img alt="Фото питомца" loading="lazy" style="display:none" data-cover-photo-id="' + Number(pet.cover_photo_id) + '">'
            : '<div class="pet-cover-placeholder">' + esc(initials) + '</div>';
          return '<article class="pet-card" role="button" tabindex="0" data-pet-id="' + Number(pet.id) + '">' +
            '<div class="pet-cover">' + cover + '<div class="pet-cover-label">' + (pet.species === "cat" ? "CAT" : "DOG") + '</div></div>' +
            '<div class="pet-card-body"><div class="petname">' + esc(pet.name) + '</div><div class="petbreed">' + esc(description) + '</div>' +
            '<div class="pet-foot"><span>КАРТОЧКА № ' + Number(pet.id) + '</span><span class="arrow">↗</span></div></div></article>';
        }).join("") : '<div class="empty" style="grid-column:1/-1">Питомцев не найдено. Попробуй изменить запрос или добавь новую карточку.</div>';

        await Promise.all(pets.filter(function(pet){return !!pet.cover_photo_id;}).map(function(pet) {
          const image = host.querySelector('[data-cover-photo-id="' + Number(pet.cover_photo_id) + '"]');
          return loadPrivatePhoto(image, pet.cover_photo_id, pet.cover_photo_type === "cover" ? "cover" : pet.cover_photo_type === "visit" ? "visit" : "grooming");
        }));
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
        e.preventDefault();
        renderPet(Number(row.dataset.petId)).catch(showError);
      }
    };
    await runSearch();
  }
  function detailRow(label,value) {
    return '<div class="detailrow"><div class="key">' + esc(label) + '</div><div class="val">' + esc(value || "—") + '</div></div>';
  }
  function isGroomingCardExcluded(pet) {
    if (!pet || pet.species !== "dog") return true;
    const breed = String(pet.breed || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zа-я0-9]+/g, " ")
      .trim();
    const excludedBreeds = [
      "йорк", "york",
      "мопс", "pug",
      "чихуахуа", "chihuahua",
      "бульдог", "bulldog",
      "кхс", "китайская хохлатая", "chinese crested",
      "джек рассел", "джекрассел", "jack russell",
      "кавалер", "cavalier",
      "такса", "dachshund",
      "той терьер", "тойтерьер", "русский той", "toy terrier",
      "фокстерьер", "фокс терьер", "fox terrier",
      "басенджи", "basenji",
      "баварская гончая", "bavarian mountain hound", "bayerischer gebirgsschweisshund",
      "американский кокер", "american cocker",
      "спаниель", "spaniel",
      "пти брабансон", "пти брабансона", "petit brabancon", "brabancon"
    ];
    return excludedBreeds.some(function(name) {
      return breed.indexOf(name) !== -1;
    });
  }

  async function renderPet(id) {
    currentScreen = "pet-detail";
    setHead("Карточка","Данные питомца");
    clearObjectUrls();
    content.innerHTML = '<div class="loading">Открываю карточку…</div>';

    const data = await api("/api/pets/" + id);
    const pet = data.pet || {};
    const card = data.groomingCard || {};
    const photos = data.photos || [];
    const coverInitials = String(pet.name || "?").trim().split(/\s+/).slice(0,2).map(function(part){return part.charAt(0);}).join("").toUpperCase();
    const profilePhoto = data.profilePhoto || null;
    const profilePhotoType = "cover";
    const profileCover = profilePhoto
      ? '<span class="profile-fallback" data-photo-fallback>' + esc(coverInitials) + '</span><img alt="Фото питомца" data-profile-photo data-cover-photo-id="' + Number(profilePhoto.id) + '" src="" style="display:none">'
      : '<span class="profile-fallback">' + esc(coverInitials) + '</span>';
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

    const cardSection = pet.species === "dog" && !isGroomingCardExcluded(pet)
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
      ? '<section class="detailsection"><h3>Фото-примеры для карты стрижки</h3><div class="smallmuted" style="margin:-4px 0 12px">Примеры длины, формы и результата. Эти фотографии не относятся к отдельным визитам.</div>' +
        (photos.length
          ? '<div class="photo-grid">' + photos.map(function(photo) {
              return '<div class="photo-tile"><img alt="Фото-пример для карты стрижки" loading="lazy" data-photo-id="' + Number(photo.id) + '" src=""></div>';
            }).join("") + '</div>'
          : '<div class="smallmuted" style="margin:10px 0 14px">Фотографий пока нет.</div>') +
        '<label class="btn secondary filelabel">Добавить фото-пример<input id="photo-upload" type="file" accept="image/*"></label>' +
        '<div class="smallmuted" style="margin-top:9px">Изображение до 10 МБ. Архив хранится отдельно от главного фото и истории визитов.</div>' +
        '</section>'
      : "";

    content.innerHTML =
      '<button class="back" id="back-pets">← Все питомцы</button>' +
      '<div class="profile-hero"><div><div class="eyebrow">КАРТОЧКА ПИТОМЦА · № ' + Number(pet.id) + '</div><div class="detailtitle">' + esc(pet.name) + '</div><div class="detailbreed">' + esc([pet.species === "cat" ? "Кошка" : "Собака",pet.breed].filter(Boolean).join(" · ")) + '</div></div><div class="profile-mark">' + profileCover + '</div></div>' +
      '<section class="detailsection photo-purpose"><h3>Главное фото питомца</h3><div class="smallmuted">Это фото отображается на общей сетке питомцев. Оно не заменяет фото-примеры стрижки или снимки после визитов.</div><label class="btn secondary filelabel full">' + (data.profilePhoto ? "Заменить главное фото" : "Добавить главное фото") + '<input id="cover-photo-upload" type="file" accept="image/*"></label></section>' +
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
      '<section class="detailsection"><h3>История визитов</h3><div id="pet-visit-history-slot"><div class="smallmuted">Загружаю историю…</div></div></section>' +
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

    const coverPhotoInput = document.getElementById("cover-photo-upload");
    if (coverPhotoInput) {
      coverPhotoInput.addEventListener("change",async function() {
        const imageFile = coverPhotoInput.files && coverPhotoInput.files[0];
        if (!imageFile) return;
        if (!String(imageFile.type || "").startsWith("image/")) {
          showError(new Error("Выбери изображение."));
          return;
        }
        if (imageFile.size > 10 * 1024 * 1024) {
          showError(new Error("Размер фотографии должен быть не больше 10 МБ."));
          return;
        }
        coverPhotoInput.disabled = true;
        try {
          const formData = new FormData();
          formData.append("photo",imageFile,imageFile.name);
          await api("/api/pets/" + id + "/cover-photo",{
            method:"POST",
            body:formData
          });
          await renderPet(id);
        } catch(error) {
          showError(error);
          coverPhotoInput.disabled = false;
        }
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

    const profileImage = content.querySelector("[data-profile-photo]");
    const galleryImages = photos.map(function(photo) {
      return loadPrivatePhoto(content.querySelector('[data-photo-id="' + Number(photo.id) + '"]'), photo.id);
    });
    if (profileImage && profilePhoto) galleryImages.push(loadPrivatePhoto(profileImage, profilePhoto.id, profilePhotoType));

    const historySlot = document.getElementById("pet-visit-history-slot");
    try {
      const visitData = await api("/api/visits");
      const petVisits = (visitData.visits || []).filter(function(item) {
        return Number(item.dog_id) === Number(id);
      });
      if (!petVisits.length) {
        historySlot.innerHTML = '<div class="smallmuted">Завершённых визитов пока нет.</div>';
      } else {
        historySlot.innerHTML = petVisits.map(function(item) {
          const visitPhotos = item.photos || [];
          return '<article class="history-card">' +
            '<div class="history-top"><div><div class="history-name">' + esc(dateText(item.appointment_date)) + '</div><div class="history-meta">' + esc(statusText(item.status)) + (item.actual_duration_minutes ? ' · ' + esc(formatDuration(item.actual_duration_minutes)) : '') + '</div></div>' +
            '<div class="history-time">' + esc(item.actual_start_time || item.appointment_time || "—") + '</div></div>' +
            (item.procedures ? '<div class="history-procedures">' + esc(item.procedures) + '</div>' : '') +
            '<div class="smallmuted history-photo-label">Фото после визита</div>' +
            (visitPhotos.length
              ? '<div class="history-photos">' + visitPhotos.map(function(photo) {
                  return '<div class="photo-tile history-photo"><img alt="Фото после визита" loading="lazy" data-visit-photo="' + Number(photo.id) + '" src=""></div>';
                }).join("") + '</div>'
              : '<div class="smallmuted">Для этого визита фото ещё не добавлены.</div>') +
            (item.status === "completed" ? '<label class="btn secondary filelabel history-photo-label">Добавить фото после визита<input type="file" accept="image/*" data-after-photo-upload="' + Number(item.id) + '"></label>' : '') +
            '<div class="pet-foot"><span>ВИЗИТ № ' + Number(item.id) + '</span><span style="font-size:11px;font-weight:750;color:#111">' + (Number(item.earned || 0) ? money(item.earned) : '') + '</span></div>' +
          '</article>';
        }).join("");
        const visitJobs = [];
        petVisits.forEach(function(item) {
          (item.photos || []).forEach(function(photo) {
            visitJobs.push(loadPrivatePhoto(
              historySlot.querySelector('[data-visit-photo="' + Number(photo.id) + '"]'),
              photo.id,
              "visit"
            ));
          });
        });
        await Promise.all(visitJobs);
        historySlot.querySelectorAll("[data-after-photo-upload]").forEach(function(input) {
          input.addEventListener("change", async function() {
            const imageFile = input.files && input.files[0];
            if (!imageFile) return;
            if (!String(imageFile.type || "").startsWith("image/")) {
              showError(new Error("Выбери изображение."));
              return;
            }
            if (imageFile.size > 10 * 1024 * 1024) {
              showError(new Error("Размер фотографии должен быть не больше 10 МБ."));
              return;
            }
            input.disabled = true;
            try {
              const formData = new FormData();
              formData.append("photo", imageFile, imageFile.name);
              await api("/api/appointments/" + Number(input.dataset.afterPhotoUpload) + "/after-photos", {
                method:"POST",
                body:formData
              });
              await renderPet(id);
            } catch(error) {
              showError(error);
              input.disabled = false;
            }
          });
        });
      }
    } catch(error) {
      historySlot.innerHTML = '<div class="smallmuted">Не удалось загрузить историю визитов.</div>';
    }
    await Promise.all(galleryImages);
  }
  async function renderVisits() {
    currentScreen = "visits";
    setHead("Визиты","История работы с питомцами");
    clearObjectUrls();
    content.innerHTML = '<div class="loading">Загружаю историю визитов…</div>';
    const data = await api("/api/visits");
    const visits = data.visits || [];
    content.innerHTML =
      '<div class="sectionhead" style="margin-top:0"><div><h2>История визитов</h2><div class="smallmuted" style="margin-top:5px">Последние записи и выполненные услуги</div></div><span class="count">' + visits.length + (visits.length === 100 ? "+" : "") + '</span></div>' +
      (visits.length ? '<div>' + visits.map(function(item) {
        const date = dateText(item.appointment_date);
        const time = item.actual_start_time || item.appointment_time || "—";
        const duration = Number(item.actual_duration_minutes || 0);
        const earned = Number(item.earned || 0);
        return '<article class="history-card">' +
          '<div class="history-top"><div><div class="history-name">' + esc(item.name) + '</div><div class="history-meta">' + esc([item.breed, item.species === "cat" ? "кошка" : "собака"].filter(Boolean).join(" · ")) + '<br>' + esc(date) + ' · ' + esc(statusText(item.status)) + '</div></div>' +
          '<div class="history-time">' + esc(time) + '</div></div>' +
          '<button type="button" class="inlineaction visit-history-toggle" data-toggle-history-detail="' + Number(item.id) + '" aria-expanded="false">Открыть запись · услуги ↓</button>' +
          '<div class="visit-detail-panel" id="history-visit-detail-' + Number(item.id) + '" hidden></div>' +
          '<div class="smallmuted history-photo-label">Фото после визита</div>' +
          ((item.photos || []).length
            ? '<div class="history-photos">' + item.photos.map(function(photo) {
                return '<div class="photo-tile history-photo"><img alt="Фото после визита" loading="lazy" data-visit-photo="' + Number(photo.id) + '" src=""></div>';
              }).join("") + '</div>'
            : '<div class="smallmuted">Фотографий пока нет.</div>') +
          (item.status === "completed" ? '<label class="btn secondary filelabel history-photo-label">Добавить фото после визита<input type="file" accept="image/*" data-after-photo-upload="' + Number(item.id) + '"></label>' : '') +
          '<div class="pet-foot"><span>' + (duration ? 'ДЛИТЕЛЬНОСТЬ · ' + esc(formatDuration(duration)) : 'ВИЗИТ № ' + Number(item.id)) + '</span><span style="font-size:11px;font-weight:750;color:#111">' + (earned ? money(earned) : '') + '</span></div>' +
          (item.status === "in_progress" ? '<button type="button" class="inlineaction primary-action" data-finish-history-visit="' + Number(item.id) + '" data-pet-name="' + esc(item.name) + '">Завершить и внести услуги</button><div class="visit-action-panel"></div>' : '') +
          '<button type="button" class="inlineaction" data-open-pet="' + Number(item.dog_id) + '">Открыть карточку питомца ↗</button>' +
        '</article>';
      }).join("") + '</div>' : '<div class="empty">История пока пустая. Завершённые визиты появятся здесь.</div>');
    content.querySelectorAll("[data-toggle-history-detail]").forEach(function(button) {
      button.addEventListener("click",function() {
        const id = Number(button.dataset.toggleHistoryDetail);
        const item = visits.find(function(visit){ return Number(visit.id) === id; });
        const panel = content.querySelector("#history-visit-detail-" + id);
        if (!item || !panel) return;
        const opening = panel.hidden;
        if (opening) panel.innerHTML = visitDetailsHtml(item);
        panel.hidden = !opening;
        button.setAttribute("aria-expanded",String(opening));
        button.textContent = opening ? "Скрыть подробности ↑" : "Открыть запись · услуги ↓";
      });
    });
    const photoJobs = [];
    visits.forEach(function(item) {
      (item.photos || []).forEach(function(photo) {
        photoJobs.push(loadPrivatePhoto(
          content.querySelector('[data-visit-photo="' + Number(photo.id) + '"]'),
          photo.id,
          "visit"
        ));
      });
    });
    content.querySelectorAll("[data-after-photo-upload]").forEach(function(input) {
      input.addEventListener("change",async function() {
        const imageFile = input.files && input.files[0];
        if (!imageFile) return;
        if (!String(imageFile.type || "").startsWith("image/")) {
          showError(new Error("Выбери изображение."));
          return;
        }
        if (imageFile.size > 10 * 1024 * 1024) {
          showError(new Error("Размер фотографии должен быть не больше 10 МБ."));
          return;
        }
        input.disabled = true;
        try {
          const formData = new FormData();
          formData.append("photo",imageFile,imageFile.name);
          await api("/api/appointments/" + Number(input.dataset.afterPhotoUpload) + "/after-photos", {
            method:"POST",
            body:formData
          });
          await renderVisits();
        } catch(error) {
          showError(error);
          input.disabled = false;
        }
      });
    });
    content.querySelectorAll("[data-finish-history-visit]").forEach(function(button) {
      button.addEventListener("click",function() {
        const article = button.closest(".history-card");
        const panel = article && article.querySelector(".visit-action-panel");
        if (!panel) return;
        const appointmentId = Number(button.dataset.finishHistoryVisit);
        panel.innerHTML =
          '<section class="action-form">' +
            '<div class="eyebrow">ЗАВЕРШЕНИЕ ВИЗИТА</div>' +
            '<h2 style="margin:8px 0 6px">' + esc(button.dataset.petName) + '</h2>' +
            '<div class="smallmuted" style="margin-bottom:14px">Внеси выполненные услуги и сумму — по одной на строку.</div>' +
            '<form class="history-finish-form">' +
              '<textarea class="formtextarea history-finish-services" rows="4" required placeholder="Комплекс 3200&#10;Когти 300"></textarea>' +
              '<button class="btn full history-finish-save" type="submit">Сохранить услуги и завершить</button>' +
              '<button class="btn secondary full history-finish-cancel" type="button">Отмена</button>' +
            '</form>' +
          '</section>';
        panel.querySelector(".history-finish-cancel").addEventListener("click",function(){panel.innerHTML="";});
        panel.querySelector(".history-finish-form").addEventListener("submit",async function(event) {
          event.preventDefault();
          const saveButton = panel.querySelector(".history-finish-save");
          const servicesText = panel.querySelector(".history-finish-services").value;
          saveButton.disabled = true;
          saveButton.textContent = "Сохраняю…";
          try {
            await api("/api/visits/" + appointmentId + "/finish", {
              method:"POST",
              body:JSON.stringify({servicesText:servicesText})
            });
            await renderVisits();
          } catch(error) {
            saveButton.disabled = false;
            saveButton.textContent = "Сохранить услуги и завершить";
            let errorBox = panel.querySelector(".appointment-form-error");
            if (!errorBox) {
              errorBox = document.createElement("div");
              errorBox.className = "appointment-form-error";
              panel.querySelector(".history-finish-form").appendChild(errorBox);
            }
            errorBox.textContent = error.message || "Не удалось завершить визит.";
            errorBox.style.display = "block";
          }
        });
      });
    });
    content.querySelectorAll("[data-open-pet]").forEach(function(button) {
      button.addEventListener("click",function() {
        renderPet(Number(button.dataset.openPet)).catch(showError);
      });
    });
    await Promise.all(photoJobs);
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
    clearObjectUrls();
    try {
      if(screen==="today") await renderToday();
      else if(screen==="calendar") await renderCalendar();
      else if(screen==="pets") await renderPets();
      else if(screen==="visits") await renderVisits();
      else if(screen==="earnings") await renderEarnings();
    } catch(error){showError(error);}
  }
  document.querySelectorAll(".tab").forEach(function(button){
    button.addEventListener("click",function(){navigate(button.dataset.screen);});
  });
  if (!initData && !sessionToken) {
    renderLogin();
    return;
  }
  document.body.classList.remove("logged-out");
  navigate("today");
})();
</script>
</body>
</html>`;
