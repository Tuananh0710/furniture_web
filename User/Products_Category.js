// Hàm để lấy tham số từ URL
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Lấy category hoặc subcategory từ URL
const categoryId = getUrlParameter("category");
const subcategoryId = getUrlParameter("subcategory");

// API URLs
const API_BASE = "http://localhost:3000/api";

const CATEGORY_MAP = {
  1: "Sofa",
  2: "Dresser",
  3: "Nightstands",
  4: "Bed",
  5: "Bookcase",
  6: "BeanBag Chair",
  7: "Dining tables",
  8: "Dining chairs",
  9: "Bar & Kitchen",
  10: "Desks",
  11: "Desk chairs",
  12: "TV Sheft",
};

const PARENT_CATEGORY_MAP = {
  1: "Living Room",
  2: "Bed Room",
  3: "Dining & Kitchen",
  4: "Office Room",
};

async function loadProducts() {
  let apiUrl = "";
  let pageTitle = "All Products";
  let breadcrumbText = '<a href="Home.html">Home</a> &gt; All Products';

  console.log("ParentCategory ID:", categoryId);
  console.log("categoryID: ", subcategoryId);

  // Xác định API endpoint dựa trên tham số
  if (subcategoryId) {
    // Lấy sản phẩm theo categoryID (subcategory)
    apiUrl = `${API_BASE}/categories/category/${subcategoryId}`;
    pageTitle = CATEGORY_MAP[subcategoryId] || "Category";
    breadcrumbText = `<a href="Home.html">Home</a> &gt; ${pageTitle}`;
  } else if (categoryId) {
    // Lấy sản phẩm theo parentCategoryID
    apiUrl = `${API_BASE}/categories/parent-category/${categoryId}`;
    pageTitle = PARENT_CATEGORY_MAP[categoryId] || "Category";
    breadcrumbText = `<a href="Home.html">Home</a> &gt; ${pageTitle}`;
  } else {
    // Không có tham số - hiển thị tất cả sản phẩm
    apiUrl = `${API_BASE}/products`;
  }

  console.log("API URL:", apiUrl);

  // Cập nhật tiêu đề và breadcrumb
  document.getElementById("page-title").textContent = pageTitle;
  document.getElementById("breadcrumb").innerHTML = breadcrumbText;

  // Tải danh sách categories cho sidebar
  await loadCategories();

  // Tải sản phẩm
  try {
    console.log("Fetching products from:", apiUrl);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    displayProducts(data);
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById(
      "product-grid"
    ).innerHTML = `<div class="error-message">
          <p>Error loading products: ${error.message}</p>
          <p>API URL: ${apiUrl}</p>
        </div>`;
  }
}

async function loadCategories() {
  // Tải danh sách categories cho sidebar
  try {
    console.log("Loading categories from:", `${API_BASE}/categories`);
    const response = await fetch(`${API_BASE}/categories`);

    if (!response.ok) {
      console.warn(
        `Categories API returned ${response.status}, using static data`
      );
      displayStaticCategories();
      return;
    }

    const data = await response.json();
    console.log("Categories response:", data);

    // Xử lý nhiều định dạng response
    let categories = [];

    // TH1: {success: true, data: {rows: [...]}}
    if (data && data.success && data.data && data.data.rows) {
      categories = data.data.rows;
    }
    // TH2: {rows: [...]}
    else if (data && data.rows && Array.isArray(data.rows)) {
      categories = data.rows;
    }
    // TH3: {data: [...]}
    else if (data && data.data && Array.isArray(data.data)) {
      categories = data.data;
    }
    // TH4: [...]
    else if (Array.isArray(data)) {
      categories = data;
    }
    // TH5: Object khác
    else if (typeof data === "object") {
      // Thử tìm mảng trong object
      for (const key in data) {
        if (Array.isArray(data[key])) {
          categories = data[key];
          break;
        }
      }

      // Nếu không tìm thấy mảng, chuyển object thành mảng
      if (categories.length === 0) {
        categories = Object.values(data);
      }
    }

    console.log("Processed categories:", categories);

    if (categories.length > 0) {
      displayCategories(categories);
    } else {
      console.warn("No categories found in response, using static data");
      displayStaticCategories();
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    displayStaticCategories();
  }
}

function displayStaticCategories() {
  // Hiển thị categories tĩnh nếu API không hoạt động

  const staticCategories = [
    { CategoryID: 1, CategoryName: "Sofa" },
    { CategoryID: 6, CategoryName: "BeanBag Chair" },
    { CategoryID: 12, CategoryName: "TV Sheft" },
    { CategoryID: 4, CategoryName: "Bed" },
    { CategoryID: 3, CategoryName: "Nightstands" },
    { CategoryID: 2, CategoryName: "Dresser" },
    { CategoryID: 7, CategoryName: "Dining tables" },
    { CategoryID: 8, CategoryName: "Dining chairs" },
    { CategoryID: 9, CategoryName: "Bar & Kitchen" },
    { CategoryID: 5, CategoryName: "Bookcase" },
    { CategoryID: 10, CategoryName: "Desks" },
    { CategoryID: 11, CategoryName: "Desk chairs" },
  ];
  displayCategories(staticCategories);
}

function displayCategories(categories) {
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = "";

  if (!Array.isArray(categories)) {
    console.error("Categories is not an array:", categories);
    categoryList.innerHTML = "<li>Error loading categories</li>";
    return;
  }

  // Lọc categories để chỉ hiển thị những category chính
  const mainCategories = categories.filter(
    (cat) =>
      cat.ParentCategoryID == cat.CategoryID ||
      [1, 2, 3].includes(cat.CategoryID)
  );

  // Nếu không có main categories, hiển thị tất cả
  const categoriesToShow =
    mainCategories.length > 0 ? mainCategories : categories;

  categoriesToShow.forEach((category) => {
    if (category.CategoryID && category.CategoryName) {
      const li = document.createElement("li");
      li.className = "Category";
      const a = document.createElement("a");
      a.href = `Products.html?subcategory=${category.CategoryID}`;
      a.textContent = category.CategoryName;
      li.appendChild(a);
      categoryList.appendChild(li);
    }
  });

  // Nếu không có category nào được hiển thị
  if (categoryList.children.length === 0) {
    categoryList.innerHTML = "<li>No categories available</li>";
  }
}

function displayProducts(productsData) {
  const productGrid = document.getElementById("product-grid");
  productGrid.innerHTML = "";

  console.log("Displaying products:", productsData);

  // Kiểm tra và chuyển đổi dữ liệu thành mảng
  let productsArray = [];

  // Phân tích response structure
  if (
    productsData &&
    productsData.success &&
    productsData.data &&
    productsData.data.rows
  ) {
    // Format: {success: true, data: {rows: [...]}}
    productsArray = productsData.data.rows;
  } else if (
    productsData &&
    productsData.rows &&
    Array.isArray(productsData.rows)
  ) {
    // Format: {rows: [...]}
    productsArray = productsData.rows;
  } else if (
    productsData &&
    productsData.data &&
    Array.isArray(productsData.data)
  ) {
    // Format: {data: [...]}
    productsArray = productsData.data;
  } else if (Array.isArray(productsData)) {
    // Format: [...]
    productsArray = productsData;
  } else if (productsData && typeof productsData === "object") {
    // Thử tìm mảng trong object
    for (const key in productsData) {
      if (Array.isArray(productsData[key])) {
        productsArray = productsData[key];
        break;
      }
    }
  }

  console.log("Processed products array:", productsArray);

  if (!Array.isArray(productsArray) || productsArray.length === 0) {
    productGrid.innerHTML = `
        <div class="no-products">
          <h3>No products found</h3>
          <p>There are no products available in this category.</p>
          <a href="Products.html" class="btn-view-all">View All Products</a>
        </div>`;
    return;
  }

  // Hiển thị sản phẩm
  productsArray.forEach((product) => {
    if (!product || typeof product !== "object") {
      console.warn("Invalid product data:", product);
      return;
    }

    // Lấy thông tin sản phẩm
    const productId = product.ProductID || product.id || "";
    const productName =
      product.ProductName || product.Name || "Unnamed Product";
    const price = product.Price || product.price || 0;
    const oldPrice = product.OldPrice || product.oldPrice || null;

    // Xử lý hình ảnh
    let imageUrl = "LivingSpace.webp"; // Giá trị mặc định

    if (product.ImageURLs) {
      try {
        // Thử parse nếu là JSON
        const urls = JSON.parse(product.ImageURLs);
        if (Array.isArray(urls) && urls.length > 0) {
          imageUrl = urls[0];
        } else if (typeof urls === "string") {
          imageUrl = urls;
        }
      } catch (e) {
        // Nếu không phải JSON, dùng trực tiếp
        if (typeof product.ImageURLs === "string") {
          imageUrl = product.ImageURLs;
        }
      }
    }

    // Tạo card sản phẩm
    const productCard = document.createElement("a");
    productCard.href = `Product_Detail.html?id=${productId}`;
    productCard.className = "product-link";

    const cardDiv = document.createElement("div");
    cardDiv.className = "product-card";

    // Tạo HTML cho sản phẩm
    cardDiv.innerHTML = `
        <div class="product-image">
          <img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.src='LivingSpace.webp'" />
        </div>
        <div class="product-info">
          <div class="product-name">${productName}</div>
          <div class="price-container">
            <div class="price">${formatPrice(price)}₫</div>
            ${
              oldPrice
                ? `<div class="old-price">${formatPrice(oldPrice)}₫</div>`
                : ""
            }
          </div>
        </div>
      `;

    productCard.appendChild(cardDiv);
    productGrid.appendChild(productCard);
  });
}

function formatPrice(price) {
  try {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return "0";
    return priceNum.toLocaleString("vi-VN");
  } catch (e) {
    return "0";
  }
}

// Tải sản phẩm khi trang được load
document.addEventListener("DOMContentLoaded", loadProducts);

// Thêm event listener cho filter và sort (nếu có)
function setupEventListeners() {
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      console.log("Sort by:", this.value);
      // Thêm logic sort tại đây
    });
  }
}

// Gọi setup khi DOM ready
document.addEventListener("DOMContentLoaded", setupEventListeners);
