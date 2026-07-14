const db = new Dexie('MoneyManager');

db.version(1).stores({
  transactions:  '++id, type, categoryId, subcategoryId, accountId, date, merchant, createdAt',
  categories:    '++id, name, type',
  subcategories: '++id, name, categoryId',
  accounts:      '++id, name, type',
  merchantMap:   '++id, merchant, categoryId, subcategoryId',
  settings:      'key',
  budgets:       '++id, categoryId',
});

db.version(2).stores({
  transactions: '++id, type, categoryId, subcategoryId, accountId, date, merchant, createdAt, tag',
});

db.version(3).stores({
  buckets: '++id, name, createdAt',
});

db.version(4).stores({
  transactions: '++id, type, categoryId, subcategoryId, accountId, date, merchant, createdAt, tag, splitwiseId',
});

async function seedDefaults() {
  const catCount = await db.categories.count();
  if (catCount > 0) return;

  const expenseCats = [
    { name: 'Food & Dining',    icon: '🍽️', color: '#FEF9C3', type: 'expense' },
    { name: 'Transport',        icon: '🚗', color: '#DBEAFE', type: 'expense' },
    { name: 'Health',           icon: '💊', color: '#FCE7F3', type: 'expense' },
    { name: 'Shopping',         icon: '🛍️', color: '#EDE9FE', type: 'expense' },
    { name: 'Bills & Utilities',icon: '💡', color: '#FEE2E2', type: 'expense' },
    { name: 'Entertainment',    icon: '🎬', color: '#DBEAFE', type: 'expense' },
    { name: 'Other',            icon: '📦', color: '#F3F4F6', type: 'expense' },
  ];
  const incomeCats = [
    { name: 'Salary',       icon: '💼', color: '#D1FAE5', type: 'income' },
    { name: 'Freelance',    icon: '💻', color: '#D1FAE5', type: 'income' },
    { name: 'Investment',   icon: '📈', color: '#D1FAE5', type: 'income' },
    { name: 'Other Income', icon: '💰', color: '#D1FAE5', type: 'income' },
  ];

  const catIds = await db.categories.bulkAdd([...expenseCats, ...incomeCats], { allKeys: true });

  const [foodId, transportId, healthId, shoppingId, billsId, entertainmentId] = catIds;

  await db.subcategories.bulkAdd([
    { name: 'Groceries',       categoryId: foodId,          icon: '🥦' },
    { name: 'Restaurants',     categoryId: foodId,          icon: '🍴' },
    { name: 'Swiggy / Zomato', categoryId: foodId,          icon: '🛵' },
    { name: 'Cafes & Coffee',  categoryId: foodId,          icon: '☕' },
    { name: 'Petrol',          categoryId: transportId,     icon: '⛽' },
    { name: 'Auto / Cab',      categoryId: transportId,     icon: '🚖' },
    { name: 'Metro / Bus',     categoryId: transportId,     icon: '🚇' },
    { name: 'Doctor',          categoryId: healthId,        icon: '👨‍⚕️' },
    { name: 'Medicines',       categoryId: healthId,        icon: '💊' },
    { name: 'Gym',             categoryId: healthId,        icon: '🏋️' },
    { name: 'Clothes',         categoryId: shoppingId,      icon: '👕' },
    { name: 'Electronics',     categoryId: shoppingId,      icon: '📱' },
    { name: 'Online Shopping', categoryId: shoppingId,      icon: '📦' },
    { name: 'Electricity',     categoryId: billsId,         icon: '⚡' },
    { name: 'Internet',        categoryId: billsId,         icon: '📶' },
    { name: 'Rent',            categoryId: billsId,         icon: '🏠' },
    { name: 'OTT / Streaming', categoryId: entertainmentId, icon: '🎬' },
    { name: 'Movies',          categoryId: entertainmentId, icon: '🍿' },
  ]);

  await db.accounts.bulkAdd([
    { name: 'Cash',         type: 'Cash',        balance: 0, icon: '💵' },
    { name: 'Bank Account', type: 'Savings',      balance: 0, icon: '🏦' },
    { name: 'Credit Card',  type: 'Credit Card',  balance: 0, icon: '💳' },
  ]);

  await db.settings.bulkPut([
    { key: 'currency',       value: '₹' },
    { key: 'monthStart',     value: 1 },
    { key: 'aiApiKey',    value: '' },
    { key: 'aiModel',     value: 'gemini-2.5-flash' },
    { key: 'aiEnabled',   value: true },
    { key: 'readbackEnabled',value: true },
    { key: 'voiceLang',      value: 'en-IN' },
  ]);
}
