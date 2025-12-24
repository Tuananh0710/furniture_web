document.addEventListener("DOMContentLoaded", function () {
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

  const minusBtn = document.querySelector(".quantity-btn:first-child");
  const plusBtn = document.querySelector(".quantity-btn:last-child");
  const quantityInput = document.getElementById("quantity");

  if (minusBtn && plusBtn && quantityInput) {
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
  }

  const addToCartBtn = document.querySelector(".add-to-cart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      // Hàm showCartNotification cần được định nghĩa hoặc đảm bảo nó tồn tại
      // Nếu hàm này nằm ở file khác thì OK, nếu không bạn cần giữ lại logic của nó
      if (typeof showCartNotification === "function") {
        showCartNotification();
      } else {
        // Logic hiển thị notification đơn giản nếu chưa có hàm
        const noti = document.getElementById("cartNotification");
        const overlay = document.getElementById("cartNotificationOverlay");
        if (noti && overlay) {
          noti.classList.add("show");
          overlay.classList.add("show");
          setTimeout(() => {
            noti.classList.remove("show");
            overlay.classList.remove("show");
          }, 2000);
        }
      }
    });
  }

  document.body.addEventListener("click", function (e) {
    if (e.target.closest(".helpful-btn")) {
      const button = e.target.closest(".helpful-btn");
      const countElement = button.querySelector("span") || button;
      const match = countElement.textContent.match(/\d+/);
      let count = match ? parseInt(match[0]) : 0;
      count++;
      if (match) {
        countElement.textContent = countElement.textContent.replace(
          /\d+/,
          count
        );
      } else {
        countElement.textContent = `Hữu ích (${count})`;
      }
      button.style.backgroundColor = "#e8f5e8";
      button.style.borderColor = "#008000";
      button.style.color = "#008000";
    }
  });
});

function changeImage(img) {
  const mainImg = document.getElementById("mainImage");
  if (mainImg) mainImg.src = img.src;
}
