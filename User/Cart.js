document.addEventListener("DOMContentLoaded", function () {
  const userId = getUserId();
  if (!userId) {
    alert("Please log in to view your shopping cart.");
    window.location.href = "Login.html";
    return;
  }

  loadCartData(userId);
});

function getUserId() {
  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    return user.id || user.userId || user.UserID;
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
    } else {
      console.error("Lỗi khi lấy giỏ hàng:", result.message);
      showEmptyCart();
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    showEmptyCart();
  }
}

function displayCartItems(cartData) {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryTotal = document.getElementById("cart-summary-total");

  if (!cartData.item || cartData.item.length === 0) {
    showEmptyCart();
    return;
  }

  cartItemsContainer.innerHTML = "";

  cartData.item.forEach((item) => {
    const row = createCartItemRow(item);
    cartItemsContainer.appendChild(row);
  });

  if (cartSummaryTotal) {
    cartSummaryTotal.textContent = formatPrice(cartData.totalAmount);
  }
}

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
            <a href="Product_Detail.html?id=${item.ProductID}">
                <span>${item.ProductName}</span>
                <div>
                    <p><b>Product Code:</b> ${item.ProductCode}</p>
                </div>
                <div>
                    <p><b>Color:</b> ${item.Color}</p>
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
    cartSummaryTotal.textContent = "0VND";
  }
}

async function updateQuantity(cartItemId, newQuantity) {
  const userId = getUserId();
  if (!userId) return;

  newQuantity = parseInt(newQuantity);

  if (isNaN(newQuantity) || newQuantity < 1) {
    alert("Số lượng không hợp lệ");
    loadCartData(userId);
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
      loadCartData(userId);
    } else {
      console.log("Lỗi khi cập nhật: " + result.message);
      loadCartData(userId);
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng:", error);
    loadCartData(userId);
  }
}

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
      loadCartData(userId);
    } else {
      alert("Lỗi khi xóa: " + result.message);
    }
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    alert("Có lỗi xảy ra khi xóa sản phẩm");
  }
}

function formatPrice(price) {
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }
  return price.toLocaleString("vi-VN") + "VND";
}

window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
