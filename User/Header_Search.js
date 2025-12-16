document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  if (searchButton && searchInput) {
    // 1. Lắng nghe sự kiện click trên nút tìm kiếm
    searchButton.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a> (chuyển hướng)

      const query = searchInput.value.trim();

      if (query) {
        const apiUrl = `http://localhost:3000/api/products/search?q=${encodeURIComponent(
          query
        )}`;

        console.log("Đang gọi API tìm kiếm:", apiUrl);

        // 3. Thực hiện lệnh gọi API
        fetch(apiUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Kết quả tìm kiếm từ API:", data);

            // 4. CHUYỂN HƯỚNG: Chuyển hướng người dùng đến trang Products.html
            // và truyền từ khóa tìm kiếm qua tham số URL (query parameter 'q').
            // Trang Products.html sẽ sử dụng tham số này để hiển thị kết quả.
            window.location.href = `Products.html?q=${encodeURIComponent(
              query
            )}`;
          })
          .catch((error) => {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            alert("Lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.");
          });
      } else {
        // Nếu ô tìm kiếm trống, vẫn chuyển hướng để hiển thị tất cả sản phẩm
        // hoặc các sản phẩm được lọc mặc định.
        window.location.href = "Products.html";
      }
    });

    // Tùy chọn: Xử lý tìm kiếm khi người dùng nhấn Enter trong ô input
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Ngăn chặn gửi form/chuyển hướng mặc định
        searchButton.click(); // Giả lập click vào nút tìm kiếm
      }
    });
  }
});
