document.addEventListener("DOMContentLoaded", function () {
  // --- 1. Tab Functionality (Chức năng chuyển tab) ---
  const tabHeaders = document.querySelectorAll(".tab-header");
  tabHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-header")
        .forEach((h) => h.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // --- 2. Quantity Buttons (Nút tăng/giảm số lượng) ---
  const minusBtn = document.querySelector(".quantity-btn:first-child");
  const plusBtn = document.querySelector(".quantity-btn:last-child");
  const quantityInput = document.getElementById("quantity");

  minusBtn.addEventListener("click", function () {
    let value = parseInt(quantityInput.value);
    if (value > 1) {
      quantityInput.value = value - 1;
    }
  });
  plusBtn.addEventListener("click", function () {
    let value = parseInt(quantityInput.value);
    quantityInput.value = value + 1;
  });

  // --- 3. "Add to Cart" Notification (Thông báo thêm vào giỏ hàng) ---
  const addToCartBtn = document.querySelector(".add-to-cart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      showCartNotification();
    });
  }

  // --- 4. "Helpful" Review Buttons (Nút đánh giá hữu ích) ---
  document.querySelectorAll(".helpful-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const countElement = this.querySelector("span") || this;
      // Trích xuất số đếm hiện tại. Sử dụng biểu thức chính quy để tìm số
      const match = countElement.textContent.match(/\d+/);
      let count = match ? parseInt(match[0]) : 0;
      count++;
      // Cập nhật lại số đếm trong chuỗi văn bản
      if (match) {
        countElement.textContent = countElement.textContent.replace(
          /\d+/,
          count
        );
      } else {
        countElement.textContent = `Hữu ích (${count})`;
      }
      this.style.backgroundColor = "#e8f5e8";
      this.style.borderColor = "#008000";
      this.style.color = "#008000";
    });
  });

  // --- 5. Review Form Functionality (Chức năng Form Đánh giá) ---
  const reviewForm = document.getElementById("reviewForm");
  const formBody = document.getElementById("formBody");
  const formSuccess = document.getElementById("formSuccess");
  const addReviewBtn = document.querySelector(".add-review-btn");
  const closeForm = document.getElementById("closeForm");
  const cancelReview = document.getElementById("cancelReview");
  const closeSuccess = document.getElementById("closeSuccess");
  const submitReview = document.getElementById("submitReview");
  const starRating = document.getElementById("starRating");
  const ratingValue = document.getElementById("ratingValue");
  const imageUpload = document.getElementById("imageUpload");
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("image-preview");
  const stars = starRating ? starRating.querySelectorAll(".star") : [];
  let selectedRating = 0;
  let uploadedImages = [];

  // Hàm đóng form đánh giá
  function closeReviewForm() {
    reviewForm.classList.remove("active");
    document.body.style.overflow = "auto";
    resetForm();
  }

  // Hàm reset form
  function resetForm() {
    document.getElementById("reviewerName").value = "";
    document.getElementById("reviewTitle").value = "";
    document.getElementById("reviewContent").value = "";
    // Reset rating
    selectedRating = 0;
    ratingValue.value = "0";
    stars.forEach((star) => {
      star.classList.remove("active");
      star.style.color = "#ddd";
    });
    // Reset ảnh
    uploadedImages = [];
    updateImagePreview();
    // Reset validation và trạng thái form
    if (document.getElementById("charCounter")) {
      document.getElementById("charCounter").textContent = "0/500 ký tự";
      document
        .getElementById("charCounter")
        .classList.remove("warning", "error");
    }

    submitReview.disabled = true;
    formBody.style.display = "block";
    formSuccess.classList.remove("active");
  }

  // Hàm kiểm tra form
  function validateForm() {
    const name = document.getElementById("reviewerName").value.trim();
    const title = document.getElementById("reviewTitle").value.trim();
    const content = document.getElementById("reviewContent").value.trim();
    const rating = parseInt(ratingValue.value);
    if (name && title && content && rating > 0) {
      submitReview.disabled = false;
    } else {
      submitReview.disabled = true;
    }
  }

  // Cập nhật ảnh preview
  function updateImagePreview() {
    imagePreview.innerHTML = "";
    uploadedImages.forEach((image, index) => {
      const previewDiv = document.createElement("div");
      previewDiv.className = "preview-image";

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = "Preview image";

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-image";
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", function () {
        uploadedImages.splice(index, 1);
        updateImagePreview();
      });

      previewDiv.appendChild(img);
      previewDiv.appendChild(removeBtn);
      imagePreview.appendChild(previewDiv);
    });
  }

  // --- Event Listeners cho Review Form ---
  if (addReviewBtn) {
    addReviewBtn.addEventListener("click", function () {
      reviewForm.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }
  if (closeForm) closeForm.addEventListener("click", closeReviewForm);
  if (cancelReview) cancelReview.addEventListener("click", closeReviewForm);
  if (closeSuccess) closeSuccess.addEventListener("click", closeReviewForm);

  // Star rating functionality
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      selectedRating = parseInt(this.getAttribute("data-rating"));
      ratingValue.value = selectedRating;

      stars.forEach((s) => {
        const starRating = parseInt(s.getAttribute("data-rating"));
        if (starRating <= selectedRating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
      validateForm();
    });

    star.addEventListener("mouseover", function () {
      const hoverRating = parseInt(this.getAttribute("data-rating"));
      stars.forEach((s) => {
        const starRating = parseInt(s.getAttribute("data-rating"));
        if (starRating <= hoverRating) {
          s.style.color = "#ffc107";
        } else {
          s.style.color = "#ddd";
        }
      });
    });

    star.addEventListener("mouseout", function () {
      stars.forEach((s) => {
        const starRating = parseInt(s.getAttribute("data-rating"));
        if (starRating <= selectedRating) {
          s.style.color = "#ffc107";
        } else {
          s.style.color = "#ddd";
        }
      });
    });
  });

  // Image upload functionality
  if (imageUpload) {
    imageUpload.addEventListener("click", function () {
      imageInput.click();
    });
  }

  if (imageInput) {
    imageInput.addEventListener("change", function (e) {
      const files = e.target.files;
      if (files.length + uploadedImages.length > 3) {
        alert("Bạn chỉ có thể tải lên tối đa 3 ảnh!");
        return;
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (e) {
            uploadedImages.push({
              file: file,
              url: e.target.result,
            });
            updateImagePreview();
          };
          reader.readAsDataURL(file);
        }
      }
      imageInput.value = "";
    });
  }

  // Event Listeners cho validation
  document
    .getElementById("reviewerName")
    ?.addEventListener("input", validateForm);
  document
    .getElementById("reviewTitle")
    ?.addEventListener("input", validateForm);
  document
    .getElementById("reviewContent")
    ?.addEventListener("input", validateForm);
  // Form submission
  if (submitReview) {
    submitReview.addEventListener("click", function () {
      // Logic gửi dữ liệu lên server sẽ được thêm vào đây
      // Hiện tại chỉ hiển thị thông báo thành công cho mục đích demo

      formBody.style.display = "none";
      formSuccess.classList.add("active");
    });
  }
  // Đóng form khi click bên ngoài (overlay)
  if (reviewForm) {
    reviewForm.addEventListener("click", function (e) {
      if (e.target === reviewForm) {
        closeReviewForm();
      }
    });
  }
});

// Thay đổi hình ảnh chính
function changeImage(img) {
  document.getElementById("mainImage").src = img.src;
}
