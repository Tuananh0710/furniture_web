document.addEventListener("DOMContentLoaded", function () {
  const modals = {
    detail: document.getElementById("productDetailModal"),
    edit: document.getElementById("editProductModal"),
    add: document.getElementById("ADDProductModal"),
  };

  function closeModal(modal) {
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  document
    .querySelector(".btn-detail-close")
    ?.addEventListener("click", () => closeModal(modals.detail));

  window.addEventListener("click", function (e) {
    if (e.target === modals.detail) closeModal(modals.detail);
    if (e.target === modals.edit) closeModal(modals.edit);
    if (e.target === modals.add) closeModal(modals.add);
  });

  let uploadedImages = new Set();
  const imageInput = document.getElementById("imageInput");
  const uploadArea = document.getElementById("imageUpload");
  const previewArea = document.getElementById("image-preview");

  if (uploadArea && imageInput) {
    uploadArea.addEventListener("click", () => imageInput.click());

    imageInput.addEventListener("change", function (event) {
      const files = event.target.files;

      Array.from(files).forEach((file) => {
        const fileKey = file.name + "-" + file.size;
        if (uploadedImages.has(fileKey)) return;

        uploadedImages.add(fileKey);

        const reader = new FileReader();
        reader.onload = function (e) {
          const div = document.createElement("div");
          div.classList.add("preview-image");
          div.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button class="remove-image">&times;</button>
          `;
          previewArea.appendChild(div);

          div
            .querySelector(".remove-image")
            .addEventListener("click", function (e) {
              e.stopPropagation();
              div.remove();
              uploadedImages.delete(fileKey);
            });
        };
        reader.readAsDataURL(file);
      });
      event.target.value = "";
    });
  }
});
