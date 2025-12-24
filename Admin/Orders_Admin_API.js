const API_URL = "http://localhost:3000/api/admin/allOrders";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}
//1.dsach order
async function fetchOrders() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
      window.location.href = "DangNhap.html";
      return;
    }
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401 || response.status === 403) {
      alert("Phiên đăng nhập hết hạn.");
      localStorage.removeItem("token");
      window.location.href = "DangNhap.html";
      return;
    }

    const result = await response.json();

    if (result.success) {
      const orders = result.data;
      const tableBody = document.querySelector("table tbody");

      tableBody.innerHTML = "";
      if (orders.length === 0) {
        tableBody.innerHTML =
          "<tr><td colspan='8' style='text-align:center'>No orders received.</td></tr>";
        return;
      }
      orders.forEach((order) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="pointer" onclick="showOrderDetail(${order.OrderId})">${
          order.OrderCode
        }</td>
            <td>${order.FullName}</td>
            <td>${formatDate(order.OrderDate)}</td>
            <td>${order.Phone}</td>
            <td>${order.ShippingAddress}</td>
            <td>${order.TotalAmount} VND</td>
            <td><span class="status-badge ${getStatusClass(order.Status)}">${
          order.Status
        }</span></td>
            <td class="icon">
                <a href="Orders_Detail_Admin.html?id=${order.OrderId}">
                    <i class="fa-solid fa-pen-to-square" id="Update"></i>
                </a>
                &nbsp;&nbsp;&nbsp;
                <i class="fa-solid fa-trash" onclick="deleteOrder(${
                  order.OrderId
                })" id="Delete" style="cursor: pointer;"></i>
            </td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      console.error("Lỗi từ server:", result.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
  }
}
function getStatusClass(status) {
  switch (status) {
    case "Completed":
      return "status-completed";
    case "Confirmed":
      return "status-confirmed";
    case "Shipping":
      return "status-shipping";
    case "Pending":
      return "status-pending";
    case "Returned":
      return "status-returned";
    default:
      return "";
  }
}

//2.chi tiết order
function formatCurrency(value) {
  if (!value) return "0 VND";
  if (typeof value === "number") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }
  return value + "VND";
}

async function showOrderDetail(orderId) {
  const detailUrl = `http://localhost:3000/api/orders/${orderId}`;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(detailUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      const data = result.data;
      populateModal(data);
      openModal();
    } else {
      alert("Unable to retrieve order details: " + result.message);
    }
  } catch (error) {
    console.error("Error retrieving order details:", error);
  }
}
function populateModal(data) {
  document.getElementById("modalOrderId").textContent = data.OrderCode;
  document.querySelector(".order-info p").textContent =
    "Date: " + data.OrderDate;

  const statusBtn = document.querySelector(".status button");
  statusBtn.textContent = data.OrderStatus;
  statusBtn.className = "";
  statusBtn.classList.add("status-badge", getStatusClass(data.OrderStatus));

  //Thông tin khách hàng & Giao hàng
  const columns = document.querySelectorAll(".info-column");

  if (columns[0]) {
    const infoItem = columns[0].querySelector(".info-item");
    infoItem.innerHTML = `
            <strong>Customer: ${data.CustomerName}</strong>
            <p><i class="fa-solid fa-phone"></i> ${data.CustomerPhone}</p>
            <p><i class="fa-solid fa-envelope"></i> ${data.CustomerEmail}</p>
        `;
  }

  if (columns[1]) {
    const infoItem = columns[1].querySelector(".info-item");
    infoItem.innerHTML = `
            <strong>Receiver: ${data.CustomerName}</strong>
            <p><i class="fa-solid fa-phone"></i> ${data.CustomerPhone}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${data.ShippingAddress}</p>
        `;
  }

  const itemsList = document.querySelector(".items-list");
  const headerRow = itemsList.querySelector(".item-row.header");
  itemsList.innerHTML = "";
  itemsList.appendChild(headerRow);

  data.Items.forEach((item) => {
    const itemRow = document.createElement("div");
    itemRow.classList.add("item-row");
    itemRow.innerHTML = `
            <div class="product-info">
                <a href="#">
                    <strong>${item.ProductName}</strong>
                    <p>Dimension: ${item.Dimensions} </p>
                    <p>Color: ${item.Color || ""}</p>
                </a>
            </div>
            <span>${formatCurrency(item.UnitPrice)}</span>
            <span>${item.Quantity}</span>
            <span>${formatCurrency(item.Subtotal)}</span>
        `;
    itemsList.appendChild(itemRow);
  });

  const summaryRows = document.querySelectorAll(
    ".payment-summary .summary-row span:last-child"
  );
  if (summaryRows.length >= 3) {
    summaryRows[0].textContent = formatCurrency(data.Subtotally);
    summaryRows[1].textContent = formatCurrency(data.ShippingFee);
    summaryRows[2].innerHTML = `<strong>${formatCurrency(
      data.TotalAmount
    )}</strong>`;
  }
}
function openModal() {
  const modal = document.getElementById("orderDetailModal");
  modal.style.display = "block";
}
function closeModal() {
  const modal = document.getElementById("orderDetailModal");
  modal.style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
  const closeSpan = document.querySelector(".close");
  const closeBtn = document.querySelector(".btn-close");
  const modal = document.getElementById("orderDetailModal");
  if (closeSpan) closeSpan.onclick = closeModal;
  if (closeBtn) closeBtn.onclick = closeModal;
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };
});

document.addEventListener("DOMContentLoaded", fetchOrders);
