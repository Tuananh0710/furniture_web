const modal = document.getElementById("orderDetailModal");
const closeBtn = document.querySelector(".close");
const closeFormBtn = document.querySelector(".btn-close");
const modalOrderId = document.getElementById("modalOrderId");

window.showOrderDetail = function (orderId) {
  console.log("Opening modal for order:", orderId);

  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
};

function closeModal() {
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (closeFormBtn) {
    closeFormBtn.addEventListener("click", closeModal);
  }

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
});
