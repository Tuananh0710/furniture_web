//1. Tab functionality chuyển thông tin khi click
document.addEventListener("DOMContentLoaded", function () {
  const tabHeaders = document.querySelectorAll(".tab-header");

  tabHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      // Remove active class from all headers and panels
      document
        .querySelectorAll(".tab-header")
        .forEach((h) => h.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));

      // Add active class to clicked header
      this.classList.add("active");

      // Show corresponding panel
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Quantity buttons
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
});

//2. Thay đổi hình ảnh
function changeImage(img) {
  document.getElementById("mainImage").src = img.src;
}

//3. Đánh giá sản phẩm
document.querySelectorAll(".helpful-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const countElement = this.querySelector("span") || this;
    let count = parseInt(countElement.textContent.match(/\d+/)[0]);
    count++;

    if (this.querySelector("span")) {
      this.querySelector("span").textContent = this.textContent.replace(
        /\d+/,
        count
      );
    } else {
      this.textContent = this.textContent.replace(/\d+/, count);
    }

    this.style.backgroundColor = "#e8f5e8";
    this.style.borderColor = "#008000";
    this.style.color = "#008000";
  });
});

//FORM đánh giá
// Review Form Functionality
document.addEventListener("DOMContentLoaded", function () {
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
  const reviewContent = document.getElementById("reviewContent");
  const charCounter = document.getElementById("charCounter");
  const imageUpload = document.getElementById("imageUpload");
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("image-preview");

  let selectedRating = 0;
  let uploadedImages = [];

  // Open review form
  addReviewBtn.addEventListener("click", function () {
    reviewForm.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  // Close review form
  function closeReviewForm() {
    reviewForm.classList.remove("active");
    document.body.style.overflow = "auto";
    resetForm();
  }

  closeForm.addEventListener("click", closeReviewForm);
  cancelReview.addEventListener("click", closeReviewForm);
  closeSuccess.addEventListener("click", closeReviewForm);

  // Star rating functionality
  const stars = starRating.querySelectorAll(".star");
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
  imageUpload.addEventListener("click", function () {
    imageInput.click();
  });

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

    // Reset input to allow selecting same files again
    imageInput.value = "";
  });

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

  // Form validation
  function validateForm() {
    const name = document.getElementById("reviewerName").value.trim();
    const email = document.getElementById("reviewerEmail").value.trim();
    const title = document.getElementById("reviewTitle").value.trim();
    const content = document.getElementById("reviewContent").value.trim();
    const rating = parseInt(ratingValue.value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name && emailRegex.test(email) && title && content && rating > 0) {
      submitReview.disabled = false;
    } else {
      submitReview.disabled = true;
    }
  }

  // Add input event listeners for validation
  document
    .getElementById("reviewerName")
    .addEventListener("input", validateForm);
  document
    .getElementById("reviewerEmail")
    .addEventListener("input", validateForm);
  document
    .getElementById("reviewTitle")
    .addEventListener("input", validateForm);

  // Form submission
  submitReview.addEventListener("click", function () {
    // Here you would normally send the data to your server
    // For demo purposes, we'll just show the success message

    formBody.style.display = "none";
    formSuccess.classList.add("active");
  });

  // Reset form
  function resetForm() {
    document.getElementById("reviewerName").value = "";
    document.getElementById("reviewerEmail").value = "";
    document.getElementById("reviewTitle").value = "";
    document.getElementById("reviewContent").value = "";
    document.getElementById("purchaseVerification").value = "yes";

    selectedRating = 0;
    ratingValue.value = "0";
    stars.forEach((star) => {
      star.classList.remove("active");
      star.style.color = "#ddd";
    });

    uploadedImages = [];
    updateImagePreview();

    charCounter.textContent = "0/500 ký tự";
    charCounter.classList.remove("warning", "error");

    submitReview.disabled = true;

    formBody.style.display = "block";
    formSuccess.classList.remove("active");
  }

  // Close form when clicking outside
  reviewForm.addEventListener("click", function (e) {
    if (e.target === reviewForm) {
      closeReviewForm();
    }
  });
});

// 3.1 Hiện thông báo
document.addEventListener("DOMContentLoaded", function () {
  const tabHeaders = document.querySelectorAll(".tab-header");

  tabHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      // Remove active class from all headers and panels
      document
        .querySelectorAll(".tab-header")
        .forEach((h) => h.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));

      // Add active class to clicked header
      this.classList.add("active");

      // Show corresponding panel
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Quantity buttons
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

  // Add to cart button functionality
  const addToCartBtn = document.querySelector(".add-to-cart");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      const productName = document.querySelector(".product-title").textContent;
      const quantity = document.getElementById("quantity").value;

      // Show black theme notification
      showCartNotification();
    });
  }

  // Review helpful buttons
  document.querySelectorAll(".helpful-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const countElement = this.querySelector("span") || this;
      let count = parseInt(countElement.textContent.match(/\d+/)[0]);
      count++;

      if (this.querySelector("span")) {
        this.querySelector("span").textContent = this.textContent.replace(
          /\d+/,
          count
        );
      } else {
        this.textContent = this.textContent.replace(/\d+/, count);
      }

      this.style.backgroundColor = "#e8f5e8";
      this.style.borderColor = "#008000";
      this.style.color = "#008000";
    });
  });
});

//3.2 Hiện thông báo
function showCartNotification() {
  // Get existing elements
  const overlay = document.getElementById("cartNotificationOverlay");
  const notification = document.getElementById("cartNotification");

  // Show overlay and notification
  overlay.classList.add("show");
  setTimeout(() => {
    notification.classList.add("show");
  }, 250);

  // Auto hide after 2 seconds
  const autoHide = setTimeout(() => {
    hideCartNotification();
  }, 1800);

  // Store timeout reference for manual control
  notification.autoHideTimeout = autoHide;

  // Add click event to overlay to close notification
  overlay.addEventListener("click", hideCartNotification);
}

//3.3 Ẩn thông báo
function hideCartNotification() {
  const notification = document.getElementById("cartNotification");
  const overlay = document.getElementById("cartNotificationOverlay");

  if (notification) {
    notification.classList.remove("show");
  }
  if (overlay) {
    overlay.classList.remove("show");
  }

  // Clear any existing timeout
  if (notification && notification.autoHideTimeout) {
    clearTimeout(notification.autoHideTimeout);
  }
}
