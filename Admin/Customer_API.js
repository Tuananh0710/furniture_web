document.addEventListener("DOMContentLoaded", function () {
  fetchCustomers();
});

async function fetchCustomers() {
  const apiUrl = "http://localhost:3000/api/admin/allCustomer";
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để xem danh sách khách hàng!");
    return;
  }
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Quan trọng: Gửi token lên server.
        // Lưu ý: Tùy vào backend của bạn quy định, có thể là "Bearer " + token hoặc chỉ token.
        // Dưới đây là cách phổ biến nhất:
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      renderCustomerTable(result.data);
    } else {
      console.error("Không lấy được dữ liệu:", result.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối đến API:", error);
  }
}

function renderCustomerTable(customers) {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="pointer">${customer.UserID}</td>
      <td>${customer.FullName}</td>
      <td>${customer.Phone}</td>
      <td>${customer.Address}</td>
      <td>${customer.Email}</td>
      <td class="icon">
        <i class="fa-solid fa-pen-to-square" onclick="editCustomer(${customer.UserID})" title="Sửa"></i>
        &nbsp;&nbsp;&nbsp;
        <i class="fa-solid fa-trash" onclick="deleteCustomer(${customer.UserID})" title="Xóa"></i>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function deleteCustomer(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
    return;
  }

  // 2. Cấu hình API
  // Lưu ý: URL này không chứa ID, ID sẽ được gửi trong body
  const apiUrl = "http://localhost:3000/api/admin/deleteCustomer";
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Vui lòng đăng nhập lại!");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Quan trọng: Gửi UserID qua Body vì URL không có tham số
      body: JSON.stringify({ UserID: id }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Thành công: " + result.message);
      renderCustomerTable(result.data);
    } else {
      alert("Lỗi: " + (result.message || "Không thể xóa khách hàng"));
    }
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    alert("Lỗi kết nối đến Server khi xóa.");
  }
}
