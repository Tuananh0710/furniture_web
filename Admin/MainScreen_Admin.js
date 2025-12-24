document.addEventListener("DOMContentLoaded", () => {
  const token = getAuthToken();

  if (!token) {
    alert("Vui lòng đăng nhập để tiếp tục");
    window.location.href = "/DangNhap.html";
    return;
  }

  loadDashboardData();
  loadStockData();
  initializeCharts();
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

async function loadDashboardData() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;
      const revenueFormatted = formatCurrency(data.today_revenue);
      document.getElementById("card-revenue").innerText = revenueFormatted;

      document.getElementById("card-orders").innerText = data.today_total_order;

      document.getElementById("card-products").innerText =
        data.today_total_product;

      document.getElementById("card-returns").innerText =
        data.today_total_refund_product;

      document.getElementById("activity-revenue").innerText = revenueFormatted;
      document.getElementById("activity-orders").innerText =
        data.today_total_order;
      document.getElementById("activity-products").innerText =
        data.today_total_product;

      document.getElementById("return-products").innerText =
        data.today_total_refund_product;
      document.getElementById("return-orders").innerText =
        data.today_total_refund_order;

      if (result.date) {
        const dateInput = document.querySelector(".date input[type='date']");
        if (dateInput) {
          dateInput.value = result.date;
        }
      }

      updateHourlyChartsWithTodayData(data);
    } else {
      console.error("API response không hợp lệ:", result);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê chung:", error);
  }
}

async function loadStockData() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/products/stock-counts",
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;
      document.getElementById("stock-in").innerText = data.in_Stock;
      document.getElementById("stock-out").innerText = data.out_of_Stock;
      document.getElementById("stock-low").innerText = data.low_Stock;
    } else {
      console.error("API response không hợp lệ:", result);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu kho:", error);
  }
}

function handleUnauthorized() {
  alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "/DanhNhap.html";
}
