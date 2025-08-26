// === Helpers ===
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const STORAGE_KEY = "shop_items_v1";

function toNumber(v) {
  const n = Number(parseFloat(v));
  return Number.isFinite(n) ? n : 0;
}
function formatPKR(n) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
}
function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function startOfWeek(dateLike) {
  const dt = new Date(dateLike);
  const day = dt.getDay(); // 0 Sun ... 6 Sat
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  const start = new Date(dt.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}
function startOfMonth(dateLike) {
  const d = new Date(dateLike);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(dateLike) {
  const d = new Date(dateLike);
  return new Date(d.getFullYear(), 0, 1);
}
function endOfDay(dateLike) {
  const d = new Date(dateLike);
  d.setHours(23, 59, 59, 999);
  return d;
}
function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// === Storage ===
function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// === Data / Calculations ===
function calcRow({ buy, sell, qty }) {
  const cost = toNumber(buy) * toNumber(qty);
  const revenue = toNumber(sell) * toNumber(qty);
  const profit = revenue - cost;
  return { cost, revenue, profit };
}
function rowTotals(items) {
  return items.reduce(
    (acc, it) => {
      acc.cost += it.cost;
      acc.revenue += it.revenue;
      acc.profit += it.profit;
      return acc;
    },
    { cost: 0, revenue: 0, profit: 0 }
  );
}

// === State ===
let ITEMS = loadItems(); // array of {id, date, name, buy, sell, qty, cost, revenue, profit}
let filterFrom = null; // Date or null
let filterTo = null; // Date or null
let quickRange = "all";
let searchText = "";

// === UI Elements ===
const formEl = $("#itemForm");
const dateEl = $("#date");
const nameEl = $("#name");
const buyEl = $("#buy");
const sellEl = $("#sell");
const qtyEl = $("#qty");
const resetFormBtn = $("#resetForm");

const totalCostEl = $("#totalCost");
const totalRevenueEl = $("#totalRevenue");
const totalProfitEl = $("#totalProfit");

const tRevenueEl = $("#tRevenue");
const tCostEl = $("#tCost");
const tProfitEl = $("#tProfit");

const grandCostEl = $("#grandCost");
const grandRevenueEl = $("#grandRevenue");
const grandProfitEl = $("#grandProfit");

const tbody = $("#itemsTable tbody");

const searchEl = $("#search");
const exportBtn = $("#exportCSV");
const clearAllBtn = $("#clearAll");
const fromDateEl = $("#fromDate");
const toDateEl = $("#toDate");
const applyRangeBtn = $("#applyRange");

// === Initial Setup ===
function init() {
  // default date = today
  dateEl.value = todayStr();

  // Quick-range buttons
  $$(".quick-filters .btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setQuickRange(btn.dataset.range);
      render();
    });
  });

  // Custom range
  applyRangeBtn.addEventListener("click", () => {
    const f = fromDateEl.value ? new Date(fromDateEl.value) : null;
    const t = toDateEl.value ? endOfDay(new Date(toDateEl.value)) : null;
    filterFrom = f;
    filterTo = t;
    quickRange = "custom";
    render();
  });

  // Search
  searchEl.addEventListener("input", () => {
    searchText = searchEl.value.trim().toLowerCase();
    render();
  });

  // Form submit
  formEl.addEventListener("submit", onAddItem);
  resetFormBtn.addEventListener("click", () => formEl.reset());

  // Export & Clear
  exportBtn.addEventListener("click", exportCSV);
  clearAllBtn.addEventListener("click", clearAllData);

  // First render
  setQuickRange("all");
  render();
}

// === Actions ===
function onAddItem(e) {
  e.preventDefault();

  const date = dateEl.value || todayStr();
  const name = nameEl.value.trim();
  const buy = toNumber(buyEl.value);
  const sell = toNumber(sellEl.value);
  const qty = Math.max(1, Math.floor(toNumber(qtyEl.value)));

  if (!name) return;

  const { cost, revenue, profit } = calcRow({ buy, sell, qty });
  const item = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date, // yyyy-mm-dd
    name,
    buy,
    sell,
    qty,
    cost,
    revenue,
    profit,
  };

  ITEMS.push(item);
  saveItems(ITEMS);
  formEl.reset();
  dateEl.value = todayStr();
  render();
}

function deleteItem(id) {
  ITEMS = ITEMS.filter((it) => it.id !== id);
  saveItems(ITEMS);
  render();
}

function clearAllData() {
  if (!confirm("This will delete ALL saved items. Continue?")) return;
  ITEMS = [];
  saveItems(ITEMS);
  render();
}

function exportCSV() {
  const filtered = getFilteredItems();
  const headers = [
    "Date",
    "Item Name",
    "Purchase (per unit)",
    "Sale (per unit)",
    "Qty",
    "Cost",
    "Revenue",
    "Profit",
  ];
  const rows = filtered.map((it) => [
    it.date,
    it.name,
    it.buy,
    it.sell,
    it.qty,
    it.cost,
    it.revenue,
    it.profit,
  ]);

  const lines = [headers, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");
  const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shop-items-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// === Filters ===
function setQuickRange(range) {
  quickRange = range;
  const now = new Date();

  if (range === "today") {
    const f = new Date();
    f.setHours(0, 0, 0, 0);
    filterFrom = f;
    filterTo = endOfDay(now);
  } else if (range === "week") {
    filterFrom = startOfWeek(now);
    filterTo = endOfDay(now);
  } else if (range === "month") {
    filterFrom = startOfMonth(now);
    filterTo = endOfDay(now);
  } else if (range === "year") {
    filterFrom = startOfYear(now);
    filterTo = endOfDay(now);
  }
}
