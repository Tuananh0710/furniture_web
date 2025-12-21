function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  return productId;
}
const PRODUCT_ID = getProductIdFromUrl();
const API_URL = `http://localhost:3000/api/products/${PRODUCT_ID}/related`;

async function loadRelatedProducts() {
  const relatedProductsGrid = document.querySelector(
    ".related-products .products-grid"
  );
  if (!relatedProductsGrid) {
    return;
  }
  relatedProductsGrid.innerHTML = "";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const products = result.data;
    if (products && products.length > 0) {
      products.forEach((product, index) => {
        const productCard = document.createElement("div");
        productCard.classList.add("products-card");
        const formattedPrice =
          new Intl.NumberFormat("vi-VN").format(product.Price) + " VND";
        let imageUrl = "placeholder.webp";
        try {
          const images = JSON.parse(product.ImageURLs);
          if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
          } else {
            console.log(
              `⚠️ No images in array or not an array, using placeholder`
            );
          }
        } catch (e) {
          console.error("❌ Lỗi phân tích ImageURLs:", e, "Using placeholder");
        }
        productCard.innerHTML = `
          <img src="${imageUrl}" alt="${product.ProductName}" />
          <div class="products-info">
            <div class="product-name">${product.ProductName}</div>
            <div class="prices">${formattedPrice}</div>
            <div style="color: #383838ff; font-size:13px; font-weight: bold; margin-top:5px" >Color: ${product.Color}</div>
          </div>
        `;
        productCard.addEventListener("click", () => {
          window.location.href = `Product_Detail.html?id=${product.ProductID}`;
        });
        relatedProductsGrid.appendChild(productCard);
      });
    } else {
      relatedProductsGrid.innerHTML = "<p>No related products were found.</p>";
    }
  } catch (error) {
    relatedProductsGrid.innerHTML =
      "<p>An error occurred while loading the related product.</p>";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  loadRelatedProducts();
});
