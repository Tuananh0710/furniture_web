// demo data (replace with real API later)
const today = new Date();
function formatDate(d) {
  return d.toLocaleDateString("vi-VN");
}

// --- sampleSeries: nếu days === 1 -> tạo dữ liệu theo giờ (0..23)
// --- nếu days > 1 -> tạo dữ liệu theo ngày (như trước)
function sampleSeries(days) {
  const labels = [],
    values = [];
  if (days === 1) {
    // Thống kê theo giờ trong ngày hiện tại: 24 điểm (0:00, 1:00, ..., 23:00)
    const now = new Date();
    const yyyy = now.getFullYear(),
      mm = now.getMonth(),
      dd = now.getDate();
    for (let h = 0; h < 24; h++) {
      // label dạng "00:00", "01:00", ..., "23:00"
      labels.push(String(h).padStart(2, "0") + ":00");
      // tạo dữ liệu mẫu: mỗi giờ có giá trị ngẫu nhiên
      // (Bạn có thể thay bằng API trả về doanh số theo giờ)
      const base = Math.round((Math.random() * 2 + 0.5) * 100000); // giá trị nhỏ hơn daily
      values.push(base);
    }
  } else {
    // theo ngày (giữ như cũ)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(
        d.toLocaleDateString("vi-VN", { month: "2-digit", day: "2-digit" })
      );
      values.push(Math.round((Math.random() * 2 + 1) * 1000000));
    }
  }
  return { labels, values };
}

// initial dataset
let revenueSeries = sampleSeries(30);
let ordersSeries = {
  labels: revenueSeries.labels,
  values: revenueSeries.values.map((v) => Math.round(v / 200000)),
};
let categoryData = {
  labels: ["Bàn", "Ghế", "Tủ", "Sofa", "Gương"],
  values: [34, 22, 18, 15, 11],
};
let recentOrders = [
  {
    id: "DH1001",
    customer: "Nguyễn A",
    date: formatDate(today),
    total: 450000,
    status: "Completed",
  },
  {
    id: "DH1002",
    customer: "Trần B",
    date: formatDate(today),
    total: 1250000,
    status: "Pending",
  },
  {
    id: "DH1003",
    customer: "Lê C",
    date: formatDate(today),
    total: 760000,
    status: "Shipped",
  },
];

// render KPI values
function updateKPIs() {
  const revenue = revenueSeries.values.reduce((s, x) => s + x, 0);
  document.getElementById("kpiRevVal").textContent =
    revenue.toLocaleString("vi-VN") + " ₫";
  document.getElementById("kpiOrdersVal").textContent =
    ordersSeries.values.reduce((s, x) => s + x, 0);
  document.getElementById("kpiCustVal").textContent = Math.floor(
    Math.random() * 200 + 30
  );
  document.getElementById("kpiStockVal").textContent = Math.floor(
    Math.random() * 20 + 1
  );
}

// charts initialisation
const ctxRev = document.getElementById("chartRevenue").getContext("2d");
const chartRevenue = new Chart(ctxRev, {
  type: "line",
  data: {
    labels: revenueSeries.labels,
    datasets: [
      {
        label: "Revenue (VNĐ)",
        data: revenueSeries.values,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.08)",
        fill: true,
        tension: 0.25,
      },
    ],
  },
  options: {
    responsive: true,
    scales: { y: { ticks: { callback: (v) => v.toLocaleString("vi-VN") } } },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => ctx.parsed.y.toLocaleString("vi-VN") + " ₫",
        },
      },
    },
  },
});

const ctxOrd = document.getElementById("chartOrders").getContext("2d");
const chartOrders = new Chart(ctxOrd, {
  type: "bar",
  data: {
    labels: ordersSeries.labels,
    datasets: [
      {
        label: "Orders",
        data: ordersSeries.values,
        backgroundColor: "#06b6d4",
        borderRadius: 6,
      },
    ],
  },
  options: { responsive: true },
});

const ctxCat = document.getElementById("chartCategory").getContext("2d");
const chartCategory = new Chart(ctxCat, {
  type: "doughnut",
  data: {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.values,
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
      },
    ],
  },
  options: { responsive: true, plugins: { legend: { position: "bottom" } } },
});

// fill lists & tables
function renderLists() {
  const topCustomersEl = document.getElementById("topCustomers");
  topCustomersEl.innerHTML = "";
  const sampleCusts = [
    { name: "Cty ABC", spent: 12000000, orders: 24 },
    { name: "Nguyễn Văn A", spent: 8600000, orders: 15 },
    { name: "Trần Thị B", spent: 4300000, orders: 12 },
  ];
  sampleCusts.forEach((c) => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `<div><strong>${c.name}</strong><div class="small">${
      c.orders
    } orders</div></div><div>${c.spent.toLocaleString("vi-VN")} ₫</div>`;
    topCustomersEl.appendChild(div);
  });

  const invEl = document.getElementById("inventoryList");
  invEl.innerHTML = "";
  const low = [
    { sku: "SP010", name: "Ghế Eames", qty: 2 },
    { sku: "SP023", name: "Bàn Oak", qty: 4 },
  ];
  low.forEach((i) => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `<div><strong>${i.name}</strong><div class="small">SKU: ${i.sku}</div></div><div style="color:#d97706">${i.qty} left</div>`;
    invEl.appendChild(div);
  });

  const tbody = document.querySelector("#recentOrders tbody");
  tbody.innerHTML = "";
  recentOrders.forEach((o) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${o.id}</b></td><td>${o.customer}</td><td>${
      o.date
    }</td><td>${o.total.toLocaleString("vi-VN")} ₫</td><td>${o.status}</td>`;
    tbody.appendChild(tr);
  });
}

// apply filters: date range, search, status
function applyFilters() {
  // for demo: regenerate sample series with chosen range
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;
  const q = document.getElementById("qSearch").value.trim().toLowerCase();
  // quick: if from/to defined, compute days
  let days = 30;
  if (from && to) {
    const d1 = new Date(from),
      d2 = new Date(to);
    const diff = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    days = Math.min(365, diff + 1);
  } else {
    const activeQuick = document.querySelector(".quick-buttons button.active");
    if (activeQuick) days = parseInt(activeQuick.dataset.range);
  }
  revenueSeries = sampleSeries(days);
  ordersSeries = {
    labels: revenueSeries.labels,
    values: revenueSeries.values.map((v) => Math.round(v / 200000)),
  };

  // update charts
  chartRevenue.data.labels = revenueSeries.labels;
  chartRevenue.data.datasets[0].data = revenueSeries.values;
  chartRevenue.update();

  chartOrders.data.labels = ordersSeries.labels;
  chartOrders.data.datasets[0].data = ordersSeries.values;
  chartOrders.update();

  // update KPIs & lists
  updateKPIs();
  renderLists();
}

// sidebar nav click to scroll & active state
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    const target = document.getElementById(item.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// quick buttons
document.querySelectorAll(".quick-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".quick-buttons button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

// apply/reset buttons
document.getElementById("btnApply").addEventListener("click", applyFilters);
document.getElementById("btnReset").addEventListener("click", () => {
  document.getElementById("qSearch").value = "";
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  document
    .querySelectorAll(".status-filter")
    .forEach((cb) => (cb.checked = true));
  document
    .querySelectorAll(".quick-buttons button")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector('.quick-buttons button[data-range="30"]')
    .classList.add("active");
  applyFilters();
});

// Export CSV (recent orders)
document.getElementById("exportCSV").addEventListener("click", () => {
  const rows = [
    ["Order", "Customer", "Date", "Total", "Status"],
    ...recentOrders.map((o) => [o.id, o.customer, o.date, o.total, o.status]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recent_orders.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// Download PDF stub
document
  .getElementById("downloadPDF")
  .addEventListener("click", () =>
    alert("PDF export stub - integrate library or server-side export")
  );

// initial render
updateKPIs();
renderLists();
applyFilters();
