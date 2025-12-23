document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra token trước khi tải dữ liệu
  const token = getAuthToken();

  if (!token) {
    alert("Vui lòng đăng nhập để tiếp tục");
    window.location.href = "/login.html";
    return;
  }

  // Gọi hàm load dữ liệu
  loadDashboardData();
  loadStockData();

  // Thêm hàm tạo biểu đồ (sẽ được gọi sau khi có dữ liệu)
  initializeCharts();
});

// Hàm định dạng tiền tệ (VNĐ)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Hàm tạo headers với token
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

// 1. Lấy dữ liệu Thống kê chung (Doanh thu, Đơn hàng...)
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

      // --- Cập nhật vào các Card (Hàng trên) ---
      // Doanh thu (Format sang tiền Việt)
      const revenueFormatted = formatCurrency(data.today_revenue);
      document.getElementById("card-revenue").innerText = revenueFormatted;

      // Đơn hàng
      document.getElementById("card-orders").innerText = data.today_total_order;

      // Sản phẩm
      document.getElementById("card-products").innerText =
        data.today_total_product;

      // Sản phẩm trả lại
      document.getElementById("card-returns").innerText =
        data.today_total_refund_product;

      // --- Cập nhật vào bảng Activity (Hàng dưới) ---
      document.getElementById("activity-revenue").innerText = revenueFormatted;
      document.getElementById("activity-orders").innerText =
        data.today_total_order;
      document.getElementById("activity-products").innerText =
        data.today_total_product;

      // --- Cập nhật vào bảng Return Information ---
      document.getElementById("return-products").innerText =
        data.today_total_refund_product;
      document.getElementById("return-orders").innerText =
        data.today_total_refund_order;

      // --- Cập nhật ngày tháng vào input date ---
      if (result.date) {
        // Lấy input date element
        const dateInput = document.querySelector(".date input[type='date']");
        if (dateInput) {
          // Set giá trị date từ JSON response
          dateInput.value = result.date;
        }
      }

      // Sau khi có dữ liệu hôm nay, cập nhật biểu đồ
      updateHourlyChartsWithTodayData(data);
    } else {
      console.error("API response không hợp lệ:", result);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê chung:", error);
  }
}

// 2. Lấy dữ liệu Kho hàng (Stock Counts)
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

      // Cập nhật bảng Inventory Information
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

// Hàm xử lý khi token không hợp lệ
function handleUnauthorized() {
  alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  // Xóa token
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  // Chuyển hướng về trang đăng nhập
  window.location.href = "/login.html";
}

// Thêm event listener cho nút logout nếu có
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login.html";
    });
  }
});
