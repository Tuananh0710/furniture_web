async function fetchProducts(limit = 10) {
  try {
    const response = await fetch(`http://localhost:3000/api/products`);
    if (!response.ok) {
      return [];
    }
    const result = await response.json();
    const products = result.data || [];
    if (products.length > 0) {
    }
    return products;
  } catch (error) {
    return [];
  }
}

function formatPrice(price) {
  if (!price) {
    return "Liên hệ";
  }
  try {
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber)) {
      return price + " VND";
    }
    const formatted = priceNumber.toLocaleString("vi-VN") + " VND";
    return formatted;
  } catch (e) {
    return price + " VND";
  }
}

function createProductHTML(product, isDetailPage = false) {
  let imageUrl = "";
  try {
    if (product.ImageURLs) {
      let imageUrls;
      if (typeof product.ImageURLs === "string") {
        try {
          imageUrls = JSON.parse(product.ImageURLs);
        } catch (parseError) {
          imageUrls = [product.ImageURLs];
        }
      } else {
        imageUrls = product.ImageURLs;
      }
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        imageUrl = imageUrls[0];
      }
    }
  } catch (e) {
    console.error(`[ERROR] Lỗi khi parse ImageURLs:`, e);
  }
  const testPaths = [imageUrl];
  if (imageUrl) {
    fullImageUrl = testPaths[0];
  }
  const priceHTML = formatPrice(product.Price);
  const productHTML = `
    <div class="product" data-product-id="${product.ProductID}">
      <img src="${fullImageUrl}" alt="${product.ProductName}" 
           class="product-image"
           loading="lazy"
           onerror="handleImageError(this, ${JSON.stringify(testPaths)})" />
      <h3>${product.ProductName}</h3>
      <p class="price">${priceHTML}</p>
    </div>
  `;
  if (isDetailPage) {
    return `
      <a href="Product_Detail.html?id=${product.ProductID}" class="gallery">
        ${productHTML}
      </a>
    `;
  }
  return productHTML;
}

function renderFeaturedProducts(products) {
  const productSections = document.querySelectorAll(".product-section");
  const featuredSection = productSections[0];
  const container = featuredSection
    ? featuredSection.querySelector(".gallery")
    : null;
  if (!container) {
    return;
  }
  container.innerHTML = "";

  const featuredProducts = products.slice(0, 5);
  if (featuredProducts.length === 0) {
    container.innerHTML = `<div class="no-products">Không có sản phẩm</div>`;
    return;
  }
  featuredProducts.forEach((product, index) => {
    const productHTML = createProductHTML(product, true);
    container.innerHTML += productHTML;
  });
}

function renderNewArrivals(products) {
  const productSections = document.querySelectorAll(".product-section");
  const newArrivalsSection = productSections[productSections.length - 1];
  const container = newArrivalsSection
    ? newArrivalsSection.querySelector(".gallery")
    : null;
  if (!container) {
    return;
  }
  container.innerHTML = "";
  const sortedProducts = [...products].sort((a, b) => {
    return new Date(b.CreatedAt) - new Date(a.CreatedAt);
  });

  const newArrivals = [...sortedProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  if (newArrivals.length === 0) {
    container.innerHTML = `<div class="no-products">Không có sản phẩm mới</div>`;
    return;
  }
  newArrivals.forEach((product, index) => {
    const productHTML = createProductHTML(product, true);
    container.innerHTML += productHTML;
  });
}

async function loadProducts() {
  const products = await fetchProducts(10);
  renderFeaturedProducts(products);
  renderNewArrivals(products);
}

loadProducts();
