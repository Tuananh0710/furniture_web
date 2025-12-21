const API_URL = "http://localhost:3000/api/orders";

// Hàm lấy OrderID từ URL
function getOrderIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("orderId");
}

async function fetchOrderDetail() {
  try {
    // 1. Debug URL và orderId
    console.log("📝 Bước 1: Lấy Order ID từ URL");
    const orderId = getOrderIdFromUrl();
    console.log("✅ Order ID từ URL:", orderId, "(kiểu:", typeof orderId + ")");

    if (!orderId) {
      console.error("❌ Không tìm thấy Order ID trong URL");
      console.log("📍 URL hiện tại:", window.location.href);
      console.log("📍 Hàm getOrderIdFromUrl trả về:", orderId);

      document.getElementById("order-items-body").innerHTML =
        '<tr><td colspan="4" style="color: red;">Không tìm thấy Order ID trong URL.</td></tr>';
      console.groupEnd();
      return;
    }

    // 2. Debug API_URL
    console.log("\n📝 Bước 2: Kiểm tra API URL");
    console.log(
      "📌 API_URL được định nghĩa:",
      typeof API_URL !== "undefined" ? "CÓ" : "KHÔNG"
    );

    // Kiểm tra xem API_URL có tồn tại không
    if (typeof API_URL === "undefined") {
      console.error("❌ API_URL không được định nghĩa");
      console.log(
        '💡 Hãy đảm bảo khai báo: const API_URL = "http://localhost:3000/api/orders"'
      );
      console.groupEnd();
      return;
    }

    const fullUrl = `${API_URL}/${orderId}`;
    console.log("✅ URL đầy đủ sẽ gọi:", fullUrl);

    // 3. Debug token
    console.log("\n📝 Bước 3: Kiểm tra Authentication Token");
    const authToken = localStorage.getItem("token");
    console.log("📌 Token từ localStorage:", authToken ? "CÓ" : "KHÔNG");

    if (!authToken) {
      console.warn("⚠️ Không tìm thấy token trong localStorage");
      console.log("💡 Token mặc định sẽ được dùng:", "YOUR_AUTH_TOKEN_HERE");
    }

    const tokenToUse = authToken || "YOUR_AUTH_TOKEN_HERE";
    console.log(
      "✅ Token sẽ gửi lên server:",
      tokenToUse.substring(0, 10) + "..."
    );

    // 4. Debug request configuration
    console.log("\n📝 Bước 4: Cấu hình Request");
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        "Content-Type": "application/json",
      },
    };

    console.log("✅ Request Options:", JSON.stringify(requestOptions, null, 2));

    // 5. Thực hiện fetch request
    console.log("\n📝 Bước 5: Gọi API");
    console.time("⏱️ API Call Duration");

    console.log("🔄 Đang gọi API...");
    const response = await fetch(fullUrl, requestOptions);

    console.timeEnd("⏱️ API Call Duration");
    console.log("✅ Response Status:", response.status, response.statusText);
    console.log("✅ Response OK:", response.ok);

    // 6. Debug response headers
    console.log("\n📝 Bước 6: Kiểm tra Response Headers");
    console.log("📌 Content-Type:", response.headers.get("content-type"));
    console.log("📌 CORS Headers:", {
      "Access-Control-Allow-Origin": response.headers.get(
        "access-control-allow-origin"
      ),
      "Access-Control-Allow-Methods": response.headers.get(
        "access-control-allow-methods"
      ),
      "Access-Control-Allow-Headers": response.headers.get(
        "access-control-allow-headers"
      ),
    });

    // 7. Parse response
    console.log("\n📝 Bước 7: Parse Response Data");

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Response không phải JSON");
      console.log("📌 Content-Type nhận được:", contentType);

      // Thử đọc text để xem server trả về gì
      const textResponse = await response.text();
      console.log(
        "📌 Response body (text):",
        textResponse.substring(0, 200) + "..."
      );

      throw new Error("Server trả về định dạng không phải JSON");
    }

    const result = await response.json();
    console.log("✅ Response JSON:", result);

    // 8. Xử lý response
    console.log("\n📝 Bước 8: Xử lý Response");

    if (!response.ok) {
      console.error("❌ API Response không OK");
      console.log("📌 Status Code:", response.status);
      console.log(
        "📌 Error Message:",
        result.message || "Không có thông báo lỗi"
      );

      const errorMessage = result.message || `Lỗi server (${response.status})`;
      document.getElementById(
        "order-items-body"
      ).innerHTML = `<tr><td colspan="4" style="color: red;">Lỗi: ${errorMessage}</td></tr>`;

      document.getElementById(
        "order-detail-title"
      ).textContent = `Lỗi khi xem đơn hàng #${orderId}`;

      console.groupEnd();
      return;
    }

    if (!result.data) {
      console.error('❌ Không có trường "data" trong response');
      console.log("📌 Response structure:", Object.keys(result));

      document.getElementById(
        "order-items-body"
      ).innerHTML = `<tr><td colspan="4" style="color: red;">Lỗi: Dữ liệu không hợp lệ từ server</td></tr>`;

      console.groupEnd();
      return;
    }

    console.log("✅ Data nhận được:", result.data);
    console.log(
      "✅ Order có Items:",
      result.data.Items?.length || 0,
      "sản phẩm"
    );

    // 9. Gọi hàm render
    console.log("\n📝 Bước 9: Render dữ liệu");

    // Kiểm tra DOM elements trước khi render
    const orderItemsBody = document.getElementById("order-items-body");
    const orderDetailTitle = document.getElementById("order-detail-title");

    console.log("📌 DOM Elements tồn tại:", {
      "order-items-body": !!orderItemsBody,
      "order-detail-title": !!orderDetailTitle,
    });

    if (!orderItemsBody || !orderDetailTitle) {
      console.error("❌ Thiếu DOM elements cần thiết");
      console.log(
        "💡 Đảm bảo HTML có các phần tử với id: order-items-body và order-detail-title"
      );
      console.groupEnd();
      return;
    }

    try {
      console.log("🔄 Đang gọi renderOrderDetail...");
      renderOrderDetail(result.data);
      console.log("✅ Render thành công");
    } catch (renderError) {
      console.error("❌ Lỗi khi render:", renderError);
      console.error("📍 Stack trace:", renderError.stack);

      document.getElementById(
        "order-items-body"
      ).innerHTML = `<tr><td colspan="4" style="color: red;">Lỗi hiển thị dữ liệu: ${renderError.message}</td></tr>`;
    }

    console.log("\n🎉 === HOÀN TẤT ===");
  } catch (error) {
    console.error("\n🔥 === CATCH BLOCK - Có lỗi xảy ra ===");
    console.error("📌 Error name:", error.name);
    console.error("📌 Error message:", error.message);
    console.error("📌 Error stack:", error.stack);

    // Phân loại lỗi
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error("🔍 Lỗi này thường do:");
      console.error("   1. Mất kết nối internet");
      console.error("   2. URL sai");
      console.error("   3. CORS error");
      console.error("💡 Kiểm tra Network tab trong DevTools");
    }

    if (error.name === "AbortError") {
      console.error("🔍 Request bị hủy/ timeout");
    }

    // Hiển thị lỗi cho người dùng
    const orderItemsBody = document.getElementById("order-items-body");
    if (orderItemsBody) {
      orderItemsBody.innerHTML =
        '<tr><td colspan="4" style="color: red;">Lỗi kết nối Server. Vui lòng thử lại.</td></tr>';
    }
  } finally {
    console.groupEnd();
  }
}

/**
 * Hàm hiển thị dữ liệu chi tiết đơn hàng lên HTML
 * @param {object} data - Dữ liệu chi tiết đơn hàng từ API
 */
function renderOrderDetail(data) {
  // Cập nhật thông tin chung của đơn hàng
  document.getElementById(
    "order-detail-title"
  ).textContent = `View Order Detail`;

  document.getElementById("shipping").textContent = data.ShippingFee;

  document.getElementById("final-total").textContent = data.TotalAmount;

  // Cập nhật Breadcrumb
  document.getElementById("order-breadcrumb").textContent = `View Order Detail`;

  // Xử lý danh sách sản phẩm
  const tbody = document.getElementById("order-items-body");
  tbody.innerHTML = ""; // Xóa nội dung "Đang tải"

  // Kiểm tra nếu có Items mới lặp
  if (data.Items && Array.isArray(data.Items)) {
    console.log("🛒 Danh sách Items từ API:", data.Items);

    data.Items.forEach((item, index) => {
      console.log(`📦 Item ${index + 1}:`, {
        ProductID: item.ProductID,
        ProductName: item.ProductName,
        ProductCode: item.ProductCode,
        "ProductID type": typeof item.ProductID,
        "ProductID value": item.ProductID,
        "Is valid ID":
          item.ProductID &&
          item.ProductID !== "undefined" &&
          item.ProductID !== "null",
      });

      // FIX 1: Kiểm tra và chuẩn hóa ProductID
      let productId = item.ProductID;

      // Kiểm tra nếu ProductID không hợp lệ
      if (!productId || productId === "undefined" || productId === "null") {
        console.error(`❌ ProductID không hợp lệ cho item ${index + 1}:`, item);
        // Thử các key khác có thể chứa ID
        productId =
          item.productId || item.productID || item.id || item.ProductId;
        console.log(`🔄 Thử các key khác:`, { productId });
      }

      // FIX 2: Nếu vẫn không có ID hợp lệ, bỏ qua item này
      if (!productId || productId === "undefined" || productId === "null") {
        console.warn(
          `⚠️ Bỏ qua item ${index + 1} vì không có ProductID hợp lệ`
        );
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="product-info">
              <img src="placeholder.webp" alt="No product" />
              <span style="color: #666;">${
                item.ProductName || "Unknown Product"
              }</span>
              <div>
                  <p><b>Mã SP: </b>${item.ProductCode || "N/A"}</p>
                  <p style="color: red; font-size: 12px;">(Không thể xem chi tiết - thiếu ID)</p>
              </div>
          </td>
          <td>${item.UnitPrice || "N/A"}</td>
          <td>${item.Quantity || "N/A"}</td>
          <td>${item.Subtotal || "N/A"}</td>
        `;
        tbody.appendChild(row);
        return;
      }

      // FIX 3: Đảm bảo ProductID là số (parse nếu cần)
      const numericProductId = parseInt(productId);
      if (isNaN(numericProductId)) {
        console.error(`❌ ProductID không phải số:`, productId);
        // Vẫn sử dụng, nhưng ghi log warning
      }

      const row = document.createElement("tr");

      // Tạo URL ảnh
      const imageUrl = item.FirstImageUrl
        ? `../user/${item.FirstImageUrl}`
        : "placeholder.webp";

      // FIX 4: Tạo link với ProductID đã được kiểm tra
      const currentOrderId = getOrderIdFromUrl();

      const productDetailUrl = `Product_Detail.html?id=${
        numericProductId || productId
      }&orderId=${currentOrderId}`;
      console.log(`🔗 Link cho ${item.ProductName}:`, productDetailUrl);

      row.innerHTML = `
          <td class="product-info">
              <img src="${imageUrl}" alt="${item.ProductName}" />
              <a href="${productDetailUrl}" 
                 target="_blank"
                 onclick="console.log('🖱️ Clicked product:', ${JSON.stringify({
                   id: numericProductId || productId,
                   name: item.ProductName,
                 })})">
              <span>${item.ProductName}</span>
              <div>
                  <p><b>Mã SP: </b>${item.ProductCode}</p>
                  <p style="color: #666; font-size: 12px;">Click để xem chi tiết</p>
              </div>
              </a>
          </td>
          <td>${item.UnitPrice}</td>
          <td>${item.Quantity}</td>
          <td>${item.Subtotal}</td>
      `;

      tbody.appendChild(row);
      console.log(`✅ Đã thêm item ${index + 1} vào bảng`);
    });
  } else {
    console.log("📭 Không có Items trong order");
    tbody.innerHTML =
      '<tr><td colspan="4" style="color: orange;">Đơn hàng không có sản phẩm nào.</td></tr>';
  }

  console.log("🎉 Render order detail completed");
}

document.addEventListener("DOMContentLoaded", fetchOrderDetail);
