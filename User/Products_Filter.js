let currentFilters = {
  price: "all",
  colors: [],
};

function initFilters() {
  const priceRadios = document.querySelectorAll('input[name="price"]');
  priceRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      currentFilters.price = this.value;
      applyFilters();
    });
  });

  const colorCircles = document.querySelectorAll(".color-circle");
  colorCircles.forEach((circle) => {
    circle.addEventListener("click", function () {
      const color = this.getAttribute("data-color");
      this.classList.toggle("selected");

      const index = currentFilters.colors.indexOf(color);
      if (index === -1) {
        currentFilters.colors.push(color);
      } else {
        currentFilters.colors.splice(index, 1);
      }

      if (typeof updateSelectedColorsDisplay === "function") {
        updateSelectedColorsDisplay();
      }
      applyFilters();
    });
  });
}

function applyFilters() {
  if (!window.allProducts || window.allProducts.length === 0) return;

  let filteredResults = [...window.allProducts];

  if (currentFilters.price !== "all") {
    filteredResults = filteredResults.filter((product) => {
      const price = parseFloat(product.Price || product.price || 0);
      switch (currentFilters.price) {
        case "under-500":
          return price < 500000;
        case "500-1000":
          return price >= 500000 && price <= 1000000;
        case "1000-2000":
          return price >= 1000000 && price <= 2000000;
        case "2000-3000":
          return price >= 2000000 && price <= 3000000;
        case "3000-5000":
          return price >= 3000000 && price <= 5000000;
        case "above-5000":
          return price > 5000000;
        default:
          return true;
      }
    });
  }

  if (currentFilters.colors.length > 0) {
    filteredResults = filteredResults.filter((product) => {
      const pColor = (product.Color || product.Colors || "").toLowerCase();
      return currentFilters.colors.some((c) =>
        pColor.includes(c.toLowerCase())
      );
    });
  }

  window.displayProducts(filteredResults);

  if (typeof updateProductCount === "function") {
    updateProductCount(filteredResults.length);
  }
}

window.initFilters = initFilters;
window.applyFilters = applyFilters;
