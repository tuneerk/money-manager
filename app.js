'use strict';

const KEYWORD_MAP = {
  swiggy:       ['Food & Dining', 'Swiggy / Zomato'],
  zomato:       ['Food & Dining', 'Swiggy / Zomato'],
  blinkit:      ['Food & Dining', 'Groceries'],
  zepto:        ['Food & Dining', 'Groceries'],
  bigbasket:    ['Food & Dining', 'Groceries'],
  dmart:        ['Food & Dining', 'Groceries'],
  grocery:      ['Food & Dining', 'Groceries'],
  groceries:    ['Food & Dining', 'Groceries'],
  supermarket:  ['Food & Dining', 'Groceries'],
  restaurant:   ['Food & Dining', 'Restaurants'],
  cafe:         ['Food & Dining', 'Cafes & Coffee'],
  coffee:       ['Food & Dining', 'Cafes & Coffee'],
  starbucks:    ['Food & Dining', 'Cafes & Coffee'],
  chai:         ['Food & Dining', 'Cafes & Coffee'],
  mcdonald:     ['Food & Dining', 'Restaurants'],
  kfc:          ['Food & Dining', 'Restaurants'],
  domino:       ['Food & Dining', 'Restaurants'],
  pizza:        ['Food & Dining', 'Restaurants'],
  biryani:      ['Food & Dining', 'Restaurants'],
  ola:          ['Transport', 'Auto / Cab'],
  uber:         ['Transport', 'Auto / Cab'],
  rapido:       ['Transport', 'Auto / Cab'],
  auto:         ['Transport', 'Auto / Cab'],
  cab:          ['Transport', 'Auto / Cab'],
  taxi:         ['Transport', 'Auto / Cab'],
  petrol:       ['Transport', 'Petrol'],
  fuel:         ['Transport', 'Petrol'],
  diesel:       ['Transport', 'Petrol'],
  metro:        ['Transport', 'Metro / Bus'],
  bus:          ['Transport', 'Metro / Bus'],
  train:        ['Transport', 'Metro / Bus'],
  pharmacy:     ['Health', 'Medicines'],
  medicine:     ['Health', 'Medicines'],
  medicines:    ['Health', 'Medicines'],
  doctor:       ['Health', 'Doctor'],
  hospital:     ['Health', 'Doctor'],
  clinic:       ['Health', 'Doctor'],
  gym:          ['Health', 'Gym'],
  fitness:      ['Health', 'Gym'],
  amazon:       ['Shopping', 'Online Shopping'],
  flipkart:     ['Shopping', 'Online Shopping'],
  myntra:       ['Shopping', 'Clothes'],
  ajio:         ['Shopping', 'Clothes'],
  meesho:       ['Shopping', 'Online Shopping'],
  electricity:  ['Bills & Utilities', 'Electricity'],
  airtel:       ['Bills & Utilities', 'Internet'],
  jio:          ['Bills & Utilities', 'Internet'],
  bsnl:         ['Bills & Utilities', 'Internet'],
  rent:         ['Bills & Utilities', 'Rent'],
  netflix:      ['Entertainment', 'OTT / Streaming'],
  hotstar:      ['Entertainment', 'OTT / Streaming'],
  spotify:      ['Entertainment', 'OTT / Streaming'],
  prime:        ['Entertainment', 'OTT / Streaming'],
  movie:        ['Entertainment', 'Movies'],
  cinema:       ['Entertainment', 'Movies'],
  pvr:          ['Entertainment', 'Movies'],
  inox:         ['Entertainment', 'Movies'],
  salary:       ['Salary', ''],
  freelance:    ['Freelance', ''],
  investment:   ['Investment', ''],
  dividend:     ['Investment', ''],
};

const CHART_COLORS = [
  '#FF7B7B','#FF9A3C','#FFD700','#90EE90',
  '#4FC3A1','#40E0D0','#87CEEB','#DDA0DD',
  '#FF8C94','#A8E6CF','#FFD3B6','#B4A7E5',
];

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── App State ─────────────────────────────────────────────────────────────
const state = {
  currentType:      'expense',
  fabOpen:          false,
  lastTxnId:        null,
  lastTxnAmount:    0,
  lastTxnAccountId: null,
  lastTxnType:      'expense',

  navMonth:         new Date().getMonth(),
  navYear:          new Date().getFullYear(),

  txnViewTab:       'daily',
  statsTab:         'expense',
  reportPeriod:     'month',

  voiceParsed:      null,
  recognition:      null,
  listening:        false,
  voiceConfidence:  1.0,
  voiceAlternates:  [],
  voiceMode:        'idle',
  pendingMultiTxns: [],
  readbackEnabled:  true,

  scanData:         null,
  scanImageB64:     null,
  autocatData:      null,
  selectedAccIcon:  '🏦',
  currency:         '₹',
};

// ─── Init ──────────────────────────────────────────────────────────────────
async function init() {
  await seedDefaults();

  const cur = await db.settings.get('currency');
  if (cur) state.currency = cur.value;

  const readback = await db.settings.get('readbackEnabled');
  state.readbackEnabled = readback?.value ?? true;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  await refreshTxnList();
  setupGlobalListeners();
}

function setupGlobalListeners() {
  document.querySelectorAll('[data-tab]').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn))
  );

  document.getElementById('fab-main').addEventListener('click', toggleFab);
  document.getElementById('fab-voice').addEventListener('click', () => { closeFab(); openVoiceSheet(); });
  document.getElementById('fab-scan').addEventListener('click',  () => { closeFab(); openScanSheet(); });
  document.getElementById('fab-add').addEventListener('click',   () => { closeFab(); openAddSheet(state.currentType); });

  document.querySelectorAll('.overlay-bg').forEach(bg =>
    bg.addEventListener('click', e => { if (e.target === bg) closeOverlay(bg.id); })
  );

  document.getElementById('toast-undo').addEventListener('click', undoLastTxn);
  document.getElementById('toast').addEventListener('click', e => {
    if (e.target.id !== 'toast-undo') dismissToast();
  });

  document.getElementById('txn-type-expense').addEventListener('click',  () => setTxnType('expense'));
  document.getElementById('txn-type-income').addEventListener('click',   () => setTxnType('income'));
  document.getElementById('txn-type-transfer').addEventListener('click', () => setTxnType('transfer'));

  document.getElementById('txn-category').addEventListener('change', () => loadSubcats());

  document.getElementById('save-txn-btn').addEventListener('click', saveTransaction);

  document.getElementById('voice-mic-btn').addEventListener('click', toggleListening);
  document.getElementById('voice-confirm-btn').addEventListener('click', confirmVoice);

  document.getElementById('scan-camera-btn').addEventListener('click', triggerCamera);
  document.getElementById('scan-file-btn').addEventListener('click', () =>
    document.getElementById('scan-file-input').click()
  );
  document.getElementById('scan-file-input').addEventListener('change',  e => handleScanFile(e.target));
  document.getElementById('scan-camera-input').addEventListener('change', e => handleScanFile(e.target));
  document.getElementById('scan-use-btn').addEventListener('click', useScanData);

  document.getElementById('autocat-confirm-btn').addEventListener('click', confirmAutocat);

  document.getElementById('save-account-btn').addEventListener('click', saveAccount);
  document.getElementById('save-transfer-btn').addEventListener('click', saveTransfer);

  document.getElementById('report-period').addEventListener('change', e => {
    state.reportPeriod = e.target.value;
    refreshReports();
  });

  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('clear-btn').addEventListener('click', clearData);
  document.getElementById('open-merchant-map-btn').addEventListener('click', openMerchantMap);
  document.getElementById('open-add-account-btn').addEventListener('click', () => openAccountSheet());

  document.getElementById('settings-currency').addEventListener('change', async e => {
    state.currency = e.target.value;
    await db.settings.put({ key: 'currency', value: e.target.value });
  });
  document.getElementById('settings-month-start').addEventListener('change', async e => {
    await db.settings.put({ key: 'monthStart', value: parseInt(e.target.value) });
  });
  document.getElementById('toggle-readback').addEventListener('click', () => toggleSetting('readbackEnabled', 'toggle-readback'));
  document.getElementById('toggle-ai').addEventListener('click', () => toggleSetting('aiEnabled', 'toggle-ai'));
  document.getElementById('ai-api-key').addEventListener('change', async e => {
    await db.settings.put({ key: 'aiApiKey', value: e.target.value.trim() });
  });
  document.getElementById('ai-model').addEventListener('change', async e => {
    await db.settings.put({ key: 'aiModel', value: e.target.value });
    updateAIKeyHint(e.target.value);
  });
  document.getElementById('voice-lang').addEventListener('change', async e => {
    await db.settings.put({ key: 'voiceLang', value: e.target.value });
  });
  document.getElementById('multi-save-all-btn').addEventListener('click', () => bulkSaveTxns(state.pendingMultiTxns));
  document.getElementById('multi-review-btn').addEventListener('click', reviewMultiTxnsOne);
}

// ─── Month Navigation ───────────────────────────────────────────────────────
function navPrevMonth() {
  if (state.txnViewTab === 'monthly' && document.querySelector('.screen.active')?.id === 'transactions') {
    state.navYear--;
    refreshCurrentScreen();
    return;
  }
  if (state.navMonth === 0) { state.navMonth = 11; state.navYear--; }
  else                       { state.navMonth--; }
  refreshCurrentScreen();
}

function navNextMonth() {
  if (state.txnViewTab === 'monthly' && document.querySelector('.screen.active')?.id === 'transactions') {
    state.navYear++;
    refreshCurrentScreen();
    return;
  }
  if (state.navMonth === 11) { state.navMonth = 0; state.navYear++; }
  else                        { state.navMonth++; }
  refreshCurrentScreen();
}

function refreshCurrentScreen() {
  const active = document.querySelector('.screen.active')?.id;
  if (active === 'transactions')     refreshTxnList();
  if (active === 'reports')          refreshReports();
}

function getNavPeriod() {
  const y = state.navYear, m = state.navMonth;
  const start = `${y}-${String(m + 1).padStart(2,'0')}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const end   = `${y}-${String(m + 1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
  return { start, end };
}

function monthLabel() {
  return `${MONTH_NAMES[state.navMonth]} ${state.navYear}`;
}

function updateMonthLabels() {
  const lbl = monthLabel();
  const statsEl = document.getElementById('stats-month-label');
  if (statsEl) statsEl.textContent = lbl;
  const txnEl = document.getElementById('txn-month-label');
  if (txnEl) txnEl.textContent = state.txnViewTab === 'monthly' ? String(state.navYear) : lbl;
}

// ─── Navigation ────────────────────────────────────────────────────────────
function switchTab(btn) {
  const target = btn.dataset.tab;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  btn.classList.add('active');

  if (target === 'transactions')     refreshTxnList();
  if (target === 'reports')          refreshReports();
  if (target === 'accounts-screen')  refreshAccounts();
  if (target === 'settings')         refreshSettings();
}

function toggleFab() {
  state.fabOpen = !state.fabOpen;
  document.getElementById('fab-main').classList.toggle('open', state.fabOpen);
  document.getElementById('fab-menu').classList.toggle('open', state.fabOpen);
}

function closeFab() {
  state.fabOpen = false;
  document.getElementById('fab-main').classList.remove('open');
  document.getElementById('fab-menu').classList.remove('open');
}

function openOverlay(id) {
  closeFab();
  document.getElementById(id).classList.add('active');
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
  if (state.listening) stopListening();
}

// ─── Day-Grouped Transaction Render ─────────────────────────────────────────
function renderDayGroups(txns) {
  const groups = {};
  for (const t of txns) {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => {
      const [y, m, d] = date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      const dayClass = dow === 0 ? 'sunday' : dow === 6 ? 'saturday' : '';

      const dayIncome  = items.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const dayExpense = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterStr = new Date(Date.now() - 864e5).toISOString().split('T')[0];
      let dateLabel = DAY_NAMES[dow];
      if (date === todayStr)   dateLabel = 'Today';
      if (date === yesterStr)  dateLabel = 'Yest';

      return `
      <div class="day-group">
        <div class="day-group-header">
          <div class="day-badge ${dayClass}">
            <span class="day-num">${d}</span>
            <span class="day-name">${dateLabel}</span>
          </div>
          <div class="day-totals">
            ${dayIncome  > 0 ? `<span class="day-income-total">+${state.currency}${fmt(dayIncome)}</span>` : ''}
            ${dayExpense > 0 ? `<span class="day-expense-total">-${state.currency}${fmt(dayExpense)}</span>` : ''}
          </div>
        </div>
        ${items.map(txnHTML).join('')}
      </div>`;
    }).join('');
}

function txnHTML(t) {
  const meta = getCatMeta(t.categoryName);
  const sign = t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '-';
  const cls  = t.type === 'income' ? 'income' : t.type === 'transfer' ? 'transfer' : 'expense';
  return `
    <div class="txn-row" onclick="deleteTxnPrompt(${t.id})">
      <div class="txn-icon" style="background:${meta.darkBg}">${meta.icon}</div>
      <div class="txn-info">
        <div class="txn-cat">${t.categoryName || 'Uncategorised'}</div>
        <div class="txn-sub">${t.note || t.merchant || t.subcategoryName || ''}</div>
      </div>
      <div class="txn-amount ${cls}">${sign}${state.currency}${fmt(t.amount)}</div>
    </div>`;
}

// ─── Transactions Screen ────────────────────────────────────────────────────
function setTxnView(tab, el) {
  state.txnViewTab = tab;
  document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  refreshTxnList();
}

async function refreshTxnList() {
  updateMonthLabels();
  const list = document.getElementById('all-txn-list');

  if (state.txnViewTab === 'calendar') {
    await renderCalendarView(list);
    return;
  }

  if (state.txnViewTab === 'monthly') {
    await renderMonthlyYearView(list);
    return;
  }

  const { start, end } = getNavPeriod();
  const all = await db.transactions.where('date').between(start, end, true, true).toArray();
  all.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt));

  if (state.txnViewTab === 'total') {
    await renderTotalView(list, all);
    return;
  }

  if (all.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions this month.</p>';
    return;
  }

  list.innerHTML = renderDayGroups(all);
}

// ─── Calendar View ────────────────────────────────────────────────────────────
async function renderCalendarView(container) {
  const { start, end } = getNavPeriod();
  const txns = await db.transactions.where('date').between(start, end, true, true).toArray();

  const dayMap = {};
  let totalInc = 0, totalExp = 0;
  for (const t of txns) {
    if (!dayMap[t.date]) dayMap[t.date] = { income: 0, expense: 0 };
    if (t.type === 'income')  { dayMap[t.date].income  += t.amount; totalInc += t.amount; }
    if (t.type === 'expense') { dayMap[t.date].expense += t.amount; totalExp += t.amount; }
  }

  const y = state.navYear, m = state.navMonth;
  const firstDay  = new Date(y, m, 1);
  const lastDate  = new Date(y, m + 1, 0).getDate();
  const todayStr  = new Date().toISOString().split('T')[0];
  const balance   = totalInc - totalExp;

  let startOffset = firstDay.getDay();
  startOffset = startOffset === 0 ? 6 : startOffset - 1; // shift to Mon=0

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  let html = `
    <div style="display:flex;padding:10px 16px 8px">
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-2)">Income</div>
        <div style="font-size:15px;font-weight:700;color:var(--income)">${state.currency}${fmt(totalInc)}</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-2)">Expenses</div>
        <div style="font-size:15px;font-weight:700;color:var(--expense)">${state.currency}${fmt(totalExp)}</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-2)">Total</div>
        <div style="font-size:15px;font-weight:700;color:${balance>=0?'var(--income)':'var(--expense)'}">${state.currency}${fmt(Math.abs(balance))}</div>
      </div>
    </div>
    <div class="cal-grid">
      <div class="cal-header-row">
        <div class="cal-hcell">Mon</div><div class="cal-hcell">Tue</div><div class="cal-hcell">Wed</div>
        <div class="cal-hcell">Thu</div><div class="cal-hcell">Fri</div>
        <div class="cal-hcell cal-sat">Sat</div>
        <div class="cal-hcell cal-sun">Sun</div>
      </div>`;

  for (let i = 0; i < cells.length; i += 7) {
    html += '<div class="cal-row">';
    for (let j = i; j < i + 7; j++) {
      const day = cells[j];
      if (!day) { html += '<div class="cal-empty"></div>'; continue; }
      const col     = j % 7; // 5=Sat 6=Sun in Mon-first
      const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const data    = dayMap[dateStr] || { income: 0, expense: 0 };
      const isToday = dateStr === todayStr;
      html += `
        <div class="cal-cell${isToday ? ' cal-today' : ''}">
          <span class="cal-dnum${col===5?' cal-sat':col===6?' cal-sun':''}">${day}</span>
          ${data.income  > 0 ? `<span class="cal-inc">${fmtShort(data.income)}</span>`  : ''}
          ${data.expense > 0 ? `<span class="cal-exp">${fmtShort(data.expense)}</span>` : ''}
        </div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function fmtShort(n) {
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n));
}

// ─── Monthly Year View ────────────────────────────────────────────────────────
async function renderMonthlyYearView(container) {
  const year  = state.navYear;
  const txns  = await db.transactions.where('date').between(`${year}-01-01`, `${year}-12-31`, true, true).toArray();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const monthData = Array.from({ length: 12 }, () => ({ income: 0, expense: 0, txns: [] }));
  for (const t of txns) {
    const mi = parseInt(t.date.split('-')[1]) - 1;
    monthData[mi].txns.push(t);
    if (t.type === 'income')  monthData[mi].income  += t.amount;
    if (t.type === 'expense') monthData[mi].expense += t.amount;
  }

  const yearInc = monthData.reduce((s, d) => s + d.income, 0);
  const yearExp = monthData.reduce((s, d) => s + d.expense, 0);
  const maxM    = year === today.getFullYear() ? today.getMonth() : 11;

  let html = `
    <div style="display:flex;padding:10px 16px 8px;border-bottom:1px solid var(--border)">
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-2)">Income</div>
        <div style="font-size:15px;font-weight:700;color:var(--income)">${state.currency}${fmt(yearInc)}</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-2)">Expenses</div>
        <div style="font-size:15px;font-weight:700;color:var(--expense)">${state.currency}${fmt(yearExp)}</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-2)">Total</div>
        <div style="font-size:15px;font-weight:700;color:${yearInc-yearExp>=0?'var(--income)':'var(--expense)'}">${state.currency}${fmt(Math.abs(yearInc-yearExp))}</div>
      </div>
    </div>`;

  for (let mi = maxM; mi >= 0; mi--) {
    const data    = monthData[mi];
    const bal     = data.income - data.expense;
    const isActive = mi === state.navMonth && year === today.getFullYear();
    const mPad    = String(mi + 1).padStart(2, '0');
    const lastDay = new Date(year, mi + 1, 0).getDate();

    html += `
      <div style="border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;padding:12px 16px;cursor:pointer" onclick="jumpToMonth(${mi},${year})">
          <div style="min-width:110px">
            <div style="font-size:15px;font-weight:600">${MONTH_NAMES[mi]}</div>
            <div style="font-size:11px;color:var(--text-3)">${mPad}.1 ~ ${mPad}.${lastDay}</div>
          </div>
          <div style="flex:1"></div>
          <div style="text-align:right">
            <div style="font-size:14px;font-weight:600;color:var(--income)">${state.currency}${fmt(data.income)}</div>
            <div style="font-size:12px;color:${bal>=0?'var(--income)':'var(--expense)'}">${state.currency}${fmt(Math.abs(bal))}</div>
          </div>
        </div>`;

    if (isActive) {
      const weeks = getMonthWeeks(year, mi);
      for (let wi = weeks.length - 1; wi >= 0; wi--) {
        const { start: wS, end: wE } = weeks[wi];
        const wSStr = wS.toISOString().split('T')[0];
        const wEStr = wE.toISOString().split('T')[0];
        const wTxns = data.txns.filter(t => t.date >= wSStr && t.date <= wEStr);
        const wInc  = wTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const wExp  = wTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const wBal  = wInc - wExp;
        const isCurWeek = todayStr >= wSStr && todayStr <= wEStr;
        const sL = `${String(wS.getDate()).padStart(2,'0')}.${String(wS.getMonth()+1).padStart(2,'0')}`;
        const eL = `${String(wE.getDate()).padStart(2,'0')}.${String(wE.getMonth()+1).padStart(2,'0')}`;
        html += `
          <div style="display:flex;align-items:center;padding:8px 16px 8px 28px;background:${isCurWeek?'rgba(139,0,0,.35)':'transparent'};cursor:pointer"
               onclick="jumpToMonth(${mi},${year})">
            <div style="flex:1;font-size:12px;color:var(--text-2)">${sL} ~ ${eL}</div>
            <div style="text-align:right">
              <div style="font-size:12px;font-weight:600;color:var(--income)">${state.currency}${fmt(wInc)}</div>
              <div style="font-size:11px;color:${wBal>=0?'var(--income)':'var(--expense)'}">${state.currency}${fmt(Math.abs(wBal))}</div>
            </div>
          </div>`;
      }
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

function getMonthWeeks(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const weeks    = [];
  let dow        = firstDay.getDay();
  let daysBack   = dow === 0 ? 6 : dow - 1;
  let ws         = new Date(firstDay);
  ws.setDate(firstDay.getDate() - daysBack);
  while (ws <= lastDay) {
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    weeks.push({ start: new Date(ws), end: new Date(we) });
    ws.setDate(ws.getDate() + 7);
  }
  return weeks;
}

function jumpToMonth(month, year) {
  state.navMonth = month;
  state.navYear  = year;
  const btn = document.querySelector('.view-tab[data-vtab="daily"]');
  if (btn) { state.txnViewTab = 'daily'; document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
  refreshTxnList();
}

// ─── Total View ───────────────────────────────────────────────────────────────
async function renderTotalView(container, all) {
  const income  = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const transferRaw = all.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
  const transfer = transferRaw / 2;

  const prevM  = state.navMonth === 0 ? 11 : state.navMonth - 1;
  const prevY  = state.navMonth === 0 ? state.navYear - 1 : state.navYear;
  const pS     = `${prevY}-${String(prevM+1).padStart(2,'0')}-01`;
  const pE     = `${prevY}-${String(prevM+1).padStart(2,'0')}-${new Date(prevY, prevM+1, 0).getDate()}`;
  const pTxns  = await db.transactions.where('date').between(pS, pE, true, true).toArray();
  const prevExp = pTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const compPct = prevExp > 0 ? Math.round(expense / prevExp * 100) : null;

  const accounts = await db.accounts.toArray();
  const accMap   = {};
  for (const a of accounts) accMap[a.id] = a;
  const cashBankExp = all.filter(t => t.type === 'expense' && t.accountId &&
    ['cash','savings','checking'].includes((accMap[t.accountId]?.type||'').toLowerCase()))
    .reduce((s, t) => s + t.amount, 0);
  const cardExp = all.filter(t => t.type === 'expense' && t.accountId &&
    (accMap[t.accountId]?.type||'').toLowerCase() === 'credit card')
    .reduce((s, t) => s + t.amount, 0);

  const { start, end } = getNavPeriod();
  const fD = s => { const [y,m,d] = s.split('-'); return `${d}.${m}.${y.slice(2)}`; };

  container.innerHTML = `
    <div style="padding:12px 16px">
      <div style="display:flex;margin-bottom:12px;text-align:center">
        <div style="flex:1">
          <div style="font-size:11px;color:var(--text-2)">Income</div>
          <div style="font-size:16px;font-weight:700;color:var(--income)">${state.currency}${fmt(income)}</div>
        </div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--text-2)">Expenses</div>
          <div style="font-size:16px;font-weight:700;color:var(--expense)">${state.currency}${fmt(expense)}</div>
        </div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--text-2)">Total</div>
          <div style="font-size:16px;font-weight:700;color:${balance>=0?'var(--income)':'var(--expense)'}">${state.currency}${fmt(Math.abs(balance))}</div>
        </div>
      </div>
      <div style="background:var(--surface);border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;cursor:pointer"
           onclick="document.querySelector('[data-tab=reports]').click()">
        <span style="font-size:20px;margin-right:10px">📋</span>
        <span style="font-size:15px;font-weight:600;flex:1">Budget</span>
        <span style="font-size:13px;color:var(--text-2)">Budget Setting ›</span>
      </div>
      <div style="background:var(--surface);border-radius:12px;padding:14px 16px;margin-bottom:10px">
        <div style="display:flex;align-items:center;margin-bottom:10px">
          <span style="font-size:20px;margin-right:10px">💰</span>
          <span style="font-size:15px;font-weight:600;flex:1">Accounts</span>
          <span style="font-size:11px;color:var(--text-3)">${fD(start)} ~ ${fD(end)}</span>
        </div>
        ${compPct !== null ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--text-2);font-size:13px">Compared Expenses (Last month)</span>
          <span style="font-weight:700;color:${compPct>100?'var(--expense)':'var(--income)'}">${compPct}%</span>
        </div>` : ''}
        ${cashBankExp > 0 ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--text-2);font-size:13px">Expenses (Cash, Accounts)</span>
          <span style="font-weight:600">${state.currency}${fmt(cashBankExp)}</span>
        </div>` : ''}
        ${cardExp > 0 ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--text-2);font-size:13px">Expenses (Card)</span>
          <span style="font-weight:600">${state.currency}${fmt(cardExp)}</span>
        </div>` : ''}
        ${transfer > 0 ? `<div style="display:flex;justify-content:space-between;padding:7px 0">
          <span style="color:var(--text-2);font-size:13px">Transfer (Cash, Accounts →)</span>
          <span style="font-weight:600">${state.currency}${fmt(transfer)}</span>
        </div>` : ''}
        ${cashBankExp===0 && cardExp===0 && transfer===0 ? `
          <div style="color:var(--text-3);font-size:13px;text-align:center;padding:8px 0">No account-linked transactions this month</div>` : ''}
      </div>
      <div style="background:var(--surface);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer" onclick="exportData()">
        <span style="font-size:20px">📊</span>
        <span style="font-size:15px;font-weight:600">Export Data to JSON</span>
      </div>
    </div>`;
}

// ─── Add Transaction ────────────────────────────────────────────────────────
async function openAddSheet(type = 'expense', prefill = {}) {
  state.currentType = type;

  document.getElementById('txn-amount').value   = prefill.amount   || '';
  document.getElementById('txn-note').value     = prefill.note     || '';
  document.getElementById('txn-merchant').value = prefill.merchant || '';
  document.getElementById('txn-date').value     = prefill.date     || new Date().toISOString().split('T')[0];

  setTxnType(type);
  await loadCategoryDropdown(prefill.categoryName, prefill.subcategoryName);

  const accounts = await db.accounts.toArray();
  const accSel = document.getElementById('txn-account');
  accSel.innerHTML = accounts.map(a => `<option value="${a.id}">${a.icon || ''} ${a.name}</option>`).join('');

  if (prefill.receiptImage) {
    state.scanImageB64 = prefill.receiptImage;
    document.getElementById('receipt-preview').src = prefill.receiptImage;
    document.getElementById('receipt-preview-wrap').style.display = 'block';
  } else {
    document.getElementById('receipt-preview-wrap').style.display = 'none';
    state.scanImageB64 = null;
  }

  openOverlay('add-sheet');
}

function setTxnType(type) {
  state.currentType = type;
  ['expense','income','transfer'].forEach(t => {
    document.getElementById(`txn-type-${t}`).classList.toggle('active', t === type);
  });
  if (type !== 'transfer') loadCategoryDropdown();
  else {
    document.getElementById('txn-category').innerHTML = '<option value="">N/A (Transfer)</option>';
    document.getElementById('txn-subcategory').innerHTML = '<option value="">N/A</option>';
  }
}

async function loadCategoryDropdown(prefillCat, prefillSub) {
  const type = state.currentType === 'transfer' ? 'expense' : state.currentType;
  const cats = await db.categories.where('type').equals(type).toArray();
  const sel = document.getElementById('txn-category');
  sel.innerHTML = '<option value="">Select category</option>' +
    cats.map(c => `<option value="${c.id}" data-name="${c.name}"${c.name === prefillCat ? ' selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  await loadSubcats(prefillSub);
}

async function loadSubcats(prefillSub) {
  const catSel = document.getElementById('txn-category');
  const catId  = parseInt(catSel.value);
  const subSel = document.getElementById('txn-subcategory');
  if (!catId) { subSel.innerHTML = '<option value="">Select sub-category</option>'; return; }
  const subs = await db.subcategories.where('categoryId').equals(catId).toArray();
  subSel.innerHTML = '<option value="">No sub-category</option>' +
    subs.map(s => `<option value="${s.id}" data-name="${s.name}"${s.name === prefillSub ? ' selected' : ''}>${s.icon || ''} ${s.name}</option>`).join('');
}

async function saveTransaction() {
  if (state.currentType === 'transfer') { await saveTransferFromSheet(); return; }

  const amountRaw = parseFloat(document.getElementById('txn-amount').value);
  if (!amountRaw || amountRaw <= 0) { showToast('Enter a valid amount'); return; }

  const catSel  = document.getElementById('txn-category');
  const subSel  = document.getElementById('txn-subcategory');
  const catId   = parseInt(catSel.value) || null;
  const subId   = parseInt(subSel.value) || null;
  const catName = catSel.selectedOptions[0]?.dataset.name || '';
  const subName = subSel.selectedOptions[0]?.dataset.name || '';
  const accId   = parseInt(document.getElementById('txn-account').value) || null;

  const txn = {
    type:            state.currentType,
    amount:          amountRaw,
    categoryId:      catId,
    subcategoryId:   subId,
    categoryName:    catName,
    subcategoryName: subName,
    accountId:       accId,
    date:            document.getElementById('txn-date').value,
    note:            document.getElementById('txn-note').value.trim(),
    merchant:        document.getElementById('txn-merchant').value.trim(),
    receiptImage:    state.scanImageB64 || null,
    createdAt:       Date.now(),
  };

  const newId = await db.transactions.add(txn);
  state.lastTxnId        = newId;
  state.lastTxnAmount    = amountRaw;
  state.lastTxnAccountId = accId;
  state.lastTxnType      = state.currentType;

  if (accId) {
    const acc = await db.accounts.get(accId);
    if (acc) {
      const delta = state.currentType === 'income' ? amountRaw : -amountRaw;
      await db.accounts.update(accId, { balance: acc.balance + delta });
    }
  }

  closeOverlay('add-sheet');
  await refreshTxnList();
  showToast(`${state.currentType === 'income' ? 'Income' : 'Expense'} saved`, true);
}

async function deleteTxnPrompt(id) {
  if (!confirm('Delete this transaction?')) return;
  const txn = await db.transactions.get(id);
  if (!txn) return;
  await db.transactions.delete(id);
  if (txn.accountId) {
    const acc = await db.accounts.get(txn.accountId);
    if (acc) {
      const delta = txn.type === 'income' ? -txn.amount : txn.amount;
      await db.accounts.update(txn.accountId, { balance: acc.balance + delta });
    }
  }
  const activeScreen = document.querySelector('.screen.active')?.id;
  if (activeScreen === 'transactions') await refreshTxnList();
  if (activeScreen === 'reports')      await refreshReports();
  showToast('Transaction deleted');
}

// ─── Stats / Reports ─────────────────────────────────────────────────────────
function setStatsTab(tab, el) {
  state.statsTab = tab;
  document.querySelectorAll('.stats-tab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('stats-total-label').textContent = tab === 'expense' ? 'Total Spent' : 'Total Income';
  refreshReports();
}

async function refreshReports() {
  updateMonthLabels();
  const { start, end } = state.reportPeriod === 'month'
    ? getNavPeriod()
    : await getPeriodRange(state.reportPeriod);

  const txns = await db.transactions.where('date').between(start, end, true, true).toArray();
  const filtered = txns.filter(t => t.type === state.statsTab);
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  document.getElementById('reports-total').textContent = `${state.currency}${fmt(total)}`;

  const catMap = {};
  for (const t of filtered) {
    const cat = t.categoryName || 'Uncategorised';
    if (!catMap[cat]) catMap[cat] = { total: 0, subs: {} };
    catMap[cat].total += t.amount;
    if (t.subcategoryName) catMap[cat].subs[t.subcategoryName] = (catMap[cat].subs[t.subcategoryName] || 0) + t.amount;
  }

  const sorted = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total);

  // Pie chart
  renderPieChart(sorted, total);

  const budgets = await db.budgets.toArray();
  const cats    = await db.categories.toArray();
  const budgetByCatName = {};
  for (const b of budgets) {
    const cat = cats.find(c => c.id === b.categoryId);
    if (cat) budgetByCatName[cat.name] = b.amount;
  }

  const breakdown = document.getElementById('cat-breakdown');
  if (sorted.length === 0) {
    breakdown.innerHTML = '<p class="empty-state">No data in this period.</p>';
    renderPieChart([], 0);
    if (state.statsTab === 'expense') {
      renderBudgetManager(cats.filter(c => c.type === 'expense'), budgetByCatName, {});
    } else {
      document.getElementById('budget-section').innerHTML = '';
    }
    return;
  }

  breakdown.innerHTML = sorted.map(([catName, data], idx) => {
    const pct   = total > 0 ? Math.round(data.total / total * 100) : 0;
    const color = CHART_COLORS[idx % CHART_COLORS.length];
    const budget = budgetByCatName[catName];
    const budgetPct = budget ? Math.min(100, Math.round(data.total / budget * 100)) : null;
    const budgetBar = budget ? `
      <div class="budget-row">
        <span class="budget-label">${state.currency}${fmt(data.total)}/${state.currency}${fmt(budget)}</span>
        <div class="budget-track"><div class="budget-fill ${budgetPct >= 100 ? 'over' : ''}" style="width:${budgetPct}%"></div></div>
        <span class="budget-pct">${budgetPct}%</span>
      </div>` : '';
    return `
      <div class="stat-cat-row">
        <div class="stat-cat-dot" style="background:${color}"></div>
        <div class="stat-cat-info">
          <div class="stat-cat-name">${catName}</div>
          <div class="stat-cat-bar-wrap"><div class="stat-cat-bar" style="width:${pct}%;background:${color}"></div></div>
          ${budgetBar}
        </div>
        <div class="stat-cat-right">
          <div class="stat-cat-amt">${state.currency}${fmt(data.total)}</div>
          <div class="stat-pct-badge" style="background:${color}">${pct}%</div>
        </div>
      </div>`;
  }).join('');

  if (state.statsTab === 'expense') {
    renderBudgetManager(cats.filter(c => c.type === 'expense'), budgetByCatName, catMap);
  } else {
    document.getElementById('budget-section').innerHTML = '';
  }
}

function renderPieChart(sorted, total) {
  const svg = document.getElementById('pie-svg');
  if (!svg) return;
  if (sorted.length === 0 || total === 0) {
    svg.innerHTML = `<circle cx="100" cy="100" r="70" fill="none" stroke="#3A3A50" stroke-width="28"/>`;
    return;
  }

  const cx = 100, cy = 100, r = 70, strokeW = 28;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  let paths = '';
  for (let i = 0; i < sorted.length; i++) {
    const [, data] = sorted[i];
    const pct   = data.total / total;
    const dash  = pct * circ;
    const color = CHART_COLORS[i % CHART_COLORS.length];
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${color}" stroke-width="${strokeW}"
      stroke-dasharray="${dash} ${circ - dash}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
  }

  const topName = sorted[0][0];
  const topPct  = Math.round(sorted[0][1].total / total * 100);
  svg.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2E2E42" stroke-width="${strokeW}"/>
    ${paths}
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#FFF" font-size="22" font-weight="700" font-family="system-ui">${topPct}%</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#9999BB" font-size="11" font-family="system-ui">${topName.length > 12 ? topName.slice(0,12)+'…' : topName}</text>`;
}

async function renderBudgetManager(cats, budgetByCatName, catMap) {
  const section = document.getElementById('budget-section');
  section.innerHTML = '<div class="section-title" style="margin-bottom:12px">Monthly Budgets</div>' +
    cats.map(c => {
      const cur = budgetByCatName[c.name] || '';
      return `<div class="budget-edit-row">
        <span class="budget-cat-label">${c.icon} ${c.name}</span>
        <input type="number" class="budget-input" placeholder="No limit"
               value="${cur}" data-cat-id="${c.id}"
               onchange="saveBudget(${c.id}, this.value)">
      </div>`;
    }).join('');
}

async function saveBudget(categoryId, value) {
  const amount   = parseFloat(value);
  const existing = await db.budgets.where('categoryId').equals(categoryId).first();
  if (!amount || amount <= 0) {
    if (existing) await db.budgets.delete(existing.id);
  } else {
    if (existing) await db.budgets.update(existing.id, { amount });
    else           await db.budgets.add({ categoryId, amount });
  }
  await refreshReports();
}

// ─── Accounts ───────────────────────────────────────────────────────────────
async function refreshAccounts() {
  const accounts = await db.accounts.toArray();
  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  document.getElementById('net-worth').textContent = `${state.currency}${fmt(total)}`;

  const list = document.getElementById('accounts-list');
  if (accounts.length === 0) {
    list.innerHTML = '<p class="empty-state">No accounts yet.</p>';
    return;
  }

  const groups = groupAccounts(accounts);
  let html = '';
  for (const [groupName, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    const groupTotal = items.reduce((s, a) => s + (a.balance || 0), 0);
    html += `<div class="acc-group-header"><span>${groupName}</span><span class="acc-group-total">${state.currency}${fmt(Math.abs(groupTotal))}</span></div>`;
    html += items.map(a => accountRowHTML(a)).join('');
  }
  list.innerHTML = html;
}

function accountRowHTML(a) {
  const isCC      = a.type === 'Credit Card';
  const balance   = a.balance || 0;
  const hasLimit  = isCC && a.limit > 0;
  // outstanding = how much is owed (positive number when balance < 0)
  const outstanding = isCC ? Math.max(-balance, 0) : 0;
  const available   = hasLimit ? Math.max(a.limit - outstanding, 0) : null;
  const utilPct     = hasLimit ? Math.min(100, Math.round(outstanding / a.limit * 100)) : null;
  const barColor    = utilPct >= 80 ? 'var(--expense)' : utilPct >= 50 ? '#FFD700' : 'var(--income)';

  const balanceHTML = isCC ? `
    <div style="text-align:right;flex-shrink:0">
      <div class="acc-balance ${outstanding > 0 ? 'negative' : 'positive'}">
        ${outstanding > 0 ? '-' : ''}${state.currency}${fmt(outstanding)}
      </div>
      ${hasLimit ? `<div style="font-size:11px;color:var(--text-2);margin-top:1px">${state.currency}${fmt(available)} free</div>` : ''}
    </div>` : `
    <div class="acc-balance ${balance >= 0 ? 'positive' : 'negative'}">
      ${state.currency}${fmt(Math.abs(balance))}
    </div>`;

  const utilizationHTML = hasLimit ? `
    <div style="margin-top:5px">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-3);margin-bottom:2px">
        <span>Utilisation</span><span>${utilPct}% of ${state.currency}${fmt(a.limit)}</span>
      </div>
      <div style="height:3px;background:var(--border);border-radius:2px">
        <div style="width:${utilPct}%;height:100%;border-radius:2px;background:${barColor};transition:width .3s"></div>
      </div>
    </div>` : '';

  return `
    <div class="account-row">
      <div class="acc-icon-circle">${a.icon || '🏦'}</div>
      <div class="acc-info" style="flex:1;min-width:0">
        <div class="acc-name">${a.name}</div>
        <div class="acc-type">${a.type}</div>
        ${utilizationHTML}
      </div>
      ${balanceHTML}
    </div>`;
}

function groupAccounts(accounts) {
  const groups = { Cash: [], 'Banks & Savings': [], 'Credit Cards': [], Investments: [], Other: [] };
  for (const a of accounts) {
    const t = (a.type || '').toLowerCase();
    if (t === 'cash')                                        groups.Cash.push(a);
    else if (t === 'savings' || t === 'checking')            groups['Banks & Savings'].push(a);
    else if (t === 'credit card')                            groups['Credit Cards'].push(a);
    else if (t === 'investment')                             groups.Investments.push(a);
    else                                                     groups.Other.push(a);
  }
  return groups;
}

function openAccountSheet() {
  document.getElementById('account-name').value    = '';
  document.getElementById('account-type').value    = 'Savings';
  document.getElementById('account-balance').value = '';
  document.getElementById('account-limit').value   = '';
  document.getElementById('credit-limit-field').style.display = 'none';
  state.selectedAccIcon = '🏦';
  document.getElementById('acc-icon-preview').textContent = '🏦';
  openOverlay('account-sheet');
}

function onAccountTypeChange(type) {
  document.getElementById('credit-limit-field').style.display =
    type === 'Credit Card' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.acc-icon-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.acc-icon-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedAccIcon = btn.textContent;
      document.getElementById('acc-icon-preview').textContent = btn.textContent;
    });
  });
});

async function saveAccount() {
  const name = document.getElementById('account-name').value.trim();
  if (!name) { showToast('Enter account name'); return; }
  const type  = document.getElementById('account-type').value;
  const limit = type === 'Credit Card'
    ? (parseFloat(document.getElementById('account-limit').value) || null)
    : null;
  await db.accounts.add({
    name,
    type,
    balance: parseFloat(document.getElementById('account-balance').value) || 0,
    limit,
    icon: state.selectedAccIcon,
  });
  closeOverlay('account-sheet');
  await refreshAccounts();
  showToast('Account added');
}

function openTransferSheet() {
  document.getElementById('transfer-amount').value = '';
  document.getElementById('transfer-date').value   = new Date().toISOString().split('T')[0];
  document.getElementById('transfer-note').value   = '';
  loadTransferAccounts();
  openOverlay('transfer-sheet');
}

async function loadTransferAccounts() {
  const accounts = await db.accounts.toArray();
  const opts = accounts.map(a => `<option value="${a.id}">${a.icon || ''} ${a.name}</option>`).join('');
  document.getElementById('transfer-from').innerHTML = opts;
  document.getElementById('transfer-to').innerHTML   = opts;
}

async function saveTransferFromSheet() {
  const amount = parseFloat(document.getElementById('txn-amount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
  const accounts = await db.accounts.toArray();
  if (accounts.length < 2) { showToast('Need at least 2 accounts for transfer'); return; }
  closeOverlay('add-sheet');
  openTransferSheet();
}

async function saveTransfer() {
  const amount = parseFloat(document.getElementById('transfer-amount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
  const fromId = parseInt(document.getElementById('transfer-from').value);
  const toId   = parseInt(document.getElementById('transfer-to').value);
  if (fromId === toId) { showToast('Choose different accounts'); return; }
  const date = document.getElementById('transfer-date').value;
  const note = document.getElementById('transfer-note').value.trim();
  const from = await db.accounts.get(fromId);
  const to   = await db.accounts.get(toId);
  if (!from || !to) return;
  const createdAt = Date.now();
  await db.transactions.bulkAdd([
    { type:'transfer', amount, categoryId:null, subcategoryId:null, categoryName:`To: ${to.name}`, subcategoryName:'', accountId:fromId, date, note, merchant:'', receiptImage:null, createdAt },
    { type:'transfer', amount, categoryId:null, subcategoryId:null, categoryName:`From: ${from.name}`, subcategoryName:'', accountId:toId, date, note, merchant:'', receiptImage:null, createdAt: createdAt+1 },
  ]);
  await db.accounts.update(fromId, { balance: from.balance - amount });
  await db.accounts.update(toId,   { balance: to.balance   + amount });
  closeOverlay('transfer-sheet');
  await refreshAccounts();
  showToast('Transfer saved');
}

// ─── Settings ────────────────────────────────────────────────────────────────
async function refreshSettings() {
  const settings = {};
  (await db.settings.toArray()).forEach(s => { settings[s.key] = s.value; });
  document.getElementById('settings-currency').value    = settings.currency  || '₹';
  document.getElementById('settings-month-start').value = settings.monthStart || 1;
  document.getElementById('ai-api-key').value           = settings.aiApiKey  || '';
  const model = settings.aiModel || 'gemini-2.5-flash';
  document.getElementById('ai-model').value             = model;
  document.getElementById('voice-lang').value           = settings.voiceLang || 'en-IN';
  setToggleVisual('toggle-ai',       settings.aiEnabled      ?? true);
  setToggleVisual('toggle-readback', settings.readbackEnabled ?? true);
  updateAIKeyHint(model);
}

function setToggleVisual(id, on) {
  document.getElementById(id).classList.toggle('on', !!on);
}

function updateAIKeyHint(model) {
  const hint = document.getElementById('ai-key-hint');
  if (!hint) return;
  hint.textContent = model?.startsWith('claude')
    ? 'Claude key starts with sk-ant-api03-… — get it at console.anthropic.com'
    : 'Gemini key starts with AIzaSy… — get it at aistudio.google.com';
}

async function toggleSetting(key, btnId) {
  const cur  = await db.settings.get(key);
  const next = !(cur?.value || false);
  await db.settings.put({ key, value: next });
  setToggleVisual(btnId, next);
  if (key === 'readbackEnabled') state.readbackEnabled = next;
  if (key === 'aiEnabled') state.aiEnabled = next;
}

async function exportData() {
  const data = {
    transactions:  await db.transactions.toArray(),
    categories:    await db.categories.toArray(),
    subcategories: await db.subcategories.toArray(),
    accounts:      await db.accounts.toArray(),
    merchantMap:   await db.merchantMap.toArray(),
    settings:      await db.settings.toArray(),
    budgets:       await db.budgets.toArray(),
    exportedAt:    new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `money-manager-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported');
}

async function clearData() {
  if (!confirm('Clear ALL data? This cannot be undone.')) return;
  await Promise.all([db.transactions.clear(), db.merchantMap.clear(), db.budgets.clear()]);
  await refreshTxnList();
  showToast('Data cleared');
}

async function openMerchantMap() {
  const map  = await db.merchantMap.toArray();
  const list = document.getElementById('merchant-map-list');
  if (map.length === 0) {
    list.innerHTML = '<p class="empty-state">No saved merchant rules yet.</p>';
  } else {
    list.innerHTML = map.map(m => `
      <div class="merchant-row">
        <div class="merchant-info">
          <div class="merchant-name">${m.merchant}</div>
          <div class="merchant-cat">${m.categoryName}${m.subcategoryName ? ' › ' + m.subcategoryName : ''}</div>
        </div>
        <button class="btn-icon" onclick="deleteMerchantMap(${m.id})">🗑️</button>
      </div>`).join('');
  }
  openOverlay('merchant-sheet');
}

async function deleteMerchantMap(id) {
  await db.merchantMap.delete(id);
  await openMerchantMap();
}

// ─── Voice Module ────────────────────────────────────────────────────────────
function openVoiceSheet() { resetVoiceUI(); openOverlay('voice-sheet'); }

function resetVoiceUI() {
  state.voiceParsed = null;
  state.voiceMode   = 'idle';
  document.getElementById('voice-status').textContent         = 'Tap the mic to start';
  document.getElementById('voice-parsed-card').style.display  = 'none';
  document.getElementById('voice-confirm-btn').style.display  = 'none';
  document.getElementById('voice-mic-btn').classList.remove('listening');
}

function toggleListening() { if (state.listening) stopListening(); else startListening(); }

function startListening() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const text = prompt('Voice not supported. Type your expense:');
    if (text) processVoiceText(text, 1.0);
    return;
  }
  if (!window.isSecureContext) {
    document.getElementById('voice-status').textContent =
      'Microphone requires HTTPS. Open the app over https:// or from localhost.';
    return;
  }
  state.recognition = new SR();
  state.recognition.lang            = document.getElementById('voice-lang')?.value || 'en-IN';
  state.recognition.interimResults  = false;
  state.recognition.maxAlternatives = 3;
  state.recognition.onstart  = () => {
    state.listening = true; state.voiceMode = 'listening';
    document.getElementById('voice-mic-btn').classList.add('listening');
    document.getElementById('voice-status').textContent = 'Listening…';
  };
  state.recognition.onresult = e => {
    const result = e.results[0];
    state.voiceAlternates = Array.from(result).slice(1).map(r => r.transcript);
    state.voiceConfidence = result[0].confidence;
    stopListening();
    processVoiceText(result[0].transcript, result[0].confidence);
  };
  state.recognition.onerror = e => {
    stopListening();
    const msg =
      e.error === 'no-speech'            ? "Didn't catch that. Try again." :
      e.error === 'network'              ? 'Voice unavailable offline. Type instead.' :
      e.error === 'not-allowed'          ? 'Microphone access denied. Check browser permissions.' :
      e.error === 'audio-capture'        ? 'No microphone found or blocked by the system.' :
      e.error === 'service-not-allowed'  ? 'Speech service not allowed on this page.' :
                                           `Voice error: ${e.error}. Try again.`;
    document.getElementById('voice-status').textContent = msg;
  };
  state.recognition.onend = () => {
    state.listening = false;
    document.getElementById('voice-mic-btn').classList.remove('listening');
  };
  state.recognition.start();
}

function stopListening() {
  if (state.recognition) { state.recognition.stop(); state.recognition = null; }
  state.listening = false;
  document.getElementById('voice-mic-btn').classList.remove('listening');
}

async function processVoiceText(text, confidence = 1.0) {
  if (isCancellation(text)) { document.getElementById('voice-status').textContent = 'Cancelled. Tap mic to try again.'; return; }
  document.getElementById('voice-status').textContent = 'Processing…';
  state.voiceMode = 'processing';

  const ai = await getActiveAI();

  if (ai?.noKey) {
    document.getElementById('voice-status').textContent = '⚠️ No API key configured.';
    showAIWarning();
    return;
  }

  if (ai) {
    document.getElementById('voice-status').textContent = '🤔 Thinking…';
    const scenario = hasMultipleAmounts(text) ? 'multi' : 'standard';
    const aiResult = ai.provider === 'gemini'
      ? await callGeminiVoice(text, scenario, confidence, ai.key, ai.model)
      : await callClaudeVoice(text, scenario, confidence, ai.key, ai.model);
    if (aiResult) {
      if (aiResult.transactions?.length > 1) {
        state.pendingMultiTxns = aiResult.transactions;
        openMultiTxnConfirmSheet(aiResult.transactions);
        if (aiResult.confirmText) speakConfirmation(aiResult.confirmText);
        return;
      }
      state.voiceParsed = aiResult;
      state.voiceMode   = 'parsed';
      document.getElementById('voice-status').textContent = aiResult.amount ? 'Tap Save to continue' : '⚠️ Couldn\'t find an amount. Please verify.';
      updateParsedUI(aiResult);
      speakConfirmation(buildConfirmText(aiResult));
      return;
    }
  }

  // Fallback: local NLP (no key set, or Claude call failed)
  const parsed  = parseVoiceInput(text);
  const catInfo = await matchCategory(parsed.merchant || text);
  parsed.categoryName    = catInfo?.[0] || null;
  parsed.subcategoryName = catInfo?.[1] || null;
  state.voiceParsed = parsed;
  state.voiceMode   = 'parsed';
  document.getElementById('voice-status').textContent = parsed.amount ? 'Tap Save to continue' : '⚠️ Couldn\'t find an amount. Please verify.';
  updateParsedUI(parsed);
  speakConfirmation(buildConfirmText(parsed));
}

function parseVoiceInput(text) {
  const lower = text.toLowerCase();
  const amtMatch = lower.match(/[₹rs.]?\s*(\d+(?:[.,]\d+)?)(?:\s*k)?/i);
  let amount = null;
  if (amtMatch) {
    amount = parseFloat(amtMatch[1].replace(',', '.'));
    if (/\bk\b/i.test(text.slice(text.toLowerCase().indexOf(amtMatch[1])))) amount *= 1000;
  }
  const merchantMatch = lower.match(/(?:on|at|for|to|from|@)\s+([a-z0-9 &'-]+?)(?:\s+\d|$|,|\.|and)/i);
  const merchant = merchantMatch ? merchantMatch[1].trim() : null;
  let date = new Date().toISOString().split('T')[0];
  if (/yesterday/i.test(text)) { const d = new Date(); d.setDate(d.getDate()-1); date = d.toISOString().split('T')[0]; }
  let note = text;
  if (amtMatch)      note = note.replace(amtMatch[0], '').trim();
  if (merchantMatch) note = note.replace(merchantMatch[0], '').trim();
  note = note.replace(/^(paid|spent|bought|got|received|for|on|at)\s+/i, '').trim();
  return { amount, merchant, date, note, raw: text };
}

async function matchCategory(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  const saved = await db.merchantMap.where('merchant').equals(lower).first();
  if (saved) return [saved.categoryName, saved.subcategoryName];
  for (const [keyword, catInfo] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return catInfo;
  }
  return null;
}

function updateParsedUI(parsed) {
  const card = document.getElementById('voice-parsed-card');
  card.style.display = 'block';
  card.innerHTML = `
    <div class="parsed-row"><span class="parsed-label">Amount</span><span class="parsed-value">${parsed.amount ? state.currency + fmt(parsed.amount) : '—'}</span></div>
    <div class="parsed-row"><span class="parsed-label">Merchant</span><span class="parsed-value">${parsed.merchant || '—'}</span></div>
    <div class="parsed-row"><span class="parsed-label">Category</span><span class="parsed-value">${parsed.categoryName || '—'}</span></div>
    <div class="parsed-row"><span class="parsed-label">Date</span><span class="parsed-value">${formatDate(parsed.date)}</span></div>
    ${parsed.note ? `<div class="parsed-row"><span class="parsed-label">Note</span><span class="parsed-value">${parsed.note}</span></div>` : ''}`;
  document.getElementById('voice-confirm-btn').style.display = 'block';
}

async function confirmVoice() {
  const parsed = state.voiceParsed;
  if (!parsed) return;
  if (!parsed.categoryName) { openAutoCatSheet(parsed.merchant || parsed.raw); return; }
  if (parsed.merchant) {
    const existing = await db.merchantMap.where('merchant').equals(parsed.merchant.toLowerCase()).first();
    if (!existing) await db.merchantMap.add({ merchant:parsed.merchant.toLowerCase(), categoryId:null, subcategoryId:null, categoryName:parsed.categoryName, subcategoryName:parsed.subcategoryName||'' });
  }
  closeOverlay('voice-sheet');
  await openAddSheet(parsed.amount ? (KEYWORD_MAP[parsed.merchant?.toLowerCase()]?.[0]?.includes('Salary') ? 'income' : 'expense') : 'expense', {
    amount:parsed.amount, merchant:parsed.merchant||'', date:parsed.date, note:parsed.note,
    categoryName:parsed.categoryName, subcategoryName:parsed.subcategoryName||'',
  });
}

async function openAutoCatSheet(merchantName) {
  state.autocatData = { merchantName, selectedCat: null };
  const cats = await db.categories.where('type').equals('expense').toArray();
  const suggested = suggestCategory(merchantName);
  document.getElementById('autocat-merchant').textContent = `"${merchantName}"`;
  document.getElementById('autocat-grid').innerHTML = cats.map(c => `
    <button class="autocat-btn ${c.name === suggested ? 'suggested' : ''}" onclick="selectAutocat(this, '${c.name}', ${c.id})">
      <span class="autocat-icon">${c.icon}</span>
      <span class="autocat-name">${c.name}</span>
    </button>`).join('');
  openOverlay('autocat-sheet');
}

function selectAutocat(el, catName, catId) {
  document.querySelectorAll('.autocat-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  state.autocatData.selectedCat   = catName;
  state.autocatData.selectedCatId = catId;
}

async function confirmAutocat() {
  const { merchantName, selectedCat, selectedCatId } = state.autocatData || {};
  if (!selectedCat) { showToast('Select a category'); return; }
  if (merchantName) await db.merchantMap.add({ merchant:merchantName.toLowerCase(), categoryId:selectedCatId||null, subcategoryId:null, categoryName:selectedCat, subcategoryName:'' });
  if (state.voiceParsed) { state.voiceParsed.categoryName = selectedCat; state.voiceParsed.subcategoryName = ''; }
  closeOverlay('autocat-sheet'); closeOverlay('voice-sheet');
  await openAddSheet('expense', { amount:state.voiceParsed?.amount, merchant:merchantName, date:state.voiceParsed?.date, note:state.voiceParsed?.note, categoryName:selectedCat });
}

function suggestCategory(merchant) {
  if (!merchant) return null;
  const lower = merchant.toLowerCase();
  for (const [keyword, [cat]] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return null;
}

function buildConfirmText(parsed) {
  const amt   = parsed.amount ? `${fmt(parsed.amount)} rupees` : 'unknown amount';
  const merch = parsed.merchant ? `at ${parsed.merchant}` : '';
  const cat   = parsed.categoryName ? `under ${parsed.categoryName}` : '';
  return `Saving ${amt} ${merch} ${cat}. Confirm?`.replace(/\s+/g, ' ').trim();
}

function speakConfirmation(text) {
  if (!state.readbackEnabled || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-IN'; u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function hasMultipleAmounts(text) { return (text.match(/\d+(?:\.\d+)?(?:\s*k)?/gi) || []).length >= 2; }
function isCancellation(text) { return /^(cancel|stop|never mind|forget it|undo that)$/i.test(text.trim()); }

// ─── AI Routing ──────────────────────────────────────────────────────────────
// Returns:
//   null                          → AI disabled, use NLP
//   { noKey: true }               → AI enabled but key missing, show warning
//   { provider, key, model }      → ready to call AI
async function getActiveAI() {
  const [enabledRow, keyRow, modelRow] = await Promise.all([
    db.settings.get('aiEnabled'),
    db.settings.get('aiApiKey'),
    db.settings.get('aiModel'),
  ]);
  const enabled = enabledRow?.value ?? true;
  if (!enabled) return null;

  const key   = keyRow?.value?.trim()  || '';
  const model = modelRow?.value?.trim() || 'gemini-2.5-flash';
  if (!key) return { noKey: true };

  const provider = model.startsWith('claude') ? 'claude' : 'gemini';
  return { provider, key, model };
}

function showAIWarning() {
  const el = document.getElementById('ai-warning-modal');
  el.style.display = 'flex';
}

function closeAIWarning() {
  document.getElementById('ai-warning-modal').style.display = 'none';
}

function goToAISettings() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
  document.getElementById('settings').classList.add('active');
  document.querySelector('[data-tab="settings"]').classList.add('active');
  refreshSettings();
}

function buildVoicePrompts(scenario, confidence) {
  const today = new Date().toISOString().split('T')[0];
  const CATS  = Object.entries(KEYWORD_MAP).map(([k,[c,s]]) => `${k}→${c}${s?'›'+s:''}`).join(', ');
  const alts  = state.voiceAlternates.length ? `Alternate readings: ${state.voiceAlternates.map(a=>`"${a}"`).join(', ')}.` : '';
  const multi = `You are a financial transaction parser for an Indian expense tracking app. Extract ALL transactions from the user's voice input. Return ONLY valid JSON. Rules: Amounts in INR. 'k' means thousands. 'and','also','+','plus' signal multiple transactions. Distinguish income from expense by context. Match merchants to: ${CATS}. Today: ${today}. Return: {"transactions":[{"amount":number,"type":"expense"|"income","merchant":string,"categoryName":string,"subcategoryName":string,"date":"YYYY-MM-DD","note":string}],"confirmText":string}`;
  const single = `You are parsing a voice-to-text transcript for an Indian expense app. Transcript confidence: ${(confidence*100).toFixed(0)}%. ${alts} Categories: ${CATS}. Today: ${today}. Return ONLY JSON: {"amount":number|null,"type":"expense"|"income","merchant":string|null,"categoryName":string|null,"subcategoryName":string|null,"date":"YYYY-MM-DD","note":string,"needsConfirmation":boolean}`;
  return scenario === 'multi' ? multi : single;
}

function buildReceiptPrompt() {
  const today = new Date().toISOString().split('T')[0];
  return `Extract receipt data and return ONLY valid JSON with keys: amount (number, the total paid), merchant (string, store/restaurant name), date ("YYYY-MM-DD", today is ${today} if not visible), categoryName (one of: Food & Dining, Transport, Health, Shopping, Bills & Utilities, Entertainment, Other, or null). No explanation, just JSON.`;
}

function parseAIJson(text) {
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// ─── Claude API ───────────────────────────────────────────────────────────────
async function callClaudeVoice(transcript, scenario = 'standard', confidence = 1.0, apiKey, model = 'claude-haiku-4-5-20251001') {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model, max_tokens:1000, system:buildVoicePrompts(scenario, confidence), messages:[{role:'user',content:transcript}] }),
    });
    clearTimeout(timeout);
    const data = await res.json();
    return parseAIJson(data.content?.find(b => b.type==='text')?.text || '{}');
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[Claude] voice failed:', err.message);
    return null;
  }
}

async function extractReceiptClaude(imageB64, apiKey, model = 'claude-haiku-4-5-20251001') {
  const mediaType  = imageB64.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const b64data    = imageB64.split(',')[1];
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model, max_tokens: 400,
        system: buildReceiptPrompt(),
        messages: [{ role:'user', content:[
          { type:'image', source:{ type:'base64', media_type:mediaType, data:b64data } },
          { type:'text', text:'Extract the total amount paid, merchant name, date, and category from this receipt.' }
        ]}]
      }),
    });
    clearTimeout(timeout);
    const data = await res.json();
    return parseAIJson(data.content?.find(b => b.type==='text')?.text || '{}');
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[Claude] receipt failed:', err.message);
    return null;
  }
}

// ─── Gemini API ───────────────────────────────────────────────────────────────
const GEMINI_URL = (key, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

async function callGeminiVoice(transcript, scenario = 'standard', confidence = 1.0, apiKey, model = 'gemini-2.5-flash') {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(GEMINI_URL(apiKey, model), {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildVoicePrompts(scenario, confidence) }] },
        contents: [{ role:'user', parts:[{ text: transcript }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.1 },
      }),
    });
    clearTimeout(timeout);
    const data = await res.json();
    return parseAIJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[Gemini] voice failed:', err.message);
    return null;
  }
}

async function extractReceiptGemini(imageB64, apiKey, model = 'gemini-2.5-flash') {
  const mediaType  = imageB64.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const b64data    = imageB64.split(',')[1];
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(GEMINI_URL(apiKey, model), {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildReceiptPrompt() }] },
        contents: [{ role:'user', parts:[
          { inlineData: { mimeType: mediaType, data: b64data } },
          { text: 'Extract the total amount paid, merchant name, date, and category from this receipt.' }
        ]}],
        generationConfig: { maxOutputTokens: 400, temperature: 0.1 },
      }),
    });
    clearTimeout(timeout);
    const data = await res.json();
    return parseAIJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[Gemini] receipt failed:', err.message);
    return null;
  }
}

function openMultiTxnConfirmSheet(txns) {
  document.getElementById('multi-txn-list').innerHTML = txns.map((t, i) => `
    <div class="multi-txn-row">
      <div class="multi-txn-info">
        <span class="multi-txn-type ${t.type}">${t.type==='income'?'+':'-'}${state.currency}${fmt(t.amount)}</span>
        <span class="multi-txn-cat">${t.categoryName||'Uncategorised'}</span>
        <span class="multi-txn-note">${t.merchant||t.note||''}</span>
      </div>
      <button class="btn-sm" onclick="editMultiTxn(${i})">Edit</button>
    </div>`).join('');
  closeOverlay('voice-sheet');
  openOverlay('multi-txn-sheet');
}

async function bulkSaveTxns(txns) {
  for (const t of txns) {
    await db.transactions.add({ type:t.type||'expense', amount:t.amount, categoryId:null, subcategoryId:null, categoryName:t.categoryName||'', subcategoryName:t.subcategoryName||'', accountId:null, date:t.date||new Date().toISOString().split('T')[0], note:t.note||'', merchant:t.merchant||'', receiptImage:null, createdAt:Date.now() });
  }
  closeOverlay('multi-txn-sheet');
  await refreshTxnList();
  showToast(`${txns.length} transactions saved`);
}

function editMultiTxn(idx) {
  const t = state.pendingMultiTxns[idx];
  closeOverlay('multi-txn-sheet');
  openAddSheet(t.type||'expense', { amount:t.amount, merchant:t.merchant, date:t.date, note:t.note, categoryName:t.categoryName, subcategoryName:t.subcategoryName });
}

async function reviewMultiTxnsOne() {
  if (state.pendingMultiTxns.length === 0) return;
  const [first, ...rest] = state.pendingMultiTxns;
  state.pendingMultiTxns = rest;
  closeOverlay('multi-txn-sheet');
  await openAddSheet(first.type||'expense', { amount:first.amount, merchant:first.merchant, date:first.date, note:first.note, categoryName:first.categoryName });
}

// ─── Scan Module ─────────────────────────────────────────────────────────────
function openScanSheet() {
  state.scanData = null; state.scanImageB64 = null;
  document.getElementById('scan-preview-img').src           = '';
  document.getElementById('scan-preview-wrap').style.display = 'none';
  document.getElementById('scan-fields').style.display       = 'none';
  document.getElementById('scan-use-btn').style.display      = 'none';
  document.getElementById('scan-status').textContent         = 'Take a photo or upload a bill';
  openOverlay('scan-sheet');
}

function triggerCamera() { document.getElementById('scan-camera-input').click(); }

function handleScanFile(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.scanImageB64 = e.target.result;
    document.getElementById('scan-preview-img').src           = e.target.result;
    document.getElementById('scan-preview-wrap').style.display = 'block';
    runOCR(e.target.result);
  };
  reader.readAsDataURL(file);
  input.value = '';
}

async function runOCR(imageB64) {
  const ai = await getActiveAI();
  if (ai?.noKey) {
    document.getElementById('scan-status').textContent = '⚠️ No API key configured.';
    showAIWarning();
    return;
  }
  const label = !ai ? 'Reading bill…' : `Reading bill with ${ai.provider === 'gemini' ? 'Gemini' : 'Claude'}…`;
  document.getElementById('scan-status').textContent = label;
  await sleep(300);
  const result = await extractReceiptData(imageB64);
  if (!result) return; // warning already shown
  state.scanData = result;
  document.getElementById('scan-amount').value   = result.amount   || '';
  document.getElementById('scan-merchant').value = result.merchant || '';
  document.getElementById('scan-date').value     = result.date     || new Date().toISOString().split('T')[0];
  document.getElementById('scan-fields').style.display  = 'block';
  document.getElementById('scan-use-btn').style.display = 'block';
  document.getElementById('scan-status').textContent    = 'Edit fields if needed, then tap Use';
}

async function extractReceiptData(imageB64) {
  const fallback = { amount:null, merchant:'', date:new Date().toISOString().split('T')[0] };
  const ai = await getActiveAI();

  if (ai?.noKey) {
    document.getElementById('scan-status').textContent = '⚠️ No API key configured.';
    showAIWarning();
    return null; // null signals caller to leave fields empty and stay open
  }

  if (!ai) return fallback; // NLP mode — no AI for scan, return empty

  const result = ai.provider === 'gemini'
    ? await extractReceiptGemini(imageB64, ai.key, ai.model)
    : await extractReceiptClaude(imageB64, ai.key, ai.model);
  return result || fallback;
}

async function useScanData() {
  const amount   = parseFloat(document.getElementById('scan-amount').value) || null;
  const merchant = document.getElementById('scan-merchant').value.trim();
  const date     = document.getElementById('scan-date').value;
  const catInfo  = await matchCategory(merchant);
  closeOverlay('scan-sheet');
  await openAddSheet('expense', { amount, merchant, date, categoryName:catInfo?.[0]||'', subcategoryName:catInfo?.[1]||'', receiptImage:state.scanImageB64 });
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(n));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  const yest  = new Date(Date.now() - 864e5).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yest)  return 'Yesterday';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

async function getPeriodRange(period) {
  const monthStartRow = await db.settings.get('monthStart');
  const startDay = monthStartRow?.value || 1;
  const now = new Date();
  if (period === 'week') {
    const dow = now.getDay();
    const daysBack = dow === 0 ? 6 : dow - 1; // Monday-first
    const monday = new Date(now); monday.setDate(now.getDate() - daysBack);
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
  }
  if (period === 'month') {
    let start = new Date(now.getFullYear(), now.getMonth(), startDay);
    if (start > now) start = new Date(now.getFullYear(), now.getMonth()-1, startDay);
    let end = new Date(start.getFullYear(), start.getMonth()+1, startDay-1);
    return { start:start.toISOString().split('T')[0], end:end.toISOString().split('T')[0] };
  }
  if (period === 'last') {
    let end   = new Date(now.getFullYear(), now.getMonth(), startDay-1);
    let start = new Date(end.getFullYear(), end.getMonth()-1, startDay);
    return { start:start.toISOString().split('T')[0], end:end.toISOString().split('T')[0] };
  }
  if (period === 'year') return { start:`${now.getFullYear()}-01-01`, end:`${now.getFullYear()}-12-31` };
  return { start:'2000-01-01', end:'2099-12-31' };
}

function getCatMeta(name) {
  const map = {
    'Food & Dining':    { icon:'🍽️', darkBg:'#3D2E1E' },
    'Transport':        { icon:'🚗', darkBg:'#1E2D3D' },
    'Health':           { icon:'💊', darkBg:'#3D1E2E' },
    'Shopping':         { icon:'🛍️', darkBg:'#2E1E3D' },
    'Bills & Utilities':{ icon:'💡', darkBg:'#3D1E1E' },
    'Entertainment':    { icon:'🎬', darkBg:'#1E1E3D' },
    'Other':            { icon:'📦', darkBg:'#2E2E2E' },
    'Salary':           { icon:'💼', darkBg:'#1E3D2E' },
    'Freelance':        { icon:'💻', darkBg:'#1E3D2E' },
    'Investment':       { icon:'📈', darkBg:'#1E3D2E' },
    'Other Income':     { icon:'💰', darkBg:'#1E3D2E' },
  };
  return map[name] || { icon:'📦', darkBg:'#2E2E42' };
}

let toastTimer = null;
function showToast(msg, showUndo = false) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent    = msg;
  document.getElementById('toast-undo').style.display = showUndo ? 'inline-block' : 'none';
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(dismissToast, 3000);
}
function dismissToast() {
  document.getElementById('toast').classList.remove('show');
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
}

async function undoLastTxn() {
  if (!state.lastTxnId) return;
  const txn = await db.transactions.get(state.lastTxnId);
  if (!txn) return;
  await db.transactions.delete(state.lastTxnId);
  if (txn.accountId) {
    const acc = await db.accounts.get(txn.accountId);
    if (acc) { const delta = txn.type==='income' ? -txn.amount : txn.amount; await db.accounts.update(txn.accountId, { balance:acc.balance+delta }); }
  }
  state.lastTxnId = null;
  document.getElementById('toast').classList.remove('show');
  await refreshTxnList();
  showToast('Transaction undone');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

document.addEventListener('DOMContentLoaded', init);
