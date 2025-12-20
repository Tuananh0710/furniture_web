// Hàm để lấy tham số từ URL
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

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
  const categoryId = getUrlParameter("category");
  const subcategoryId = getUrlParameter("subcategory");
  const searchQuery = getUrlParameter("q");
  if (searchQuery) {
    await loadCategories();
    return;
  }
  let apiUrl = `${API_BASE}/products`;
  let pageTitle = "All Products";
  let breadcrumbText = '<a href="Home.html">Home</a> &gt; All Products';

  if (subcategoryId) {
    apiUrl = `${API_BASE}/categories/category/${subcategoryId}`;
    pageTitle = CATEGORY_MAP[subcategoryId] || "Category";
    breadcrumbText = `<a href="Home.html">Home</a> &gt; <a href="Products.html?category=${getParentCategoryId(
      subcategoryId
    )}">${getParentCategoryName(subcategoryId)}</a> &gt; ${pageTitle}`;
  } else if (categoryId) {
    apiUrl = `${API_BASE}/categories/parent-category/${categoryId}`;
    pageTitle = PARENT_CATEGORY_MAP[categoryId] || "Category";
    breadcrumbText = `<a href="Home.html">Home</a> &gt; ${pageTitle}`;
  } else if (searchQuery) {
    await loadCategories();
    return;
  }

  document.getElementById("page-title").textContent = pageTitle;
  document.getElementById("breadcrumb").innerHTML = breadcrumbText;

  await loadCategories();

  try {
    console.log("Fetching products from:", apiUrl);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.allProducts = extractProductsArray(data);

    displayProducts(data);
    if (typeof window.initFilters === "function") {
      window.initFilters();
    }
  } catch (error) {
    console.error("Error loading products:", error);
    const productGrid = document.getElementById("product-grid");
    if (productGrid) {
      productGrid.innerHTML = `<div class="error-message">
          <p>Error loading products: ${error.message}</p>
          <p>API URL: ${apiUrl}</p>
        </div>`;
    }
  }
}

function getParentCategoryId(subcategoryId) {
  const subToParentMap = {
    1: 1,
    6: 1,
    12: 1,
    4: 2,
    3: 2,
    2: 2,
    7: 3,
    8: 3,
    9: 3,
    5: 4,
    10: 4,
    11: 4,
  };
  return subToParentMap[subcategoryId] || 1;
}

// Hàm helper để lấy parent category name
function getParentCategoryName(subcategoryId) {
  const parentId = getParentCategoryId(subcategoryId);
  return PARENT_CATEGORY_MAP[parentId] || "Category";
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) {
      displayStaticCategories();
      return;
    }
    const data = await response.json();
    let categories = [];

    if (typeof data === "object") {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          categories = data[key];
          break;
        }
      }
    }
    if (categories.length > 0) {
      displayCategories(categories);
    } else {
      displayStaticCategories();
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    displayStaticCategories();
  }
}

function displayStaticCategories() {
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
  if (!categoryList) {
    return;
  }
  categoryList.innerHTML = "";

  if (!Array.isArray(categories)) {
    categoryList.innerHTML = "<li>Error loading categories</li>";
    return;
  }

  const currentParentCategoryId = getUrlParameter("category");
  const currentSubcategoryId = getUrlParameter("subcategory");

  let categoriesToDisplay = [];
  let parentIdToFilter = null;

  if (currentParentCategoryId) {
    parentIdToFilter = currentParentCategoryId;
  } else if (currentSubcategoryId) {
    parentIdToFilter = findParentIdBySubcategoryId(
      parseInt(currentSubcategoryId),
      categories
    );
  }

  if (parentIdToFilter) {
    categoriesToDisplay = categories.filter(
      (cat) =>
        cat.ParentCategoryID &&
        cat.ParentCategoryID.toString() === parentIdToFilter &&
        cat.CategoryID !== cat.ParentCategoryID
    );

    if (categoriesToDisplay.length === 0) {
      categoriesToDisplay = getSubcategoriesByParentId(
        parseInt(parentIdToFilter),
        categories
      );
    }
  } else {
    categoriesToDisplay = categories.filter(
      (cat) =>
        cat.CategoryID &&
        cat.ParentCategoryID &&
        cat.CategoryID !== cat.ParentCategoryID
    );
    if (categoriesToDisplay.length === 0) {
      categoriesToDisplay = categories;
    }
  }
  if (categoriesToDisplay.length === 0) {
    categoryList.innerHTML = "<li>No categories available</li>";
    return;
  }
  // Tạo list categories
  categoriesToDisplay.forEach((category) => {
    if (category.CategoryID && category.CategoryName) {
      const li = document.createElement("li");
      li.className = "category-item";
      if (
        currentSubcategoryId &&
        category.CategoryID.toString() === currentSubcategoryId
      ) {
        li.classList.add("active");
      }
      const a = document.createElement("a");
      a.href = `Products.html?subcategory=${category.CategoryID}`;
      a.textContent = category.CategoryName;
      li.appendChild(a);
      categoryList.appendChild(li);
    }
  });
}

function findParentIdBySubcategoryId(subcategoryId, allCategories) {
  const foundCategory = allCategories.find(
    (cat) =>
      cat.CategoryID && cat.CategoryID.toString() === subcategoryId.toString()
  );
  if (foundCategory && foundCategory.ParentCategoryID) {
    return foundCategory.ParentCategoryID.toString();
  }
  return getParentCategoryId(subcategoryId).toString();
}

function getParentCategoryId(subcategoryId) {
  const subToParentMap = {
    1: 1,
    6: 1,
    12: 1,
    2: 2,
    3: 2,
    4: 2,
    7: 3,
    8: 3,
    9: 3,
    5: 4,
    10: 4,
    11: 4,
  };
  return subToParentMap[subcategoryId] || 1;
}

function getSubcategoriesByParentId(parentId, allCategories) {
  const subcategoryMap = {
    1: [1, 6, 12],
    2: [2, 3, 4],
    3: [7, 8, 9],
    4: [5, 10, 11],
  };
  const subcategoryIds = subcategoryMap[parentId] || [];
  return allCategories.filter((cat) => subcategoryIds.includes(cat.CategoryID));
}
function displayProducts(productsData) {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) {
    console.error("Product grid element not found");
    return;
  }
  productGrid.innerHTML = "";
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
  if (!Array.isArray(productsArray) || productsArray.length === 0) {
    productGrid.innerHTML = `
        <div class="no-products">
          <h3>No products found</h3>
          <p>There are no products available in this category.</p>
        </div>`;
    return;
  }

  // Hiển thị sản phẩm
  productsArray.forEach((product) => {
    if (!product || typeof product !== "object") {
      return;
    }
    const productId = product.ProductID || product.id;
    const productName = product.ProductName || product.Name;
    const price = product.Price || product.price;
    const color = product.Color || product.Colors || "Various Colors";

    let imageUrl = "LivingSpace.webp";

    if (product.ImageURLs) {
      try {
        const urls = JSON.parse(product.ImageURLs);
        if (Array.isArray(urls) && urls.length > 0) {
          imageUrl = urls[0];
        } else if (typeof urls === "string") {
          imageUrl = urls;
        }
      } catch (e) {
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

    cardDiv.innerHTML = `
        <div class="product-image">
          <img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.src='LivingSpace.webp'" />
        </div>
        <div class="product-info">
          <div class="product-name">${productName}</div>
          <div class="price-container">
            <div class="price">${formatPrice(price)}  VND</div>
          </div>
          <div class="product-name" style="color: #373737ff;">Color: ${color}</div>
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

function extractProductsArray(productsData) {
  let productsArray = [];
  if (
    productsData &&
    productsData.success &&
    productsData.data &&
    productsData.data.rows
  ) {
    productsArray = productsData.data.rows;
  } else if (
    productsData &&
    productsData.rows &&
    Array.isArray(productsData.rows)
  ) {
    productsArray = productsData.rows;
  } else if (
    productsData &&
    productsData.data &&
    Array.isArray(productsData.data)
  ) {
    productsArray = productsData.data;
  } else if (Array.isArray(productsData)) {
    productsArray = productsData;
  } else if (productsData && typeof productsData === "object") {
    for (const key in productsData) {
      if (Array.isArray(productsData[key])) {
        productsArray = productsData[key];
        break;
      }
    }
  }
  return productsArray || [];
}

document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
});

window.getUrlParameter = getUrlParameter;
window.displayProducts = displayProducts;
window.formatPrice = formatPrice;
window.extractProductsArray = extractProductsArray;
