// Hàm tiện ích để định dạng tiền tệ Việt Nam Đồng (VND)
function formatVND(amount) {
  if (typeof amount !== "number") return "0 VND";
  return amount.toLocaleString("vi-VN") + " VND";
}

// A. Hiển thị chi tiết sản phẩm
function displayOrderItems(items) {
  const container = document.getElementById("orderItemsContainer");
  if (!container) return console(error.message);

  // Xóa nội dung tĩnh/cũ
  container.innerHTML = "";

  items.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "order-item";

    itemDiv.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.productName}" />
            <div class="item">
                <p style="font-size: 17px; font-weight: 600">${
                  item.productName
                }</p>
                <span style="font-size: 14px">Prize: ${formatVND(
                  item.price
                )}</span>
                <br>
                <span style="font-size: 14px"> Quantity: ${item.quantity}</span>
            </div>
        `;
    container.appendChild(itemDiv);
  });
}

// B. Hiển thị tổng kết đơn hàng
function displaySummary(data) {
  document.getElementById("subtotal").textContent = formatVND(data.subtotal);
  document.getElementById("shippingFee").textContent = formatVND(
    data.shippingFee
  );
  document.getElementById("total").textContent = formatVND(data.totalAmount);
}

// C. Hàm chính: Lấy dữ liệu API
async function fetchCartInfo() {
  const apiURL = "http://localhost:3000/api/checkout/inf";

  const authToken = localStorage.getItem("token");

  if (!authToken) {
    console.error("Lỗi: Người dùng chưa đăng nhập. Không tìm thấy token.");
    return;
  }

  try {
    const response = await fetch(apiURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Status: ${response.status}`);
    }

    const cartData = await response.json();

    //  Lấy đối tượng data chứa thông tin giỏ hàng
    const apiData = cartData.data;

    displayOrderItems(apiData.cartItems || []);

    displaySummary(apiData.summary);
  } catch (error) {
    console.error("Lỗi khi tải thông tin giỏ hàng:", error);
  }
}

// Tải dữ liệu khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", fetchCartInfo);
//
//
//
//
//
// D. Thu thập và Gửi đơn hàng

async function placeOrder(event) {
  const apiURL = "http://localhost:3000/api/checkout/place-order";

  const authToken = localStorage.getItem("token");

  // 1. Thu thập dữ liệu từ Form
  const fullName = document.getElementById("fullName").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;
  const notes = document.getElementById("notes").value;

  const paymentMethodElement = document.querySelector(
    ".payment-method input:checked"
  );
  const paymentMethod = paymentMethodElement ? "cod" : null;

  if (!fullName || !address || !phone || !paymentMethod) {
    alert("Please fill in all shipping information!");
    return;
  }

  const orderPayload = {
    fullName: fullName,
    shippingAddress: address,
    phone: phone,
    notes: notes,
    paymentMethod: paymentMethod,
  };

  try {
    // Vô hiệu hóa nút để tránh gửi nhiều lần
    const orderBtn = document.getElementById("placeOrderBtn");
    orderBtn.disabled = true;
    orderBtn.textContent = "Processing....";

    // 2. Gửi yêu cầu POST
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    // 3. Xử lý phản hồi
    if (response.ok) {
      const result = await response.json();
      window.location.href = "Completed.html";
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Lỗi khi đặt hàng: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Lỗi đặt hàng:", error);
    alert(`Order failed: ${error.message}`);
  } finally {
    const orderBtn = document.getElementById("placeOrderBtn");
    orderBtn.disabled = false;
    orderBtn.textContent = "Place Order";
  }
}

// E. Gắn sự kiện vào nút
document.addEventListener("DOMContentLoaded", () => {
  fetchCartInfo();

  const orderBtn = document.getElementById("placeOrderBtn");
  if (orderBtn) {
    orderBtn.addEventListener("click", placeOrder);
  }
});
