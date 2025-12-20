function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get(param);
  console.log(
    `🔍 getQueryParam("${param}") from "${window.location.search}" =`,
    value
  );
  return value;
}

// Hàm gọi API tìm kiếm
async function fetchSearchResults() {
  console.log("🚀 ===== BẮT ĐẦU fetchSearchResults() =====");

  const searchQuery = getQueryParam("q") || "";
  const category = getQueryParam("category") || "";
  const minPrice = getQueryParam("minPrice") || "";
  const maxPrice = getQueryParam("maxPrice") || "";
  const inStock = getQueryParam("inStock") || "";

  console.log("📊 Tham số từ URL:", {
    searchQuery,
    category,
    minPrice,
    maxPrice,
    inStock,
    fullURL: window.location.href,
  });

  // Xây dựng URL API với các tham số
  let apiUrl = "http://localhost:3000/api/products/search?";

  const params = [];

  // Debug từng tham số
  console.group("📝 Kiểm tra từng tham số:");
  if (searchQuery) {
    console.log(`✓ Thêm "q": ${searchQuery}`);
    params.push(`q=${encodeURIComponent(searchQuery)}`);
  } else {
    console.log(`✗ Không có "q" hoặc rỗng`);
  }

  if (category) {
    console.log(`✓ Thêm "category": ${category}`);
    params.push(`category=${encodeURIComponent(category)}`);
  }

  if (minPrice) {
    console.log(`✓ Thêm "minPrice": ${minPrice}`);
    params.push(`minPrice=${encodeURIComponent(minPrice)}`);
  }

  if (maxPrice) {
    console.log(`✓ Thêm "maxPrice": ${maxPrice}`);
    params.push(`maxPrice=${encodeURIComponent(maxPrice)}`);
  }

  if (inStock) {
    console.log(`✓ Thêm "inStock": ${inStock}`);
    params.push(`inStock=${encodeURIComponent(inStock)}`);
  }
  console.groupEnd();

  const paramsString = params.join("&");
  apiUrl += paramsString;

  console.log("🔗 URL API cuối cùng:", apiUrl);
  console.log("📋 Tham số gửi đi:", paramsString || "(không có tham số)");

  try {
    console.log("🔄 Đang gọi API...");
    const startTime = performance.now();

    const response = await fetch(apiUrl);
    const endTime = performance.now();

    console.log(`⏱️ Thời gian phản hồi: ${(endTime - startTime).toFixed(2)}ms`);
    console.log("📥 Response status:", response.status, response.statusText);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await response.json();
    console.log("📦 Response data từ API:", {
      success: result.success,
      total: result.total,
      dataLength: result.data ? result.data.length : 0,
      message: result.message,
      dataPreview: result.data ? result.data.slice(0, 3) : null,
    });

    if (result.success) {
      console.log(`✅ API thành công, có ${result.data.length} sản phẩm`);

      // Debug chi tiết các sản phẩm
      if (searchQuery && result.data.length > 0) {
        console.group("🔎 Kiểm tra sản phẩm tìm thấy:");
        result.data.forEach((product, index) => {
          const matchesSearch =
            product.ProductName &&
            product.ProductName.toLowerCase().includes(
              searchQuery.toLowerCase()
            );
          console.log(
            `${index + 1}. "${
              product.ProductName
            }" - Khớp với "${searchQuery}": ${matchesSearch}`
          );
        });
        console.groupEnd();
      }

      displayProducts(result.data);
      updateSearchSummary(result.total, searchQuery);
    } else {
      console.warn("⚠️ API không thành công:", result.message);
      displayNoProducts(result.message);
    }
  } catch (error) {
    console.error("❌ Lỗi khi tải dữ liệu:", error);
    console.error("🔗 URL gây lỗi:", apiUrl);
    displayError("Đã xảy ra lỗi khi tải dữ liệu sản phẩm");
  }

  console.log("🏁 ===== KẾT THÚC fetchSearchResults() =====");
}

// Hàm hiển thị sản phẩm
function displayProducts(products) {
  console.log(
    "🎨 displayProducts() được gọi với",
    products ? products.length : 0,
    "sản phẩm"
  );

  const productGrid = document.getElementById("product-grid");

  if (!productGrid) {
    console.error("❌ Không tìm thấy #product-grid trong DOM!");
    return;
  }

  if (!products || products.length === 0) {
    console.log("📭 Không có sản phẩm để hiển thị");
    displayNoProducts("Không tìm thấy sản phẩm phù hợp");
    return;
  }

  console.log(`🖼️ Hiển thị ${products.length} sản phẩm`);

  // Xóa nội dung cũ
  productGrid.innerHTML = "";

  // Tạo HTML cho từng sản phẩm
  products.forEach((product, index) => {
    console.log(
      `  ${index + 1}. ${product.ProductName} - ${product.Price} VND`
    );
    const productCard = createProductCard(product);
    productGrid.appendChild(productCard);
  });
}

// Hàm tạo thẻ sản phẩm
function createProductCard(product) {
  console.log(`🃏 Tạo card cho: ${product.ProductName}`);

  const card = document.createElement("div");
  card.className = "product-card";

  // Thêm sự kiện click
  card.addEventListener("click", () => {
    console.log(
      `👆 Click vào sản phẩm: ${product.ProductName} (ID: ${product.ProductID})`
    );
    viewProductDetail(product.ProductID);
  });

  // Xử lý hình ảnh
  let imageUrl = "";
  try {
    const images = JSON.parse(product.ImageURLs);
    imageUrl = images && images.length > 0 ? images[0] : "LivingSpace.webp";
    console.log(`  🖼️ Ảnh sản phẩm: ${imageUrl}`);
  } catch (e) {
    console.warn(`  ⚠️ Lỗi parse ImageURLs: ${e.message}`);
    imageUrl = "LivingSpace.webp";
  }

  // Hàm định dạng giá
  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }

  card.innerHTML = `
    <div class="product-image">
      <img src="${imageUrl}" alt="${product.ProductName}" 
           onerror="console.warn('❌ Lỗi tải ảnh:', this.src); this.onerror=null; this.src='LivingSpace.webp'" />
    </div>
    <div class="product-info">
      <div class="product-name">${product.ProductName}</div>
      <div class="price-container">
        <div class="price">${formatPrice(product.Price)} VND</div>
      </div>
    </div>
  `;

  return card;
}

// Hàm hiển thị thông báo khi không có sản phẩm
function displayNoProducts(message) {
  console.log(`📢 displayNoProducts: ${message}`);
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) {
    console.error("❌ Không tìm thấy #product-grid để hiển thị thông báo");
    return;
  }

  productGrid.innerHTML = `
    <div class="no-products">
      <h3>${message}</h3>
      <p>Vui lòng thử lại với từ khóa tìm kiếm khác hoặc điều chỉnh bộ lọc.</p>
      <button onclick="goBackToShop()">Quay lại cửa hàng</button>
    </div>
  `;
}

// Hàm hiển thị lỗi
function displayError(errorMessage) {
  console.error(`💥 displayError: ${errorMessage}`);
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) {
    document.body.innerHTML += `<div class="error-message"><h3>${errorMessage}</h3></div>`;
    return;
  }

  productGrid.innerHTML = `
    <div class="error-message">
      <h3>${errorMessage}</h3>
      <p>Vui lòng thử lại sau.</p>
    </div>
  `;
}

// Hàm cập nhật thông tin tìm kiếm
function updateSearchSummary(total, query) {
  console.log(`📊 updateSearchSummary: total=${total}, query="${query}"`);

  let searchSummary = document.querySelector(".search-summary");

  if (!searchSummary) {
    console.log("➕ Tạo mới .search-summary");
    searchSummary = document.createElement("div");
    searchSummary.className = "search-summary";

    if (query) {
      searchSummary.innerHTML = `<h2>Kết quả tìm kiếm cho: "${query}" (${total} sản phẩm)</h2>`;
    } else {
      searchSummary.innerHTML = `<h2>Tất cả sản phẩm (${total} sản phẩm)</h2>`;
    }

    const productGrid = document.getElementById("product-grid");
    if (productGrid && productGrid.parentNode) {
      productGrid.parentNode.insertBefore(searchSummary, productGrid);
    } else {
      console.error("❌ Không thể chèn .search-summary");
    }
  }
}

// Hàm xem chi tiết sản phẩm
function viewProductDetail(productId) {
  console.log(`🔗 Chuyển đến chi tiết sản phẩm ID: ${productId}`);
  window.location.href = `product-detail.html?id=${productId}`;
}

// Hàm quay lại cửa hàng
function goBackToShop() {
  console.log("↩️ Quay lại cửa hàng");
  window.location.href = "Products.html";
}

// Hàm thiết lập bộ lọc từ URL
function setupFiltersFromURL() {
  console.log("⚙️ setupFiltersFromURL()");

  const minPrice = getQueryParam("minPrice");
  const maxPrice = getQueryParam("maxPrice");
  const category = getQueryParam("category");

  console.log("🎚️ Thiết lập bộ lọc từ URL:", { minPrice, maxPrice, category });

  // Thiết lập giá trị cho các radio button price
  if (minPrice && maxPrice) {
    console.log(
      `💰 Tìm radio button cho khoảng giá: ${minPrice} - ${maxPrice}`
    );

    const priceRadioButtons = document.querySelectorAll('input[name="price"]');
    console.log(`📻 Tìm thấy ${priceRadioButtons.length} radio button`);

    let found = false;
    priceRadioButtons.forEach((radio, index) => {
      const labelText = radio.nextSibling ? radio.nextSibling.textContent : "";
      const includesMin = labelText.includes(minPrice);
      const includesMax = labelText.includes(maxPrice);

      console.log(
        `  Radio ${
          index + 1
        }: "${labelText}" - Có min? ${includesMin} - Có max? ${includesMax}`
      );

      if (includesMin && includesMax) {
        radio.checked = true;
        found = true;
        console.log(`  ✅ Đã chọn radio: ${labelText}`);
      }
    });

    if (!found) {
      console.warn(
        `⚠️ Không tìm thấy radio button phù hợp với ${minPrice}-${maxPrice}`
      );
    }
  } else {
    console.log("ℹ️ Không có tham số giá trong URL");
  }
}

// Hàm xử lý bộ lọc
function setupFilterEvents() {
  console.log("🎮 setupFilterEvents()");

  // Lắng nghe sự kiện thay đổi bộ lọc giá
  const priceRadios = document.querySelectorAll('input[name="price"]');
  console.log(`🎯 Lắng nghe ${priceRadios.length} radio button giá`);

  priceRadios.forEach((radio, index) => {
    radio.addEventListener("change", function () {
      console.log(
        `📻 Radio ${
          index + 1
        } thay đổi: ${this.nextSibling?.textContent?.trim()}`
      );
      applyFilters();
    });
  });

  // Lắng nghe sự kiện chọn màu sắc
  const colorCircles = document.querySelectorAll(".color-circle");
  console.log(`🎨 Lắng nghe ${colorCircles.length} màu sắc`);

  colorCircles.forEach((circle, index) => {
    circle.addEventListener("click", function () {
      console.log(
        `🎨 Click vào màu ${index + 1}: ${
          this.style.backgroundColor || this.className
        }`
      );
      applyFilters();
    });
  });
}

// Hàm áp dụng bộ lọc
function applyFilters() {
  console.log("🔘 applyFilters() được gọi");

  const selectedPrice = document.querySelector('input[name="price"]:checked');
  const urlParams = new URLSearchParams(window.location.search);

  console.log("📋 URL params hiện tại:", urlParams.toString());
  console.log(
    "💲 Radio được chọn:",
    selectedPrice?.nextSibling?.textContent?.trim()
  );

  // Xóa các tham số filter cũ
  urlParams.delete("minPrice");
  urlParams.delete("maxPrice");
  console.log("🧹 Đã xóa minPrice và maxPrice cũ");

  if (selectedPrice) {
    const priceText = selectedPrice.nextSibling.textContent.trim();
    console.log(`💰 Xử lý khoảng giá: "${priceText}"`);

    // Phân tích khoảng giá từ text
    if (priceText.includes("Under")) {
      urlParams.set("maxPrice", "500000");
      console.log("💰 Khoảng giá: Under 500,000");
    } else if (priceText.includes("Above")) {
      urlParams.set("minPrice", "5000000");
      console.log("💰 Khoảng giá: Above 5,000,000");
    } else {
      const priceRange = priceText.match(/(\d+,?\d*)/g);
      console.log("💰 Tìm thấy số trong text:", priceRange);

      if (priceRange && priceRange.length >= 2) {
        const min = priceRange[0].replace(/,/g, "");
        const max = priceRange[1].replace(/,/g, "");
        urlParams.set("minPrice", min);
        urlParams.set("maxPrice", max);
        console.log(`💰 Khoảng giá: ${min} - ${max}`);
      } else {
        console.warn("⚠️ Không thể phân tích khoảng giá từ:", priceText);
      }
    }
  } else {
    console.log("ℹ️ Không có radio giá nào được chọn");
  }

  // Chuyển hướng với bộ lọc mới
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  console.log("🔄 Chuyển hướng đến:", newUrl);
  window.location.href = newUrl;
}

// Hàm khởi tạo
async function init() {
  console.log("🚀 ===== BẮT ĐẦU KHỞI TẠO ===== ");
  console.log("📍 Trang hiện tại:", window.location.href);
  console.log("📄 Pathname:", window.location.pathname);
  console.log("🔍 Query string:", window.location.search);

  // Kiểm tra DOM element
  const productGrid = document.getElementById("product-grid");
  console.log("🎯 #product-grid tồn tại?", !!productGrid);

  if (!productGrid) {
    console.error("❌ KHÔNG TÌM THẤY #product-grid trong DOM!");
    console.log("🔍 Toàn bộ body HTML:", document.body.innerHTML);
  }

  // Lấy dữ liệu từ API
  console.log("📥 Bắt đầu gọi API...");
  await fetchSearchResults();

  // Thiết lập bộ lọc từ URL
  console.log("⚙️ Thiết lập bộ lọc từ URL...");
  setupFiltersFromURL();

  // Thiết lập sự kiện cho bộ lọc
  console.log("🎮 Thiết lập sự kiện bộ lọc...");
  setupFilterEvents();

  console.log("✅ ===== KHỞI TẠO HOÀN TẤT ===== ");
}

// Thêm CSS cho debug
function addDebugStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .debug-info {
      background: #f0f0f0;
      padding: 10px;
      margin: 10px 0;
      border-left: 4px solid #007bff;
      font-family: monospace;
      font-size: 12px;
    }
    .product-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
}

// Chạy khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM đã tải xong");
  console.clear(); // Xóa console cũ để dễ theo dõi
  console.log(
    "%c🔍 DEBUG MODE ĐÃ BẬT",
    "color: white; background: #007bff; padding: 5px 10px; border-radius: 3px; font-weight: bold;"
  );

  // Thêm CSS debug
  addDebugStyles();

  // Chạy init
  init().catch((error) => {
    console.error("❌ Lỗi trong init():", error);
    displayError("Đã xảy ra lỗi khi khởi tạo trang");
  });
});

// Thêm global helper
window.debugSearch = {
  getCurrentParams: function () {
    return {
      q: getQueryParam("q"),
      category: getQueryParam("category"),
      minPrice: getQueryParam("minPrice"),
      maxPrice: getQueryParam("maxPrice"),
      inStock: getQueryParam("inStock"),
      fullURL: window.location.href,
    };
  },
  reloadSearch: function () {
    console.log("🔄 Tải lại tìm kiếm...");
    fetchSearchResults();
  },
  clearFilters: function () {
    console.log("🧹 Xóa tất cả bộ lọc...");
    window.location.href = window.location.pathname;
  },
};

// 1. Xử lý sự kiện nhấn phím Enter (Event Delegation)
document.addEventListener("keydown", function (e) {
  // Kiểm tra xem phím nhấn có phải Enter và mục tiêu có phải là ô input search không
  if (e.key === "Enter" && e.target && e.target.id === "searchInput") {
    e.preventDefault(); // Chặn hành động mặc định (tránh reload trang rỗng)
    const query = e.target.value.trim();
    console.log("⌨️ Phát hiện nhấn Enter với từ khóa:", query);

    if (query) {
      window.location.href = `Result_Search.html?q=${encodeURIComponent(
        query
      )}`;
    } else {
      window.location.href = `Result_Search.html`;
    }
  }
});

// Thêm hàm này vào Result_Search.js
function setupGlobalSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchButton");

  console.log("🔍 Đang thiết lập bộ gõ tìm kiếm...", {
    input: !!input,
    btn: !!btn,
  });

  if (input) {
    // Chặn phím Enter để không bị dính lỗi URL "?" rỗng
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Chặn đứng trình duyệt reload trang
        const query = input.value.trim();
        console.log("⌨️ Nhấn Enter tìm kiếm:", query);
        window.location.href = `Result_Search.html?q=${encodeURIComponent(
          query
        )}`;
      }
    });
  }

  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const query = input ? input.value.trim() : "";
      window.location.href = `Result_Search.html?q=${encodeURIComponent(
        query
      )}`;
    });
  }
}

// Thay thế đoạn code xử lý sự kiện ở cuối file Result_Search.js của bạn

// Sử dụng Event Delegation để bắt sự kiện Submit của Form (kể cả khi form được fetch vào sau)
document.addEventListener("submit", function (e) {
  // Kiểm tra xem form chứa ô searchInput có đang bị submit không
  if (e.target.querySelector("#searchInput") || e.target.id === "searchForm") {
    e.preventDefault(); // CHẶN tuyệt đối việc reload trang mặc định của trình duyệt

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      const query = searchInput.value.trim();
      console.log("🚀 Form Submit - Từ khóa:", query);

      // Thực hiện chuyển hướng thủ công kèm tham số đúng
      if (query) {
        window.location.href = `Result_Search.html?q=${encodeURIComponent(
          query
        )}`;
      } else {
        window.location.href = `Result_Search.html`;
      }
    }
  }
});

// Bổ sung: Lắng nghe trực tiếp phím Enter trên ô input để chắc chắn
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && e.target.id === "searchInput") {
    e.preventDefault(); // Chặn trình duyệt submit form rỗng
    const query = e.target.value.trim();

    window.location.href = query
      ? `Result_Search.html?q=${encodeURIComponent(query)}`
      : `Result_Search.html`;
  }
});
