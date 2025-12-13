// OrderFrontEnd.js

document.addEventListener("DOMContentLoaded", () => {
  // ... (Giữ nguyên hàm formatCurrency và renderOrders) ...
  function formatCurrency(amount) {
    if (typeof amount !== "number") {
      amount = parseFloat(amount);
    }
    return amount.toLocaleString("vi-VN", { minimumFractionDigits: 0 });
  }

  function renderOrders(orders, tableBody) {
    tableBody.innerHTML = "";
    orders.forEach((order) => {
      const row = tableBody.insertRow();
      row.innerHTML = `
                <td><a href="View_Order_Detail.html?orderId=${order.OrderID}">${order.OrderID}</a></td>
                <td>${order.Date}</td>
                <td>${order.Address}</td>
                <td>${order.OrderValue} VNĐ</td>
                <td>${order.PaymentStatus}</td>
                <td>${order.ShippingStatus}</td>
            `;
    });
  }

  // Hàm MỚI: Hiển thị tên người dùng
  function displayUserName() {
    const userSpan = document.querySelector(".sidebar p span");
    const userDataString = localStorage.getItem("user"); // Lấy dữ liệu user object từ key 'user'

    if (userSpan && userDataString) {
      try {
        // Parse chuỗi JSON thành object
        const userData = JSON.parse(userDataString);

        // Lấy FullName và cập nhật vào giao diện
        if (userData && userData.FullName) {
          userSpan.textContent = userData.FullName + "!";
        }
      } catch (error) {
        console.error("Lỗi khi parse user data từ Local Storage:", error);
      }
    }
  }

  // 2. Hàm chính để lấy và hiển thị đơn hàng
  async function loadMyOrders() {
    const tableElement = document.querySelector(".content table");

    if (!tableElement) {
      console.error("Không tìm thấy thẻ <table> trong .content");
      return;
    }

    let tableBody = tableElement.querySelector("tbody");
    if (!tableBody) {
      tableBody = document.createElement("tbody");
      tableElement.appendChild(tableBody);
    }

    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Đang tải đơn hàng...</td></tr>`;

    const token = localStorage.getItem("token"); // Đã dùng key "token"

    if (!token) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Bạn chưa đăng nhập.</td></tr>`;
      return;
    }

    const API_URL = "http://localhost:3000/api/orders/my-orders";

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        const orders = result.data;
        if (orders.length > 0) {
          renderOrders(orders, tableBody);
        } else {
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Bạn chưa có đơn hàng nào.</td></tr>`;
        }
      } else {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Lỗi tải đơn hàng: ${
          result.message || "Lỗi không xác định"
        }</td></tr>`;
      }
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Không thể kết nối đến server.</td></tr>`;
    }
  }

  // 4. Kích hoạt cả hai hàm khi DOM đã tải xong
  displayUserName(); // Hiển thị tên người dùng trước
  loadMyOrders(); // Sau đó tải đơn hàng
});
