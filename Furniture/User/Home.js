// Tự động chuyển banner
let index = 0;
const slides = document.querySelectorAll(".slide");

function showSlide() {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
  index = (index + 1) % slides.length;
}

setInterval(showSlide, 3000);
