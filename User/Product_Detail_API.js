// 1. Hàm lấy Product ID từ URL (Ví dụ: id=2 trong Product_Detail.html?id=2)
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// 2. Hàm gọi API và cập nhật giao diện
async function fetchProductDetail() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    console.error("Lỗi: Không tìm thấy ID sản phẩm trong URL.");
    document.querySelector(".product-info").innerHTML =
      "<h2> Product ID not found. Please return to the listing page.</h2>";
    return;
  }
  const apiUrl = `http://localhost:3000/api/products/${productId}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && result.data) {
      updateProductHTML(result.data);
    } else {
      console.error("API trả về không thành công hoặc không có dữ liệu.");
      document.querySelector(".product-info").innerHTML =
        "<h2>No data was found for this product.</h2>";
    }
  } catch (error) {
    console.error("Lỗi trong quá trình Fetch API:", error);
    document.querySelector(".product-info").innerHTML =
      "<h2>Unable to load product information. Please check your API connection.</h2>";
  }
}

// 3. Hàm cập nhật nội dung HTML
function updateProductHTML(product) {
  const formatCurrency = (amount) => {
    const number = parseFloat(String(amount).replace(/,/g, ""));
    if (isNaN(number)) return String(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(number);
  };
  const productInfo = document.querySelector(".product-info");

  productInfo.querySelector(".product-title").textContent =
    product.ProductName || "Updating";
  const brandsDiv = productInfo.querySelector(".brands");
  if (brandsDiv) {
    brandsDiv.innerHTML = `
            <b>ProductCode:</b> ${product.ProductCode || "Updating"}
            <br />
            <b>Brand:</b> ${product.Brand || "Updating"}
        `;
  }
  const pricesDiv = productInfo.querySelector(".prices");
  if (pricesDiv) {
    const formattedPrice = formatCurrency(product.Price || "0");
    pricesDiv.innerHTML = `
            <br />
            <span class="current-price">${formattedPrice}</span>
            <br />
        `;
  }
  const specsHTML = `
        <div class="specs1">
            <b>Material:</b>
            <p>${product.Material || "Updating"}</p>
        </div>
        <div class="specs1">
            <b>Color:</b>
            <p>${product.Color || "Updating"}</p>
        </div>
        <div class="specs1">
            <b>Dimensions:</b>(length, width, height)
            <p>${product.Dimensions || "Updating"}</p>
        </div>
        <div class="specs1">
            <b>Category:</b>
            <p>${product.CategoryName || "Updating"}</p>
        </div>
    `;
  const specsContainer = document.querySelector(".specs");
  if (specsContainer) {
    specsContainer.innerHTML = specsHTML;
  }
  // --- Cập nhật Hình ảnh (Images) --- fix
  const mainImage = document.getElementById("mainImage");
  const thumbnailContainer = document.querySelector(".thumbnail-container");

  if (product.ImageURLs && Array.isArray(product.ImageURLs)) {
    const baseUrl = "http://localhost:3000/";
    const firstImageUrl =
      product.ImageURLs.length > 0
        ? baseUrl + product.ImageURLs[0]
        : "placeholder.jpg";
    if (mainImage) {
      mainImage.src = firstImageUrl;
    }
    // Cập nhật Thumbnail
    if (thumbnailContainer) {
      thumbnailContainer.innerHTML = "";
      product.ImageURLs.forEach((url, index) => {
        const img = document.createElement("img");
        img.src = baseUrl + url;
        img.alt = `thumb${index + 1}`;
        img.onclick = function () {
          changeImage(this);
        }; // Hàm chuyển ảnh
        thumbnailContainer.appendChild(img);
      });
    }
  }
  // --- Cập nhật Mô tả (Description) ---
  const descriptionPanel = document.getElementById("description");
  if (descriptionPanel) {
    descriptionPanel.innerHTML = `<p>${
      product.Description || "Product information is being updated."
    }</p>`;
  }
  // Kiểm tra tồn kho
  const addToCartBtn = document.querySelector(".add-to-cart");
  if (product.StockQuantity !== undefined && product.StockQuantity <= 0) {
    if (addToCartBtn) {
      addToCartBtn.textContent = "Out of stock";
      addToCartBtn.disabled = true;
    }
  }
}
// 4. Hàm hỗ trợ chuyển ảnh (giữ nguyên hoặc bổ sung nếu chưa có)
function changeImage(imgElement) {
  const mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.src = imgElement.src;
  }
}
document.addEventListener("DOMContentLoaded", fetchProductDetail);
//
//
// 5. Hàm thêm sản phẩm vào giỏ hàng (sử dụng Product ID và Quantity)
async function addToCart() {
  const productIdString = getProductIdFromUrl();
  const quantityInput = document.getElementById("quantity");
  const productId = parseInt(productIdString);
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  const userId = 4;
  if (!productId || isNaN(quantity) || quantity < 1) {
    console.error("Lỗi: ID sản phẩm không hợp lệ.");
    return;
  }
  const apiUrl = "http://localhost:3000/api/cart/add";
  const postData = {
    userId: userId,
    productId: productId,
    quantity: quantity,
  };
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    const result = await response.json();

    if (response.ok && result.success) {
      console.log("Sản phẩm đã được thêm vào giỏ hàng:", result.data);
      showCartNotification();
    } else {
      console.error(
        "Lỗi khi thêm sản phẩm vào giỏ hàng:",
        result.message || "Lỗi không xác định"
      );
      alert(`The product is already in your shopping cart.`);
    }
  } catch (error) {
    console.error("Lỗi trong quá trình Fetch API Add to Cart:", error);
    alert("Connection error!  Unable to add product to cart.");
  }
}
// Hàm hiện thông báo thêm vào giỏ hàng
function showCartNotification() {
  const overlay = document.getElementById("cartNotificationOverlay");
  const notification = document.getElementById("cartNotification");
  if (overlay) overlay.classList.add("show");
  setTimeout(() => {
    if (notification) notification.classList.add("show");
  }, 250);
  const autoHide = setTimeout(() => {
    hideCartNotification();
  }, 1000);
  if (notification) notification.autoHideTimeout = autoHide;

  if (overlay) {
    overlay.removeEventListener("click", hideCartNotification);
    overlay.addEventListener("click", hideCartNotification);
  }
}
// Hàm ẩn thông báo thêm vào giỏ hàng
function hideCartNotification() {
  const notification = document.getElementById("cartNotification");
  const overlay = document.getElementById("cartNotificationOverlay");
  if (notification) {
    notification.classList.remove("show");
  }
  if (overlay) {
    overlay.classList.remove("show");
  }
  if (notification && notification.autoHideTimeout) {
    clearTimeout(notification.autoHideTimeout);
    notification.autoHideTimeout = null;
  }
}

// 7. Lắng nghe sự kiện DOMContentLoaded để thêm sự kiện click
document.addEventListener("DOMContentLoaded", () => {
  fetchProductDetail(); // Tải chi tiết sản phẩm

  const addToCartBtn = document.querySelector(".add-to-cart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addToCart);
  }
});
