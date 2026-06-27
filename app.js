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

  await refreshHome();
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
  document.getElementById('claude-api-key').addEventListener('change', async e => {
    await db.settings.put({ key: 'claudeApiKey', value: e.target.value.trim() });
  });
  document.getElementById('gemini-api-key').addEventListener('change', async e => {
    await db.settings.put({ key: 'geminiApiKey', value: e.target.value.trim() });
  });
  document.getElementById('ai-preference').addEventListener('change', async e => {
    await db.settings.put({ key: 'aiPreference', value: e.target.value });
  });
  document.getElementById('voice-lang').addEventListener('change', async e => {
    await db.settings.put({ key: 'voiceLang', value: e.target.value });
  });
  document.getElementById('multi-save-all-btn').addEventListener('click', () => bulkSaveTxns(state.pendingMultiTxns));
  document.getElementById('multi-review-btn').addEventListener('click', reviewMultiTxnsOne);
}

// ─── Month Navigation ───────────────────────────────────────────────────────
function navPrevMonth() {
  if (state.navMonth === 0) { state.navMonth = 11; state.navYear--; }
  else                       { state.navMonth--; }
  refreshCurrentScreen();
}

function navNextMonth() {
  if (state.navMonth === 11) { state.navMonth = 0; state.navYear++; }
  else                        { state.navMonth++; }
  refreshCurrentScreen();
}

function refreshCurrentScreen() {
  const active = document.querySelector('.screen.active')?.id;
  if (active === 'home')             refreshHome();
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
  ['home-month-label','txn-month-label','stats-month-label'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = lbl;
  });
}

// ─── Navigation ────────────────────────────────────────────────────────────
function switchTab(btn) {
  const target = btn.dataset.tab;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  btn.classList.add('active');

  if (target === 'home')             refreshHome();
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

// ─── Home ──────────────────────────────────────────────────────────────────
async function refreshHome() {
  updateMonthLabels();
  const { start, end } = getNavPeriod();
  const all = await db.transactions.where('date').between(start, end, true, true).toArray();

  const income  = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const balEl = document.getElementById('home-balance');
  balEl.textContent = state.currency + fmt(Math.abs(balance));
  balEl.className   = 'amount ' + (balance >= 0 ? 'positive' : 'negative');

  document.getElementById('home-income').textContent  = state.currency + fmt(income);
  document.getElementById('home-expense').textContent = state.currency + fmt(expense);

  const recent = [...all].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt)).slice(0, 25);
  const list = document.getElementById('home-txn-list');
  if (recent.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions this month.<br>Tap + to add one.</p>';
    return;
  }
  list.innerHTML = renderDayGroups(recent);
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
  const { start, end } = getNavPeriod();
  const all = await db.transactions.where('date').between(start, end, true, true).toArray();
  all.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt));

  const list = document.getElementById('all-txn-list');
  if (all.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions this month.</p>';
    return;
  }

  if (state.txnViewTab === 'monthly') {
    const income  = all.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
    const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    list.innerHTML = `
      <div style="padding:16px 20px;display:flex;gap:16px">
        <div style="flex:1;background:var(--surface);border-radius:12px;padding:12px 16px">
          <div style="font-size:11px;color:var(--text-2)">INCOME</div>
          <div style="font-size:22px;font-weight:700;color:var(--income)">${state.currency}${fmt(income)}</div>
        </div>
        <div style="flex:1;background:var(--surface);border-radius:12px;padding:12px 16px">
          <div style="font-size:11px;color:var(--text-2)">EXPENSE</div>
          <div style="font-size:22px;font-weight:700;color:var(--expense)">${state.currency}${fmt(expense)}</div>
        </div>
      </div>
      ${renderDayGroups(all)}`;
    return;
  }

  if (state.txnViewTab === 'total') {
    const income  = all.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
    const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    list.innerHTML = `
      <div style="padding:16px 20px">
        <div style="background:var(--surface);border-radius:14px;padding:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:var(--text-2);font-size:13px">Total Income</span>
            <span style="color:var(--income);font-weight:700">${state.currency}${fmt(income)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:var(--text-2);font-size:13px">Total Expense</span>
            <span style="color:var(--expense);font-weight:700">${state.currency}${fmt(expense)}</span>
          </div>
          <div style="height:1px;background:var(--border);margin:8px 0"></div>
          <div style="display:flex;justify-content:space-between">
            <span style="font-size:15px;font-weight:600">Balance</span>
            <span style="font-size:15px;font-weight:700;color:${income - expense >= 0 ? 'var(--income)' : 'var(--expense)'}">${state.currency}${fmt(Math.abs(income - expense))}</span>
          </div>
        </div>
      </div>`;
    return;
  }

  list.innerHTML = renderDayGroups(all);
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
  await refreshHome();
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
  if (activeScreen === 'home')         await refreshHome();
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
    html += items.map(a => `
      <div class="account-row">
        <div class="acc-icon-circle">${a.icon || '🏦'}</div>
        <div class="acc-info">
          <div class="acc-name">${a.name}</div>
          <div class="acc-type">${a.type}</div>
        </div>
        <div class="acc-balance ${a.balance >= 0 ? 'positive' : 'negative'}">
          ${state.currency}${fmt(Math.abs(a.balance || 0))}
        </div>
      </div>`).join('');
  }
  list.innerHTML = html;
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
  state.selectedAccIcon = '🏦';
  document.getElementById('acc-icon-preview').textContent = '🏦';
  openOverlay('account-sheet');
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
  await db.accounts.add({
    name,
    type:    document.getElementById('account-type').value,
    balance: parseFloat(document.getElementById('account-balance').value) || 0,
    icon:    state.selectedAccIcon,
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
  document.getElementById('settings-currency').value    = settings.currency     || '₹';
  document.getElementById('settings-month-start').value = settings.monthStart   || 1;
  document.getElementById('claude-api-key').value       = settings.claudeApiKey || '';
  document.getElementById('gemini-api-key').value       = settings.geminiApiKey || '';
  document.getElementById('ai-preference').value        = settings.aiPreference || 'claude';
  document.getElementById('voice-lang').value           = settings.voiceLang    || 'en-IN';
  setToggleVisual('toggle-readback', settings.readbackEnabled ?? true);
}

function setToggleVisual(id, on) {
  document.getElementById(id).classList.toggle('on', !!on);
}

async function toggleSetting(key, btnId) {
  const cur  = await db.settings.get(key);
  const next = !(cur?.value || false);
  await db.settings.put({ key, value: next });
  setToggleVisual(btnId, next);
  if (key === 'readbackEnabled') state.readbackEnabled = next;
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
  await refreshHome();
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
    document.getElementById('voice-status').textContent =
      e.error === 'no-speech' ? "Didn't catch that. Try again." :
      e.error === 'network'   ? 'Voice unavailable. Type instead.' :
                                'Could not hear clearly. Try again.';
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

  if (ai) {
    document.getElementById('voice-status').textContent = `🤔 Thinking…`;
    const scenario = hasMultipleAmounts(text) ? 'multi' : 'standard';
    const aiResult = ai.provider === 'gemini'
      ? await callGeminiVoice(text, scenario, confidence, ai.key)
      : await callClaudeVoice(text, scenario, confidence, ai.key);
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
async function getActiveAI() {
  const [claudeRow, geminiRow, prefRow] = await Promise.all([
    db.settings.get('claudeApiKey'),
    db.settings.get('geminiApiKey'),
    db.settings.get('aiPreference'),
  ]);
  const claudeKey = claudeRow?.value?.trim() || '';
  const geminiKey = geminiRow?.value?.trim() || '';
  const pref      = prefRow?.value || 'claude';

  if (pref === 'gemini') {
    if (geminiKey) return { provider: 'gemini', key: geminiKey };
    if (claudeKey) return { provider: 'claude', key: claudeKey };
  } else {
    if (claudeKey) return { provider: 'claude', key: claudeKey };
    if (geminiKey) return { provider: 'gemini', key: geminiKey };
  }
  return null;
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
async function callClaudeVoice(transcript, scenario = 'standard', confidence = 1.0, apiKey) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:1000, system:buildVoicePrompts(scenario, confidence), messages:[{role:'user',content:transcript}] }),
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

async function extractReceiptClaude(imageB64, apiKey) {
  const mediaType  = imageB64.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const b64data    = imageB64.split(',')[1];
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 400,
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
const GEMINI_URL = key => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

async function callGeminiVoice(transcript, scenario = 'standard', confidence = 1.0, apiKey) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(GEMINI_URL(apiKey), {
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

async function extractReceiptGemini(imageB64, apiKey) {
  const mediaType  = imageB64.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const b64data    = imageB64.split(',')[1];
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(GEMINI_URL(apiKey), {
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
  await refreshHome();
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
  document.getElementById('scan-status').textContent = ai ? `Reading bill with ${ai.provider === 'gemini' ? 'Gemini' : 'Claude'}…` : 'Reading bill…';
  await sleep(300);
  const result = await extractReceiptData(imageB64);
  state.scanData = result;
  document.getElementById('scan-amount').value   = result.amount || '';
  document.getElementById('scan-merchant').value = result.merchant || '';
  document.getElementById('scan-date').value     = result.date || new Date().toISOString().split('T')[0];
  document.getElementById('scan-fields').style.display  = 'block';
  document.getElementById('scan-use-btn').style.display = 'block';
  document.getElementById('scan-status').textContent    = 'Edit fields if needed, then tap Use';
}

async function extractReceiptData(imageB64) {
  const fallback = { amount:null, merchant:'', date:new Date().toISOString().split('T')[0] };
  const ai = await getActiveAI();
  if (!ai) return fallback;
  const result = ai.provider === 'gemini'
    ? await extractReceiptGemini(imageB64, ai.key)
    : await extractReceiptClaude(imageB64, ai.key);
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
  document.getElementById('toast-msg').textContent          = msg;
  document.getElementById('toast-undo').style.display       = showUndo ? 'inline-block' : 'none';
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
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
  await refreshHome();
  showToast('Transaction undone');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

document.addEventListener('DOMContentLoaded', init);
