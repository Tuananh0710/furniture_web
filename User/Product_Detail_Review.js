const urlParams = new URLSearchParams(window.location.search);
const currentProductId = urlParams.get("id");

if (!currentProductId) {
  console.error("Không tìm thấy Product ID trong URL!");
}
const apiUrl = `http://localhost:3000/api/reviews/product/${currentProductId}`;

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN");
}

function generateStars(rating) {
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHtml += '<i class="fas fa-star" style="color: #FFD700;"></i>';
    } else {
      starsHtml += '<i class="far fa-star" style="color: #ccc;"></i>';
    }
  }
  return starsHtml;
}

function getInitials(name) {
  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

async function loadReviews() {
  const container = document.getElementById("reviews-container");
  try {
    const response = await fetch(apiUrl);
    const jsonData = await response.json();

    if (!jsonData.success || !jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = "<p>There are no reviews for this product yet.</p>";
      return;
    }

    const reviewsHtml = jsonData.data
      .map((review) => {
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${getInitials(
                          review.FullName
                        )}</div>
                        <div class="reviewer-details">
                            <h4>${review.FullName}</h4>
                        </div>
                    </div>
                    <div class="review-date">${formatDate(
                      review.CreatedAt
                    )}</div>
                </div>

                <div class="review-stars">
                    ${generateStars(review.Rating)}
                </div>

                <div class="review-content">
                    ${review.Comment}
                </div>
            </div>
            `;
      })
      .join("");

    container.innerHTML = reviewsHtml;
  } catch (error) {
    console.error("Lỗi khi tải đánh giá:", error);
    container.innerHTML = "<p>An error occurred while loading the review.</p>";
  }
}
document.addEventListener("DOMContentLoaded", loadReviews);
//
//
//
//
//
//
//
const summaryApiUrl = `http://localhost:3000/api/reviews/product/${currentProductId}/average-rating`;
async function loadReviewSummary() {
  try {
    const response = await fetch(summaryApiUrl);
    const jsonData = await response.json();
    if (!jsonData.success || !jsonData.data || !jsonData.data.data) {
      console.warn("Không có dữ liệu thống kê đánh giá.");
      return;
    }
    const summaryData = jsonData.data.data;
    const { averageRating, totalReviews, starCounts } = summaryData;
    const scoreElement = document.querySelector(".rating-score");
    if (scoreElement) {
      scoreElement.textContent = Number(averageRating).toFixed(1);
    }
    const starsContainer = document.querySelector(
      ".reviews-summary .rating-stars"
    );
    if (starsContainer) {
      starsContainer.innerHTML = generateStars(averageRating);
    }
    const countElement = document.querySelector(".rating-count");
    if (countElement) {
      countElement.textContent = `${totalReviews} reviews`;
    }
    const ratingBars = document.querySelectorAll(".rating-bar");
    ratingBars.forEach((bar, index) => {
      const starLevel = 5 - index;
      const count = starCounts[starLevel] || 0;
      let percent = 0;
      if (totalReviews > 0) {
        percent = (count / totalReviews) * 100;
      }
      const fillElement = bar.querySelector(".rating-fill");
      if (fillElement) {
        fillElement.style.width = `${percent}%`;
      }
      const percentElement = bar.querySelector(".rating-percent");
      if (percentElement) {
        percentElement.textContent = `${Math.round(percent)}%`;
      }
    });
  } catch (error) {
    console.error("Lỗi khi tải thống kê đánh giá:", error);
  }
}

//
//
//
//3.theem review
const currentOrderId = urlParams.get("orderId");

const addReviewBtn = document.querySelector(".add-review-btn");
const reviewFormContainer = document.getElementById("reviewForm");
const closeFormBtn = document.getElementById("closeForm");
const cancelReviewBtn = document.getElementById("cancelReview");
const submitReviewBtn = document.getElementById("submitReview");
const starRatingContainer = document.getElementById("starRating");
const stars = starRatingContainer.querySelectorAll(".star");
const ratingValueInput = document.getElementById("ratingValue");
const reviewContentInput = document.getElementById("reviewContent");
const formBody = document.getElementById("formBody");
const formSuccess = document.getElementById("formSuccess");
const closeSuccessBtn = document.getElementById("closeSuccess");

if (addReviewBtn) {
  if (currentProductId && currentOrderId) {
    addReviewBtn.style.display = "block";

    addReviewBtn.addEventListener("click", () => {
      reviewFormContainer.style.display = "flex";
      resetForm();
    });
  } else {
    addReviewBtn.style.display = "none";
  }
}

function closeReviewForm() {
  reviewFormContainer.style.display = "none";
}

if (closeFormBtn) closeFormBtn.addEventListener("click", closeReviewForm);
if (cancelReviewBtn) cancelReviewBtn.addEventListener("click", closeReviewForm);
if (closeSuccessBtn)
  closeSuccessBtn.addEventListener("click", () => {
    closeReviewForm();
    loadReviews();
    loadReviewSummary();
  });

stars.forEach((star) => {
  star.addEventListener("click", function () {
    const rating = this.getAttribute("data-rating");
    ratingValueInput.value = rating;
    updateStarVisuals(rating);
    checkFormValidity();
  });
});

function updateStarVisuals(rating) {
  stars.forEach((star) => {
    const starRating = star.getAttribute("data-rating");
    if (starRating <= rating) {
      star.classList.add("selected");
      star.style.color = "#FFD700";
    } else {
      star.classList.remove("selected");
      star.style.color = "#ccc";
    }
  });
}

function checkFormValidity() {
  const rating = ratingValueInput.value;
  const content = reviewContentInput.value.trim();

  if (rating > 0 && content.length > 0) {
    submitReviewBtn.disabled = false;
    submitReviewBtn.classList.add("active");
  } else {
    submitReviewBtn.disabled = true;
    submitReviewBtn.classList.remove("active");
  }
}

reviewContentInput.addEventListener("input", checkFormValidity);

submitReviewBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const rating = ratingValueInput.value;
  const comment = reviewContentInput.value;

  const reviewData = {
    orderId: currentOrderId,
    productId: currentProductId,
    rating: rating,
    comment: comment,
  };

  try {
    submitReviewBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/reviews/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    const result = await response.json();

    if (result.success) {
      formBody.style.display = "none";
      formSuccess.style.display = "flex";
    } else {
      alert("Lỗi: " + (result.message || "Không thể gửi đánh giá"));
      submitReviewBtn.innerHTML =
        '<i class="fas fa-paper-plane"></i> SUBMIT REVIEW';
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Đã có lỗi xảy ra khi kết nối đến server.");
    submitReviewBtn.innerHTML =
      '<i class="fas fa-paper-plane"></i> SUBMIT REVIEW';
  }
});

function resetForm() {
  ratingValueInput.value = 0;
  reviewContentInput.value = "";
  updateStarVisuals(0);
  submitReviewBtn.disabled = true;
  formBody.style.display = "block";
  formSuccess.style.display = "none";
  submitReviewBtn.innerHTML =
    '<i class="fas fa-paper-plane"></i> SUBMIT REVIEW';
}
document.addEventListener("DOMContentLoaded", () => {
  loadReviews();
  loadReviewSummary();
});
