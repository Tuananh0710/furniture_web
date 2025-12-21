function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("Id");
}

async function fetchProductDetail() {
  const productId = getProductIdFromUrl();

  if (!productId || productId === "undefined" || productId === "null") {
    document.querySelector(".product-info").innerHTML = `
      <div style="color: red; padding: 20px;">
        <h2>Product ID not found</h2>
        <p>URL: ${window.location.href}</p>
      </div>`;
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
      document.querySelector(".product-info").innerHTML = `
        <h2>No data was found for this product.</h2>
        <p>Product ID: ${productId}</p>
        <p>API Response: ${JSON.stringify(result)}</p>`;
    }
  } catch (error) {
    document.querySelector(".product-info").innerHTML = `
      <h2>Unable to load product information.</h2>
      <p>Error: ${error.message}</p>
      <p>Product ID: ${productId}</p>
      <p>Please check your API connection at: <code>http://localhost:3000/api/products/${productId}</code></p>`;
  }
}

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

  const mainImage = document.getElementById("mainImage");
  const thumbnailContainer = document.querySelector(".thumbnail-container");

  let imageUrls = [];

  try {
    if (product.ImageURLs) {
      if (typeof product.ImageURLs === "string") {
        imageUrls = JSON.parse(product.ImageURLs);
      } else if (Array.isArray(product.ImageURLs)) {
        imageUrls = product.ImageURLs;
      }
    }
  } catch (error) {
    imageUrls = [];
  }

  const baseUrl = "";

  if (imageUrls && imageUrls.length > 0) {
    const firstImageUrl = baseUrl + imageUrls[0];
    if (mainImage) {
      mainImage.src = firstImageUrl;
      mainImage.onerror = function () {
        this.src = "placeholder.jpg";
      };
    }
    if (thumbnailContainer) {
      thumbnailContainer.innerHTML = "";
      imageUrls.forEach((url, index) => {
        const img = document.createElement("img");
        const fullUrl = baseUrl + url;

        img.src = fullUrl;
        img.alt = `thumb${index + 1}`;
        img.title = `Hình ${index + 1}`;
        img.onerror = function () {
          this.src = "placeholder.jpg";
        };
        img.onclick = function () {
          changeImage(this);
        };
        thumbnailContainer.appendChild(img);
      });
    }
  } else {
    if (mainImage) {
      mainImage.src = "placeholder.jpg";
    }
    if (thumbnailContainer) {
      thumbnailContainer.innerHTML = "<p>No images available</p>";
    }
  }
  const descriptionPanel = document.getElementById("description");
  if (descriptionPanel) {
    descriptionPanel.innerHTML = `<p>${
      product.Description || "Product information is being updated."
    }</p>`;
  }
  const addToCartBtn = document.querySelector(".add-to-cart");
  if (product.StockQuantity !== undefined && product.StockQuantity <= 0) {
    if (addToCartBtn) {
      addToCartBtn.textContent = "Out of stock";
      addToCartBtn.disabled = true;
    }
  }
}
function changeImage(imgElement) {
  const mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.src = imgElement.src;
  }
}
document.addEventListener("DOMContentLoaded", fetchProductDetail);

async function addToCart() {
  const productIdString = getProductIdFromUrl();
  const quantityInput = document.getElementById("quantity");
  const productId = parseInt(productIdString);
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  const userId = getUserId();
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
      showCartNotification();
    } else {
      alert(`The product is already in your shopping cart.`);
    }
  } catch (error) {
    alert("Connection error!  Unable to add product to cart.");
  }
}

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

function getUserId() {
  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    return user.id || user.userId || user.UserID;
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProductDetail();
  const addToCartBtn = document.querySelector(".add-to-cart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addToCart);
  }
});
