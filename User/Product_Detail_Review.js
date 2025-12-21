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

document.addEventListener("DOMContentLoaded", () => {
  loadReviews();
  loadReviewSummary();
});
