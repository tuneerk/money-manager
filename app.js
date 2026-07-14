'use strict';

const APP_VERSION = 'v1.40';

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

const SW_CATEGORY_MAP = {
  'Food and drink':     ['Food & Dining', ''],
  'Groceries':          ['Food & Dining', 'Groceries'],
  'Restaurants':        ['Food & Dining', 'Restaurants'],
  'Dining out':         ['Food & Dining', 'Restaurants'],
  'Alcohol, bars':      ['Food & Dining', 'Restaurants'],
  'Transportation':     ['Transport', ''],
  'Gas/fuel':           ['Transport', 'Petrol'],
  'Parking':            ['Transport', ''],
  'Taxi':               ['Transport', 'Auto / Cab'],
  'Public transit':     ['Transport', 'Metro / Bus'],
  'Entertainment':      ['Entertainment', ''],
  'Games':              ['Entertainment', ''],
  'Movies':             ['Entertainment', 'Movies'],
  'Music':              ['Entertainment', 'OTT / Streaming'],
  'Sports':             ['Entertainment', ''],
  'Home':               ['Bills & Utilities', ''],
  'Rent':               ['Bills & Utilities', 'Rent'],
  'Utilities':          ['Bills & Utilities', 'Electricity'],
  'Household supplies': ['Bills & Utilities', ''],
  'Furniture':          ['Shopping', ''],
  'Electronics':        ['Shopping', 'Electronics'],
  'Clothing':           ['Shopping', 'Clothes'],
  'Life & Personal':    ['Shopping', ''],
  'Healthcare':         ['Health', 'Medicines'],
  'Fitness':            ['Health', 'Gym'],
  'General':            ['Other', ''],
  'Uncategorized':      ['Other', ''],
};

const BUCKET_ICONS  = ['🎯','🏖️','🏠','🚗','💍','✈️','🎓','💻','📱','🏋️','🛍️','🎮','🎵','👶','🐾','💊'];
const BUCKET_COLORS = ['#54A0FF','#5F27CD','#10AC84','#FF9F43','#FECA57','#FF6B6B','#FF9FF3','#48DBFB','#EE5A24','#C8D6E5'];

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

  editingTxnId:     null,
  editingTxnOld:    null,

  multiTxnTotal:    0,

  catDetailName:      null,
  catDetailColor:     '#FF6060',
  catDetailSubFilter: null,

  statsTagFilter: '',
  txnTagFilter:   '',
  tagDetailName:  null,

  voiceParsed:      null,
  recognition:      null,
  listening:        false,
  voiceConfidence:  1.0,
  voiceAlternates:  [],
  voiceMode:        'idle',
  pendingMultiTxns: [],
  pendingSplitwiseImportTo: null,
  multiTxnIdx: 0,
  editingMultiIdx:  null,
  catMgmtTab:       'expense',
  catMgmtExpanded:  new Set(),
  readbackEnabled:  true,
  txnCatId:         null,
  txnCatName:       '',
  txnSubId:         null,
  txnSubName:       '',
  openCustomDD:     null,

  scanData:         null,
  scanImageB64:     null,
  autocatData:      null,
  selectedAccIcon:    '🏦',
  editingAccountId:   null,
  viewingAccountId:   null,
  splitwiseFriends:   null,
  splitwiseTotalOwed: 0,
  splitwiseTotalOwe:  0,
  currency:           '₹',

  editingBucketId:    null,
  addFundsBucketId:   null,
  selectedBucketIcon:  '🎯',
  selectedBucketColor: '#54A0FF',

  splitwiseCollapsed: false,
  txnSearchQuery:     '',
};

let _accountMap = new Map();

// ─── Init ──────────────────────────────────────────────────────────────────
async function init() {
  await seedDefaults();

  const cur = await db.settings.get('currency');
  if (cur) state.currency = cur.value;

  const readback = await db.settings.get('readbackEnabled');
  state.readbackEnabled = readback?.value ?? true;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data?.type === 'SW_UPDATED') window.location.reload();
    });
  }

  const verEl = document.getElementById('app-version-label');
  if (verEl) verEl.textContent = APP_VERSION;

  await refreshTxnList();
  setupGlobalListeners();
  _applyDynamicSafeTop();

  // Background Splitwise auto-sync (every 12h)
  const [swEnabledRow, swUrlRow, swLastFetchRow] = await Promise.all([
    db.settings.get('splitwiseEnabled'),
    db.settings.get('splitwiseProxyUrl'),
    db.settings.get('splitwiseLastFetch'),
  ]);
  const swReady = !!(swEnabledRow?.value && swUrlRow?.value?.trim());
  if (swReady) {
    const lastFetch = swLastFetchRow?.value ? new Date(swLastFetchRow.value) : null;
    const stale = !lastFetch || (Date.now() - lastFetch.getTime() > 12 * 3600 * 1000);
    if (stale) refreshSplitwiseBalances(true);
  }
}

function _applyDynamicSafeTop() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);pointer-events:none;visibility:hidden';
  document.body.appendChild(probe);
  requestAnimationFrame(() => {
    const safeTop = probe.getBoundingClientRect().height || 0;
    document.body.removeChild(probe);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS && safeTop < 10) {
      document.querySelectorAll('.overlay-fullscreen, .screen').forEach(el => el.style.paddingTop = '0px');
    } else if (isIOS && safeTop > 10) {
      document.querySelectorAll('.overlay-fullscreen').forEach(el => el.style.paddingTop = safeTop + 'px');
      document.querySelectorAll('.screen').forEach(el => el.style.paddingTop = safeTop + 'px');
    }
    // iOS with env()=0: CSS max(env(),59px) gives 59px minimum — no override needed
    // Bottom safe area is handled via env(safe-area-inset-bottom,0px) directly in CSS
    // (not through a custom property, which WebKit can fail to resolve correctly)
  });
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

  document.addEventListener('pointerdown', e => {
    if (!state.openCustomDD) return;
    const dd = document.getElementById(state.openCustomDD);
    if (dd && !dd.contains(e.target)) closeAllCustomDDs();
  }, { capture: true });

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

  document.getElementById('import-excel-input').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) { importExcel(f); e.target.value = ''; }
  });
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
  document.getElementById('toggle-splitwise').addEventListener('click', async () => {
    await toggleSetting('splitwiseEnabled', 'toggle-splitwise');
    const on = document.getElementById('toggle-splitwise').classList.contains('on');
    document.getElementById('splitwise-config').style.display = on ? 'block' : 'none';
  });
  document.getElementById('splitwise-api-key').addEventListener('change', async e => {
    await db.settings.put({ key: 'splitwiseApiKey', value: e.target.value.trim() });
    document.getElementById('splitwise-test-status').textContent = '—';
    document.getElementById('splitwise-test-status').style.color = 'var(--text-3)';
  });
  document.getElementById('splitwise-proxy-url').addEventListener('change', async e => {
    await db.settings.put({ key: 'splitwiseProxyUrl', value: e.target.value.trim() });
    document.getElementById('splitwise-test-status').textContent = '—';
    document.getElementById('splitwise-test-status').style.color = 'var(--text-3)';
  });

  document.getElementById('multi-save-all-btn').addEventListener('click', () => bulkSaveTxns(state.pendingMultiTxns));

  document.getElementById('save-bucket-btn').addEventListener('click', saveBucket);
  document.getElementById('delete-bucket-btn').addEventListener('click', deleteBucket);
  document.getElementById('add-funds-confirm-btn').addEventListener('click', saveAddFunds);

  document.querySelectorAll('.bucket-icon-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bucket-icon-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedBucketIcon = btn.textContent;
      document.getElementById('bucket-icon-preview').textContent = btn.textContent;
    });
  });

  document.querySelectorAll('.bucket-color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.bucket-color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      state.selectedBucketColor = sw.dataset.color;
    });
  });

  setupSheetDismiss();
  setupTxnSwipe();
  setupPTR('transactions',    () => refreshTxnList());
  setupPTR('accounts-screen', () => refreshAccounts());
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
  if (target === 'buckets-screen')   refreshBuckets();
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
  if (id === 'add-sheet') {
    if (state.editingMultiIdx !== null) {
      state.editingMultiIdx = null;
      _renderMultiTxnCard();
      openOverlay('multi-txn-sheet');
      return;
    }
    state.editingTxnId  = null;
    state.editingTxnOld = null;
    state.pendingMultiTxns = [];
    state.multiTxnTotal    = 0;
  }
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

      const dayIncome  = items.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const dayExpense = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      const todayStr  = new Date().toISOString().split('T')[0];
      const yesterStr = new Date(Date.now() - 864e5).toISOString().split('T')[0];
      let dayLabel = DAY_NAMES[dow];
      if (date === todayStr)  dayLabel = 'Today';
      if (date === yesterStr) dayLabel = 'Yest';

      const numCls  = dow === 0 ? 'sunday' : dow === 6 ? 'saturday' : '';
      const pillCls = `day-pill${dow === 0 ? ' sunday' : dow === 6 ? ' saturday' : ''}`;
      const mmYyyy  = `${String(m).padStart(2, '0')}.${y}`;

      return `
      <div class="day-group">
        <div class="day-group-header">
          <span class="day-num-big ${numCls}">${d}</span>
          <span class="${pillCls}">${dayLabel}</span>
          <span class="day-mmyy">${mmYyyy}</span>
          <div class="day-totals">
            <span class="day-income-total">${state.currency}${fmt(dayIncome)}</span>
            <span class="day-expense-total">-${state.currency}${fmt(dayExpense)}</span>
          </div>
        </div>
        ${items.map(txnHTML).join('')}
      </div>`;
    }).join('');
}

function txnHTML(t) {
  const meta    = getCatMeta(t.categoryName);
  const sign    = t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '-';
  const cls     = t.type === 'income' ? 'income' : t.type === 'transfer' ? 'transfer' : 'expense';
  const desc    = t.note || t.merchant || '';
  const accName = _accountMap.get(t.accountId) || '';
  const subLine = t.subcategoryName || '';

  const descRow = desc    ? `<div class="txn-desc">${desc}</div>`      : '';
  const accRow  = accName ? `<div class="txn-acc">${accName}</div>`    : '';
  const tagRow  = t.tag   ? `<span class="txn-tag-chip" data-tag="${t.tag.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" onclick="event.stopPropagation();openTagDetail(this.dataset.tag)">#${t.tag}</span>` : '';

  return `
    <div class="txn-swipe-wrap">
      <div class="txn-swipe-actions">
        <button class="txn-swipe-del" onclick="event.stopPropagation();_swipeDelete(${t.id})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Delete
        </button>
      </div>
      <div class="txn-row" onclick="_txnTap(event,${t.id})">
        <div class="txn-icon" style="background:${meta.darkBg}">${meta.icon}</div>
        <div class="txn-cat-block">
          <div class="txn-cat">${t.categoryName || 'Other'}</div>
          ${subLine ? `<div class="txn-sub">${subLine}</div>` : ''}
        </div>
        <div class="txn-main">
          ${descRow}${accRow}${tagRow}
        </div>
        <div class="txn-amount ${cls}">${sign}${state.currency}${fmt(t.amount)}</div>
      </div>
    </div>`;
}

// ─── Transactions Screen ────────────────────────────────────────────────────
function toggleTxnSearch() {
  const bar   = document.getElementById('txn-search-bar');
  const input = document.getElementById('txn-search-input');
  const visible = bar.style.display !== 'none';
  bar.style.display = visible ? 'none' : 'block';
  if (!visible) { input.value = ''; state.txnSearchQuery = ''; input.focus(); }
  else          { state.txnSearchQuery = ''; refreshTxnList(); }
}

function toggleTxnFilter() {
  const bar = document.getElementById('txn-tag-bar');
  if (bar.style.display === 'none') {
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
    state.txnTagFilter = '';
    refreshTxnList();
  }
}

function onTxnSearch(q) {
  state.txnSearchQuery = q.trim();
  refreshTxnList();
}

function setTxnView(tab, el) {
  state.txnViewTab = tab;
  document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  refreshTxnList();
}

async function refreshTxnList() {
  _closeActiveSwipe(true);
  _swipeWrap = null;
  updateMonthLabels();
  const list     = document.getElementById('all-txn-list');
  const summaryEl = document.getElementById('txn-summary-bar');
  const txnTagBar = document.getElementById('txn-tag-bar');

  // Preload accounts for display in txn rows
  const accs = await db.accounts.toArray();
  _accountMap.clear();
  for (const a of accs) _accountMap.set(a.id, a.name);

  if (state.txnViewTab === 'calendar') {
    txnTagBar.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'none';
    await renderCalendarView(list);
    return;
  }

  if (state.txnViewTab === 'monthly') {
    txnTagBar.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'none';
    await renderMonthlyYearView(list);
    return;
  }

  const { start, end } = getNavPeriod();
  const all = await db.transactions.where('date').between(start, end, true, true).toArray();
  all.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt));

  // Update summary bar
  if (summaryEl) {
    const monthIncome  = all.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
    const monthExpense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthTotal   = monthIncome - monthExpense;
    document.getElementById('txn-sum-income').textContent  = state.currency + fmt(monthIncome);
    document.getElementById('txn-sum-expense').textContent = state.currency + fmt(monthExpense);
    const totalEl = document.getElementById('txn-sum-total');
    totalEl.textContent  = (monthTotal < 0 ? '-' : '') + state.currency + fmt(Math.abs(monthTotal));
    totalEl.style.color  = monthTotal >= 0 ? 'var(--income)' : 'var(--expense)';
    summaryEl.style.display = 'flex';
  }

  await renderTagFilterBar('txn-tag-bar', state.txnTagFilter, 'setTxnTagFilter');

  if (state.txnViewTab === 'total') {
    await renderTotalView(list, all);
    return;
  }

  let display = state.txnTagFilter ? all.filter(t => t.tag === state.txnTagFilter) : all;

  // Apply search filter
  if (state.txnSearchQuery) {
    const q = state.txnSearchQuery.toLowerCase();
    display = display.filter(t =>
      (t.categoryName || '').toLowerCase().includes(q) ||
      (t.subcategoryName || '').toLowerCase().includes(q) ||
      (t.merchant || '').toLowerCase().includes(q) ||
      (t.note || '').toLowerCase().includes(q) ||
      (_accountMap.get(t.accountId) || '').toLowerCase().includes(q)
    );
  }

  if (display.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions this month.</p>';
    return;
  }

  list.innerHTML = renderDayGroups(display);
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
  state.currentType   = type;
  state.editingTxnId  = null;
  state.editingTxnOld = null;

  document.getElementById('txn-amount').value   = prefill.amount   || '';
  document.getElementById('txn-note').value     = prefill.note     || '';
  document.getElementById('txn-merchant').value = prefill.merchant || '';
  document.getElementById('txn-date').value     = prefill.date     || new Date().toISOString().split('T')[0];
  document.getElementById('txn-tag').value      = prefill.tag      || '';
  loadTagSuggestions();

  setTxnType(type);
  await loadCategoryDropdown(prefill.categoryName, prefill.subcategoryName);

  const accounts = await db.accounts.toArray();
  const accSel = document.getElementById('txn-account');
  accSel.innerHTML = accounts.map(a => `<option value="${a.id}">${a.icon || ''} ${a.name}</option>`).join('');
  if (prefill.accountId) accSel.value = String(prefill.accountId);

  if (prefill.receiptImage) {
    state.scanImageB64 = prefill.receiptImage;
    document.getElementById('receipt-preview').src = prefill.receiptImage;
    document.getElementById('receipt-preview-wrap').style.display = 'block';
  } else {
    document.getElementById('receipt-preview-wrap').style.display = 'none';
    state.scanImageB64 = null;
  }

  document.getElementById('add-sheet-title').textContent    = 'Add Transaction';
  document.getElementById('delete-txn-btn').style.display   = 'none';
  document.getElementById('save-txn-btn').textContent       = 'Save';

  openOverlay('add-sheet');
}

async function openEditSheet(id) {
  const txn = await db.transactions.get(id);
  if (!txn) return;
  await openAddSheet(txn.type, {
    amount:          txn.amount,
    note:            txn.note,
    merchant:        txn.merchant,
    date:            txn.date,
    categoryName:    txn.categoryName,
    subcategoryName: txn.subcategoryName,
    accountId:       txn.accountId,
    receiptImage:    txn.receiptImage,
    tag:             txn.tag,
  });
  state.editingTxnId  = id;
  state.editingTxnOld = { amount: txn.amount, accountId: txn.accountId, type: txn.type };
  document.getElementById('add-sheet-title').textContent  = 'Edit Transaction';
  document.getElementById('delete-txn-btn').style.display = '';
  document.getElementById('save-txn-btn').textContent     = 'Update';
}

async function deleteEditingTxn() {
  if (!state.editingTxnId) return;
  const id = state.editingTxnId;
  closeOverlay('add-sheet');
  await deleteTxnPrompt(id);
}

function setTxnType(type) {
  state.currentType = type;
  ['expense','income','transfer'].forEach(t => {
    document.getElementById(`txn-type-${t}`).classList.toggle('active', t === type);
  });
  if (type !== 'transfer') {
    loadCategoryDropdown();
  } else {
    const cl = document.getElementById('txn-category-label');
    const sl = document.getElementById('txn-subcategory-label');
    cl.textContent = 'N/A (Transfer)'; cl.className = 'custom-dd-label ph';
    sl.textContent = 'N/A';           sl.className = 'custom-dd-label ph';
    document.getElementById('txn-category-list').innerHTML   = '';
    document.getElementById('txn-subcategory-list').innerHTML = '';
    state.txnCatId = null; state.txnCatName = '';
    state.txnSubId = null; state.txnSubName = '';
  }
}

function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

function toggleCustomDD(ddId) {
  if (state.openCustomDD === ddId) { closeAllCustomDDs(); return; }
  closeAllCustomDDs();
  const btn  = document.querySelector(`#${ddId} .custom-dd-btn`);
  const list = document.querySelector(`#${ddId} .custom-dd-list`);
  btn.classList.add('open');
  list.classList.add('open');
  state.openCustomDD = ddId;
}

function closeAllCustomDDs() {
  if (!state.openCustomDD) return;
  const dd = document.getElementById(state.openCustomDD);
  if (dd) {
    dd.querySelector('.custom-dd-btn')?.classList.remove('open');
    dd.querySelector('.custom-dd-list')?.classList.remove('open');
  }
  state.openCustomDD = null;
}

function selectCatOption(btn) {
  const id   = parseInt(btn.dataset.id) || null;
  const name = btn.dataset.name || '';
  const icon = btn.dataset.icon || '';
  state.txnCatId = id; state.txnCatName = name;
  state.txnSubId = null; state.txnSubName = '';
  const label = document.getElementById('txn-category-label');
  label.textContent = id ? `${icon} ${name}`.trim() : 'Select category';
  label.className   = id ? 'custom-dd-label' : 'custom-dd-label ph';
  document.querySelectorAll('#txn-category-list .custom-dd-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  closeAllCustomDDs();
  if (id) loadSubcats();
}

function selectSubOption(btn) {
  const id   = parseInt(btn.dataset.id) || null;
  const name = btn.dataset.name || '';
  const icon = btn.dataset.icon || '';
  state.txnSubId = id; state.txnSubName = name;
  const label = document.getElementById('txn-subcategory-label');
  label.textContent = id ? `${icon} ${name}`.trim() : 'No sub-category';
  label.className   = id ? 'custom-dd-label' : 'custom-dd-label ph';
  document.querySelectorAll('#txn-subcategory-list .custom-dd-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  closeAllCustomDDs();
}

async function loadCategoryDropdown(prefillCat, prefillSub) {
  const type = state.currentType === 'transfer' ? 'expense' : state.currentType;
  const cats = await db.categories.where('type').equals(type).toArray();
  state.txnCatId = null; state.txnCatName = '';
  state.txnSubId = null; state.txnSubName = '';
  const label = document.getElementById('txn-category-label');
  label.textContent = 'Select category';
  label.className   = 'custom-dd-label ph';
  const list = document.getElementById('txn-category-list');
  list.innerHTML = cats.map(c => {
    const sel = c.name === prefillCat;
    if (sel) {
      state.txnCatId = c.id; state.txnCatName = c.name;
      label.textContent = `${c.icon || ''} ${c.name}`.trim();
      label.className   = 'custom-dd-label';
    }
    return `<button type="button" class="custom-dd-opt${sel?' selected':''}" data-id="${c.id}" data-name="${_esc(c.name)}" data-icon="${_esc(c.icon||'')}" onclick="selectCatOption(this)"><span class="custom-dd-opt-icon">${c.icon||''}</span>${c.name}</button>`;
  }).join('');
  await loadSubcats(prefillSub);
}

async function loadSubcats(prefillSub) {
  const catId = state.txnCatId;
  state.txnSubId = null; state.txnSubName = '';
  const label = document.getElementById('txn-subcategory-label');
  label.textContent = 'No sub-category';
  label.className   = 'custom-dd-label ph';
  const list = document.getElementById('txn-subcategory-list');
  if (!catId) { list.innerHTML = ''; return; }
  const subs = await db.subcategories.where('categoryId').equals(catId).toArray();
  list.innerHTML = `<button type="button" class="custom-dd-opt" data-id="" data-name="" data-icon="" onclick="selectSubOption(this)">No sub-category</button>`
    + subs.map(s => {
      const sel = s.name === prefillSub;
      if (sel) {
        state.txnSubId = s.id; state.txnSubName = s.name;
        label.textContent = `${s.icon||''} ${s.name}`.trim();
        label.className   = 'custom-dd-label';
      }
      return `<button type="button" class="custom-dd-opt${sel?' selected':''}" data-id="${s.id}" data-name="${_esc(s.name)}" data-icon="${_esc(s.icon||'')}" onclick="selectSubOption(this)"><span class="custom-dd-opt-icon">${s.icon||''}</span>${s.name}</button>`;
    }).join('');
}

async function saveTransaction() {
  if (state.currentType === 'transfer' && !state.editingTxnId) { await saveTransferFromSheet(); return; }

  const amountRaw = parseFloat(document.getElementById('txn-amount').value);
  if (!amountRaw || amountRaw <= 0) { showToast('Enter a valid amount'); return; }

  const catId   = state.txnCatId   || null;
  const subId   = state.txnSubId   || null;
  const catName = state.txnCatName || '';
  const subName = state.txnSubName || '';
  const accId   = parseInt(document.getElementById('txn-account').value) || null;

  const fields = {
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
    tag:             document.getElementById('txn-tag').value.trim() || null,
  };

  if (state.editingTxnId) {
    const old = state.editingTxnOld;
    if (old.accountId) {
      const acc = await db.accounts.get(old.accountId);
      if (acc) {
        const reversal = old.type === 'income' ? -old.amount : old.amount;
        await db.accounts.update(old.accountId, { balance: acc.balance + reversal });
      }
    }
    if (accId) {
      const acc = await db.accounts.get(accId);
      if (acc) {
        const delta = state.currentType === 'income' ? amountRaw : -amountRaw;
        await db.accounts.update(accId, { balance: acc.balance + delta });
      }
    }
    await db.transactions.update(state.editingTxnId, fields);
    closeOverlay('add-sheet');
    const activeScreen = document.querySelector('.screen.active')?.id;
    if (activeScreen === 'transactions') await refreshTxnList();
    if (activeScreen === 'reports')      await refreshReports();
    showToast('Transaction updated');
    return;
  }

  const txn = { ...fields, createdAt: Date.now() };
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

  if (state.editingMultiIdx !== null) {
    const idx = state.editingMultiIdx;
    state.editingMultiIdx = null;
    state.pendingMultiTxns.splice(idx, 1);
    closeOverlay('add-sheet');
    await refreshTxnList();
    if (state.pendingMultiTxns.length > 0) {
      if (state.multiTxnIdx >= state.pendingMultiTxns.length) state.multiTxnIdx = state.pendingMultiTxns.length - 1;
      _renderMultiTxnCard();
      openOverlay('multi-txn-sheet');
    } else {
      await _multiTxnFinalize('All transactions saved');
    }
    return;
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
  const filtered = txns.filter(t => t.type === state.statsTab && (!state.statsTagFilter || t.tag === state.statsTagFilter));
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  await renderTagFilterBar('stats-tag-bar', state.statsTagFilter, 'setStatsTagFilter');
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
    return;
  }

  breakdown.innerHTML = sorted.map(([catName, data], idx) => {
    const pct   = total > 0 ? Math.round(data.total / total * 100) : 0;
    const color = CHART_COLORS[idx % CHART_COLORS.length];
    const meta  = getCatMeta(catName);
    const safeN = catName.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `
      <div class="stat-cat-row" onclick="openCatDetail('${safeN}','${color}')">
        <div class="stat-pct-pill" style="background:${color}">${pct}%</div>
        <div class="stat-cat-name">${meta.icon} ${catName}</div>
        <div class="stat-cat-amt">${state.currency} ${fmtDec(data.total)}</div>
      </div>`;
  }).join('');

}

function renderPieChart(sorted, total) {
  const svg = document.getElementById('pie-svg');
  if (!svg) return;

  const W = 320, H = 200, cx = 160, cy = 100, R = 88, ri = 52;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  if (sorted.length === 0 || total === 0) {
    svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#2E2E42"/>
      <circle cx="${cx}" cy="${cy}" r="${ri}" fill="#1C1C2A"/>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#666688" font-size="12" font-family="system-ui">No data</text>`;
    return;
  }

  const TAU = 2 * Math.PI;
  let startAngle = -Math.PI / 2;

  const slices = sorted.map(([catName, data], i) => {
    const pct   = data.total / total;
    const angle = pct * TAU;
    const mid   = startAngle + angle / 2;
    const s     = { catName, data, pct, angle, startAngle, endAngle: startAngle + angle, midAngle: mid, color: CHART_COLORS[i % CHART_COLORS.length] };
    startAngle += angle;
    return s;
  });

  // ── Donut slices ──
  let html = '';
  for (const s of slices) {
    if (s.pct < 0.001) continue;
    const lArc = s.angle > Math.PI ? 1 : 0;
    // Outer arc
    const ox1 = cx + R  * Math.cos(s.startAngle), oy1 = cy + R  * Math.sin(s.startAngle);
    const ox2 = cx + R  * Math.cos(s.endAngle),   oy2 = cy + R  * Math.sin(s.endAngle);
    // Inner arc (reversed)
    const ix1 = cx + ri * Math.cos(s.endAngle),   iy1 = cy + ri * Math.sin(s.endAngle);
    const ix2 = cx + ri * Math.cos(s.startAngle), iy2 = cy + ri * Math.sin(s.startAngle);
    html += `<path d="M${ox1.toFixed(1)},${oy1.toFixed(1)}A${R},${R} 0 ${lArc},1 ${ox2.toFixed(1)},${oy2.toFixed(1)}L${ix1.toFixed(1)},${iy1.toFixed(1)}A${ri},${ri} 0 ${lArc},0 ${ix2.toFixed(1)},${iy2.toFixed(1)}Z" fill="${s.color}" stroke="#1C1C2A" stroke-width="1.5"/>`;

    // Inline percentage label for slices large enough to fit text (~12%+)
    if (s.pct >= 0.12) {
      const midR = (R + ri) / 2;
      const lx   = cx + midR * Math.cos(s.midAngle);
      const ly   = cy + midR * Math.sin(s.midAngle);
      html += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10.5" font-weight="700" font-family="system-ui,sans-serif" style="pointer-events:none">${(s.pct * 100).toFixed(0)}%</text>`;
    }
  }

  // ── Donut hole ──
  html += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="#1C1C2A"/>`;

  // ── Center: top category ──
  const top  = slices[0];
  const meta = getCatMeta(top.catName);
  const name = top.catName.length > 11 ? top.catName.slice(0, 11) + '…' : top.catName;
  html += `<text x="${cx}" y="${cy - 13}" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="18" font-family="system-ui">${meta.icon}</text>
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#FFFFFF" font-size="9.5" font-weight="600" font-family="system-ui,sans-serif">${name}</text>
    <text x="${cx}" y="${cy + 17}" text-anchor="middle" fill="#9999BB" font-size="9" font-family="system-ui,sans-serif">${(top.pct * 100).toFixed(1)}%</text>`;

  svg.innerHTML = html;
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

// ─── Category Detail ─────────────────────────────────────────────────────────
async function openCatDetail(catName, color) {
  state.catDetailName      = catName;
  state.catDetailColor     = color;
  state.catDetailSubFilter = null;
  await renderCatDetail();
  openOverlay('cat-detail-sheet');
}

async function renderCatDetail(skipChart = false) {
  const { start, end } = getNavPeriod();
  const catName = state.catDetailName;
  const color   = state.catDetailColor;
  const meta    = getCatMeta(catName);

  document.getElementById('cd-icon').textContent   = meta.icon;
  document.getElementById('cd-name').textContent   = catName;
  document.getElementById('cd-period').textContent = monthLabel();

  const allTxns = await db.transactions.where('date').between(start, end, true, true).toArray();
  const catTxns = allTxns.filter(t => t.type === state.statsTab && t.categoryName === catName);
  const total   = catTxns.reduce((s, t) => s + t.amount, 0);
  document.getElementById('cd-total').textContent = `${state.currency}${fmt(total)}`;

  // Subcategory breakdown
  const subMap = {};
  for (const t of catTxns) {
    const s = t.subcategoryName || '';
    if (s) subMap[s] = (subMap[s] || 0) + t.amount;
  }
  const subSorted = Object.entries(subMap).sort((a, b) => b[1] - a[1]);

  const subsEl = document.getElementById('cd-subs');
  if (subSorted.length > 0) {
    subsEl.innerHTML =
      `<div class="cd-sub-row${!state.catDetailSubFilter ? ' sel' : ''}" onclick="setCatDetailSub(null)">
        <span class="cd-sub-name">All</span>
        <span class="cd-sub-pct">100%</span>
        <span class="cd-sub-amt">${state.currency}${fmt(total)}</span>
      </div>` +
      subSorted.map(([sub, amt]) => {
        const pct  = total > 0 ? Math.round(amt / total * 100) : 0;
        const safe = sub.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        return `<div class="cd-sub-row${state.catDetailSubFilter === sub ? ' sel' : ''}" onclick="setCatDetailSub(this.dataset.s)" data-s="${safe}">
          <span class="cd-sub-name">${sub}</span>
          <span class="cd-sub-pct">${pct}%</span>
          <span class="cd-sub-amt">${state.currency}${fmt(amt)}</span>
        </div>`;
      }).join('');
  } else {
    subsEl.innerHTML = '';
  }

  if (!skipChart) await renderCatDetailChart(catName, color);

  // Transaction list filtered by subcategory
  const sub = state.catDetailSubFilter;
  const displayTxns = sub
    ? catTxns.filter(t => t.subcategoryName === sub)
    : catTxns;
  displayTxns.sort((a, b) => b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt);

  document.getElementById('cd-txns').innerHTML = displayTxns.length
    ? renderDayGroups(displayTxns)
    : '<p class="empty-state">No transactions this period.</p>';
}

async function renderCatDetailChart(catName, color) {
  const now    = new Date();
  const labels = [];
  const totals = [];

  for (let i = 7; i >= 0; i--) {
    const d  = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y  = d.getFullYear(), m = d.getMonth();
    const mm = String(m + 1).padStart(2, '0');
    const ld = new Date(y, m + 1, 0).getDate();
    const txns = await db.transactions.where('date')
      .between(`${y}-${mm}-01`, `${y}-${mm}-${String(ld).padStart(2,'0')}`, true, true)
      .toArray();
    totals.push(txns.filter(t => t.type === state.statsTab && t.categoryName === catName)
      .reduce((s, t) => s + t.amount, 0));
    labels.push(MONTH_NAMES[m].slice(0, 3));
  }

  const max = Math.max(...totals, 1);
  const W = 320, H = 110, PX = 26, PY = 8, BOT = 18;
  const cw = W - PX * 2, ch = H - PY - BOT;
  const n  = totals.length;
  const pts = totals.map((v, i) => ({
    x: PX + (i / (n - 1)) * cw,
    y: PY + ch - (v / max) * ch,
  }));

  const grids = [0.5, 1].map(f => {
    const y = PY + ch - f * ch;
    return `<line x1="${PX}" y1="${y}" x2="${W-PX}" y2="${y}" stroke="var(--border)" stroke-width="1"/>
      <text x="${PX-3}" y="${y+3}" text-anchor="end" fill="var(--text-3)" font-size="8">${fmtShort(f * max)}</text>`;
  }).join('');

  const line = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M${pts[0].x},${PY+ch} L${pts.map(p=>`${p.x},${p.y}`).join(' L')} L${pts[n-1].x},${PY+ch} Z`;
  const dots = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}" stroke="var(--bg)" stroke-width="1.5"/>`).join('');
  const lbls = labels.map((l,i) => `<text x="${pts[i].x}" y="${H-1}" text-anchor="middle" fill="var(--text-3)" font-size="9">${l}</text>`).join('');

  document.getElementById('cd-chart').innerHTML = `
    <defs>
      <linearGradient id="cdGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grids}
    <path d="${area}" fill="url(#cdGrad)"/>
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${lbls}`;
}

async function setCatDetailSub(sub) {
  state.catDetailSubFilter = sub || null;
  await renderCatDetail(true);
}

async function catDetailNavPrev() {
  if (state.navMonth === 0) { state.navMonth = 11; state.navYear--; }
  else state.navMonth--;
  state.catDetailSubFilter = null;
  await renderCatDetail();
}

async function catDetailNavNext() {
  if (state.navMonth === 11) { state.navMonth = 0; state.navYear++; }
  else state.navMonth++;
  state.catDetailSubFilter = null;
  await renderCatDetail();
}

// ─── Tags ────────────────────────────────────────────────────────────────────
async function getAllTags() {
  try { return await db.transactions.orderBy('tag').uniqueKeys(); } catch { return []; }
}

async function loadTagSuggestions() {
  const tags = await getAllTags();
  document.getElementById('tag-suggestions').innerHTML =
    tags.map(t => `<option value="${t.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></option>`).join('');
}

async function renderTagFilterBar(barId, activeTag, setterFn) {
  const tags = await getAllTags();
  const bar  = document.getElementById(barId);
  if (!bar) return;
  if (tags.length === 0) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  bar.innerHTML =
    `<span class="tag-filter-chip${!activeTag ? ' active' : ''}" data-fn="${setterFn}" data-tag="" onclick="handleTagChip(this)">All</span>` +
    tags.map(t => {
      const safe = t.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      return `<span class="tag-filter-chip${activeTag === t ? ' active' : ''}" data-fn="${setterFn}" data-tag="${safe}" onclick="handleTagChip(this)">#${t}</span>`;
    }).join('');
}

function handleTagChip(el) {
  const tag = el.dataset.tag;
  const fn  = el.dataset.fn;
  if      (fn === 'setStatsTagFilter') setStatsTagFilter(tag);
  else if (fn === 'setTxnTagFilter')   setTxnTagFilter(tag);
}

function setStatsTagFilter(tag) { state.statsTagFilter = tag; refreshReports(); }
function setTxnTagFilter(tag)   { state.txnTagFilter   = tag; refreshTxnList(); }

async function openTagDetail(tagName) {
  state.tagDetailName = tagName;
  await renderTagDetail();
  openOverlay('tag-detail-sheet');
}

async function renderTagDetail(skipChart = false) {
  const { start, end } = getNavPeriod();
  const tagName = state.tagDetailName;

  document.getElementById('td-name').textContent   = `#${tagName}`;
  document.getElementById('td-period').textContent = monthLabel();

  const allTxns = await db.transactions.where('date').between(start, end, true, true).toArray();
  const tagTxns = allTxns.filter(t => t.tag === tagName && t.type !== 'transfer');
  const total   = tagTxns.reduce((s, t) => s + t.amount, 0);
  document.getElementById('td-total').textContent = `${state.currency}${fmt(total)}`;

  // Category breakdown
  const catMap = {};
  for (const t of tagTxns) {
    const c = t.categoryName || 'Uncategorised';
    catMap[c] = (catMap[c] || 0) + t.amount;
  }
  const catSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  document.getElementById('td-cats').innerHTML = catSorted.length
    ? catSorted.map(([cat, amt], idx) => {
        const pct   = total > 0 ? Math.round(amt / total * 100) : 0;
        const color = CHART_COLORS[idx % CHART_COLORS.length];
        return `<div class="cd-sub-row">
          <span class="cd-sub-name" style="display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>${cat}
          </span>
          <span class="cd-sub-pct">${pct}%</span>
          <span class="cd-sub-amt">${state.currency}${fmt(amt)}</span>
        </div>`;
      }).join('')
    : '<p class="empty-state">No transactions this period.</p>';

  if (!skipChart) await renderTagDetailChart(tagName);

  const sorted = [...tagTxns].sort((a, b) => b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt);
  document.getElementById('td-txns').innerHTML = sorted.length
    ? renderDayGroups(sorted)
    : '<p class="empty-state">No transactions this period.</p>';
}

async function renderTagDetailChart(tagName) {
  const now = new Date();
  const labels = [], totals = [];
  for (let i = 7; i >= 0; i--) {
    const d  = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y  = d.getFullYear(), m = d.getMonth();
    const mm = String(m + 1).padStart(2, '0');
    const ld = new Date(y, m + 1, 0).getDate();
    const txns = await db.transactions.where('date')
      .between(`${y}-${mm}-01`, `${y}-${mm}-${String(ld).padStart(2,'0')}`, true, true).toArray();
    totals.push(txns.filter(t => t.tag === tagName && t.type !== 'transfer').reduce((s, t) => s + t.amount, 0));
    labels.push(MONTH_NAMES[m].slice(0, 3));
  }
  const color = '#FF9800';
  const max = Math.max(...totals, 1);
  const W = 320, H = 110, PX = 26, PY = 8, BOT = 18;
  const cw = W - PX * 2, ch = H - PY - BOT, n = totals.length;
  const pts = totals.map((v, i) => ({ x: PX + (i / (n-1)) * cw, y: PY + ch - (v / max) * ch }));
  const grids = [0.5, 1].map(f => {
    const y = PY + ch - f * ch;
    return `<line x1="${PX}" y1="${y}" x2="${W-PX}" y2="${y}" stroke="var(--border)" stroke-width="1"/>
      <text x="${PX-3}" y="${y+3}" text-anchor="end" fill="var(--text-3)" font-size="8">${fmtShort(f*max)}</text>`;
  }).join('');
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M${pts[0].x},${PY+ch} L${pts.map(p=>`${p.x},${p.y}`).join(' L')} L${pts[n-1].x},${PY+ch} Z`;
  const dots = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}" stroke="var(--bg)" stroke-width="1.5"/>`).join('');
  const lbls = labels.map((l,i) => `<text x="${pts[i].x}" y="${H-1}" text-anchor="middle" fill="var(--text-3)" font-size="9">${l}</text>`).join('');
  document.getElementById('td-chart').innerHTML = `
    <defs><linearGradient id="tdGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${grids}<path d="${area}" fill="url(#tdGrad)"/>
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${lbls}`;
}

async function tagDetailNavPrev() {
  if (state.navMonth === 0) { state.navMonth = 11; state.navYear--; } else state.navMonth--;
  await renderTagDetail();
}
async function tagDetailNavNext() {
  if (state.navMonth === 11) { state.navMonth = 0; state.navYear++; } else state.navMonth++;
  await renderTagDetail();
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
}

// ─── Accounts ───────────────────────────────────────────────────────────────
async function refreshAccounts() {
  const [accounts, swEnabledRow, swUrlRow] = await Promise.all([
    db.accounts.toArray(),
    db.settings.get('splitwiseEnabled'),
    db.settings.get('splitwiseProxyUrl'),
  ]);
  const swEnabled = !!(swEnabledRow?.value && swUrlRow?.value?.trim());

  const assets      = accounts.filter(a => (a.balance || 0) >= 0).reduce((s, a) => s + (a.balance || 0), 0);
  const liabilities = accounts.filter(a => (a.balance || 0) <  0).reduce((s, a) => s + (a.balance || 0), 0);
  const total       = assets + liabilities;
  document.getElementById('acc-assets').textContent      = `${state.currency}${fmt(assets)}`;
  document.getElementById('acc-liabilities').textContent = `${state.currency}${fmt(Math.abs(liabilities))}`;
  document.getElementById('acc-total').textContent       = `${state.currency}${fmt(Math.abs(total))}`;

  const list = document.getElementById('accounts-list');
  let html = '';
  if (accounts.length > 0) {
    const groups = groupAccounts(accounts);
    for (const [groupName, items] of Object.entries(groups)) {
      if (items.length === 0) continue;
      const groupTotal = items.reduce((s, a) => s + (a.balance || 0), 0);
      const isCCGroup  = groupName === 'Credit Cards';
      const totalSign  = groupTotal < 0 ? '-' : '';
      html += `<div class="acc-group-header"><span>${groupName}</span><span class="acc-group-total">${totalSign}${state.currency}${fmt(Math.abs(groupTotal))}</span></div>`;
      if (isCCGroup) {
        html += `<div class="acc-cc-col-header"><span class="acc-cc-col-label">Balance Payable</span><span class="acc-cc-col-label" style="min-width:110px">Outst. Balance</span></div>`;
      }
      html += items.map(a => accountRowHTML(a)).join('');
    }
  }

  if (swEnabled) {
    html += `<div class="acc-group-header"><span>Splitwise</span><span class="acc-group-total" id="sw-list-net">—</span></div>`;
    html += `<div class="acc-cc-col-header"><span class="acc-cc-col-label">You are owed</span><span class="acc-cc-col-label" style="min-width:110px">You owe</span></div>`;
    html += `<div class="account-row" onclick="openSplitwiseDetail()">
      <div class="acc-row-name">🔄 Splitwise</div>
      <div class="acc-row-right">
        <div class="acc-row-bal zero" id="sw-list-owed">…</div>
        <div class="acc-row-bal zero" id="sw-list-owe" style="min-width:110px">…</div>
      </div>
    </div>`;
  }

  if (!html) html = '<p class="empty-state">No accounts yet.</p>';
  list.innerHTML = html;

  const cats    = await db.categories.where('type').equals('expense').toArray();
  const budgets = await db.budgets.toArray();
  const budgetByCatName = {};
  for (const b of budgets) {
    const cat = cats.find(c => c.id === b.categoryId);
    if (cat) budgetByCatName[cat.name] = b.amount;
  }
  renderBudgetManager(cats, budgetByCatName, {});
  refreshSplitwiseBalances();
}

function accountRowHTML(a) {
  const isCC        = a.type === 'Credit Card';
  const balance     = a.balance || 0;
  const hasLimit    = isCC && a.limit > 0;
  const outstanding = isCC ? Math.max(-balance, 0) : 0;
  const available   = hasLimit ? Math.max(a.limit - outstanding, 0) : null;
  const utilPct     = hasLimit ? Math.min(100, Math.round(outstanding / a.limit * 100)) : null;
  const barColor    = utilPct >= 80 ? 'var(--expense)' : utilPct >= 50 ? '#FFD700' : 'var(--income)';

  if (isCC) {
    const payable  = Math.max(balance, 0);
    const outst    = outstanding;
    const payCls   = payable  > 0 ? 'negative' : 'zero';
    const outstCls = outst    > 0 ? 'negative' : 'zero';
    const utilBar  = hasLimit ? `
      <div class="acc-util-bar" style="width:100px">
        <div class="acc-util-fill" style="width:${utilPct}%;background:${barColor}"></div>
      </div>` : '';
    return `
      <div class="account-row" onclick="openAccountDetail(${a.id})">
        <div class="acc-row-name">${a.icon || '💳'} ${a.name}</div>
        <div class="acc-row-right">
          <div class="acc-row-bal ${payCls}">${state.currency}${fmt(payable)}</div>
          <div class="acc-row-bal ${outstCls}" style="min-width:110px">${state.currency}${fmt(outst)}</div>
        </div>
      </div>`;
  }

  const dispBal = Math.abs(balance);
  const balCls  = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';
  const sign    = balance < 0 ? '-' : '';
  return `
    <div class="account-row" onclick="openAccountDetail(${a.id})">
      <div class="acc-row-name">${a.icon || '🏦'} ${a.name}</div>
      <div class="acc-row-bal ${balCls}">${sign}${state.currency}${fmt(dispBal)}</div>
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

async function openAccountDetail(id) {
  state.viewingAccountId = id;
  const a = await db.accounts.get(id);

  document.getElementById('acc-detail-heading').textContent = `${a.icon || '🏦'} ${a.name}`;

  const isCC        = a.type === 'Credit Card';
  const balance     = a.balance || 0;
  const outstanding = isCC ? Math.max(-balance, 0) : 0;
  const available   = (isCC && a.limit > 0) ? Math.max(a.limit - outstanding, 0) : null;
  const utilPct     = (isCC && a.limit > 0) ? Math.min(100, Math.round(outstanding / a.limit * 100)) : null;
  const barColor    = utilPct >= 80 ? 'var(--expense)' : utilPct >= 50 ? '#FFD700' : 'var(--income)';

  const displayBal  = isCC ? outstanding : Math.abs(balance);
  const balCls      = isCC ? (outstanding > 0 ? 'negative' : 'positive') : (balance >= 0 ? 'positive' : 'negative');
  const balLabel    = isCC ? 'Outstanding' : (balance >= 0 ? 'Balance' : 'Overdraft');

  const availHTML = available !== null ? `
    <div class="acc-detail-avail">${state.currency}${fmt(available)} available of ${state.currency}${fmt(a.limit)} limit</div>
    <div class="acc-detail-util-bar">
      <div class="acc-detail-util-fill" style="width:${utilPct}%;background:${barColor}"></div>
    </div>` : '';

  document.getElementById('acc-detail-info').innerHTML = `
    <div class="acc-detail-balance-card">
      <div class="acc-detail-type-label">${a.type} · ${balLabel}</div>
      <div class="acc-detail-amount ${balCls}">${state.currency}${fmt(displayBal)}</div>
      ${availHTML}
    </div>`;

  document.getElementById('acc-detail-txns').innerHTML =
    '<p style="padding:16px var(--px);color:var(--text-3);font-size:13px">Loading…</p>';

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('account-detail-screen').classList.add('active');

  const allAccounts = await db.accounts.toArray();
  _accountMap = new Map(allAccounts.map(ac => [ac.id, ac.name]));
  const txns = await db.transactions.where('accountId').equals(id).reverse().sortBy('date');

  if (txns.length === 0) {
    document.getElementById('acc-detail-txns').innerHTML = '<p class="empty-state">No transactions yet.</p>';
  } else {
    document.getElementById('acc-detail-txns').innerHTML = txns.map(t => txnDetailRowHTML(t)).join('');
  }
}

function txnDetailRowHTML(t) {
  const meta    = getCatMeta(t.categoryName);
  const sign    = t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '-';
  const cls     = t.type === 'income' ? 'income' : t.type === 'transfer' ? 'transfer' : 'expense';
  const desc    = t.note || t.merchant || '';
  const d       = new Date(t.date);
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `
    <div class="txn-row" onclick="openEditSheet(${t.id})">
      <div class="txn-icon" style="background:${meta.darkBg}">${meta.icon}</div>
      <div class="txn-cat-block">
        <div class="txn-cat">${t.categoryName || 'Other'}</div>
        ${t.subcategoryName ? `<div class="txn-sub">${t.subcategoryName}</div>` : ''}
      </div>
      <div class="txn-main">
        ${desc ? `<div class="txn-desc">${desc}</div>` : ''}
        <div class="txn-acc">${dateStr}</div>
      </div>
      <div class="txn-amount ${cls}">${sign}${state.currency}${fmt(t.amount)}</div>
    </div>`;
}

function closeAccountDetail() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('accounts-screen').classList.add('active');
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tab="accounts-screen"]')?.classList.add('active');
  document.getElementById('acc-detail-edit-btn').style.display = '';
  document.getElementById('acc-detail-section-label').textContent = 'Transactions';
  document.getElementById('acc-detail-footer').style.display = 'none';
}

async function openAccountSheet(id = null) {
  state.editingAccountId = id;
  const isEdit = id !== null;
  document.getElementById('account-sheet-title').textContent = isEdit ? 'Edit Account' : 'Add Account';
  document.getElementById('save-account-btn').textContent    = isEdit ? 'Save Changes' : 'Add Account';
  document.getElementById('delete-account-btn').style.display = isEdit ? 'block' : 'none';

  if (isEdit) {
    const a = await db.accounts.get(id);
    document.getElementById('account-name').value    = a.name;
    document.getElementById('account-type').value    = a.type;
    document.getElementById('account-balance').value = a.balance ?? '';
    document.getElementById('account-balance-label').textContent = 'Current Balance';
    document.getElementById('account-limit').value   = a.limit ?? '';
    state.selectedAccIcon = a.icon || '🏦';
    onAccountTypeChange(a.type);
  } else {
    document.getElementById('account-name').value    = '';
    document.getElementById('account-type').value    = 'Savings';
    document.getElementById('account-balance').value = '';
    document.getElementById('account-balance-label').textContent = 'Opening Balance';
    document.getElementById('account-limit').value   = '';
    document.getElementById('credit-limit-field').style.display = 'none';
    state.selectedAccIcon = '🏦';
  }
  document.getElementById('acc-icon-preview').textContent = state.selectedAccIcon;
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
  const type    = document.getElementById('account-type').value;
  const balance = parseFloat(document.getElementById('account-balance').value) || 0;
  const limit   = type === 'Credit Card'
    ? (parseFloat(document.getElementById('account-limit').value) || null)
    : null;
  const icon = state.selectedAccIcon;

  if (state.editingAccountId) {
    await db.accounts.update(state.editingAccountId, { name, type, balance, limit, icon });
    closeOverlay('account-sheet');
    await refreshAccounts();
    showToast('Account updated');
  } else {
    await db.accounts.add({ name, type, balance, limit, icon });
    closeOverlay('account-sheet');
    await refreshAccounts();
    showToast('Account added');
  }
}

async function deleteAccount() {
  if (!state.editingAccountId) return;
  if (!confirm('Delete this account?')) return;
  await db.accounts.delete(state.editingAccountId);
  closeOverlay('account-sheet');
  await refreshAccounts();
  showToast('Account deleted');
}

// ─── Savings Goals (Buckets) ────────────────────────────────────────────────
async function refreshBuckets() {
  const buckets = await db.buckets.orderBy('createdAt').toArray();
  const totalSaved  = buckets.reduce((s, b) => s + (b.savedAmount  || 0), 0);
  const totalTarget = buckets.reduce((s, b) => s + (b.targetAmount || 0), 0);
  const overallPct  = totalTarget > 0 ? Math.min(100, Math.round(totalSaved / totalTarget * 100)) : 0;

  document.getElementById('buckets-summary').innerHTML = `
    <div class="bucket-summary-col">
      <div class="bucket-summary-label">Saved</div>
      <div class="bucket-summary-val" style="color:var(--income)">${state.currency}${fmt(totalSaved)}</div>
    </div>
    <div class="bucket-summary-col">
      <div class="bucket-summary-label">Total Goal</div>
      <div class="bucket-summary-val">${state.currency}${fmt(totalTarget)}</div>
    </div>
    <div class="bucket-summary-col">
      <div class="bucket-summary-label">Progress</div>
      <div class="bucket-summary-val" style="color:var(--income)">${overallPct}%</div>
    </div>`;

  const list = document.getElementById('buckets-list');
  if (buckets.length === 0) {
    list.innerHTML = '<p class="empty-state">No savings goals yet.<br>Tap + New Goal to get started.</p>';
    return;
  }
  list.innerHTML = buckets.map(b => bucketCardHTML(b)).join('');
}

function bucketCardHTML(b) {
  const saved  = b.savedAmount  || 0;
  const target = b.targetAmount || 0;
  const pct    = target > 0 ? Math.min(100, Math.round(saved / target * 100)) : 0;
  const color  = b.color || '#54A0FF';
  const icon   = b.icon  || '🎯';
  const done   = pct >= 100;

  let deadlineHTML = '';
  if (b.deadline) {
    const dl   = new Date(b.deadline + 'T00:00:00');
    const days = Math.ceil((dl - new Date()) / 864e5);
    if (days < 0)      deadlineHTML = `<span class="bucket-deadline" style="color:var(--expense)">Overdue ${Math.abs(days)}d</span>`;
    else if (days === 0) deadlineHTML = `<span class="bucket-deadline" style="color:var(--expense)">Due today!</span>`;
    else               deadlineHTML = `<span class="bucket-deadline">${days}d left · ${dl.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>`;
  }

  return `
    <div class="bucket-card" onclick="openBucketSheet(${b.id})">
      <div class="bucket-card-top">
        <div class="bucket-icon-circle" style="background:${color}22">${icon}</div>
        <div class="bucket-info">
          <div class="bucket-name">${done ? '✅ ' : ''}${b.name}</div>
          <div class="bucket-amounts">${state.currency}${fmt(saved)} of ${state.currency}${fmt(target)}</div>
        </div>
        <div class="bucket-pct" style="color:${done ? 'var(--income)' : color}">${pct}%</div>
      </div>
      <div class="bucket-bar-wrap">
        <div class="bucket-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="bucket-card-footer">
        ${deadlineHTML || '<span></span>'}
        <button class="bucket-add-btn" onclick="event.stopPropagation();openAddFundsSheet(${b.id})">+ Add</button>
      </div>
    </div>`;
}

async function openBucketSheet(id = null) {
  state.editingBucketId = id;
  const isEdit = id !== null;
  document.getElementById('bucket-sheet-title').textContent  = isEdit ? 'Edit Goal' : 'New Goal';
  document.getElementById('save-bucket-btn').textContent     = isEdit ? 'Save Changes' : 'Create Goal';
  document.getElementById('delete-bucket-btn').style.display = isEdit ? 'block' : 'none';

  if (isEdit) {
    const b = await db.buckets.get(id);
    document.getElementById('bucket-name-input').value     = b.name;
    document.getElementById('bucket-target-input').value   = b.targetAmount || '';
    document.getElementById('bucket-saved-input').value    = b.savedAmount  || '';
    document.getElementById('bucket-deadline-input').value = b.deadline     || '';
    state.selectedBucketIcon  = b.icon  || '🎯';
    state.selectedBucketColor = b.color || '#54A0FF';
  } else {
    document.getElementById('bucket-name-input').value     = '';
    document.getElementById('bucket-target-input').value   = '';
    document.getElementById('bucket-saved-input').value    = '';
    document.getElementById('bucket-deadline-input').value = '';
    state.selectedBucketIcon  = '🎯';
    state.selectedBucketColor = '#54A0FF';
  }

  document.getElementById('bucket-icon-preview').textContent = state.selectedBucketIcon;
  document.querySelectorAll('.bucket-icon-opt').forEach(btn =>
    btn.classList.toggle('selected', btn.textContent === state.selectedBucketIcon)
  );
  document.querySelectorAll('.bucket-color-swatch').forEach(sw =>
    sw.classList.toggle('selected', sw.dataset.color === state.selectedBucketColor)
  );
  document.getElementById('add-funds-prefix').textContent = state.currency;

  openOverlay('bucket-sheet');
}

async function saveBucket() {
  const name = document.getElementById('bucket-name-input').value.trim();
  if (!name) { showToast('Enter a goal name'); return; }
  const target   = parseFloat(document.getElementById('bucket-target-input').value)   || 0;
  const saved    = parseFloat(document.getElementById('bucket-saved-input').value)    || 0;
  const deadline = document.getElementById('bucket-deadline-input').value || null;

  const data = {
    name,
    icon:         state.selectedBucketIcon,
    color:        state.selectedBucketColor,
    targetAmount: target,
    savedAmount:  saved,
    deadline,
  };

  if (state.editingBucketId) {
    await db.buckets.update(state.editingBucketId, data);
    showToast('Goal updated');
  } else {
    await db.buckets.add({ ...data, createdAt: Date.now() });
    showToast('Goal created!');
  }
  closeOverlay('bucket-sheet');
  await refreshBuckets();
}

async function deleteBucket() {
  if (!state.editingBucketId) return;
  if (!confirm('Delete this savings goal?')) return;
  await db.buckets.delete(state.editingBucketId);
  closeOverlay('bucket-sheet');
  await refreshBuckets();
  showToast('Goal deleted');
}

async function openAddFundsSheet(bucketId) {
  state.addFundsBucketId = bucketId;
  const b = await db.buckets.get(bucketId);
  document.getElementById('add-funds-title').textContent  = `Add to "${b.name}"`;
  document.getElementById('add-funds-amount').value = '';
  document.getElementById('add-funds-prefix').textContent = state.currency;
  openOverlay('add-funds-sheet');
}

async function saveAddFunds() {
  const amount = parseFloat(document.getElementById('add-funds-amount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
  const b = await db.buckets.get(state.addFundsBucketId);
  if (!b) return;
  const newSaved = (b.savedAmount || 0) + amount;
  await db.buckets.update(state.addFundsBucketId, { savedAmount: newSaved });
  closeOverlay('add-funds-sheet');
  await refreshBuckets();
  const pct = b.targetAmount > 0 ? Math.min(100, Math.round(newSaved / b.targetAmount * 100)) : 0;
  showToast(pct >= 100 ? `🎉 Goal reached!` : `${state.currency}${fmt(amount)} added · ${pct}%`);
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

// ─── Splitwise ───────────────────────────────────────────────────────────────
async function splitwiseFetch(path, options = {}) {
  const [urlRow, keyRow] = await Promise.all([
    db.settings.get('splitwiseProxyUrl'),
    db.settings.get('splitwiseApiKey'),
  ]);
  const proxyUrl = (urlRow?.value || '').trim().replace(/\/$/, '');
  if (!proxyUrl) throw new Error('Proxy URL not configured');
  const apiKey = (keyRow?.value || '').trim();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (apiKey) headers['X-Splitwise-Key'] = apiKey;
  const res = await fetch(proxyUrl + path, { ...options, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function testSplitwiseConnection() {
  const statusEl = document.getElementById('splitwise-test-status');
  statusEl.textContent = 'Testing…';
  statusEl.style.color = 'var(--text-3)';
  try {
    const data = await splitwiseFetch('/get_current_user');
    const user = data.user;
    if (!user?.id) throw new Error('Invalid response');
    await db.settings.put({ key: 'splitwiseUserId', value: user.id });
    statusEl.textContent = `✓ ${user.first_name}`;
    statusEl.style.color = 'var(--income)';
  } catch (err) {
    statusEl.textContent = `✕ ${err.message}`;
    statusEl.style.color = 'var(--expense)';
    console.warn('[Splitwise] connection test failed:', err.message);
  }
}

function swRelativeTime(isoStr) {
  if (!isoStr) return 'never';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function swApplyFriendsData(friends, totalOwed, totalOwe) {
  state.splitwiseFriends   = friends;
  state.splitwiseTotalOwed = totalOwed;
  state.splitwiseTotalOwe  = totalOwe;
  const owedEl = document.getElementById('sw-list-owed');
  const oweEl  = document.getElementById('sw-list-owe');
  const netEl  = document.getElementById('sw-list-net');
  const net = totalOwed - totalOwe;
  if (owedEl) { owedEl.textContent = `${state.currency}${fmt(totalOwed)}`; owedEl.className = `acc-row-bal ${totalOwed > 0 ? 'positive' : 'zero'}`; }
  if (oweEl)  { oweEl.textContent  = `${state.currency}${fmt(totalOwe)}`;  oweEl.className  = `acc-row-bal ${totalOwe > 0 ? 'negative' : 'zero'}`; oweEl.style.minWidth = '110px'; }
  if (netEl)  { netEl.textContent  = `${net >= 0 ? '' : '-'}${state.currency}${fmt(Math.abs(net))}`; }
}

async function refreshSplitwiseBalances(forceRefresh = false) {
  // Show cached values immediately (no spinner, instant UI)
  const cacheRow = await db.settings.get('splitwiseFriendsCache');
  if (cacheRow?.value) {
    try {
      const c = JSON.parse(cacheRow.value);
      swApplyFriendsData(c.friends || [], c.totalOwed || 0, c.totalOwe || 0);
    } catch (_) {}
  }

  // Only hit the network if > 12h old or forced
  const lastFetchRow = await db.settings.get('splitwiseLastFetch');
  const lastFetch = lastFetchRow?.value ? new Date(lastFetchRow.value) : null;
  const stale = !lastFetch || (Date.now() - lastFetch.getTime() > 12 * 3600 * 1000);
  if (!stale && !forceRefresh) return;

  try {
    const data    = await splitwiseFetch('/get_friends');
    const friends = (data.friends || []).filter(f => f.balance?.length > 0);
    let totalOwed = 0, totalOwe = 0;
    const friendsData = [];
    for (const f of friends) {
      const bal    = f.balance.find(b => b.currency_code === 'INR') || f.balance[0];
      const amount = parseFloat(bal?.amount || 0);
      if (amount === 0) continue;
      if (amount > 0) totalOwed += amount;
      else            totalOwe  += Math.abs(amount);
      friendsData.push({ name: `${f.first_name} ${f.last_name || ''}`.trim(), amount });
    }
    const fetchedAt = new Date().toISOString();
    await Promise.all([
      db.settings.put({ key: 'splitwiseFriendsCache', value: JSON.stringify({ friends: friendsData, totalOwed, totalOwe, fetchedAt }) }),
      db.settings.put({ key: 'splitwiseLastFetch', value: fetchedAt }),
    ]);
    swApplyFriendsData(friendsData, totalOwed, totalOwe);
    const syncEl = document.getElementById('sw-detail-sync-time');
    if (syncEl) syncEl.textContent = 'just now';
    renderSplitwiseFriendsDetail();
  } catch (err) {
    console.warn('[Splitwise] balance fetch failed:', err.message);
  }
}

function renderSplitwiseFriendsDetail() {
  const friends = state.splitwiseFriends || [];
  const el = document.getElementById('acc-detail-txns');
  if (!el) return;
  if (friends.length === 0) {
    el.innerHTML = '<p class="empty-state">All settled up! 🎉</p>';
    return;
  }
  const sorted = [...friends].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  el.innerHTML = sorted.map(f => {
    const cls   = f.amount > 0 ? 'positive' : 'negative';
    const label = f.amount > 0 ? 'owes you' : 'you owe';
    const sign  = f.amount > 0 ? '+' : '-';
    return `
      <div class="account-row" style="-webkit-user-select:none;user-select:none">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--text-2);flex-shrink:0;margin-right:12px">
          ${f.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:1px">${label}</div>
        </div>
        <div class="acc-row-bal ${cls}">${sign}${state.currency}${fmt(Math.abs(f.amount))}</div>
      </div>`;
  }).join('');
}

async function syncSplitwiseNow() {
  const syncEl = document.getElementById('sw-detail-sync-time');
  if (syncEl) syncEl.textContent = 'syncing…';
  await refreshSplitwiseBalances(true);
  // update balance card numbers
  const owed = state.splitwiseTotalOwed;
  const owe  = state.splitwiseTotalOwe;
  const net  = owed - owe;
  const owedAmtEl = document.getElementById('sw-card-owed');
  const oweAmtEl  = document.getElementById('sw-card-owe');
  const netAmtEl  = document.getElementById('sw-card-net');
  if (owedAmtEl) owedAmtEl.textContent = `${state.currency}${fmt(owed)}`;
  if (oweAmtEl)  oweAmtEl.textContent  = `${state.currency}${fmt(owe)}`;
  if (netAmtEl)  { netAmtEl.textContent = `${net >= 0 ? '' : '-'}${state.currency}${fmt(Math.abs(net))}`; netAmtEl.className = `acc-detail-amount ${net >= 0 ? 'positive' : 'negative'}`; }
}

async function openSplitwiseDetail() {
  document.getElementById('acc-detail-heading').textContent = '🔄 Splitwise';
  document.getElementById('acc-detail-edit-btn').style.display = 'none';
  document.getElementById('acc-detail-section-label').textContent = 'Friends';
  document.getElementById('acc-detail-footer').style.display = 'block';

  // Load from IDB cache if state is empty
  if (!state.splitwiseFriends) {
    const cacheRow = await db.settings.get('splitwiseFriendsCache');
    if (cacheRow?.value) {
      try {
        const c = JSON.parse(cacheRow.value);
        swApplyFriendsData(c.friends || [], c.totalOwed || 0, c.totalOwe || 0);
      } catch (_) {}
    }
  }

  const owed = state.splitwiseTotalOwed;
  const owe  = state.splitwiseTotalOwe;
  const net  = owed - owe;

  const [lastFetchRow, lastImportRow] = await Promise.all([
    db.settings.get('splitwiseLastFetch'),
    db.settings.get('splitwiseLastImport'),
  ]);
  const syncTime = swRelativeTime(lastFetchRow?.value);

  document.getElementById('acc-detail-info').innerHTML = `
    <div class="acc-detail-balance-card">
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="flex:1;text-align:center;padding:10px 8px;background:rgba(91,184,255,.08);border-radius:10px">
          <div class="acc-detail-type-label">You are owed</div>
          <div id="sw-card-owed" class="acc-detail-amount positive" style="font-size:20px">${state.currency}${fmt(owed)}</div>
        </div>
        <div style="flex:1;text-align:center;padding:10px 8px;background:rgba(255,96,96,.08);border-radius:10px">
          <div class="acc-detail-type-label">You owe</div>
          <div id="sw-card-owe" class="acc-detail-amount negative" style="font-size:20px">${state.currency}${fmt(owe)}</div>
        </div>
      </div>
      <div class="acc-detail-type-label" style="text-align:center">Net balance</div>
      <div id="sw-card-net" class="acc-detail-amount ${net >= 0 ? 'positive' : 'negative'}" style="font-size:24px;text-align:center">${net >= 0 ? '' : '-'}${state.currency}${fmt(Math.abs(net))}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:10px">
        <span style="font-size:11px;color:var(--text-3)">Synced <span id="sw-detail-sync-time">${syncTime}</span></span>
        <button onclick="syncSplitwiseNow()" style="font-size:11px;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer;padding:0 4px">· Sync now</button>
      </div>
    </div>`;

  // Update footer import button label
  const labelEl = document.getElementById('sw-import-btn-label');
  if (labelEl) {
    const lastImport = lastImportRow?.value;
    const today = new Date().toISOString().split('T')[0];
    labelEl.textContent = (lastImport && lastImport < today)
      ? `Import ${lastImport} → Today`
      : 'Import Expenses';
  }

  renderSplitwiseFriendsDetail();

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('account-detail-screen').classList.add('active');

  // Background refresh if stale (> 12h)
  const lastFetch = lastFetchRow?.value ? new Date(lastFetchRow.value) : null;
  if (!lastFetch || Date.now() - lastFetch.getTime() > 12 * 3600 * 1000) {
    refreshSplitwiseBalances(true);
  }
}

async function openSplitwiseImport() {
  const lastImportRow = await db.settings.get('splitwiseLastImport');
  const lastPullChip  = document.getElementById('sw-chip-lastpull');
  if (lastPullChip) {
    lastPullChip.textContent = lastImportRow?.value
      ? `Since last pull (${lastImportRow.value})`
      : 'Since last pull (90 days)';
  }
  document.getElementById('sw-import-status').textContent = '';
  await swSelectChip(lastImportRow?.value ? 'lastpull' : 90);
  openOverlay('sw-import-sheet');
}

function swClearChips() {
  document.querySelectorAll('.sw-range-chip').forEach(c => c.classList.remove('active'));
}

async function swSelectChip(type) {
  swClearChips();
  const today = new Date().toISOString().split('T')[0];
  let from;
  if (type === 'lastpull') {
    const row = await db.settings.get('splitwiseLastImport');
    from = row?.value || new Date(Date.now() - 90 * 864e5).toISOString().split('T')[0];
    document.getElementById('sw-chip-lastpull')?.classList.add('active');
  } else {
    from = new Date(Date.now() - type * 864e5).toISOString().split('T')[0];
    document.querySelector(`.sw-range-chip[onclick="swSelectChip(${type})"]`)?.classList.add('active');
  }
  document.getElementById('sw-import-from').value = from;
  document.getElementById('sw-import-to').value   = today;
}

async function aiMapSplitwiseCategories(uniqueSwCats) {
  const [keyRow, modelRow, enabledRow] = await Promise.all([
    db.settings.get('aiApiKey'),
    db.settings.get('aiModel'),
    db.settings.get('aiEnabled'),
  ]);
  if (!enabledRow?.value || !keyRow?.value) return null;

  const apiKey = keyRow.value.trim();
  const model  = modelRow?.value || 'gemini-2.5-flash';

  const localCats = await db.categories.toArray();
  const localSubs = await db.subcategories.toArray();
  const subsByCatId = {};
  for (const s of localSubs) {
    (subsByCatId[s.categoryId] = subsByCatId[s.categoryId] || []).push(s.name);
  }
  const catList = localCats
    .map(c => `${c.name}: ${(subsByCatId[c.id] || []).join(', ') || '(none)'}`)
    .join('\n');

  const prompt =
    `Map each Splitwise expense category to one of the local budget categories below.\n` +
    `Return ONLY a JSON object — no explanation. Each key is a Splitwise category name,\n` +
    `each value is [localCategory, localSubcategory] (use "" for subcategory if no good match).\n\n` +
    `Splitwise categories: ${JSON.stringify(uniqueSwCats)}\n\n` +
    `Local categories and their subcategories:\n${catList}`;

  try {
    let text;
    if (model.startsWith('gemini')) {
      const res  = await fetch(GEMINI_URL(apiKey, model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0 },
        }),
      });
      const data = await res.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    } else {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model, max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      text = data.content?.find(b => b.type === 'text')?.text || '{}';
    }
    const result = parseAIJson(text);
    return typeof result === 'object' && !Array.isArray(result) ? result : null;
  } catch (err) {
    console.warn('[Splitwise] AI category mapping failed:', err.message);
    return null;
  }
}

// Called from the date-picker sheet; reads dates from DOM inputs
async function fetchSplitwiseExpenses() {
  const from = document.getElementById('sw-import-from').value;
  const to   = document.getElementById('sw-import-to').value;
  const statusEl = document.getElementById('sw-import-status');
  if (!from || !to) { statusEl.textContent = 'Select a date range'; return; }
  statusEl.textContent = 'Fetching expenses…';
  await _doSplitwiseImport(from, to, msg => { statusEl.textContent = msg; }, true);
}


async function _doSplitwiseImport(from, to, onStatus, closeSheet) {
  try {
    const userIdRow = await db.settings.get('splitwiseUserId');
    const userId    = userIdRow?.value;
    if (!userId) { onStatus('Test connection first in Settings → Splitwise'); return; }

    const existingTxns = await db.transactions.where('splitwiseId').above(0).toArray();
    const existingIds  = new Set(existingTxns.map(t => t.splitwiseId));

    const data     = await splitwiseFetch(`/get_expenses?dated_after=${from}T00:00:00Z&dated_before=${to}T23:59:59Z&limit=200`);
    const expenses = data.expenses || [];

    const eligible = [];
    for (const exp of expenses) {
      if (exp.deleted_at) continue;
      if (exp.payment)    continue;
      if (existingIds.has(exp.id)) continue;
      const userEntry = exp.users?.find(u => u.user_id === userId || u.user?.id === userId);
      const owed      = parseFloat(userEntry?.owed_share || 0);
      if (owed <= 0) continue;
      eligible.push({ exp, owed });
    }

    if (eligible.length === 0) {
      onStatus(expenses.length > 0
        ? `${expenses.length} expense(s) found — all already imported.`
        : 'No new expenses found in this period.');
      return;
    }

    const uniqueSwCats = [...new Set(eligible.map(({ exp }) => exp.category?.name).filter(Boolean))];
    onStatus('Mapping categories…');
    const aiMap = await aiMapSplitwiseCategories(uniqueSwCats);

    const txns = eligible.map(({ exp, owed }) => {
      const swCat = exp.category?.name || '';
      const [catName, subName] = aiMap?.[swCat] ?? SW_CATEGORY_MAP[swCat] ?? ['Other', ''];
      return {
        type: 'expense', amount: owed,
        categoryName: catName || 'Other', subcategoryName: subName || '',
        merchant: exp.description || '',
        date: (exp.date || '').split('T')[0] || new Date().toISOString().split('T')[0],
        note: '', splitwiseId: exp.id,
      };
    });

    state.pendingSplitwiseImportTo = to;
    if (closeSheet) closeOverlay('sw-import-sheet');
    state.pendingMultiTxns = txns;
    state.multiTxnTotal    = txns.length;
    renderMultiTxnList();
    openOverlay('multi-txn-sheet');
  } catch (err) {
    onStatus(`Error: ${err.message}`);
  }
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

  const swEnabled = settings.splitwiseEnabled ?? false;
  setToggleVisual('toggle-splitwise', swEnabled);
  document.getElementById('splitwise-api-key').value    = settings.splitwiseApiKey  || '';
  document.getElementById('splitwise-proxy-url').value  = settings.splitwiseProxyUrl || '';
  document.getElementById('splitwise-config').style.display = swEnabled ? 'block' : 'none';
  document.getElementById('splitwise-test-status').textContent = '—';
  document.getElementById('splitwise-test-status').style.color = 'var(--text-3)';
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
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `money-manager-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported');
}

// ═══════════════════════════════════════════════════════════════
// XLSX IMPORT / EXPORT  (no external library — pure browser APIs)
// ═══════════════════════════════════════════════════════════════

// ── CRC-32 table ──
const _CRC32 = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();
function _crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = _CRC32[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ── Binary helpers ──
function _u16(n) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
function _u32(n) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; }
function _cat(...parts) {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let pos = 0; for (const p of parts) { out.set(p, pos); pos += p.length; }
  return out;
}

// ── ZIP writer (STORED = no compression) ──
function _buildZip(files) {
  const enc = new TextEncoder();
  const locals = [], cds = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nb = enc.encode(name);
    const db = typeof content === 'string' ? enc.encode(content) : content;
    const crc = _crc32(db);
    const sz = db.length;
    const lfh = _cat(
      new Uint8Array([0x50,0x4B,0x03,0x04]),
      _u16(20), _u16(0), _u16(0), _u16(0), _u16(0),
      _u32(crc), _u32(sz), _u32(sz),
      _u16(nb.length), _u16(0), nb
    );
    locals.push(_cat(lfh, db));
    cds.push(_cat(
      new Uint8Array([0x50,0x4B,0x01,0x02]),
      _u16(20), _u16(20), _u16(0), _u16(0), _u16(0), _u16(0),
      _u32(crc), _u32(sz), _u32(sz),
      _u16(nb.length), _u16(0), _u16(0),
      _u16(0), _u16(0), _u32(0), _u32(offset), nb
    ));
    offset += lfh.length + sz;
  }
  const cdBuf = _cat(...cds);
  const eocd = _cat(
    new Uint8Array([0x50,0x4B,0x05,0x06]),
    _u16(0), _u16(0),
    _u16(cds.length), _u16(cds.length),
    _u32(cdBuf.length), _u32(offset),
    _u16(0)
  );
  return _cat(...locals, cdBuf, eocd);
}

// ── ZIP reader (handles STORED and DEFLATE, including data-descriptor ZIPs) ──
// Sizes are read from the Central Directory (always correct) rather than the
// local file header (which may be zero when the data-descriptor flag is set).
async function _readZipEntry(buffer, target) {
  const bytes = new Uint8Array(buffer);
  const view  = new DataView(buffer);

  // Locate End of Central Directory record (scan backwards, allow ZIP comment up to 64 KB)
  let eocdOff = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65558); i--) {
    if (view.getUint32(i, true) === 0x06054B50) { eocdOff = i; break; }
  }
  if (eocdOff < 0) return null;

  const cdOff   = view.getUint32(eocdOff + 16, true);
  const cdCount = view.getUint16(eocdOff + 10, true);

  // Walk Central Directory entries to find the target
  let cdPos = cdOff;
  for (let e = 0; e < cdCount; e++) {
    if (view.getUint32(cdPos, true) !== 0x02014B50) break;
    const method   = view.getUint16(cdPos + 10, true);
    const compSz   = view.getUint32(cdPos + 20, true);
    const nameLen  = view.getUint16(cdPos + 28, true);
    const extLen   = view.getUint16(cdPos + 30, true);
    const commLen  = view.getUint16(cdPos + 32, true);
    const localOff = view.getUint32(cdPos + 42, true);
    const name     = new TextDecoder().decode(bytes.subarray(cdPos + 46, cdPos + 46 + nameLen));

    if (name === target) {
      // Read the local file header at localOff to find where the data actually starts
      // (local extra field length can differ from CD extra field length)
      const localNameLen = view.getUint16(localOff + 26, true);
      const localExtLen  = view.getUint16(localOff + 28, true);
      const dataStart    = localOff + 30 + localNameLen + localExtLen;
      const payload      = bytes.subarray(dataStart, dataStart + compSz);

      if (method === 0) return new TextDecoder().decode(payload);
      if (method === 8) {
        const ds = new DecompressionStream('deflate-raw');
        const w = ds.writable.getWriter();
        const r = ds.readable.getReader();
        w.write(payload); w.close();
        const chunks = [];
        for (;;) { const { done, value } = await r.read(); if (done) break; chunks.push(value); }
        const out = new Uint8Array(chunks.reduce((s,c) => s+c.length, 0));
        let p = 0; for (const c of chunks) { out.set(c, p); p += c.length; }
        return new TextDecoder().decode(out);
      }
      return null; // unsupported compression method
    }
    cdPos += 46 + nameLen + extLen + commLen;
  }
  return null;
}

// ── Excel date helpers ──
const _XLSX_EPOCH = Date.UTC(1899, 11, 30); // Dec 30 1899
function _excelToISO(serial) {
  return new Date(_XLSX_EPOCH + Math.floor(+serial) * 86400000).toISOString().split('T')[0];
}
function _isoToExcel(iso) {
  const [y,m,d] = iso.split('-').map(Number);
  return (Date.UTC(y, m-1, d) - _XLSX_EPOCH) / 86400000;
}

// ── XML escape ──
function _xe(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function exportChosen() {
  const fmt = document.querySelector('input[name="export-fmt"]:checked')?.value || 'xlsx';
  if (fmt === 'json') exportData();
  else exportExcel();
}

// ── XLSX export ──
async function exportExcel() {
  const txns     = await db.transactions.toArray();
  if (!txns.length) { showToast('No transactions to export'); return; }
  if (!confirm(`Export ${txns.length} transaction${txns.length>1?'s':''} to Excel?`)) return;
  const accounts = await db.accounts.toArray();
  const accById  = Object.fromEntries(accounts.map(a => [a.id, a.name]));

  // shared strings table
  const strs = []; const strIdx = {};
  const ss = s => { const k = String(s ?? ''); if (k in strIdx) return strIdx[k]; strIdx[k] = strs.length; strs.push(k); return strs.length-1; };

  const COLS = 'ABCDEFGHIJKLMN';
  const HDRS = ['Period','Accounts','Category','Subcategory','Note','INR','Income/Expense','Description','Amount','Currency','Accounts','Merchant','Tag','Splitwise ID'];
  HDRS.forEach(ss);

  // row format: array of {t:'s'|'n', v, s?:styleIdx}
  const headerRow = HDRS.map(h => ({ t:'s', v:ss(h) }));
  const dataRows  = txns.map(txn => {
    const acc   = accById[txn.accountId] || '';
    const type  = txn.type === 'income' ? 'Income' : txn.type === 'transfer' ? 'Transfer-Out' : 'Exp.';
    const note  = txn.note || '';
    const merch = txn.merchant || '';
    return [
      { t:'n', v:_isoToExcel(txn.date || new Date().toISOString().split('T')[0]), s:1 },
      { t:'s', v:ss(acc) },
      { t:'s', v:ss(txn.categoryName || '') },
      { t:'s', v:ss(txn.subcategoryName || '') },
      { t:'s', v:ss(merch || note) },
      { t:'n', v:txn.amount },
      { t:'s', v:ss(type) },
      { t:'s', v:ss(note) },
      { t:'n', v:txn.amount },
      { t:'s', v:ss('INR') },
      { t:'s', v:ss(acc) },
      { t:'s', v:ss(merch) },
      { t:'s', v:ss(txn.tag || '') },
      txn.splitwiseId ? { t:'n', v:txn.splitwiseId } : { t:'s', v:ss('') },
    ];
  });

  // Build sheet XML
  const allRows = [headerRow, ...dataRows];
  let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`;
  allRows.forEach((row, ri) => {
    sheetXml += `<row r="${ri+1}">`;
    row.forEach((cell, ci) => {
      const ref = COLS[ci] + (ri+1);
      if (cell.t === 's') {
        sheetXml += `<c r="${ref}" t="s"><v>${cell.v}</v></c>`;
      } else {
        sheetXml += `<c r="${ref}"${cell.s ? ` s="${cell.s}"` : ''}><v>${cell.v}</v></c>`;
      }
    });
    sheetXml += `</row>`;
  });
  sheetXml += `</sheetData></worksheet>`;

  const ssXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strs.length}" uniqueCount="${strs.length}">${strs.map(s=>`<si><t>${_xe(s)}</t></si>`).join('')}</sst>`;

  const zip = _buildZip({
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Transactions" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/worksheets/sheet1.xml': sheetXml,
    'xl/sharedStrings.xml': ssXml,
    'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/></numFmts><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`,
  });

  const blob = new Blob([zip], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `money-manager-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Excel exported');
}

// ── XLSX import ──
async function importExcel(file) {
  try {
    showToast('Reading file…');
    const buffer = await file.arrayBuffer();

    const ssXml    = await _readZipEntry(buffer, 'xl/sharedStrings.xml');
    const sheetXml = await _readZipEntry(buffer, 'xl/worksheets/sheet1.xml');
    if (!sheetXml) { showToast('Cannot read sheet'); return; }

    // Parse shared strings
    const ssDoc  = new DOMParser().parseFromString(ssXml || '<sst/>', 'text/xml');
    const strings = [...ssDoc.querySelectorAll('si')].map(si => {
      // concatenate all <t> inside this <si> (handles rich text)
      return [...si.querySelectorAll('t')].map(t => t.textContent).join('');
    });

    // Parse sheet
    const shDoc = new DOMParser().parseFromString(sheetXml, 'text/xml');
    const getVal = c => {
      const t = c.getAttribute('t');
      const v = c.querySelector('v')?.textContent ?? '';
      return t === 's' ? (strings[+v] ?? '') : v;
    };
    const col = ref => ref.replace(/[0-9]/g, '');

    const rows = [...shDoc.querySelectorAll('row')];
    if (rows.length <= 1) { showToast('No data found'); return; }

    // Lookup maps for matching accounts / categories
    const accs    = await db.accounts.toArray();
    const cats    = await db.categories.toArray();
    const subcats = await db.subcategories.toArray();
    const accByName = Object.fromEntries(accs.map(a => [a.name.toLowerCase(), a.id]));
    const catByName = Object.fromEntries(cats.map(c => [c.name.toLowerCase(), c.id]));
    const subByName = Object.fromEntries(subcats.map(s => [s.name.toLowerCase(), s.id]));

    const txns = []; let skipped = 0; const now = Date.now();

    for (let ri = 1; ri < rows.length; ri++) {
      const cells = {};
      for (const c of rows[ri].querySelectorAll('c')) cells[col(c.getAttribute('r'))] = getVal(c);

      // Map type
      const rawType = cells['G'] || '';
      let type;
      if (rawType === 'Exp.' || rawType === 'Expense')           type = 'expense';
      else if (rawType === 'Income')                             type = 'income';
      else if (rawType === 'Transfer-Out' || rawType === 'Transfer-In') type = 'transfer';
      else { skipped++; continue; }

      const amount = parseFloat(cells['F'] || cells['I'] || '0');
      if (!amount || amount <= 0) { skipped++; continue; }

      const dateSerial = parseFloat(cells['A'] || '0');
      const date = dateSerial > 0 ? _excelToISO(dateSerial) : new Date().toISOString().split('T')[0];

      // Account
      const accName  = cells['B'] || '';
      const accountId = accByName[accName.toLowerCase()] ?? null;

      // Category — strip leading emoji if present (e.g. "🚖 Transport" → "Transport")
      const rawCat = cells['C'] || '';
      const categoryName = /^[^\x00-\x7F]/.test(rawCat) ? rawCat.replace(/^\S+\s*/, '') : rawCat;
      const categoryId   = catByName[categoryName.toLowerCase()] ?? null;

      const subcategoryName = cells['D'] || '';
      const subcategoryId   = subByName[subcategoryName.toLowerCase()] ?? null;

      // Col L (Merchant) takes precedence over col E when present
      const merchant = cells['L'] || cells['E'] || '';
      const note     = cells['H'] || '';
      const tag      = cells['M'] || null;

      txns.push({ type, amount, categoryId, subcategoryId, categoryName, subcategoryName,
        accountId, date, note, merchant, receiptImage:null, tag, createdAt: now + ri });
    }

    if (!txns.length) { showToast(`No valid rows (${skipped} skipped)`); return; }

    const ok = confirm(`Import ${txns.length} transaction${txns.length>1?'s':''}${skipped ? ` (${skipped} rows skipped)` : ''}?`);
    if (!ok) return;

    await db.transactions.bulkAdd(txns);
    await refreshTxnList();
    showToast(`${txns.length} transactions imported`);
  } catch (err) {
    console.error('importExcel', err);
    showToast('Import failed: ' + err.message);
  }
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
        if (aiResult.confirmText) speakConfirmation(aiResult.confirmText);
        openMultiTxnConfirmSheet(aiResult.transactions);
        return;
      }
      state.voiceParsed = aiResult;
      speakConfirmation(buildConfirmText(aiResult));
      closeOverlay('voice-sheet');
      await openAddSheetFromParsed(aiResult);
      return;
    }
  }

  // Fallback: local NLP (no key set, or AI call failed)
  const parsed  = parseVoiceInput(text);
  const catInfo = await matchCategory(parsed.merchant || text);
  parsed.categoryName    = catInfo?.[0] || null;
  parsed.subcategoryName = catInfo?.[1] || null;
  state.voiceParsed = parsed;
  speakConfirmation(buildConfirmText(parsed));
  closeOverlay('voice-sheet');
  await openAddSheetFromParsed(parsed);
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

async function openAddSheetFromParsed(parsed) {
  if (!parsed.categoryName) {
    state.voiceParsed = parsed;
    openAutoCatSheet(parsed.merchant || parsed.raw || '');
    return;
  }
  if (parsed.merchant) {
    const existing = await db.merchantMap.where('merchant').equals(parsed.merchant.toLowerCase()).first();
    if (!existing) await db.merchantMap.add({
      merchant: parsed.merchant.toLowerCase(),
      categoryId: null, subcategoryId: null,
      categoryName: parsed.categoryName,
      subcategoryName: parsed.subcategoryName || '',
    });
  }
  await openAddSheet(parsed.type || 'expense', {
    amount: parsed.amount, merchant: parsed.merchant || '',
    date: parsed.date, note: parsed.note,
    categoryName: parsed.categoryName, subcategoryName: parsed.subcategoryName || '',
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
  state.pendingMultiTxns = [...txns];
  state.multiTxnTotal    = txns.length;
  state.multiTxnIdx      = 0;
  renderMultiTxnList();
  closeOverlay('voice-sheet');
  openOverlay('multi-txn-sheet');
}

function renderMultiTxnList() {
  state.multiTxnIdx = 0;
  _renderMultiTxnCard();
  _setupMultiTxnSwipe();
}

function _renderMultiTxnCard() {
  const txns    = state.pendingMultiTxns;
  const idx     = state.multiTxnIdx;
  const card    = document.getElementById('multi-txn-card');
  const counter = document.getElementById('multi-txn-counter');
  if (!card) return;
  if (txns.length === 0) { closeOverlay('multi-txn-sheet'); return; }
  if (counter) counter.textContent = `${idx + 1} / ${txns.length}`;
  const t     = txns[idx];
  const sign  = t.type === 'income' ? '+' : '-';
  const color = t.type === 'income' ? 'var(--income)' : 'var(--expense)';
  card.innerHTML = `
    <div class="multi-txn-card-inner">
      <div class="multi-txn-card-amount" style="color:${color}">${sign}${state.currency}${fmt(t.amount)}</div>
      <div class="multi-txn-card-merchant">${t.merchant || t.note || '—'}</div>
      <div class="multi-txn-card-cat">${t.categoryName || 'Uncategorised'}${t.subcategoryName ? ' · ' + t.subcategoryName : ''}</div>
      <div class="multi-txn-card-date">${t.date || ''}</div>
    </div>`;
  card.style.transform = '';
  card.style.opacity   = '1';
}

function _setupMultiTxnSwipe() {
  const wrap = document.getElementById('multi-txn-card-wrap');
  if (!wrap || wrap.dataset.swipeSetup) return;
  wrap.dataset.swipeSetup = '1';
  let startX = 0, startY = 0, dragging = false;
  wrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragging = true;
    const card = document.getElementById('multi-txn-card');
    if (card) card.style.transition = 'none';
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dy) > Math.abs(dx) + 5) { dragging = false; return; }
    const card = document.getElementById('multi-txn-card');
    if (card) card.style.transform = `translateX(${dx}px)`;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    const card = document.getElementById('multi-txn-card');
    if (card) card.style.transition = 'transform .22s ease, opacity .22s ease';
    if (Math.abs(dx) > 60) {
      _multiTxnSlide(dx < 0 ? 1 : -1);
    } else {
      if (card) card.style.transform = '';
    }
  }, { passive: true });
}

function _multiTxnSlide(dir) {
  const txns   = state.pendingMultiTxns;
  const newIdx = state.multiTxnIdx + dir;
  const card   = document.getElementById('multi-txn-card');
  if (newIdx < 0 || newIdx >= txns.length) {
    if (card) card.style.transform = '';
    return;
  }
  const wrapW = document.getElementById('multi-txn-card-wrap')?.offsetWidth || 320;
  if (card) {
    card.style.transition = 'transform .18s ease, opacity .18s ease';
    card.style.transform  = `translateX(${dir > 0 ? -wrapW : wrapW}px)`;
    card.style.opacity    = '0';
  }
  setTimeout(() => {
    state.multiTxnIdx = newIdx;
    _renderMultiTxnCard();
    if (card) {
      card.style.transition = 'none';
      card.style.transform  = `translateX(${dir > 0 ? wrapW : -wrapW}px)`;
      card.style.opacity    = '0';
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (card) {
        card.style.transition = 'transform .22s ease, opacity .22s ease';
        card.style.transform  = '';
        card.style.opacity    = '1';
      }
    }));
  }, 190);
}

async function saveMultiTxnCurrent() {
  const t = state.pendingMultiTxns[state.multiTxnIdx];
  if (!t) return;
  await db.transactions.add({
    type: t.type || 'expense', amount: t.amount,
    categoryId: null, subcategoryId: null,
    categoryName: t.categoryName || '', subcategoryName: t.subcategoryName || '',
    accountId: null, date: t.date || new Date().toISOString().split('T')[0],
    note: t.note || '', merchant: t.merchant || '',
    receiptImage: null, createdAt: Date.now(),
    splitwiseId: t.splitwiseId || null,
  });
  const label = t.merchant || t.categoryName || 'transaction';
  state.pendingMultiTxns.splice(state.multiTxnIdx, 1);
  await refreshTxnList();
  if (state.pendingMultiTxns.length === 0) {
    await _multiTxnFinalize('All transactions saved');
    return;
  }
  if (state.multiTxnIdx >= state.pendingMultiTxns.length) state.multiTxnIdx = state.pendingMultiTxns.length - 1;
  _renderMultiTxnCard();
  showToast(`Saved: ${label}`);
}

function discardMultiTxnCurrent() {
  const t = state.pendingMultiTxns[state.multiTxnIdx];
  if (!t) return;
  const label = t.merchant || t.categoryName || 'transaction';
  state.pendingMultiTxns.splice(state.multiTxnIdx, 1);
  if (state.pendingMultiTxns.length === 0) {
    closeOverlay('multi-txn-sheet');
    showToast('Transaction discarded');
    return;
  }
  if (state.multiTxnIdx >= state.pendingMultiTxns.length) state.multiTxnIdx = state.pendingMultiTxns.length - 1;
  _renderMultiTxnCard();
  showToast(`Discarded: ${label}`);
}

function editMultiTxnCurrent() {
  const idx = state.multiTxnIdx;
  const t   = state.pendingMultiTxns[idx];
  if (!t) return;
  state.editingMultiIdx = idx;
  closeOverlay('multi-txn-sheet');
  openAddSheet(t.type || 'expense', { amount: t.amount, merchant: t.merchant, date: t.date, note: t.note, categoryName: t.categoryName, subcategoryName: t.subcategoryName });
}

async function _multiTxnFinalize(msg) {
  if (state.pendingSplitwiseImportTo) {
    await db.settings.put({ key: 'splitwiseLastImport', value: state.pendingSplitwiseImportTo });
    state.pendingSplitwiseImportTo = null;
  }
  closeOverlay('multi-txn-sheet');
  await refreshTxnList();
  showToast(msg);
}

async function bulkSaveTxns(txns) {
  const count = txns.length;
  for (const t of txns) {
    await db.transactions.add({ type:t.type||'expense', amount:t.amount, categoryId:null, subcategoryId:null, categoryName:t.categoryName||'', subcategoryName:t.subcategoryName||'', accountId:null, date:t.date||new Date().toISOString().split('T')[0], note:t.note||'', merchant:t.merchant||'', receiptImage:null, createdAt:Date.now(), splitwiseId:t.splitwiseId||null });
  }
  state.pendingMultiTxns = [];
  await _multiTxnFinalize(`${count} transaction${count !== 1 ? 's' : ''} saved`);
}

// ─── Category Management ─────────────────────────────────────────────────────
function openCatMgmt() {
  state.catMgmtExpanded = new Set();
  hideAddCatForm();
  openOverlay('cat-mgmt-sheet');
  renderCatMgmt();
}

function setCatMgmtTab(type) {
  state.catMgmtTab = type;
  document.getElementById('catmgmt-tab-expense').classList.toggle('active', type === 'expense');
  document.getElementById('catmgmt-tab-income').classList.toggle('active', type === 'income');
  hideAddCatForm();
  renderCatMgmt();
}

async function renderCatMgmt() {
  const type    = state.catMgmtTab;
  const cats    = await db.categories.where('type').equals(type).toArray();
  const subcats = await db.subcategories.toArray();
  const subsByCat = {};
  for (const s of subcats) {
    if (!subsByCat[s.categoryId]) subsByCat[s.categoryId] = [];
    subsByCat[s.categoryId].push(s);
  }

  const el = document.getElementById('cat-mgmt-list');
  if (!el) return;

  el.innerHTML = cats.map(cat => {
    const subs    = subsByCat[cat.id] || [];
    const isOpen  = state.catMgmtExpanded.has(cat.id);
    const chevron = isOpen ? '▾' : '›';

    const subRows = subs.map(s => `
      <div class="catmgmt-sub-row">
        <span style="font-size:16px;width:24px;text-align:center">${s.icon || '•'}</span>
        <span class="catmgmt-sub-name">${s.name}</span>
        <button class="catmgmt-del" onclick="deleteSubcat(${s.id})" title="Delete subcategory">✕</button>
      </div>`).join('');

    const addSubForm = `
      <div id="add-sub-form-${cat.id}" style="display:none;padding:8px var(--px) 8px calc(var(--px) + 18px);gap:6px;flex-direction:column">
        <div style="display:flex;gap:6px">
          <input id="new-sub-icon-${cat.id}" type="text" maxlength="4" placeholder="🔹" class="catmgmt-icon-input" style="width:40px;font-size:16px">
          <input id="new-sub-name-${cat.id}" type="text" placeholder="Subcategory name" class="catmgmt-input">
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="hideAddSubcatForm(${cat.id})" class="btn btn-outline" style="flex:1;padding:6px">Cancel</button>
          <button onclick="addSubcategory(${cat.id})" class="catmgmt-save-btn" style="flex:1">Save</button>
        </div>
      </div>`;

    const addSubBtn = `
      <div class="catmgmt-add-sub">
        <button onclick="showAddSubcatForm(${cat.id})" id="add-sub-btn-${cat.id}" style="background:none;border:1px dashed var(--border);border-radius:8px;color:var(--text-3);font-size:12px;padding:5px 12px;cursor:pointer;width:100%">+ Add subcategory</button>
      </div>`;

    const subsSection = isOpen ? `<div class="catmgmt-subs">${subRows}${addSubBtn}${addSubForm}</div>` : '';

    return `
      <div class="catmgmt-row" onclick="toggleCatExpand(${cat.id})">
        <span class="catmgmt-icon">${cat.icon || '📦'}</span>
        <span class="catmgmt-name">${cat.name}</span>
        <span class="catmgmt-chevron${isOpen ? ' open' : ''}">${chevron}</span>
        <button class="catmgmt-del" onclick="event.stopPropagation();deleteCat(${cat.id})" title="Delete category">✕</button>
      </div>
      ${subsSection}`;
  }).join('');
}

function toggleCatExpand(catId) {
  if (state.catMgmtExpanded.has(catId)) state.catMgmtExpanded.delete(catId);
  else state.catMgmtExpanded.add(catId);
  renderCatMgmt();
}

async function deleteCat(catId) {
  if (!confirm('Delete this category and all its subcategories?')) return;
  await db.subcategories.where('categoryId').equals(catId).delete();
  await db.categories.delete(catId);
  state.catMgmtExpanded.delete(catId);
  renderCatMgmt();
  showToast('Category deleted');
}

async function deleteSubcat(subId) {
  await db.subcategories.delete(subId);
  renderCatMgmt();
  showToast('Subcategory deleted');
}

function showAddCatForm() {
  document.getElementById('add-cat-btn').style.display  = 'none';
  const form = document.getElementById('add-cat-form');
  form.style.display = 'flex';
  document.getElementById('new-cat-name').focus();
}

function hideAddCatForm() {
  const btn  = document.getElementById('add-cat-btn');
  const form = document.getElementById('add-cat-form');
  if (btn)  btn.style.display  = '';
  if (form) { form.style.display = 'none'; form.querySelector('input[type=text]') && (document.getElementById('new-cat-icon').value = ''); document.getElementById('new-cat-name') && (document.getElementById('new-cat-name').value = ''); }
}

async function addCategory() {
  const icon = document.getElementById('new-cat-icon').value.trim() || '📦';
  const name = document.getElementById('new-cat-name').value.trim();
  if (!name) { showToast('Enter a category name'); return; }
  await db.categories.add({ name, type: state.catMgmtTab, icon });
  hideAddCatForm();
  renderCatMgmt();
  showToast(`"${name}" added`);
}

function showAddSubcatForm(catId) {
  document.getElementById(`add-sub-btn-${catId}`).style.display = 'none';
  const form = document.getElementById(`add-sub-form-${catId}`);
  form.style.display = 'flex';
  document.getElementById(`new-sub-name-${catId}`).focus();
}

function hideAddSubcatForm(catId) {
  const btn  = document.getElementById(`add-sub-btn-${catId}`);
  const form = document.getElementById(`add-sub-form-${catId}`);
  if (btn)  btn.style.display  = '';
  if (form) form.style.display = 'none';
}

async function addSubcategory(catId) {
  const icon = document.getElementById(`new-sub-icon-${catId}`).value.trim() || '🔹';
  const name = document.getElementById(`new-sub-name-${catId}`).value.trim();
  if (!name) { showToast('Enter a subcategory name'); return; }
  await db.subcategories.add({ name, categoryId: catId, icon });
  renderCatMgmt();
  showToast(`"${name}" added`);
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

function fmtDec(n) {
  if (typeof n !== 'number' || isNaN(n)) return '0.00';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
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

// ── PWA Install ──
let _installPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  document.getElementById('install-app-row')?.style.setProperty('display', 'flex');
});

window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  document.getElementById('install-app-row')?.style.setProperty('display', 'none');
});

async function installPWA() {
  if (!_installPrompt) return;
  _installPrompt.prompt();
  const { outcome } = await _installPrompt.userChoice;
  if (outcome === 'accepted') _installPrompt = null;
}

async function checkForUpdates() {
  const statusEl = document.getElementById('update-check-status');
  if (!('serviceWorker' in navigator)) { showToast('Service Worker not supported'); return; }
  const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
  if (!reg) { showToast('App not installed as PWA'); return; }
  if (statusEl) statusEl.textContent = 'Checking…';
  try {
    await reg.update();
    if (reg.installing || reg.waiting) {
      if (statusEl) statusEl.textContent = 'Updating…';
      // SW activate event will force-reload the page automatically
    } else {
      if (statusEl) statusEl.textContent = 'Up to date';
      showToast('Already up to date');
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
    }
  } catch (e) {
    if (statusEl) statusEl.textContent = 'Failed';
    showToast('Update check failed — are you online?');
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', init);

// ─── Gestures ────────────────────────────────────────────────────────────────

// Back button — closes top-most active overlay; "press again to exit" toast
let _backPressTime = 0;
history.pushState({ mm: true }, '');
window.addEventListener('popstate', () => {
  const overlays = [...document.querySelectorAll('.overlay-bg.active')];
  if (overlays.length > 0) {
    closeOverlay(overlays[overlays.length - 1].id);
    history.pushState({ mm: true }, '');
    return;
  }
  if (document.getElementById('account-detail-screen')?.classList.contains('active')) {
    closeAccountDetail();
    history.pushState({ mm: true }, '');
    return;
  }
  const now = Date.now();
  if (now - _backPressTime < 2000) { _backPressTime = 0; return; }
  _backPressTime = now;
  showToast('Press back again to exit');
  history.pushState({ mm: true }, '');
});

// Swipe-down to dismiss sheets ───────────────────────────────────────────────

// Walk up from el to sheet (inclusive) and return the first scrollable ancestor.
function _findScrollable(el, sheet) {
  let node = el;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) return node;
    if (node === sheet) break;
    node = node.parentElement;
  }
  return null;
}

function setupSheetDismiss() {
  document.querySelectorAll('.overlay-bg .sheet').forEach(sheet => {
    let startY = 0, curY = 0, dragging = false, scrollEl = null;
    const bg = sheet.closest('.overlay-bg');

    sheet.addEventListener('touchstart', e => {
      startY = curY = e.touches[0].clientY;
      scrollEl = _findScrollable(e.target, sheet);
      // Don't start dismiss if the scrollable area is already scrolled down
      dragging = !(scrollEl && scrollEl.scrollTop > 0);
      if (dragging) sheet.style.transition = 'none';
    }, { passive: true });

    sheet.addEventListener('touchmove', e => {
      if (!dragging) return;
      curY = e.touches[0].clientY;
      const dy = curY - startY;
      // If user drags up, or the scroll container has drifted away from top, abort dismiss
      if (dy <= 0 || (scrollEl && scrollEl.scrollTop > 0)) {
        dragging = false;
        sheet.style.transform = '';
        return;
      }
      sheet.style.transform = `translateY(${dy}px)`;
    }, { passive: true });

    sheet.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      const dy = Math.max(0, curY - startY);
      sheet.style.transition = 'transform .28s cubic-bezier(.32,0,.67,0)';
      if (dy > 120) {
        sheet.style.transform = `translateY(100%)`;
        setTimeout(() => {
          sheet.style.transform = '';
          sheet.style.transition = '';
          if (bg) closeOverlay(bg.id);
        }, 280);
      } else {
        sheet.style.transform = '';
      }
    });
  });
}

// Pull-to-refresh ─────────────────────────────────────────────────────────────
function setupPTR(screenId, onRefresh) {
  const el = document.getElementById(screenId);
  if (!el) return;

  const bar = document.createElement('div');
  bar.className = 'ptr-bar';
  bar.innerHTML = `<svg class="ptr-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg><span class="ptr-label">Pull to refresh</span>`;
  el.insertBefore(bar, el.firstChild);

  let startY = 0, pulling = false;
  const THRESHOLD = 72;

  el.addEventListener('touchstart', e => {
    if (el.scrollTop !== 0) return;
    startY  = e.touches[0].clientY;
    pulling = true;
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) return;
    bar.classList.add('ptr-visible');
    bar.classList.toggle('ptr-ready', dy >= THRESHOLD);
    bar.querySelector('.ptr-label').textContent = dy >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
  }, { passive: true });

  el.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    if (!bar.classList.contains('ptr-ready')) {
      bar.classList.remove('ptr-visible', 'ptr-ready');
      return;
    }
    bar.classList.remove('ptr-ready');
    bar.classList.add('ptr-loading');
    bar.querySelector('.ptr-label').textContent = 'Refreshing…';
    await onRefresh();
    bar.classList.remove('ptr-loading', 'ptr-visible');
    bar.querySelector('.ptr-label').textContent = 'Pull to refresh';
  });
}

// Transaction swipe-to-delete ─────────────────────────────────────────────────
let _swipeWrap = null;   // currently-open swipe wrapper

function _closeActiveSwipe(skipAnim) {
  if (!_swipeWrap) return;
  const row = _swipeWrap.querySelector('.txn-row');
  if (row) {
    row.style.transition = skipAnim ? 'none' : 'transform .22s ease';
    row.style.transform  = 'translateX(0)';
  }
  _swipeWrap = null;
}

function _txnTap(e, id) {
  if (_swipeWrap) {
    _closeActiveSwipe();
    return;
  }
  openEditSheet(id);
}

async function _swipeDelete(id) {
  _closeActiveSwipe(true);
  await deleteTxnPrompt(id);
}

function setupTxnSwipe() {
  const list = document.getElementById('all-txn-list');
  if (!list) return;

  const DEL_WIDTH = 76;
  let startX = 0, startY = 0, wrap = null, row = null, swiping = false, axis = null;

  list.addEventListener('touchstart', e => {
    const w = e.target.closest('.txn-swipe-wrap');
    if (!w) return;
    startX  = e.touches[0].clientX;
    startY  = e.touches[0].clientY;
    wrap    = w;
    row     = w.querySelector('.txn-row');
    axis    = null;
    swiping = true;
  }, { passive: true });

  list.addEventListener('touchmove', e => {
    if (!swiping || !row) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    if (!axis) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis !== 'x') return;

    // Close any other open swipe
    if (_swipeWrap && _swipeWrap !== wrap) _closeActiveSwipe();

    const clamped = Math.min(0, Math.max(-DEL_WIDTH, dx));
    row.style.transition = 'none';
    row.style.transform  = `translateX(${clamped}px)`;
  }, { passive: true });

  list.addEventListener('touchend', () => {
    if (!swiping || !row || axis !== 'x') { swiping = false; return; }
    swiping = false;
    const cur = new DOMMatrix(getComputedStyle(row).transform).m41;
    row.style.transition = 'transform .22s ease';
    if (cur < -DEL_WIDTH / 2) {
      row.style.transform = `translateX(-${DEL_WIDTH}px)`;
      _swipeWrap = wrap;
    } else {
      row.style.transform = 'translateX(0)';
      _swipeWrap = null;
    }
    row = null; wrap = null; axis = null;
  });

  // Close on tap outside
  document.addEventListener('touchstart', e => {
    if (_swipeWrap && !_swipeWrap.contains(e.target)) _closeActiveSwipe();
  }, { passive: true });
}
