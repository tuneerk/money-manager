'use strict';

// ─── Keyword Map (Layer 2 category matching) ───────────────────────────────
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

// ─── App State ─────────────────────────────────────────────────────────────
const state = {
  currentType:      'expense',
  fabOpen:          false,
  lastTxnId:        null,
  lastTxnAmount:    0,
  lastTxnAccountId: null,
  lastTxnType:      'expense',

  reportPeriod:   'month',
  expandAllCats:  false,

  voiceParsed:    null,
  recognition:    null,
  listening:      false,
  voiceConfidence:   1.0,
  voiceAlternates:   [],
  voiceMode:         'idle',
  pendingMultiTxns:  [],
  claudeEnabled:     false,
  readbackEnabled:   true,

  scanData:       null,
  scanImageB64:   null,

  autocatData:    null,
  selectedAccIcon:'🏦',
  currency:       '₹',
};

// ─── Init ──────────────────────────────────────────────────────────────────
async function init() {
  await seedDefaults();

  const cur = await db.settings.get('currency');
  if (cur) state.currency = cur.value;

  const claudeOn = await db.settings.get('claudeEnabled');
  state.claudeEnabled = claudeOn?.value || false;

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
  document.getElementById('fab-scan').addEventListener('click', () => { closeFab(); openScanSheet(); });
  document.getElementById('fab-add').addEventListener('click', () => { closeFab(); openAddSheet(state.currentType); });

  document.querySelectorAll('.overlay-bg').forEach(bg =>
    bg.addEventListener('click', e => {
      if (e.target === bg) closeOverlay(bg.id);
    })
  );

  document.getElementById('toast-undo').addEventListener('click', undoLastTxn);

  document.getElementById('txn-type-expense').addEventListener('click', () => setTxnType('expense'));
  document.getElementById('txn-type-income').addEventListener('click', () => setTxnType('income'));

  document.getElementById('txn-category').addEventListener('change', () => loadSubcats());

  document.getElementById('save-txn-btn').addEventListener('click', saveTransaction);

  document.getElementById('voice-mic-btn').addEventListener('click', toggleListening);
  document.getElementById('voice-confirm-btn').addEventListener('click', confirmVoice);

  document.getElementById('scan-camera-btn').addEventListener('click', triggerCamera);
  document.getElementById('scan-file-btn').addEventListener('click', () =>
    document.getElementById('scan-file-input').click()
  );
  document.getElementById('scan-file-input').addEventListener('change', e => handleScanFile(e.target));
  document.getElementById('scan-camera-input').addEventListener('change', e => handleScanFile(e.target));
  document.getElementById('scan-use-btn').addEventListener('click', useScanData);

  document.getElementById('autocat-confirm-btn').addEventListener('click', confirmAutocat);

  document.getElementById('save-account-btn').addEventListener('click', saveAccount);
  document.getElementById('save-transfer-btn').addEventListener('click', saveTransfer);

  document.getElementById('report-period').addEventListener('change', e => {
    state.reportPeriod = e.target.value;
    refreshReports();
  });
  document.getElementById('expand-all-btn').addEventListener('click', toggleExpandAll);

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

  document.getElementById('toggle-claude').addEventListener('click', () => toggleSetting('claudeEnabled', 'toggle-claude'));
  document.getElementById('toggle-readback').addEventListener('click', () => toggleSetting('readbackEnabled', 'toggle-readback'));

  document.getElementById('claude-api-key').addEventListener('change', async e => {
    await db.settings.put({ key: 'claudeApiKey', value: e.target.value.trim() });
  });

  document.getElementById('voice-lang').addEventListener('change', async e => {
    await db.settings.put({ key: 'voiceLang', value: e.target.value });
  });

  document.getElementById('multi-save-all-btn').addEventListener('click', () => bulkSaveTxns(state.pendingMultiTxns));
  document.getElementById('multi-review-btn').addEventListener('click', reviewMultiTxnsOne);
}

// ─── Navigation ────────────────────────────────────────────────────────────
function switchTab(btn) {
  const target = btn.dataset.tab;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  btn.classList.add('active');

  if (target === 'home')          refreshHome();
  if (target === 'transactions')  refreshTxnList();
  if (target === 'reports')       refreshReports();
  if (target === 'accounts-screen') refreshAccounts();
  if (target === 'settings')      refreshSettings();
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

// ─── Home / Dashboard ──────────────────────────────────────────────────────
async function refreshHome() {
  const { start, end } = await getPeriodRange('month');
  const all = await db.transactions.where('date').between(start, end, true, true).toArray();

  const income  = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  document.getElementById('home-income').textContent  = state.currency + fmt(income);
  document.getElementById('home-expense').textContent = state.currency + fmt(expense);
  document.getElementById('home-balance').textContent = state.currency + fmt(Math.abs(balance));
  document.getElementById('home-balance').className =
    'balance-amount ' + (balance >= 0 ? 'positive' : 'negative');

  const recent = all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
  const list = document.getElementById('home-txn-list');
  if (recent.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions this month.<br>Tap + to add one.</p>';
    return;
  }
  list.innerHTML = renderTxnGroups(recent);
}

function renderTxnGroups(txns) {
  const groups = {};
  for (const t of txns) {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => `
      <div class="txn-date-group">
        <div class="txn-date-label">${formatDate(date)}</div>
        ${items.map(txnHTML).join('')}
      </div>`).join('');
}

function txnHTML(t) {
  const meta = getCatMeta(t.categoryName);
  const sign = t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '-';
  const cls  = t.type === 'income' ? 'income' : t.type === 'transfer' ? 'transfer' : 'expense';
  return `
    <div class="txn-card" onclick="deleteTxnPrompt(${t.id})">
      <div class="txn-icon" style="background:${meta.color}">${meta.icon}</div>
      <div class="txn-info">
        <div class="txn-cat">${t.categoryName || 'Uncategorised'}</div>
        <div class="txn-sub">${t.note || t.merchant || t.subcategoryName || ''}</div>
      </div>
      <div class="txn-amount ${cls}">${sign}${state.currency}${fmt(t.amount)}</div>
    </div>`;
}

// ─── Transaction Module ─────────────────────────────────────────────────────
async function openAddSheet(type = 'expense', prefill = {}) {
  state.currentType = type;
  const form = document.getElementById('add-sheet');

  document.getElementById('txn-amount').value    = prefill.amount || '';
  document.getElementById('txn-note').value      = prefill.note || '';
  document.getElementById('txn-merchant').value  = prefill.merchant || '';
  document.getElementById('txn-date').value      = prefill.date || new Date().toISOString().split('T')[0];

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
  document.getElementById('txn-type-expense').classList.toggle('active', type === 'expense');
  document.getElementById('txn-type-income').classList.toggle('active', type === 'income');
  loadCategoryDropdown();
}

async function loadCategoryDropdown(prefillCat, prefillSub) {
  const cats = await db.categories.where('type').equals(state.currentType).toArray();
  const sel = document.getElementById('txn-category');
  sel.innerHTML = '<option value="">Select category</option>' +
    cats.map(c => `<option value="${c.id}" data-name="${c.name}"${c.name === prefillCat ? ' selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  await loadSubcats(prefillSub);
}

async function loadSubcats(prefillSub) {
  const catSel = document.getElementById('txn-category');
  const catId  = parseInt(catSel.value);
  const subSel = document.getElementById('txn-subcategory');

  if (!catId) {
    subSel.innerHTML = '<option value="">Select sub-category</option>';
    return;
  }

  const subs = await db.subcategories.where('categoryId').equals(catId).toArray();
  subSel.innerHTML = '<option value="">No sub-category</option>' +
    subs.map(s => `<option value="${s.id}" data-name="${s.name}"${s.name === prefillSub ? ' selected' : ''}>${s.icon || ''} ${s.name}</option>`).join('');
}

async function saveTransaction() {
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

// ─── Transaction List ──────────────────────────────────────────────────────
async function refreshTxnList() {
  const all = await db.transactions.orderBy('createdAt').reverse().toArray();
  const list = document.getElementById('all-txn-list');
  if (all.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions yet.</p>';
    return;
  }
  list.innerHTML = renderTxnGroups(all);
}

// ─── Reports Module ─────────────────────────────────────────────────────────
async function refreshReports() {
  const { start, end } = await getPeriodRange(state.reportPeriod);
  const txns = await db.transactions.where('date').between(start, end, true, true).toArray();
  const expenses = txns.filter(t => t.type === 'expense');

  const total = expenses.reduce((s, t) => s + t.amount, 0);
  document.getElementById('reports-total').textContent = `${state.currency}${fmt(total)}`;

  const catMap = {};
  for (const t of expenses) {
    const cat = t.categoryName || 'Uncategorised';
    if (!catMap[cat]) catMap[cat] = { total: 0, subs: {} };
    catMap[cat].total += t.amount;
    const sub = t.subcategoryName || '';
    if (sub) {
      catMap[cat].subs[sub] = (catMap[cat].subs[sub] || 0) + t.amount;
    }
  }

  // Fetch budgets for progress display
  const budgets = await db.budgets.toArray();
  const cats = await db.categories.toArray();
  const budgetByCatName = {};
  for (const b of budgets) {
    const cat = cats.find(c => c.id === b.categoryId);
    if (cat) budgetByCatName[cat.name] = b.amount;
  }

  const sorted = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total);
  const breakdown = document.getElementById('cat-breakdown');

  if (sorted.length === 0) {
    breakdown.innerHTML = '<p class="empty-state">No expenses in this period.</p>';
    return;
  }

  breakdown.innerHTML = sorted.map(([catName, data], idx) => {
    const pct = total > 0 ? Math.round(data.total / total * 100) : 0;
    const meta = getCatMeta(catName);
    const hasSubs = Object.keys(data.subs).length > 0;
    const budget = budgetByCatName[catName];
    const budgetPct = budget ? Math.min(100, Math.round(data.total / budget * 100)) : null;
    const budgetBar = budget ? `
      <div class="budget-row">
        <span class="budget-label">${state.currency}${fmt(data.total)} / ${state.currency}${fmt(budget)}</span>
        <div class="budget-track">
          <div class="budget-fill ${budgetPct >= 100 ? 'over' : ''}" style="width:${budgetPct}%"></div>
        </div>
        <span class="budget-pct">${budgetPct}%</span>
      </div>` : '';

    const subRows = Object.entries(data.subs)
      .sort((a, b) => b[1] - a[1])
      .map(([sub, amt]) => {
        const subPct = Math.round(amt / data.total * 100);
        return `<div class="subcat-row">
          <span class="subcat-name">${sub}</span>
          <span class="subcat-amount">${state.currency}${fmt(amt)}</span>
          <span class="subcat-pct">${subPct}%</span>
        </div>`;
      }).join('');

    return `
      <div class="cat-row ${state.expandAllCats ? 'expanded' : ''}" data-idx="${idx}" onclick="toggleCatRow(this)">
        <div class="cat-row-main">
          <div class="cat-icon-chip" style="background:${meta.color}">${meta.icon}</div>
          <div class="cat-row-info">
            <div class="cat-row-name">${catName}</div>
            <div class="cat-bar-wrap"><div class="cat-bar" style="width:${pct}%"></div></div>
            ${budgetBar}
          </div>
          <div class="cat-row-right">
            <div class="cat-amount">${state.currency}${fmt(data.total)}</div>
            <div class="cat-pct">${pct}%</div>
            ${hasSubs ? `<div class="cat-chevron">▶</div>` : ''}
          </div>
        </div>
        ${hasSubs ? `<div class="subcat-list ${state.expandAllCats ? 'visible' : ''}">${subRows}</div>` : ''}
      </div>`;
  }).join('');

  // Budget setup link
  const budgetSection = document.getElementById('budget-section');
  if (budgetSection) renderBudgetManager(cats.filter(c => c.type === 'expense'), budgetByCatName, catMap);
}

function toggleCatRow(row) {
  row.classList.toggle('expanded');
  row.querySelector('.subcat-list')?.classList.toggle('visible');
}

function toggleExpandAll() {
  state.expandAllCats = !state.expandAllCats;
  document.querySelectorAll('.cat-row').forEach(r => r.classList.toggle('expanded', state.expandAllCats));
  document.querySelectorAll('.subcat-list').forEach(l => l.classList.toggle('visible', state.expandAllCats));
  document.getElementById('expand-all-btn').textContent = state.expandAllCats ? 'Collapse All' : 'Expand All';
}

async function renderBudgetManager(cats, budgetByCatName, catMap) {
  const section = document.getElementById('budget-section');
  section.innerHTML = '<div class="section-title">Monthly Budgets</div>' +
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
  const amount = parseFloat(value);
  const existing = await db.budgets.where('categoryId').equals(categoryId).first();
  if (!amount || amount <= 0) {
    if (existing) await db.budgets.delete(existing.id);
  } else {
    if (existing) await db.budgets.update(existing.id, { amount });
    else           await db.budgets.add({ categoryId, amount });
  }
  await refreshReports();
}

// ─── Accounts Module ────────────────────────────────────────────────────────
async function refreshAccounts() {
  const accounts = await db.accounts.toArray();
  const list = document.getElementById('accounts-list');
  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  document.getElementById('net-worth').textContent = `${state.currency}${fmt(total)}`;

  if (accounts.length === 0) {
    list.innerHTML = '<p class="empty-state">No accounts yet.</p>';
    return;
  }

  list.innerHTML = accounts.map(a => `
    <div class="account-card">
      <div class="acc-icon">${a.icon || '🏦'}</div>
      <div class="acc-info">
        <div class="acc-name">${a.name}</div>
        <div class="acc-type">${a.type}</div>
      </div>
      <div class="acc-balance ${a.balance >= 0 ? 'positive' : 'negative'}">
        ${state.currency}${fmt(Math.abs(a.balance))}
      </div>
    </div>`).join('');
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
    { type: 'transfer', amount, categoryId: null, subcategoryId: null,
      categoryName: `To: ${to.name}`, subcategoryName: '',
      accountId: fromId, date, note, merchant: '', receiptImage: null, createdAt },
    { type: 'transfer', amount, categoryId: null, subcategoryId: null,
      categoryName: `From: ${from.name}`, subcategoryName: '',
      accountId: toId, date, note, merchant: '', receiptImage: null, createdAt: createdAt + 1 },
  ]);

  await db.accounts.update(fromId, { balance: from.balance - amount });
  await db.accounts.update(toId,   { balance: to.balance   + amount });

  closeOverlay('transfer-sheet');
  await refreshAccounts();
  showToast('Transfer saved');
}

// ─── Settings Module ────────────────────────────────────────────────────────
async function refreshSettings() {
  const settings = {};
  (await db.settings.toArray()).forEach(s => { settings[s.key] = s.value; });

  document.getElementById('settings-currency').value    = settings.currency    || '₹';
  document.getElementById('settings-month-start').value = settings.monthStart  || 1;
  document.getElementById('claude-api-key').value       = settings.claudeApiKey || '';
  document.getElementById('voice-lang').value           = settings.voiceLang   || 'en-IN';

  setToggleVisual('toggle-claude',   settings.claudeEnabled  || false);
  setToggleVisual('toggle-readback', settings.readbackEnabled ?? true);
}

function setToggleVisual(id, on) {
  document.getElementById(id).classList.toggle('on', !!on);
}

async function toggleSetting(key, btnId) {
  const cur = await db.settings.get(key);
  const next = !(cur?.value || false);
  await db.settings.put({ key, value: next });
  setToggleVisual(btnId, next);
  if (key === 'claudeEnabled') state.claudeEnabled = next;
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
  a.href     = url;
  a.download = `money-manager-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported');
}

async function clearData() {
  if (!confirm('Clear ALL data? This cannot be undone.')) return;
  await Promise.all([
    db.transactions.clear(), db.merchantMap.clear(), db.budgets.clear(),
  ]);
  await refreshHome();
  showToast('Data cleared');
}

async function openMerchantMap() {
  const map = await db.merchantMap.toArray();
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

// ─── Voice Module ───────────────────────────────────────────────────────────
function openVoiceSheet() {
  resetVoiceUI();
  openOverlay('voice-sheet');
}

function resetVoiceUI() {
  state.voiceParsed = null;
  state.voiceMode   = 'idle';
  document.getElementById('voice-status').textContent   = 'Tap the mic to start';
  document.getElementById('voice-parsed-card').style.display = 'none';
  document.getElementById('voice-confirm-btn').style.display = 'none';
  document.getElementById('voice-mic-btn').classList.remove('listening');
}

function toggleListening() {
  if (state.listening) stopListening();
  else                 startListening();
}

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

  state.recognition.onstart = () => {
    state.listening = true;
    state.voiceMode = 'listening';
    document.getElementById('voice-mic-btn').classList.add('listening');
    document.getElementById('voice-status').textContent = 'Listening…';
  };

  state.recognition.onresult = e => {
    const result = e.results[0];
    const transcript  = result[0].transcript;
    const confidence  = result[0].confidence;
    state.voiceAlternates = Array.from(result).slice(1).map(r => r.transcript);
    state.voiceConfidence = confidence;
    stopListening();
    processVoiceText(transcript, confidence);
  };

  state.recognition.onerror = e => {
    stopListening();
    if (e.error === 'no-speech') {
      document.getElementById('voice-status').textContent = "Didn't catch that. Try again.";
    } else if (e.error === 'network') {
      document.getElementById('voice-status').textContent = 'Voice unavailable. Type instead.';
    } else {
      document.getElementById('voice-status').textContent = 'Could not hear clearly. Try again.';
    }
  };

  state.recognition.onend = () => {
    state.listening = false;
    document.getElementById('voice-mic-btn').classList.remove('listening');
  };

  state.recognition.start();
}

function stopListening() {
  if (state.recognition) {
    state.recognition.stop();
    state.recognition = null;
  }
  state.listening = false;
  document.getElementById('voice-mic-btn').classList.remove('listening');
}

async function processVoiceText(text, confidence = 1.0) {
  if (isCancellation(text)) {
    document.getElementById('voice-status').textContent = 'Cancelled. Tap mic to try again.';
    return;
  }

  document.getElementById('voice-status').textContent = 'Processing…';
  state.voiceMode = 'processing';

  const parsed = parseVoiceInput(text);
  const catInfo = await matchCategory(parsed.merchant || text);
  parsed.categoryName    = catInfo?.[0] || null;
  parsed.subcategoryName = catInfo?.[1] || null;

  const needsClaude = state.claudeEnabled && (
    !parsed.amount || hasMultipleAmounts(text) || confidence < 0.85
  );

  if (needsClaude) {
    document.getElementById('voice-status').textContent = '🤔 Thinking…';
    const aiResult = await callClaudeVoice(text,
      hasMultipleAmounts(text) ? 'multi' : 'standard', confidence);

    if (aiResult) {
      if (aiResult.transactions?.length > 1) {
        state.pendingMultiTxns = aiResult.transactions;
        openMultiTxnConfirmSheet(aiResult.transactions);
        if (aiResult.confirmText) speakConfirmation(aiResult.confirmText);
        return;
      }
      Object.assign(parsed, aiResult);
    }
  }

  state.voiceParsed = parsed;
  state.voiceMode   = 'parsed';

  if (!parsed.amount) {
    document.getElementById('voice-status').textContent = '⚠️ Couldn\'t find an amount. Please verify.';
  } else {
    document.getElementById('voice-status').textContent = 'Tap Save to continue';
  }

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
  if (/yesterday/i.test(text)) {
    const d = new Date(); d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
  } else if (/last\s+monday/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7);
    date = d.toISOString().split('T')[0];
  }

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
    ${parsed.note ? `<div class="parsed-row"><span class="parsed-label">Note</span><span class="parsed-value">${parsed.note}</span></div>` : ''}
  `;
  document.getElementById('voice-confirm-btn').style.display = 'block';
}

async function confirmVoice() {
  const parsed = state.voiceParsed;
  if (!parsed) return;

  if (!parsed.categoryName) {
    openAutoCatSheet(parsed.merchant || parsed.raw);
    return;
  }

  if (parsed.merchant) {
    const existing = await db.merchantMap.where('merchant').equals(parsed.merchant.toLowerCase()).first();
    if (!existing) {
      await db.merchantMap.add({
        merchant: parsed.merchant.toLowerCase(),
        categoryId: null,
        subcategoryId: null,
        categoryName: parsed.categoryName,
        subcategoryName: parsed.subcategoryName || '',
      });
    }
  }

  closeOverlay('voice-sheet');
  await openAddSheet(parsed.amount ? (KEYWORD_MAP[parsed.merchant?.toLowerCase()]?.[0]?.includes('Salary') ? 'income' : 'expense') : 'expense', {
    amount:          parsed.amount,
    merchant:        parsed.merchant || '',
    date:            parsed.date,
    note:            parsed.note,
    categoryName:    parsed.categoryName,
    subcategoryName: parsed.subcategoryName || '',
  });
}

async function openAutoCatSheet(merchantName) {
  state.autocatData = { merchantName, selectedCat: null };
  const cats = await db.categories.where('type').equals('expense').toArray();
  const suggested = suggestCategory(merchantName);

  document.getElementById('autocat-merchant').textContent = `"${merchantName}"`;
  const grid = document.getElementById('autocat-grid');
  grid.innerHTML = cats.map(c => `
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

  if (merchantName) {
    await db.merchantMap.add({
      merchant:      merchantName.toLowerCase(),
      categoryId:    selectedCatId || null,
      subcategoryId: null,
      categoryName:  selectedCat,
      subcategoryName: '',
    });
  }

  if (state.voiceParsed) {
    state.voiceParsed.categoryName    = selectedCat;
    state.voiceParsed.subcategoryName = '';
  }

  closeOverlay('autocat-sheet');
  closeOverlay('voice-sheet');
  await openAddSheet('expense', {
    amount:       state.voiceParsed?.amount,
    merchant:     merchantName,
    date:         state.voiceParsed?.date,
    note:         state.voiceParsed?.note,
    categoryName: selectedCat,
  });
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
  if (!state.readbackEnabled) return;
  if (!window.speechSynthesis) return;
  const u  = new SpeechSynthesisUtterance(text);
  u.lang   = 'en-IN';
  u.rate   = 0.9;
  u.pitch  = 1.0;
  u.volume = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function hasMultipleAmounts(text) {
  const matches = text.match(/\d+(?:\.\d+)?(?:\s*k)?/gi) || [];
  return matches.length >= 2;
}

function isCancellation(text) {
  return /^(cancel|stop|never mind|forget it|undo that)$/i.test(text.trim());
}

// ─── Claude API Integration ─────────────────────────────────────────────────
async function callClaudeVoice(transcript, scenario = 'standard', confidence = 1.0) {
  const keyRow = await db.settings.get('claudeApiKey');
  const apiKey = keyRow?.value;
  if (!apiKey) return null;

  const today = new Date().toISOString().split('T')[0];
  const CATEGORY_LIST = Object.entries(KEYWORD_MAP)
    .map(([k, [c, s]]) => `${k}→${c}${s ? '›' + s : ''}`).join(', ');

  const isMulti = scenario === 'multi';
  const systemPrompt = isMulti
    ? `You are a financial transaction parser for an Indian expense tracking app.
Extract ALL transactions from the user's voice input. Return ONLY valid JSON.
Rules:
- Amounts in INR. 'k' means thousands.
- 'and', 'also', '+', 'plus' signal multiple transactions.
- Distinguish income from expense by context.
- Match merchants to: ${CATEGORY_LIST}
Today: ${today}
Return: {"transactions":[{"amount":number,"type":"expense"|"income","merchant":string,"categoryName":string,"subcategoryName":string,"date":"YYYY-MM-DD","note":string}],"confirmText":string}`
    : `You are parsing a voice-to-text transcript for an Indian expense app.
Transcript confidence: ${(confidence * 100).toFixed(0)}%
${state.voiceAlternates.length ? `Alternate readings: ${state.voiceAlternates.map(a => `"${a}"`).join(', ')}` : ''}
Categories: ${CATEGORY_LIST}
Today: ${today}
Return ONLY JSON: {"amount":number|null,"type":"expense"|"income","merchant":string|null,"categoryName":string|null,"subcategoryName":string|null,"date":"YYYY-MM-DD","note":string,"needsConfirmation":boolean}`;

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: transcript }],
      }),
    });
    clearTimeout(timeout);
    const data  = await res.json();
    const text  = data.content?.find(b => b.type === 'text')?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[Claude] Voice API call failed:', err.message);
    return null;
  }
}

function openMultiTxnConfirmSheet(txns) {
  const list = document.getElementById('multi-txn-list');
  list.innerHTML = txns.map((t, i) => `
    <div class="multi-txn-row">
      <div class="multi-txn-info">
        <span class="multi-txn-type ${t.type}">${t.type === 'income' ? '+' : '-'}${state.currency}${fmt(t.amount)}</span>
        <span class="multi-txn-cat">${t.categoryName || 'Uncategorised'}</span>
        <span class="multi-txn-note">${t.merchant || t.note || ''}</span>
      </div>
      <button class="btn-sm" onclick="editMultiTxn(${i})">Edit</button>
    </div>`).join('');
  closeOverlay('voice-sheet');
  openOverlay('multi-txn-sheet');
}

async function bulkSaveTxns(txns) {
  for (const t of txns) {
    const createdAt = Date.now();
    await db.transactions.add({
      type: t.type || 'expense',
      amount: t.amount,
      categoryId: null, subcategoryId: null,
      categoryName:    t.categoryName || '',
      subcategoryName: t.subcategoryName || '',
      accountId: null,
      date: t.date || new Date().toISOString().split('T')[0],
      note: t.note || '',
      merchant: t.merchant || '',
      receiptImage: null,
      createdAt,
    });
  }
  closeOverlay('multi-txn-sheet');
  await refreshHome();
  showToast(`${txns.length} transactions saved`);
}

function editMultiTxn(idx) {
  const t = state.pendingMultiTxns[idx];
  closeOverlay('multi-txn-sheet');
  openAddSheet(t.type || 'expense', {
    amount: t.amount, merchant: t.merchant,
    date: t.date, note: t.note, categoryName: t.categoryName,
    subcategoryName: t.subcategoryName,
  });
}

async function reviewMultiTxnsOne() {
  if (state.pendingMultiTxns.length === 0) return;
  const [first, ...rest] = state.pendingMultiTxns;
  state.pendingMultiTxns = rest;
  closeOverlay('multi-txn-sheet');
  await openAddSheet(first.type || 'expense', {
    amount: first.amount, merchant: first.merchant,
    date: first.date, note: first.note, categoryName: first.categoryName,
  });
}

// ─── Scan Module ────────────────────────────────────────────────────────────
function openScanSheet() {
  state.scanData    = null;
  state.scanImageB64 = null;
  document.getElementById('scan-preview-img').src      = '';
  document.getElementById('scan-preview-wrap').style.display = 'none';
  document.getElementById('scan-fields').style.display       = 'none';
  document.getElementById('scan-use-btn').style.display      = 'none';
  document.getElementById('scan-status').textContent         = 'Take a photo or upload a bill';
  openOverlay('scan-sheet');
}

function triggerCamera() {
  document.getElementById('scan-camera-input').click();
}

function handleScanFile(input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    state.scanImageB64 = e.target.result;
    document.getElementById('scan-preview-img').src      = e.target.result;
    document.getElementById('scan-preview-wrap').style.display = 'block';
    runOCR(e.target.result);
  };
  reader.readAsDataURL(file);
  input.value = '';
}

async function runOCR(imageB64) {
  document.getElementById('scan-status').textContent = 'Reading bill…';
  await sleep(400);

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
  return {
    amount:       null,
    merchant:     '',
    date:         new Date().toISOString().split('T')[0],
    categoryName: null,
    subcategoryName: null,
    raw:          '',
  };
}

async function useScanData() {
  const amount   = parseFloat(document.getElementById('scan-amount').value) || null;
  const merchant = document.getElementById('scan-merchant').value.trim();
  const date     = document.getElementById('scan-date').value;

  const catInfo = await matchCategory(merchant);
  closeOverlay('scan-sheet');
  await openAddSheet('expense', {
    amount,
    merchant,
    date,
    categoryName:    catInfo?.[0] || '',
    subcategoryName: catInfo?.[1] || '',
    receiptImage:    state.scanImageB64,
  });
}

// ─── Utilities ──────────────────────────────────────────────────────────────
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
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function getPeriodRange(period) {
  const monthStartRow = await db.settings.get('monthStart');
  const startDay = monthStartRow?.value || 1;
  const now = new Date();

  if (period === 'month') {
    let start = new Date(now.getFullYear(), now.getMonth(), startDay);
    if (start > now) start = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
    let end = new Date(start.getFullYear(), start.getMonth() + 1, startDay - 1);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }
  if (period === 'last') {
    let end   = new Date(now.getFullYear(), now.getMonth(), startDay - 1);
    let start = new Date(end.getFullYear(), end.getMonth() - 1, startDay);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }
  if (period === 'year') {
    return {
      start: `${now.getFullYear()}-01-01`,
      end:   `${now.getFullYear()}-12-31`,
    };
  }
  return { start: '2000-01-01', end: '2099-12-31' };
}

function getCatMeta(name) {
  const map = {
    'Food & Dining':    { icon: '🍽️', color: '#FEF9C3' },
    'Transport':        { icon: '🚗', color: '#DBEAFE' },
    'Health':           { icon: '💊', color: '#FCE7F3' },
    'Shopping':         { icon: '🛍️', color: '#EDE9FE' },
    'Bills & Utilities':{ icon: '💡', color: '#FEE2E2' },
    'Entertainment':    { icon: '🎬', color: '#DBEAFE' },
    'Other':            { icon: '📦', color: '#F3F4F6' },
    'Salary':           { icon: '💼', color: '#D1FAE5' },
    'Freelance':        { icon: '💻', color: '#D1FAE5' },
    'Investment':       { icon: '📈', color: '#D1FAE5' },
    'Other Income':     { icon: '💰', color: '#D1FAE5' },
  };
  return map[name] || { icon: '📦', color: '#F3F4F6' };
}

let toastTimer = null;
function showToast(msg, showUndo = false) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-undo').style.display = showUndo ? 'inline-block' : 'none';
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
    if (acc) {
      const delta = txn.type === 'income' ? -txn.amount : txn.amount;
      await db.accounts.update(txn.accountId, { balance: acc.balance + delta });
    }
  }

  state.lastTxnId = null;
  document.getElementById('toast').classList.remove('show');
  await refreshHome();
  showToast('Transaction undone');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
