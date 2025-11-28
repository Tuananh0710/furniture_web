// products-api.js
class ProductsAPI {
  constructor() {
    this.apiUrl = "http://localhost:3000/api/products";
    this.products = [];
  }

  // Lấy tất cả sản phẩm từ API
  async fetchProducts() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu sản phẩm");
      }
      const data = await response.json();
      this.products = data.data || data; // Tuỳ thuộc vào cấu trúc response
      return this.products;
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      return [];
    }
  }

  // Lọc sản phẩm theo tiêu chí
  filterProducts(filters = {}) {
    let filteredProducts = [...this.products];

    // Lọc theo danh mục
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.CategoryName === filters.category
      );
    }

    // Lọc theo khoảng giá
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filteredProducts = filteredProducts.filter((product) => {
        const price = parseFloat(product.Price);
        return price >= min && price <= max;
      });
    }

    // Lọc theo màu sắc
    if (filters.color) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.Color &&
          product.Color.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    return filteredProducts;
  }

  // Render sản phẩm lên grid
  renderProducts(products) {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (products.length === 0) {
      productGrid.innerHTML =
        '<p class="no-products">Không tìm thấy sản phẩm phù hợp</p>';
      return;
    }

    products.forEach((product) => {
      const productCard = this.createProductCard(product);
      productGrid.appendChild(productCard);
    });
  }

  // Tạo card sản phẩm
  createProductCard(product) {
    const link = document.createElement("a");
    link.href = `Product_Detail.html?id=${product.ProductID}`;

    const card = document.createElement("div");
    card.className = "product-card";

    // Xử lý hình ảnh
    let imageUrl = "LivingSpace.webp"; // Ảnh mặc định
    if (product.ImageURLs) {
      try {
        const images = JSON.parse(product.ImageURLs);
        if (images && images.length > 0) {
          imageUrl = images[0];
        }
      } catch (e) {
        console.error("Lỗi parse ImageURLs:", e);
      }
    }

    card.innerHTML = `
            <img src="${imageUrl}" alt="${product.ProductName}" />
            <div class="product-info">
                <div class="product-name">${product.ProductName}</div>
                <div class="price">${this.formatPrice(product.Price)}₫</div>
                ${
                  product.oldPrice
                    ? `<div class="old-price">${this.formatPrice(
                        product.oldPrice
                      )}₫</div>`
                    : ""
                }
            </div>
        `;

    link.appendChild(card);
    return link;
  }

  // Định dạng giá tiền
  formatPrice(price) {
    return parseFloat(price).toLocaleString("vi-VN");
  }

  // Khởi tạo bộ lọc
  initFilters() {
    this.setupCategoryFilters();
    this.setupPriceFilters();
    this.setupColorFilters();
  }

  // Thiết lập bộ lọc danh mục
  setupCategoryFilters() {
    const categoryItems = document.querySelectorAll(".Category");
    categoryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.textContent.trim();
        const filteredProducts = this.filterProducts({ category });
        this.renderProducts(filteredProducts);
      });
    });
  }

  // Thiết lập bộ lọc giá
  setupPriceFilters() {
    const priceRadios = document.querySelectorAll('input[name="price"]');
    const priceRanges = {
      0: [0, 500000],
      1: [500000, 1000000],
      2: [1000000, 2000000],
      3: [2000000, 3000000],
      4: [3000000, 5000000],
      5: [5000000, Infinity],
    };

    priceRadios.forEach((radio, index) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          const filteredProducts = this.filterProducts({
            priceRange: priceRanges[index],
          });
          this.renderProducts(filteredProducts);
        }
      });
    });
  }

  // Thiết lập bộ lọc màu sắc
  setupColorFilters() {
    const colorCircles = document.querySelectorAll(".color-circle");
    const colorMap = {
      0: "nâu",
      1: "đen",
      2: "xám",
      3: "trắng",
      4: "đỏ",
      5: "xanh lá",
      6: "vàng",
      7: "cam",
      8: "xanh dương",
      9: "hồng",
    };

    colorCircles.forEach((circle, index) => {
      circle.addEventListener("click", () => {
        const filteredProducts = this.filterProducts({
          color: colorMap[index],
        });
        this.renderProducts(filteredProducts);
      });
    });
  }

  // Khởi tạo ứng dụng
  async init() {
    await this.fetchProducts();
    this.renderProducts(this.products);
    this.initFilters();
  }
}

// Khởi tạo khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  const productsAPI = new ProductsAPI();
  productsAPI.init();
});
