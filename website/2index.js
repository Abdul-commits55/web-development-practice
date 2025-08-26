let products = [];
let sales = [];

// Add Product
function addProduct() {
  const name = document.getElementById("pName").value;
  const cost = parseFloat(document.getElementById("pCost").value);
  const price = parseFloat(document.getElementById("pPrice").value);
  const stock = parseInt(document.getElementById("pStock").value);

  if (!name || isNaN(cost) || isNaN(price) || isNaN(stock)) {
    alert("Please fill all fields correctly");
    return;
  }

  products.push({ name, cost, price, stock });
  updateProducts();
  updateSaleOptions();

  document.getElementById("pName").value = "";
  document.getElementById("pCost").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pStock").value = "";
}

// Update Product Table
function updateProducts() {
  const table = document.getElementById("productTable");
  table.innerHTML = "";
  products.forEach((p, i) => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.cost}</td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td><button onclick="deleteProduct(${i})">Delete</button></td>
      </tr>`;
  });
}

// Delete Product
function deleteProduct(i) {
  products.splice(i, 1);
  updateProducts();
  updateSaleOptions();
}

// Update Sale Dropdown
function updateSaleOptions() {
  const select = document.getElementById("saleProduct");
  select.innerHTML = "";
  products.forEach((p, i) => {
    select.innerHTML += `<option value="${i}">${p.name}</option>`;
  });
}

// Add Sale
function addSale() {
  const productIndex = document.getElementById("saleProduct").value;
  const qty = parseInt(document.getElementById("saleQty").value);
  if (productIndex === "" || isNaN(qty) || qty <= 0) {
    alert("Please select product and quantity");
    return;
  }

  const product = products[productIndex];
  if (product.stock < qty) {
    alert("Not enough stock!");
    return;
  }

  product.stock -= qty;
  const revenue = product.price * qty;
  const profit = (product.price - product.cost) * qty;

  sales.push({ product: product.name, qty, revenue, profit });

  updateProducts();
  updateSales();
  updateSummary();

  document.getElementById("saleQty").value = "";
}

// Update Sales Table
function updateSales() {
  const table = document.getElementById("salesTable");
  table.innerHTML = "";
  sales.forEach(s => {
    table.innerHTML += `
      <tr>
        <td>${s.product}</td>
        <td>${s.qty}</td>
        <td>${s.revenue}</td>
        <td>${s.profit}</td>
      </tr>`;
  });
}

// Update Summary
function updateSummary() {
  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

  document.getElementById("totalRevenue").textContent = totalRevenue;
  document.getElementById("totalProfit").textContent = totalProfit;
}
