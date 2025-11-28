// Modal functionality
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("orderDetailModal");
  const orderIds = document.querySelectorAll(".pointer");
  const closeBtn = document.querySelector(".close");
  const closeFormBtn = document.querySelector(".btn-close");
  const modalOrderId = document.getElementById("modalOrderId");

  console.log("Modal element:", modal);
  console.log("Order IDs found:", orderIds.length);

  // Function to open modal
  function openModal(orderId) {
    console.log("Opening modal for order:", orderId);
    if (modalOrderId) {
      modalOrderId.textContent = orderId;
    }
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  // Function to close modal
  function closeModal() {
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  // Add click event to order IDs
  orderIds.forEach((orderId) => {
    orderId.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openModal(this.textContent.trim());
    });
  });

  // Close modal events
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  
  if (closeFormBtn) {
    closeFormBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
    }
  });
});