function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
window.displayProducts = function (products) {
  const productGrid = document.getElementById("product-grid");
  const searchSummary = document.querySelector(".search-results-info");
  if (!productGrid) return;

  if (!products || products.length === 0) {
    productGrid.innerHTML = `
      <div class="no-products">
        <h3>No suitable products found.</h3>
        <p>Please try different filters.</p>
      </div>`;
    return;
  }
  productGrid.innerHTML = "";
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productGrid.appendChild(productCard);
  });
};

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.addEventListener("click", () => {
    window.location.href = `Product_Detail.html?id=${product.ProductID}`;
  });

  let imageUrl = "LivingSpace.webp";
  try {
    if (product.ImageURLs && product.ImageURLs.startsWith("[")) {
      const images = JSON.parse(product.ImageURLs);
      imageUrl = images.length > 0 ? images[0] : "LivingSpace.webp";
    } else if (product.ImageURLs) {
      imageUrl = product.ImageURLs;
    }
  } catch (e) {
    console.warn("Lỗi parse ảnh:", e);
  }
  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }

  card.innerHTML = `
    <div class="product-image">
      <img src="${imageUrl}" alt="${product.ProductName}" 
           onerror="this.onerror=null; this.src='LivingSpace.webp'" />
    </div>
    <div class="product-info">
      <div class="product-name">${product.ProductName}</div>
      <div class="price-container">
        <div class="price">${formatPrice(product.Price)} VND</div>
      </div>
      <div style="color: #383838ff; font-size:13px; font-weight: bold; margin-top:5px">
        Color: ${product.Color || "Standard"}
      </div>
    </div>
  `;
  return card;
}

async function fetchSearchResults() {
  const searchQuery = getQueryParam("q") || "";
  const category = getQueryParam("category") || "";
  let apiUrl = `http://localhost:3000/api/products/search?q=${encodeURIComponent(
    searchQuery
  )}`;
  if (category) {
    apiUrl += `&category=${encodeURIComponent(category)}`;
  }
  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result.success) {
      // Lưu dữ liệu gốc vào biến Global để file Filter sử dụng
      window.allProducts = result.data;
      window.displayProducts(window.allProducts);
      const pageTitle = document.getElementById("page-title");
      if (pageTitle)
        pageTitle.innerHTML = searchQuery
          ? `<h2 style="font-size: 20px; margin-bottom: 15px; margin-top: 10px;">Search results for: "${searchQuery}" (${result.total} items)</h2>`
          : "All Products";
    } else {
      window.displayProducts([]);
      window.allProducts = [];
    }
  } catch (error) {
    const productGrid = document.getElementById("product-grid");
    if (productGrid)
      productGrid.innerHTML = `<h3>Server connection error!</h3>`;
  }
}

function performSearch(query) {
  window.location.href = `Result_Search.html?q=${encodeURIComponent(query)}`;
}
// Lắng nghe sự kiện Submit
document.addEventListener("submit", function (e) {
  const searchInput =
    e.target.querySelector("#searchInput") ||
    document.getElementById("searchInput");
  if (
    e.target.id === "searchForm" ||
    (searchInput && e.target.contains(searchInput))
  ) {
    e.preventDefault();
    const query = searchInput.value.trim();
    performSearch(query);
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  await fetchSearchResults();
  if (typeof window.initFilters === "function") {
    window.initFilters();
  }
});
