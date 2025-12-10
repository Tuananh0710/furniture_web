// Hàm giải mã JWT token (không cần secret, chỉ để lấy payload)
function decodeJWT(token) {
  try {
    // JWT có format: header.payload.signature
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Hàm lấy thông tin user từ API
async function fetchUserInfo(userId) {
  try {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage");
      return null;
    }

    console.log(
      "Using token to fetch user info:",
      token.substring(0, 30) + "..."
    );

    const response = await fetch(
      `http://localhost:3000/api/auth/${userId}/profile`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Token expired or invalid");
        // Token hết hạn, xóa và chuyển hướng
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "DangNhap.html";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("User info fetched successfully:", result.data);
      return result.data;
    } else {
      console.error("API error:", result.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

// Hàm hiển thị thông tin user lên trang
function displayUserInfo(userData) {
  console.log("Displaying user info:", userData);

  // 1. Hiển thị tên trong sidebar
  const nameSpan = document.querySelector(".sidebar p span");
  if (nameSpan && userData.FullName) {
    nameSpan.textContent = userData.FullName;
  }

  // 2. Hiển thị thông tin chi tiết
  const infoSection = document.querySelector(".content .info");
  if (infoSection) {
    infoSection.innerHTML = `
            <p><b>Full Name:</b> ${userData.FullName || "Chưa cập nhật"}</p>
            <p><b>Email:</b> ${userData.Email || "Chưa cập nhật"}</p>
            <p><b>Phone:</b> ${userData.Phone || "Chưa cập nhật"}</p>
            <p><b>Address:</b> ${userData.Address || "Chưa cập nhật"}</p>
            <p><b>Username:</b> ${userData.Username || "Chưa cập nhật"}</p>
            <p><b>Role:</b> ${userData.Role || "Member"}</p>
        `;
  }
}

// Hàm kiểm tra đăng nhập và hiển thị thông tin
async function loadUserProfile() {
  // Kiểm tra xem có token trong localStorage không
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  console.log("Token from localStorage:", token ? "Yes" : "No");
  console.log("Saved user from localStorage:", savedUser);

  if (!token) {
    // Nếu không có token, chuyển hướng về trang đăng nhập
    console.log("No token found, redirecting to login page...");
    window.location.href = "DangNhap.html";
    return;
  }

  let userId;

  // Cách 1: Lấy từ decoded token
  const decoded = decodeJWT(token);
  console.log("Decoded token:", decoded);

  if (decoded && decoded.userId) {
    userId = decoded.userId;
    console.log("UserID from token:", userId);
  }
  // Cách 2: Lấy từ saved user data
  else if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      userId = user.UserID;
      console.log("UserID from saved user:", userId);
    } catch (e) {
      console.error("Error parsing saved user:", e);
    }
  }

  if (!userId) {
    console.error("Cannot get UserID from token or saved user");
    window.location.href = "DangNhap.html";
    return;
  }

  // Gọi API để lấy thông tin user
  console.log(`Fetching user info for ID: ${userId}`);
  const userData = await fetchUserInfo(userId);

  if (userData) {
    // Hiển thị thông tin user
    displayUserInfo(userData);

    // Lưu thông tin user mới nhất vào localStorage
    localStorage.setItem("user", JSON.stringify(userData));
  } else {
    console.error("Failed to fetch user info");
    // Hiển thị thông báo lỗi
    const infoSection = document.querySelector(".content .info");
    if (infoSection) {
      infoSection.innerHTML = `
                <div class="error-message">
                    Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.
                </div>
                <button onclick="window.location.href='DangNhap.html'" class="retry-btn">
                    Đăng nhập lại
                </button>
            `;
    }
  }
}

// Hàm đăng xuất
function logout() {
  // Xóa tất cả dữ liệu đăng nhập
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");

  // Chuyển hướng về trang đăng nhập
  window.location.href = "DangNhap.html";
}

// Khởi tạo khi trang được load
document.addEventListener("DOMContentLoaded", function () {
  console.log("Page loaded, starting user profile loading...");

  // Load thông tin user
  loadUserProfile();

  // Thêm sự kiện cho nút đăng xuất
  const logoutLink = document.querySelector(
    '.sidebar-menu-li a[href="DangNhap.html"]'
  );
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  // Thêm CSS cho thông báo lỗi và nút retry
  const style = document.createElement("style");
  style.textContent = `
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
            border: 1px solid #f5c6cb;
        }
        
        .retry-btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .retry-btn:hover {
            background-color: #0056b3;
        }
        
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
    `;
  document.head.appendChild(style);
});
