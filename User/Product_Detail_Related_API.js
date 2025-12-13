function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}
const PRODUCT_ID = getProductIdFromUrl();
const API_URL = `http://localhost:3000/api/products/${PRODUCT_ID}/related`;

// Hàm gọi API và hiển thị sản phẩm liên quan
async function loadRelatedProducts() {
  const relatedProductsGrid = document.querySelector(
    ".related-products .products-grid"
  );
  relatedProductsGrid.innerHTML = "";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const products = result.data;

    if (products && products.length > 0) {
      products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.classList.add("products-card");
        const formattedPrice =
          new Intl.NumberFormat("vi-VN").format(product.Price) + "₫";

        // Lấy URL ảnh đầu tiên, giả định ImageURLs là chuỗi JSON
        let imageUrl = "placeholder.webp"; // Ảnh mặc định
        try {
          const images = JSON.parse(product.ImageURLs);
          if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
          }
        } catch (e) {
          console.error("Lỗi phân tích ImageURLs:", e);
        }

        productCard.innerHTML = `
                    <img src="${imageUrl}" alt="${product.ProductName}" />
                    <div class="products-info">
                        <div class="product-name">${product.ProductName}</div>
                        <div class="prices">${formattedPrice}</div>
                    </div>
                `;
        // Thêm sự kiện click để chuyển đến trang chi tiết sản phẩm
        productCard.addEventListener("click", () => {
          window.location.href = `Product_Detail.html?id=${product.ProductID}`;
        });

        relatedProductsGrid.appendChild(productCard);
      });
    } else {
      relatedProductsGrid.innerHTML = "<p>No related products were found.</p>";
    }
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    relatedProductsGrid.innerHTML =
      "<p>An error occurred while loading the related product.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadRelatedProducts);
