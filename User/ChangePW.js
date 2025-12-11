// ChangePW.js - Phiên bản đơn giản
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "DangNhap.html";
    return;
  }

  // Hiển thị tên user
  showUserName();

  // Xử lý form
  document
    .getElementById("accountForm")
    ?.addEventListener("submit", handleChangePassword);

  // Xử lý logout
  document
    .querySelector('a[href="DangNhap.html"]')
    ?.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "DangNhap.html";
    });
});

// Hiển thị tên user
function showUserName() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const welcomeText = document.querySelector(".welcome p");
  if (welcomeText && user.FullName) {
    welcomeText.innerHTML = `Hello, <b>${user.FullName}!</b>`;
  }
}

// Xử lý đổi mật khẩu
async function handleChangePassword(e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  // Lấy giá trị
  const currentPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Kiểm tra client-side
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Mật khẩu mới và xác nhận không khớp!");
    return;
  }

  if (newPassword.length < 6) {
    alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
    return;
  }

  // Gửi request
  btn.textContent = "Đang xử lý...";
  btn.disabled = true;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:3000/api/auth/changePassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      }
    );

    const result = await response.json();

    if (result.success) {
      alert("Đổi mật khẩu thành công!");
    }
  } catch (error) {
    alert("Lỗi kết nối server!");
    console.error(error);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
