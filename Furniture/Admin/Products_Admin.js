// ================== MỞ MODAL CHI TIẾT SẢN PHẨM ==================
document.addEventListener("DOMContentLoaded", function () {
  const productLinks = document.querySelectorAll(".Pro1 a");
  const detailModal = document.getElementById("productDetailModal");
  const detailClose = document.querySelector(".btn-detail-close");

  // Khi click vào mã sản phẩm
  productLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      detailModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // Nút X đóng chi tiết
  detailClose.addEventListener("click", () => {
    detailModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Click ngoài modal để đóng
  window.addEventListener("click", function (e) {
    if (e.target === detailModal) {
      detailModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});

// ================== ĐỔI ẢNH TRONG FORM XEM CHI TIẾT ==================
document.querySelectorAll(".detail-thumbs img").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    document.querySelector(".detail-img").src = thumb.src;
  });
});

// ================== MỞ FORM SỬA SẢN PHẨM ==================
const editButtons = document.querySelectorAll(".btn-edit"); // icon sửa
const editModal = document.getElementById("editProductModal");
const editClose = document.querySelector(".btn-edit-close");
const editCancel = document.querySelector(".btn-cancel");

// Khi click nút sửa
editButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    editModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });
});

// Nút X đóng form sửa
editClose.addEventListener("click", () => {
  editModal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Nút Hủy
editCancel.addEventListener("click", () => {
  editModal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Click ra ngoài để đóng
window.addEventListener("click", function (e) {
  if (e.target === editModal) {
    editModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// ================== ĐỔI ẢNH TRONG FORM SỬA SẢN PHẨM ==================
document.querySelectorAll(".edit-thumbs img").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    document.querySelector(".edit-img").src = thumb.src;
  });
});

// ================== MỞ FORM THÊM MỚI SẢN PHẨM ==================
const editAdd = document.querySelectorAll(".btn-add"); // icon thêm sản phẩm
const editBTNModal = document.getElementById("ADDProductModal");
const editDong = document.querySelector(".NUT-X");
const editHuy = document.querySelector(".NUT-HUY");

//khi click nút thêm sản phẩm
editAdd.forEach((btn) => {
  btn.addEventListener("click", () => {
    editBTNModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });
});

// Nút X đóng form sửa
editDong.addEventListener("click", () => {
  editBTNModal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Nút Hủy
editHuy.addEventListener("click", () => {
  editBTNModal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Click ra ngoài để đóng
window.addEventListener("click", function (e) {
  if (e.target === editBTNModal) {
    editBTNModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

//============Duyệt ảnh khi upload khi add product=========
// Danh sách file đã upload (dùng để phát hiện trùng)
let uploadedImages = new Set();

// Khi click vào khung upload → mở file input
document.getElementById("imageUpload").addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

// Xử lý images preview
document
  .getElementById("imageInput")
  .addEventListener("change", function (event) {
    const files = event.target.files;
    const preview = document.getElementById("image-preview");

    Array.from(files).forEach((file) => {
      // Kiểm tra trùng bằng file.name và file.size
      const fileKey = file.name + "-" + file.size;

      if (uploadedImages.has(fileKey)) {
        alert("The image '" + file.name + "' has already been uploaded!");
        return; // bỏ qua ảnh trùng
      }

      uploadedImages.add(fileKey); // Lưu ảnh vào danh sách

      const reader = new FileReader();
      reader.onload = function (e) {
        const div = document.createElement("div");
        div.classList.add("preview-image");

        div.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button class="remove-image">&times;</button>
      `;

        preview.appendChild(div);

        // Xóa ảnh khi nhấn nút X
        div
          .querySelector(".remove-image")
          .addEventListener("click", function () {
            div.remove();
            uploadedImages.delete(fileKey); // Xóa khỏi danh sách ảnh đã upload
          });
      };

      reader.readAsDataURL(file);
    });

    // Reset input để có thể chọn lại cùng 1 file nếu muốn
    event.target.value = "";
  });
