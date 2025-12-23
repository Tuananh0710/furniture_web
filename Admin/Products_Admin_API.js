const API_URL = "http://localhost:3000/api/products/";
let currentEditingId = null;
let allProducts = [];

const formatCurrency = (amount) => {
  const price = parseFloat(amount);
  if (isNaN(price)) return "0 VND";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
//1.Lấy ds sp
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Lỗi kết nối server");
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      allProducts = result.data;
      renderProductTable(result.data);
    } else {
      console.error("Không có dữ liệu sản phẩm");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

function renderProductTable(products) {
  const tableBody = document.querySelector(".main-content table tbody");
  tableBody.innerHTML = "";

  products.forEach((product) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="Pro1">
        <a href="#" class="btn-show-detail" data-id="${product.ProductID}">
            ${product.ProductCode || "N/A"}
        </a>
      </td>
      <td>${product.ProductName}</td>
      <td>${product.CategoryName || ""}</td> 
      <td>${product.Price} VND</td>
      <td>${product.CostPrice} VND</td>
      <td>${product.StockQuantity}</td>
      <td class="icon">
        <i class="fa-solid fa-pen-to-square btn-edit" data-id="${
          product.ProductID
        }"></i>
        
      </td>
    `;
    tableBody.appendChild(tr);
  });
  attachEventHandlers();
}

function attachEventHandlers() {
  const detailModal = document.getElementById("productDetailModal");
  document.querySelectorAll(".btn-show-detail").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      fetchProductDetail(id);
      detailModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  const editModal = document.getElementById("editProductModal");
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const product = allProducts.find((p) => p.ProductID == id);
      if (product) {
        fillEditModal(product);
        editModal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    });
  });
}
// 2.Chi tiết sp
async function fetchProductDetail(id) {
  try {
    const response = await fetch(`${API_URL}${id}`);
    const result = await response.json();
    if (result.success) {
      fillDetailModal(result.data);
    } else {
      console.error("Không tìm thấy sản phẩm");
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết:", error);
  }
}
function fillDetailModal(product) {
  let images = [];
  try {
    images = JSON.parse(product.ImageURLs);
  } catch (e) {
    images = ["default.png"];
  }
  const imagePath = "../User/";
  const mainImg = document.querySelector(".detail-img");
  if (images.length > 0) {
    mainImg.src = imagePath + images[0];
  }
  const thumbsDiv = document.querySelector(".detail-thumbs");
  thumbsDiv.innerHTML = "";
  images.forEach((imgName) => {
    const img = document.createElement("img");
    img.src = imagePath + imgName;
    img.onclick = () => {
      mainImg.src = imagePath + imgName;
    };
    thumbsDiv.appendChild(img);
  });
  document.querySelector(".detail-info h2").textContent = product.ProductName;
  document.querySelector(".detail-description p").textContent =
    product.Description;
  const detailTable =
    document.querySelector(".detail-info-table tbody") ||
    document.querySelector(".detail-info-table");
  detailTable.innerHTML = `
    <tr><th>Product Code:</th><td>${product.ProductCode}</td></tr>
    <tr><th>Category:</th><td>${product.CategoryName || " "}</td></tr>
    <tr><th>Stock Quantity:</th><td>${product.StockQuantity}</td></tr>
    <tr><th>Cost Price:</th><td>${product.CostPrice} VND</td></tr>
    <tr><th>Sell Price:</th><td>${product.Price} VND</td></tr>
    <tr><th>Material:</th><td>${product.Material || ""}</td></tr>
    <tr><th>Color:</th><td>${product.Color || ""}</td></tr>
    <tr><th>Dimension:</th><td>${product.Dimensions || ""}</td></tr>
    <tr><th>Weight:</th><td>${
      product.Weight ? product.Weight + " kg" : ""
    }</td></tr>
    <tr><th>Brand:</th><td>${product.Brand || " "}</td></tr>
    <tr><th>IsActive:</th><td>${
      product.IsActive === 1 ? "Currently for sale" : "Closed for sale"
    }</td></tr>
  `;
}
//3 thêm sp
function setupAddProductEvents() {
  const addModal = document.getElementById("ADDProductModal");
  const btnOpenAdd = document.querySelector(".btn-add");
  const btnCloseX = document.querySelector("#ADDProductModal .NUT-X");
  const btnCloseCancel = document.querySelector("#ADDProductModal .NUT-HUY");
  const btnSaveNew = document.getElementById("btn-save-new");

  if (btnOpenAdd) {
    btnOpenAdd.addEventListener("click", () => {
      clearAddForm();
      addModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  }

  const closeAddModal = () => {
    addModal.style.display = "none";
    document.body.style.overflow = "auto";
  };

  if (btnCloseX) btnCloseX.addEventListener("click", closeAddModal);
  if (btnCloseCancel) btnCloseCancel.addEventListener("click", closeAddModal);

  if (btnSaveNew) {
    btnSaveNew.addEventListener("click", async () => {
      const newProduct = {
        ProductName: document.getElementById("add-name").value,
        ProductCode: document.getElementById("add-code").value,
        CategoryID: document.getElementById("add-category").value,
        Price: document.getElementById("add-price").value,
        CostPrice: document.getElementById("add-cost-price").value,
        Description: document.getElementById("add-description").value,
        Material: document.getElementById("add-material").value,
        Color: document.getElementById("add-color").value,
        Dimensions: document.getElementById("add-dimensions").value,
        Weight: document.getElementById("add-weight").value,
        Brand: document.getElementById("add-brand").value,
        StockQuantity: document.getElementById("add-quantity").value,
        ImageURLs: document.getElementById("imageInput").value,
      };
      if (!newProduct.ProductName || !newProduct.ProductCode) {
        alert("Please enter the Product Name and Product Code!");
        return;
      }

      await createProduct(newProduct);

      closeAddModal();
    });
  }
}

async function createProduct(data) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in, or your login session has expired!");
      window.location.href = "DangNhap.html";
      return;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Product added successfully!");
      fetchProducts();
    } else {
      if (response.status === 401 || response.status === 403) {
        alert("The login session is invalid. Please log in again.");
      } else {
        alert("Error when adding: " + (result.message || "Unknown error"));
      }
    }
  } catch (error) {
    console.error("Error adding product:", error);
    alert("Server connection error!");
  }
}
function clearAddForm() {
  document.getElementById("add-name").value = "";
  document.getElementById("add-code").value = "";
  document.getElementById("add-category").selectedIndex = 0;
  document.getElementById("add-price").value = "";
  document.getElementById("add-cost-price").value = "";
  document.getElementById("add-description").value = "";
  document.getElementById("add-material").value = "";
  document.getElementById("add-color").value = "";
  document.getElementById("add-dimensions").value = "";
  document.getElementById("add-weight").value = "";
  document.getElementById("add-brand").value = "";
  document.getElementById("add-quantity").value = "";
}

//4.Sửa sp
function fillEditModal(product) {
  currentEditingId = product.ProductID;
  document.getElementById("edit-code").value = product.ProductCode || "";
  document.getElementById("edit-name").value = product.ProductName || "";
  document.getElementById("edit-category").value = product.CategoryID || "1";
  document.getElementById("edit-material").value = product.Material || "";
  document.getElementById("edit-cost-price").value = product.CostPrice || 0;
  document.getElementById("edit-price").value = product.Price || 0;
  document.getElementById("edit-color").value = product.Color || "";
  document.getElementById("edit-dimensions").value = product.Dimensions || "";
  document.getElementById("edit-weight").value = product.Weight || 0;
  document.getElementById("edit-quantity").value = product.StockQuantity || 0;
  document.getElementById("edit-brand").value = product.Brand || "";
  document.getElementById("edit-active").value =
    product.IsActive !== undefined ? product.IsActive : 1;
  document.getElementById("edit-description").value = product.Description || "";

  const previewImg = document.getElementById("edit-preview-img");
  let images = [];
  try {
    images = JSON.parse(product.ImageURLs);
  } catch (e) {
    images = ["default.png"];
  }
  const imagePath = "../User/";
  if (Array.isArray(images) && images.length > 0) {
    previewImg.src = imagePath + images[0];
  } else {
    previewImg.src = "#";
  }
}
function setupEditProductEvents() {
  const editModal = document.getElementById("editProductModal");
  const btnSave = document.querySelector("#editProductModal .btn-save");
  const btnCancel = document.querySelector("#editProductModal .btn-cancel");
  const btnClose = document.querySelector("#editProductModal .btn-edit-close");

  const closeEditModal = () => {
    editModal.style.display = "none";
    document.body.style.overflow = "auto";
    currentEditingId = null;
  };

  if (btnCancel) btnCancel.addEventListener("click", closeEditModal);
  if (btnClose) btnClose.addEventListener("click", closeEditModal);

  if (btnSave) {
    btnSave.addEventListener("click", async () => {
      if (!currentEditingId) return;
      const getValue = (id) => document.getElementById(id).value.trim();
      const getNumber = (id) => {
        const val = document.getElementById(id).value;
        return val === "" ? 0 : val;
      };

      const updatedData = {
        ProductName: getValue("edit-name"),
        ProductCode: getValue("edit-code"),
        CategoryID: getValue("edit-category"),
        Price: getNumber("edit-price"),
        CostPrice: getNumber("edit-cost-price"),
        Description: getValue("edit-description"),
        Material: getValue("edit-material"),
        Color: getValue("edit-color"),
        Dimensions: getValue("edit-dimensions"),
        Weight: getNumber("edit-weight"),
        StockQuantity: getNumber("edit-quantity"),
        Brand: getValue("edit-brand"),
        isActive: getValue("edit-active"),
        ImageURLs: "null", //NOTE, Đợi KTV Sửa
      };

      if (!updatedData.ProductName || !updatedData.ProductCode) {
        alert("Product Name and Code are required!");
        return;
      }

      await updateProduct(currentEditingId, updatedData);

      closeEditModal();
    });
  }
}
async function updateProduct(id, data) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      alert("Product update successful!");
      fetchProducts();
    } else {
      alert("Update error: " + (result.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Lỗi khi update:", error);
    alert("Server connection error during update!");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  setupAddProductEvents();
  setupEditProductEvents();
});
