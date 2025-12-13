document.addEventListener("DOMContentLoaded", function () {
  const userId = getUserId(); // Lấy ID người dùng từ session/localStorage hoặc cách khác
  if (!userId) {
    alert("Please log in to view your shopping cart.");
    window.location.href = "Login.html";
    return;
  }

  loadCartData(userId);
});

// Hàm lấy ID người dùng (tùy chỉnh theo hệ thống của bạn)
function getUserId() {
  // Cách 1: Lấy từ localStorage (nếu đã lưu khi đăng nhập)
  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    return user.id || user.userId || user.UserID;
  }

  // Cách 2: Lấy từ sessionStorage
  const sessionUser = sessionStorage.getItem("user");
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    return user.id || user.userId || user.UserID;
  }

  // Cách 3: Lấy từ URL parameters (nếu có)
  const urlParams = new URLSearchParams(window.location.search);
  const userIdFromUrl = urlParams.get("userId");
  if (userIdFromUrl) return parseInt(userIdFromUrl);

  // Cách 4: Lấy từ cookie
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "userId" || name === "user_id") {
      return parseInt(value);
    }
  }
  return null;
}

// Hàm tải dữ liệu giỏ hàng
async function loadCartData(userId) {
  try {
    const response = await fetch(`http://localhost:3000/api/cart/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      displayCartItems(result.data);
      updateCheckoutButton(result.data); // Cập nhật trạng thái nút checkout
    } else {
      console.error("Lỗi khi lấy giỏ hàng:", result.message);
      showEmptyCart();
      updateCheckoutButton({ item: [] }); // Vô hiệu hóa checkout
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    showEmptyCart();
    updateCheckoutButton({ item: [] }); // Vô hiệu hóa checkout
  }
}

// Hàm cập nhật trạng thái nút checkout
function updateCheckoutButton(cartData) {
  const checkoutButton = document.querySelector(".checkout");
  if (!checkoutButton) return;

  const isEmpty = !cartData.item || cartData.item.length === 0;

  if (isEmpty) {
    // Giỏ hàng trống: vô hiệu hóa nút checkout
    checkoutButton.style.cursor = "not-allowed";
    checkoutButton.onclick = function (e) {
      e.preventDefault();
      alert("The shopping cart is empty. Please add products before checkout.");
      return false;
    };
  } else {
    // Giỏ hàng có sản phẩm: kích hoạt nút checkout
    checkoutButton.classList.remove("disabled");
    checkoutButton.style.cursor = "pointer";
    checkoutButton.onclick = null; // Xóa event handler cũ
  }
}
// Hàm hiển thị các sản phẩm trong giỏ hàng
function displayCartItems(cartData) {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryTotal = document.getElementById("cart-summary-total");

  if (!cartData.item || cartData.item.length === 0) {
    showEmptyCart();
    return;
  }

  // Xóa nội dung cũ
  cartItemsContainer.innerHTML = "";

  // Hiển thị từng sản phẩm
  cartData.item.forEach((item) => {
    const row = createCartItemRow(item);
    cartItemsContainer.appendChild(row);
  });

  // Cập nhật tổng tiền
  if (cartSummaryTotal) {
    cartSummaryTotal.textContent = formatPrice(cartData.totalAmount);
  }

  // Cập nhật tổng số lượng sản phẩm (nếu có element hiển thị)
  const totalItemsElement = document.getElementById("total-items-count");
  if (totalItemsElement) {
    totalItemsElement.textContent = cartData.totalItems;
  }
}

// Hàm tạo một dòng sản phẩm trong giỏ hàng
function createCartItemRow(item) {
  const row = document.createElement("tr");
  row.setAttribute("data-cart-item-id", item.CartItemID);

  const totalPrice = item.Price * item.Quantity;

  row.innerHTML = `
        <td class="product-info">
            <button class="remove" onclick="removeItem(${
              item.CartItemID
            })">&times;</button>
            <img src="${
              item.ImageURLs ? "1.jpg" : item.ImageURLs.split(",")[1]
            }" alt="${item.ProductName}" />
            <a href="Product_Detail.html?productId=${item.ProductID}">
                <span>${item.ProductName}</span>
                <div>
                    <p><b>Product Code:</b> ${item.ProductCode}</p>
                </div>
                <div>
                    <p><b>Stock:</b> ${item.StockQuantity}</p>
                </div>
            </a>
        </td>
        <td class="price">${formatPrice(item.Price)}</td>
        <td>
            <input 
                type="number" 
                value="${item.Quantity}" 
                min="1" 
                max="${item.StockQuantity}" 
                onchange="updateQuantity(${item.CartItemID}, this.value)"
                class="quantity-input"
            />
        </td>
        <td class="item-total">${formatPrice(totalPrice)}</td>
    `;

  return row;
}

// Hàm hiển thị giỏ hàng trống
function showEmptyCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryTotal = document.getElementById("cart-summary-total");

  cartItemsContainer.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 40px;">
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart!</p>
            </td>
        </tr>
    `;

  if (cartSummaryTotal) {
    cartSummaryTotal.textContent = "0₫";
  }
}

// Hàm cập nhật số lượng sản phẩm
async function updateQuantity(cartItemId, newQuantity) {
  const userId = getUserId();
  if (!userId) return;

  // Chuyển đổi sang số nguyên
  newQuantity = parseInt(newQuantity);

  if (isNaN(newQuantity) || newQuantity < 1) {
    alert("Số lượng không hợp lệ");
    loadCartData(userId); // Tải lại để hiển thị số lượng cũ
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/cart/update-quantity",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          cartItemId: cartItemId,
          quantity: newQuantity,
        }),
      }
    );

    const result = await response.json();

    if (result.success) {
      // Cập nhật thành công, tải lại giỏ hàng
      loadCartData(userId);
    } else {
      alert("Lỗi khi cập nhật: " + result.message);
      loadCartData(userId); // Tải lại để hiển thị số lượng cũ
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng:", error);
    alert("Có lỗi xảy ra khi cập nhật số lượng");
    loadCartData(userId); // Tải lại để hiển thị số lượng cũ
  }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
async function removeItem(cartItemId) {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
    return;
  }

  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch("http://localhost:3000/api/cart/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        cartItemId: cartItemId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Xóa thành công, tải lại giỏ hàng
      loadCartData(userId);
    } else {
      alert("Lỗi khi xóa: " + result.message);
    }
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    alert("Có lỗi xảy ra khi xóa sản phẩm");
  }
}

// Hàm định dạng giá tiền
function formatPrice(price) {
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }
  return price.toLocaleString("vi-VN") + "₫";
}

// Thêm các hàm vào global scope để có thể gọi từ HTML
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
