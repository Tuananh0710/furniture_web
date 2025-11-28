// ===== Thêm khách hàng =====
const modal = document.getElementById("addCustomerForm");
const btnAdd = document.querySelector(".add");
const closeBtn = modal.querySelector(".close");
const cancelBtn = modal.querySelector(".cancel-btn");

btnAdd.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) modal.style.display = "none";
});

// ===== Sửa khách hàng =====
const modalUpdate = document.getElementById("UpdateCustomerForm");
const btnUpdate = document.querySelectorAll("#Update"); // Có thể nhiều icon Update
const closeUpdate = modalUpdate.querySelector(".close_update");
const cancelUpdate = modalUpdate.querySelector(".cancel-btn");

// Khi nhấn vào từng nút sửa (icon bút)
btnUpdate.forEach((btn) => {
  btn.addEventListener("click", () => {
    modalUpdate.style.display = "flex";
  });
});

// Đóng form sửa
closeUpdate.addEventListener("click", () => {
  modalUpdate.style.display = "none";
});

cancelUpdate.addEventListener("click", () => {
  modalUpdate.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modalUpdate) modalUpdate.style.display = "none";
});
