const API_URL = "http://localhost:3000/api/orders";

function getOrderIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("orderId");
}

async function fetchOrderDetail() {
  try {
    const orderId = getOrderIdFromUrl();
    if (!orderId) {
      document.getElementById("order-items-body").innerHTML =
        '<tr><td colspan="4" style="color: red;">Order ID not found in URL.</td></tr>';
      return;
    }
    if (typeof API_URL === "undefined") {
      return;
    }
    const fullUrl = `${API_URL}/${orderId}`;
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      console.log(" Token mặc định sẽ được dùng:", "YOUR_AUTH_TOKEN_HERE");
    }
    const tokenToUse = authToken || "YOUR_AUTH_TOKEN_HERE";
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(fullUrl, requestOptions);
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      throw new Error("Server trả về định dạng không phải JSON");
    }
    const result = await response.json();
    if (!response.ok) {
      const errorMessage =
        result.message || `Server error (${response.status})`;
      document.getElementById(
        "order-items-body"
      ).innerHTML = `<tr><td colspan="4" style="color: red;">Error: ${errorMessage}</td></tr>`;
      document.getElementById(
        "order-detail-title"
      ).textContent = `Error when viewing orders #${orderId}`;
      return;
    }
    if (!result.data) {
      document.getElementById(
        "order-items-body"
      ).innerHTML = `<tr><td colspan="4" style="color: red;">Error: Invalid data from the server</td></tr>`;
      return;
    }
    const orderItemsBody = document.getElementById("order-items-body");
    const orderDetailTitle = document.getElementById("order-detail-title");
    if (!orderItemsBody || !orderDetailTitle) {
      return;
    }
    try {
      renderOrderDetail(result.data);
    } catch (renderError) {
      document.getElementById(
        "order-items-body"
      ).innerHTML = `<tr><td colspan="4" style="color: red;">Data display error: ${renderError.message}</td></tr>`;
    }
  } catch (error) {
    console.error("Có lỗi xảy ra");
    console.error(" Error name:", error.name);
    console.error(" Error message:", error.message);
    console.error(" Error stack:", error.stack);
  } finally {
    console.groupEnd();
  }
}

function renderOrderDetail(data) {
  document.getElementById(
    "order-detail-title"
  ).textContent = `View Order Detail`;
  document.getElementById("shipping").textContent = data.ShippingFee;
  document.getElementById("final-total").textContent = data.TotalAmount;
  document.getElementById("order-breadcrumb").textContent = `View Order Detail`;
  const tbody = document.getElementById("order-items-body");
  tbody.innerHTML = "";
  if (data.Items && Array.isArray(data.Items)) {
    data.Items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
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
      let productId = item.ProductID;
      if (!productId || productId === "undefined" || productId === "null") {
        productId =
          item.productId || item.productID || item.id || item.ProductId;
      }
      if (!productId || productId === "undefined" || productId === "null") {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="product-info">
              <img src="placeholder.webp" alt="No product" />
              <span style="color: #666;">${
                item.ProductName || "Unknown Product"
              }</span>
              <div>
                  <p><b>ProductCode: </b>${item.ProductCode || "N/A"}</p>
                  <p><b>Color: </b>${item.Color || "N/A"}</p>
                  <p style="color: red; font-size: 12px;">(Details cannot be viewed - ID missing)</p>
              </div>
          </td>
          <td>${item.UnitPrice || "N/A"}</td>
          <td>${item.Quantity || "N/A"}</td>
          <td>${item.Subtotal || "N/A"}</td>
        `;
        tbody.appendChild(row);
        return;
      }

      const numericProductId = parseInt(productId);
      if (isNaN(numericProductId)) {
        console.error(` ProductID không phải số:`, productId);
      }
      const row = document.createElement("tr");
      const imageUrl = item.FirstImageUrl
        ? `../user/${item.FirstImageUrl}`
        : "placeholder.webp";
      const currentOrderId = getOrderIdFromUrl();
      const productDetailUrl = `Product_Detail.html?id=${
        numericProductId || productId
      }&orderId=${currentOrderId}`;
      row.innerHTML = `
          <td class="product-info">
              <img src="${imageUrl}" alt="${item.ProductName}" />
              <a href="${productDetailUrl}"          
              <span><div style="font-weight:bold; font-size: 19px;">${item.ProductName}</div></span>
              <div>
                  <p><b>ProductCode: </b>${item.ProductCode}</p>
                  <p><b>Color: </b>${item.Color}</p>
              </div>
              </a>
          </td>
          <td>${item.UnitPrice}</td>
          <td>${item.Quantity}</td>
          <td>${item.Subtotal}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

document.addEventListener("DOMContentLoaded", fetchOrderDetail);
