function getProductIdFromUrl() {
  console.log("🔍 getProductIdFromUrl() called");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  console.log("📊 URL search params:", window.location.search);
  console.log("🆔 Extracted product ID:", productId);
  return productId;
}

const PRODUCT_ID = getProductIdFromUrl();
console.log("🎯 PRODUCT_ID constant:", PRODUCT_ID);

const API_URL = `http://localhost:3000/api/products/${PRODUCT_ID}/related`;
console.log("🌐 API URL constructed:", API_URL);

// Hàm gọi API và hiển thị sản phẩm liên quan
async function loadRelatedProducts() {
  console.log("🚀 loadRelatedProducts() started");

  const relatedProductsGrid = document.querySelector(
    ".related-products .products-grid"
  );
  console.log("📦 relatedProductsGrid element:", relatedProductsGrid);

  if (!relatedProductsGrid) {
    console.error("❌ Cannot find .related-products .products-grid element");
    return;
  }

  relatedProductsGrid.innerHTML = "";
  console.log("🧹 Cleared relatedProductsGrid content");

  try {
    console.log("📡 Fetching from API:", API_URL);
    console.time("⏱️ API Fetch Time");
    const response = await fetch(API_URL);
    console.timeEnd("⏱️ API Fetch Time");

    console.log("📥 Response received:", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("📝 Parsing response to JSON...");
    console.time("⏱️ JSON Parse Time");
    const result = await response.json();
    console.timeEnd("⏱️ JSON Parse Time");

    console.log("📦 API result structure:", {
      hasData: !!result.data,
      dataType: typeof result.data,
      fullResult: result,
    });

    const products = result.data;
    console.log("🛒 Products extracted:", {
      isArray: Array.isArray(products),
      length: products?.length,
      firstProduct: products?.[0],
    });

    if (products && products.length > 0) {
      console.log(`✅ Found ${products.length} related products`);

      products.forEach((product, index) => {
        console.log(
          `\n🎨 Processing product ${index + 1}/${products.length}:`,
          {
            id: product.ProductID,
            name: product.ProductName,
            price: product.Price,
            imageURLs: product.ImageURLs,
          }
        );

        const productCard = document.createElement("div");
        productCard.classList.add("products-card");

        const formattedPrice =
          new Intl.NumberFormat("vi-VN").format(product.Price) + "₫";
        console.log(`💰 Formatted price: ${formattedPrice}`);

        // Lấy URL ảnh đầu tiên, giả định ImageURLs là chuỗi JSON
        let imageUrl = "placeholder.webp"; // Ảnh mặc định
        try {
          console.log(`🖼️ Processing ImageURLs: ${product.ImageURLs}`);
          const images = JSON.parse(product.ImageURLs);
          console.log(`📸 Parsed images:`, images);

          if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
            console.log(`✅ Using first image: ${imageUrl}`);
          } else {
            console.log(
              `⚠️ No images in array or not an array, using placeholder`
            );
          }
        } catch (e) {
          console.error("❌ Lỗi phân tích ImageURLs:", e, "Using placeholder");
        }

        console.log(`🎨 Creating HTML for product card...`);
        productCard.innerHTML = `
          <img src="${imageUrl}" alt="${product.ProductName}" />
          <div class="products-info">
            <div class="product-name">${product.ProductName}</div>
            <div class="prices">${formattedPrice}</div>
          </div>
        `;

        // Thêm sự kiện click để chuyển đến trang chi tiết sản phẩm
        productCard.addEventListener("click", () => {
          console.log(
            `🖱️ Clicked on product: ${product.ProductID} - ${product.ProductName}`
          );
          window.location.href = `Product_Detail.html?id=${product.ProductID}`;
        });

        relatedProductsGrid.appendChild(productCard);
        console.log(`✅ Product card ${index + 1} added to grid`);
      });

      console.log(`\n🎉 All ${products.length} products added to grid`);
      console.log(
        "📊 Grid children count:",
        relatedProductsGrid.children.length
      );
    } else {
      console.log("📭 No products found in response");
      relatedProductsGrid.innerHTML = "<p>No related products were found.</p>";
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm liên quan:", {
      error: error,
      message: error.message,
      stack: error.stack,
    });
    relatedProductsGrid.innerHTML =
      "<p>An error occurred while loading the related product.</p>";
  }

  console.log("🏁 loadRelatedProducts() completed");
}

console.log("📋 DOMContentLoaded listener registered");
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOMContentLoaded fired");
  console.log("🎬 Starting loadRelatedProducts...");
  loadRelatedProducts();
});

// Log thêm thông tin khi trang tải
console.log("🔄 Script loaded, waiting for DOMContentLoaded...");
console.log("🔗 Current page URL:", window.location.href);
console.log("🔗 Current page search params:", window.location.search);
