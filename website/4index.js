// Product storage and sales storage keys
const PRODUCTS_KEY = "shop_products_v1";
const SALES_KEY = "shop_sales_v1";

// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
function toNum(v){ const n = Number(parseFloat(v)); return Number.isFinite(n) ? n : 0; }
function fmt(n){ return new Intl.NumberFormat("en-PK", {style:"currency", currency:"PKR", maximumFractionDigits:0}).format(n); }
function todayStr(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
function startOfWeek(d){ const dt=new Date(d); const day=dt.getDay(); const diff=dt.getDate()-day+(day===0?-6:1); const s=new Date(dt.setDate(diff)); s.setHours(0,0,0,0); return s; }
function startOfMonth(d){ const dt=new Date(d); return new Date(dt.getFullYear(), dt.getMonth(),1); }
function startOfYear(d){ const dt=new Date(d); return new Date(dt.getFullYear(),0,1); }
function endOfDay(d){ const dt=new Date(d); dt.setHours(23,59,59,999); return dt; }
function csvEscape(v){ if (v==null) return ""; const s=String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }

// Load/Save
function loadProducts(){ try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]"); } catch { return []; } }
function saveProducts(p){ localStorage.setItem(PRODUCTS_KEY, JSON.stringify(p)); }
function loadSales(){ try { return JSON.parse(localStorage.getItem(SALES_KEY) || "[]"); } catch { return []; } }
function saveSales(s){ localStorage.setItem(SALES_KEY, JSON.stringify(s)); }

// State
let PRODUCTS = loadProducts();
let SALES = loadSales();
let filterFrom = null, filterTo = null, searchText = "";

// Elements
const pForm = $("#productForm");
const pName = $("#pName"), pBuy = $("#pBuy"), pSell = $("#pSell"), pQty = $("#pQty");
const addProductBtn = $("#addProduct"), resetProductBtn = $("#resetProduct");
const prodTbody = $("#productsTable tbody");
const salesTbody = $("#salesTable tbody");
const kCost = $("#kCost"), kRevenue = $("#kRevenue"), kProfit = $("#kProfit");
const searchProd = $("#searchProd");
const quickBtns = $$(".quick-filters .btn");
const fromDateEl = $("#fromDate"), toDateEl = $("#toDate"), applyRange = $("#applyRange");
const exportSalesCSV = $("#exportSalesCSV"), clearSalesBtn = $("#clearSales");

// Init
document.addEventListener("DOMContentLoaded", () => {
  pForm.addEventListener("submit", onAddProduct);
  resetProductBtn.addEventListener("click", () => pForm.reset());
  searchProd.addEventListener("input", ()=> { searchText = searchProd.value.trim().toLowerCase(); render(); });
  quickBtns.forEach(b => b.addEventListener("click", ()=> { setQuickRange(b.dataset.range); render(); }));
  applyRange.addEventListener("click", ()=> {
    filterFrom = fromDateEl.value ? new Date(fromDateEl.value) : null;
    filterTo = toDateEl.value ? endOfDay(new Date(toDateEl.value)) : null;
    render();
  });
  exportSalesCSV.addEventListener("click", exportSales);
  clearSalesBtn.addEventListener("click", ()=> {
    if(!confirm("Delete all sales records?")) return;
    SALES = []; saveSales(SALES); render();
  });

  // defaults
  setQuickRange("all");
  render();
});

// Product actions
function onAddProduct(e){
  e.preventDefault();
  const name = pName.value.trim(); if(!name) return;
  const buy = toNum(pBuy.value), sell = toNum(pSell.value), qty = Math.max(0, Math.floor(toNum(pQty.value)));
  const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const prod = { id, name, buy, sell, qty };
  PRODUCTS.push(prod);
  saveProducts(PRODUCTS);
  pForm.reset();
  render();
}

function deleteProduct(id){
  if(!confirm("Delete this product?")) return;
  PRODUCTS = PRODUCTS.filter(p=>p.id !== id);
  saveProducts(PRODUCTS);
  render();
}

// Render products
function renderProducts(){
  prodTbody.innerHTML = "";
  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(searchText));
  if(filtered.length===0){
    const tr=document.createElement("tr"); tr.innerHTML=`<td colspan="7" class="muted">No products found.</td>`; prodTbody.appendChild(tr); return;
  }
  filtered.forEach((p,i)=>{
    const est = p.buy * p.qty;
    const tr=document.createElement("tr");
  });
}

// (Because of single-file safety, implement renderProducts properly:)
function renderProducts(){
  prodTbody.innerHTML = "";
  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(searchText));
  if(filtered.length===0){
    const tr=document.createElement("tr"); tr.innerHTML=`<td colspan="7" class="muted">No products found.</td>`; prodTbody.appendChild(tr); return;
  }
  filtered.forEach((p,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${p.name}</td>
      <td class="num">${fmt(p.buy)}</td>
      <td class="num">${fmt(p.sell)}</td>
      <td class="num">${p.qty}</td>
      <td class="num">${fmt(p.buy * p.qty)}</td>
      <td>
        <button class="btn danger" data-del="${p.id}">Delete</button>
      </td>
    `;
    prodTbody.appendChild(tr);
  });
  // bind delete buttons
  Array.from(document.querySelectorAll('[data-del]')).forEach(btn => {
    btn.addEventListener("click", ()=> deleteProduct(btn.dataset.del));
  });
}

// Sales reporting
function setQuickRange(range){
  const now = new Date();
  if(range === "today"){ filterFrom = new Date(); filterFrom.setHours(0,0,0,0); filterTo = endOfDay(now); }
  else if(range === "week"){ filterFrom = startOfWeek(now); filterTo = endOfDay(now); }
  else if(range === "month"){ filterFrom = startOfMonth(now); filterTo = endOfDay(now); }
  else if(range === "year"){ filterFrom = startOfYear(now); filterTo = endOfDay(now); }
  else { filterFrom = null; filterTo = null; }
  fromDateEl.value = filterFrom ? filterFrom.toISOString().slice(0,10) : "";
  toDateEl.value = filterTo ? new Date(filterTo).toISOString().slice(0,10) : "";
}

function getFilteredSales(){
  let arr = SALES.slice();
  if(filterFrom || filterTo){
    arr = arr.filter(s => {
      const d = new Date(s.date + "T00:00:00");
      if(filterFrom && d < filterFrom) return false;
      if(filterTo && d > filterTo) return false;
      return true;
    });
  }
  return arr;
}

function renderSales(){
  salesTbody.innerHTML = "";
  const filtered = getFilteredSales();
  if(filtered.length === 0){
    const tr=document.createElement("tr"); tr.innerHTML=`<td colspan="6" class="muted">No sales for selected range.</td>`; salesTbody.appendChild(tr); return;
  }
  let totalRevenue = 0, totalCost = 0, totalProfit = 0;
  filtered.forEach((s,i)=>{
    const itemsSummary = s.items.map(it => `${it.name} x${it.qty}`).join(", ");
    totalRevenue += s.revenue;
    totalCost += s.cost;
    totalProfit += s.profit;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${s.date}</td>
      <td>${itemsSummary}</td>
      <td class="num">${fmt(s.revenue)}</td>
      <td class="num">${fmt(s.cost)}</td>
      <td class="num">${fmt(s.profit)}</td>
    `;
    salesTbody.appendChild(tr);
  });
  $("#sRevenue").textContent = fmt(totalRevenue);
  $("#sCost").textContent = fmt(totalCost);
  $("#sProfit").textContent = fmt(totalProfit);
  // KPIs
  kCost.textContent = fmt(totalCost);
  kRevenue.textContent = fmt(totalRevenue);
  kProfit.textContent = fmt(totalProfit);
}

// Export sales CSV
function exportSales(){
  const data = getFilteredSales();
  if(data.length === 0){ alert("No sales to export for selected range."); return; }
  const headers = ["Date","Items","Revenue","Cost","Profit"];
  const rows = data.map(s => [
    s.date,
    s.items.map(it => `${it.name} x${it.qty}`).join("; "),
    s.revenue,
    s.cost,
    s.profit
  ]);
  const lines = [headers, ...rows].map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `sales-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// Render all
function render(){
  PRODUCTS = loadProducts();
  SALES = loadSales();
  renderProducts();
  renderSales();
}

// Make app available to POS (POS will call reduceStock and registerSale)
function reduceStockAndRegisterSale(sale){
  // sale: { date, items: [{id,name,price,qty,buy}], revenue, cost, profit }
  // reduce stock
  const mapQty = {};
  sale.items.forEach(it => { mapQty[it.id] = (mapQty[it.id] || 0) + it.qty; });
  PRODUCTS = PRODUCTS.map(p => {
    if(mapQty[p.id]) p.qty = Math.max(0, p.qty - mapQty[p.id]);
    return p;
  });
  saveProducts(PRODUCTS);
  // register sale record
  SALES.push({
    id: Date.now()+"_"+Math.random().toString(36).slice(2,7),
    date: sale.date,
    items: sale.items.map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price })),
    revenue: sale.revenue,
    cost: sale.cost,
    profit: sale.profit
  });
  saveSales(SALES);
  render();
}
// expose globally so pos.js can call
window.registerSale = (sale) => reduceStockAndRegisterSale(sale);

// Kickoff
render();
