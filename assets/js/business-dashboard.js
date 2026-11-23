/**
 * PLENTI — FOOD BUSINESS DASHBOARD
 * Handles client-side surplus food listings, order fulfillment,
 * inventory management, business analytics, and merchant profile.
 */

document.addEventListener("DOMContentLoaded", () => {
  initBusinessNavigation();
  initBusinessSalesChart();
  renderBusinessOverview();
  renderBusinessListings();
  renderBusinessOrders();
  renderBusinessInventory();
  renderBusinessAnalytics();
  initAddListingForm();
  initImageUploadPreview();
  initBusinessProfileForm();
  initBusinessSidebarToggle();
});

// Local business state initialized from PLENTI_MOCK
const bizState = {
  currentTab: "overview",
  chartPeriod: "weekly",
  listingFilter: "all",
  orderFilter: "all",
  profile: { ...PLENTI_MOCK.business.profile },
  stats: { ...PLENTI_MOCK.business.stats },
  listings: [...PLENTI_MOCK.business.listings],
  orders: [...PLENTI_MOCK.business.orders],
  inventory: [...PLENTI_MOCK.business.inventory]
};

// ==================== NAVIGATION ====================
function initBusinessNavigation() {
  const navItems = document.querySelectorAll(".dash-nav-item[data-tab]");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = item.getAttribute("data-tab");
      switchBusinessTab(tab);
    });
  });

  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(`sec-${hash}`)) {
    switchBusinessTab(hash);
  }
}

function switchBusinessTab(tabId) {
  bizState.currentTab = tabId;

  document.querySelectorAll(".dash-nav-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  document.querySelectorAll(".dash-section").forEach(sec => {
    sec.classList.remove("active");
  });

  const activeSection = document.getElementById(`sec-${tabId}`);
  if (activeSection) {
    activeSection.classList.add("active");
  }

  const headingEl = document.getElementById("bizPageTitle");
  if (headingEl) {
    const titles = {
      overview: "Business Dashboard Overview",
      listings: "Surplus Food Listings",
      "add-listing": "Create New Surplus Listing",
      orders: "Customer Orders & Fulfillment",
      inventory: "Surplus Inventory Tracker",
      analytics: "Sales & Performance Analytics",
      profile: "Business Profile & Storefront Info",
      settings: "Store Settings & Preferences"
    };
    headingEl.textContent = titles[tabId] || "Merchant Dashboard";
  }

  window.location.hash = tabId;
  closeMobileSidebar();
}

// ==================== OVERVIEW RENDERING ====================
function renderBusinessOverview() {
  const s = bizState.stats;

  setElText("bizStatActiveListings", s.activeListings);
  setElText("bizStatTotalOrders", s.totalOrdersReceived);
  setElText("bizStatPendingOrders", s.pendingOrders);
  setElText("bizStatCompletedOrders", s.completedOrders);
  setElText("bizStatEarnings", `₹${s.totalEarnings.toLocaleString()}`);
  setElText("bizStatFoodRescued", `${s.foodRescuedKg} kg`);

  // Render quick orders table
  const tbody = document.getElementById("bizRecentOrdersTable");
  if (tbody) {
    tbody.innerHTML = bizState.orders.slice(0, 5).map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td><strong>${o.customerName}</strong></td>
        <td>${o.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</td>
        <td><strong>₹${o.totalAmount}</strong></td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td>${o.pickupWindow}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="viewBizOrderDetails('${o.id}')">Manage</button>
        </td>
      </tr>
    `).join("");
  }
}

// ==================== LISTINGS MANAGEMENT ====================
function renderBusinessListings() {
  const tbody = document.getElementById("bizListingsTable");
  if (!tbody) return;

  const search = document.getElementById("bizListingSearch")?.value.toLowerCase().trim() || "";

  const filtered = bizState.listings.filter(l => {
    const matchesSearch = !search ||
      l.name.toLowerCase().includes(search) ||
      l.category.toLowerCase().includes(search);

    const matchesStatus = (bizState.listingFilter === "all") || (l.status === bizState.listingFilter);
    return matchesSearch && matchesStatus;
  });

  setElText("bizListingsCountBadge", `${filtered.length} items`);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--dash-text-muted);">No listings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${l.image}" alt="${l.name}" style="width:48px; height:48px; object-fit:cover; border-radius:var(--radius-sm);" />
          <div>
            <div style="font-weight:750; color:var(--dash-text);">${l.name}</div>
            <div style="font-size:0.75rem; color:var(--dash-text-muted);">${l.category}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight:800; color:var(--dash-primary-dark);">₹${l.discountedPrice}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-subtle); text-decoration:line-through;">₹${l.originalPrice}</div>
      </td>
      <td>
        <span style="font-weight:800; color:var(--dash-primary); font-size:0.85rem;">${l.discountPercent}% OFF</span>
      </td>
      <td>
        <strong>${l.availableQty}</strong> left
      </td>
      <td>
        <div style="font-size:0.82rem; font-weight:600;">${l.pickupStart} – ${l.pickupEnd}</div>
      </td>
      <td>
        <span class="badge badge-${l.status}">${l.status.replace('_', ' ')}</span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="editListing('${l.id}')">Edit</button>
          <button class="btn btn-outline btn-sm" onclick="toggleListingActive('${l.id}')">
            ${l.status === 'active' ? 'Pause' : 'Activate'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteListing('${l.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

window.setListingFilter = function(filterVal) {
  bizState.listingFilter = filterVal;
  document.querySelectorAll(".listing-filter-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-filter") === filterVal);
  });
  renderBusinessListings();
};

window.toggleListingActive = function(listingId) {
  const item = bizState.listings.find(x => x.id === listingId);
  if (!item) return;

  item.status = (item.status === 'active') ? 'draft' : 'active';
  showBizToast(`Listing "${item.name}" is now ${item.status}.`);
  renderBusinessListings();
};

window.deleteListing = function(listingId) {
  const item = bizState.listings.find(x => x.id === listingId);
  if (!item) return;

  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    bizState.listings = bizState.listings.filter(x => x.id !== listingId);
    bizState.stats.activeListings = bizState.listings.filter(l => l.status === 'active').length;
    showBizToast(`Listing "${item.name}" deleted.`);
    renderBusinessListings();
    renderBusinessOverview();
  }
};

window.editListing = function(listingId) {
  const item = bizState.listings.find(x => x.id === listingId);
  if (!item) return;

  const modal = document.getElementById("bizEditListingModal");
  if (!modal) return;

  document.getElementById("editListingId").value = item.id;
  document.getElementById("editListingName").value = item.name;
  document.getElementById("editListingDesc").value = item.description;
  document.getElementById("editListingCategory").value = item.category;
  document.getElementById("editListingOrigPrice").value = item.originalPrice;
  document.getElementById("editListingDiscPrice").value = item.discountedPrice;
  document.getElementById("editListingQty").value = item.availableQty;
  document.getElementById("editListingPickupStart").value = item.pickupStart;
  document.getElementById("editListingPickupEnd").value = item.pickupEnd;

  modal.classList.add("open");
};

window.closeEditModal = function() {
  const modal = document.getElementById("bizEditListingModal");
  if (modal) modal.classList.remove("open");
};

// ==================== ADD LISTING FORM ====================
function initAddListingForm() {
  const form = document.getElementById("addListingForm");
  const origPriceInput = document.getElementById("newListingOrigPrice");
  const discPriceInput = document.getElementById("newListingDiscPrice");
  const discountCalcBadge = document.getElementById("discountCalcBadge");

  // Dynamic discount % calculator
  function updateDiscountCalc() {
    const orig = parseFloat(origPriceInput?.value) || 0;
    const disc = parseFloat(discPriceInput?.value) || 0;
    if (orig > 0 && disc > 0 && orig > disc) {
      const pct = Math.round(((orig - disc) / orig) * 100);
      if (discountCalcBadge) {
        discountCalcBadge.textContent = `${pct}% Discount`;
        discountCalcBadge.style.display = "inline-block";
      }
    } else if (discountCalcBadge) {
      discountCalcBadge.style.display = "none";
    }
  }

  if (origPriceInput && discPriceInput) {
    origPriceInput.addEventListener("input", updateDiscountCalc);
    discPriceInput.addEventListener("input", updateDiscountCalc);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("newListingName").value.trim();
      const desc = document.getElementById("newListingDesc").value.trim();
      const cat = document.getElementById("newListingCategory").value;
      const orig = parseFloat(document.getElementById("newListingOrigPrice").value) || 0;
      const disc = parseFloat(document.getElementById("newListingDiscPrice").value) || 0;
      const qty = parseInt(document.getElementById("newListingQty").value) || 1;
      const start = document.getElementById("newListingPickupStart").value || "19:00";
      const end = document.getElementById("newListingPickupEnd").value || "20:30";
      const expiry = document.getElementById("newListingExpiry").value || "";
      const instructions = document.getElementById("newListingInstructions")?.value || "";

      if (!name || orig <= 0 || disc <= 0) {
        alert("Please fill in required fields (Name, Original Price, Discount Price).");
        return;
      }

      const previewImg = document.getElementById("previewImgTag");
      const imageUrl = (previewImg && previewImg.src && !previewImg.src.includes("window.location"))
        ? previewImg.src
        : "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80";

      const discountPercent = Math.round(((orig - disc) / orig) * 100);

      const newListing = {
        id: `list-${Date.now().toString().slice(-4)}`,
        name,
        description: desc,
        category: cat,
        originalPrice: orig,
        discountedPrice: disc,
        discountPercent,
        availableQty: qty,
        initialQty: qty,
        pickupStart: start,
        pickupEnd: end,
        expiryDate: expiry,
        status: "active",
        image: imageUrl,
        specialInstructions: instructions
      };

      bizState.listings.unshift(newListing);
      bizState.stats.activeListings++;

      showBizToast(`🎉 "${name}" published live to hungry customers!`);
      form.reset();

      // Reset preview
      const previewBox = document.getElementById("imagePreviewBox");
      if (previewBox) previewBox.style.display = "none";
      if (discountCalcBadge) discountCalcBadge.style.display = "none";

      renderBusinessListings();
      renderBusinessOverview();
      switchBusinessTab("listings");
    });
  }

  // Handle Edit Form Submit
  const editForm = document.getElementById("editListingForm");
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editListingId").value;
      const item = bizState.listings.find(x => x.id === id);
      if (!item) return;

      item.name = document.getElementById("editListingName").value;
      item.description = document.getElementById("editListingDesc").value;
      item.category = document.getElementById("editListingCategory").value;
      item.originalPrice = parseFloat(document.getElementById("editListingOrigPrice").value);
      item.discountedPrice = parseFloat(document.getElementById("editListingDiscPrice").value);
      item.availableQty = parseInt(document.getElementById("editListingQty").value);
      item.pickupStart = document.getElementById("editListingPickupStart").value;
      item.pickupEnd = document.getElementById("editListingPickupEnd").value;
      item.discountPercent = Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100);

      closeEditModal();
      showBizToast(`✓ Listing "${item.name}" updated successfully.`);
      renderBusinessListings();
    });
  }
}

function initImageUploadPreview() {
  const fileInput = document.getElementById("newListingImageFile");
  const dropzone = document.getElementById("newListingDropzone");
  const previewBox = document.getElementById("imagePreviewBox");
  const previewImg = document.getElementById("previewImgTag");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewBox.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// ==================== ORDER MANAGEMENT ====================
function renderBusinessOrders() {
  const tbody = document.getElementById("bizOrdersTable");
  if (!tbody) return;

  const search = document.getElementById("bizOrderSearch")?.value.toLowerCase().trim() || "";

  const filtered = bizState.orders.filter(o => {
    const matchesSearch = !search ||
      o.id.toLowerCase().includes(search) ||
      o.customerName.toLowerCase().includes(search);

    const matchesStatus = (bizState.orderFilter === "all") || (o.status === bizState.orderFilter);
    return matchesSearch && matchesStatus;
  });

  setElText("bizOrdersCountBadge", `${filtered.length} orders`);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--dash-text-muted);">No orders matching filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>
        <div style="font-weight:750; color:var(--dash-text);">${o.customerName}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${o.customerPhone}</div>
      </td>
      <td>${o.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</td>
      <td><strong>₹${o.totalAmount}</strong></td>
      <td><span class="badge ${o.paymentStatus.includes('Paid') ? 'badge-completed' : 'badge-pending'}">${o.paymentStatus}</span></td>
      <td><span class="badge badge-${o.status}">${o.status}</span></td>
      <td>${o.pickupWindow}</td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="viewBizOrderDetails('${o.id}')">Details</button>
          ${o.status === 'pending' ? `
            <button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${o.id}', 'confirmed')">Accept</button>
            <button class="btn btn-danger btn-sm" onclick="updateOrderStatus('${o.id}', 'cancelled')">Reject</button>
          ` : ''}
          ${o.status === 'confirmed' ? `
            <button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${o.id}', 'ready')">Mark Ready</button>
          ` : ''}
          ${o.status === 'ready' ? `
            <button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${o.id}', 'completed')">Complete ✓</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");
}

window.setOrderFilter = function(filterVal) {
  bizState.orderFilter = filterVal;
  document.querySelectorAll(".order-filter-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-filter") === filterVal);
  });
  renderBusinessOrders();
};

window.updateOrderStatus = function(orderId, nextStatus) {
  const o = bizState.orders.find(x => x.id === orderId);
  if (!o) return;

  o.status = nextStatus;
  if (nextStatus === 'completed') {
    bizState.stats.completedOrders++;
    bizState.stats.totalEarnings += o.totalAmount;
  }

  showBizToast(`Order ${o.id} marked as "${nextStatus}".`);
  renderBusinessOrders();
  renderBusinessOverview();
};

window.viewBizOrderDetails = function(orderId) {
  const o = bizState.orders.find(x => x.id === orderId);
  if (!o) return;

  const modal = document.getElementById("bizOrderModal");
  const title = document.getElementById("bizOrderModalTitle");
  const body = document.getElementById("bizOrderModalBody");

  title.textContent = `Order ${o.id} — Pickup Details`;
  body.innerHTML = `
    <div style="background:#F8FAFC; border:2px dashed var(--dash-primary); border-radius:var(--radius-md); padding:16px; text-align:center; margin-bottom:18px;">
      <div style="font-size:0.75rem; text-transform:uppercase; color:var(--dash-text-muted);">Customer Verification Code</div>
      <div style="font-size:2rem; font-weight:850; font-family:monospace; color:var(--dash-text);">${o.id}</div>
      <span class="badge badge-${o.status}" style="margin-top:6px;">${o.status}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.85rem; margin-bottom:18px;">
      <div><strong>Customer:</strong> ${o.customerName}</div>
      <div><strong>Contact:</strong> ${o.customerPhone}</div>
      <div><strong>Ordered:</strong> ${o.orderTime}</div>
      <div><strong>Pickup Window:</strong> ${o.pickupWindow}</div>
      <div><strong>Payment:</strong> ${o.paymentMethod} (${o.paymentStatus})</div>
      <div><strong>Total Amount:</strong> ₹${o.totalAmount}</div>
    </div>

    <h5 style="font-weight:750; font-size:0.9rem; margin-bottom:8px;">Items in this box:</h5>
    <ul style="padding-left:18px; font-size:0.85rem; color:var(--dash-text);">
      ${o.items.map(i => `<li>${i.qty}x ${i.name} (₹${i.price} each)</li>`).join("")}
    </ul>
  `;

  modal.classList.add("open");
};

window.closeBizOrderModal = function() {
  const modal = document.getElementById("bizOrderModal");
  if (modal) modal.classList.remove("open");
};

// ==================== INVENTORY MANAGEMENT ====================
function renderBusinessInventory() {
  const tbody = document.getElementById("bizInventoryTable");
  if (!tbody) return;

  tbody.innerHTML = bizState.inventory.map(item => `
    <tr>
      <td>
        <div style="font-weight:750; color:var(--dash-text);">${item.name}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${item.unit}</div>
      </td>
      <td>${item.category}</td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-outline btn-sm" style="width:28px; height:28px; padding:0;" onclick="adjustStock('${item.id}', -1)">−</button>
          <strong style="font-size:1.05rem; min-width:24px; text-align:center;">${item.stockQty}</strong>
          <button class="btn btn-outline btn-sm" style="width:28px; height:28px; padding:0;" onclick="adjustStock('${item.id}', 1)">+</button>
        </div>
      </td>
      <td>${item.threshold} ${item.unit}</td>
      <td><span class="badge badge-${item.status}">${item.status.replace('_', ' ')}</span></td>
      <td><span style="font-size:0.8rem; color:var(--dash-text-muted);">${item.lastUpdated}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="restockItem('${item.id}')">Restock +5</button>
      </td>
    </tr>
  `).join("");
}

window.adjustStock = function(itemId, delta) {
  const item = bizState.inventory.find(x => x.id === itemId);
  if (!item) return;

  item.stockQty = Math.max(0, item.stockQty + delta);
  if (item.stockQty === 0) item.status = "out_of_stock";
  else if (item.stockQty <= item.threshold) item.status = "low_stock";
  else item.status = "in_stock";

  item.lastUpdated = "Just now";
  renderBusinessInventory();
};

window.restockItem = function(itemId) {
  const item = bizState.inventory.find(x => x.id === itemId);
  if (!item) return;

  item.stockQty += 5;
  item.status = (item.stockQty > item.threshold) ? "in_stock" : "low_stock";
  item.lastUpdated = "Just now";
  showBizToast(`Restocked +5 ${item.unit} of ${item.name}.`);
  renderBusinessInventory();
};

// ==================== SALES CHART & ANALYTICS ====================
function initBusinessSalesChart() {
  const tabs = document.querySelectorAll(".biz-chart-tab-btn[data-period]");
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(tab => tab.classList.remove("active"));
      t.classList.add("active");
      bizState.chartPeriod = t.getAttribute("data-period");
      drawBusinessSalesChart();
    });
  });

  drawBusinessSalesChart();
}

function drawBusinessSalesChart() {
  const container = document.getElementById("bizSalesChartSvg");
  if (!container) return;

  const isWeekly = bizState.chartPeriod === "weekly";
  const data = isWeekly ? PLENTI_MOCK.business.salesTrends.weekly : PLENTI_MOCK.business.salesTrends.monthly;
  const maxSales = Math.max(...data.map(d => d.sales));

  const width = 600;
  const height = 200;
  const barWidth = 36;
  const gap = (width - (data.length * barWidth)) / (data.length + 1);

  let svgHtml = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; font-family:inherit;">
      <line x1="0" y1="${height - 25}" x2="${width}" y2="${height - 25}" stroke="#E2E8F0" stroke-width="1.5" />
  `;

  data.forEach((d, idx) => {
    const x = gap + idx * (barWidth + gap);
    const barHeight = ((d.sales / maxSales) * (height - 60));
    const y = height - 25 - barHeight;

    svgHtml += `
      <g>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="url(#bizEmeraldGrad)" />
        <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" font-weight="700" fill="#065F46" text-anchor="middle">₹${(d.sales).toLocaleString()}</text>
        <text x="${x + barWidth / 2}" y="${height - 8}" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">${d.label}</text>
      </g>
    `;
  });

  svgHtml += `
      <defs>
        <linearGradient id="bizEmeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
    </svg>
  `;

  container.innerHTML = svgHtml;
}

function renderBusinessAnalytics() {
  setElText("analyticsTotalSales", `₹${bizState.stats.totalEarnings.toLocaleString()}`);
  setElText("analyticsTotalOrders", bizState.stats.totalOrdersReceived);
  setElText("analyticsAvgOrderVal", `₹${Math.round(bizState.stats.totalEarnings / bizState.stats.totalOrdersReceived)}`);
  setElText("analyticsFoodSavedKg", `${bizState.stats.foodRescuedKg} kg`);
}

// ==================== PROFILE FORM ====================
function initBusinessProfileForm() {
  const form = document.getElementById("bizProfileForm");
  if (!form) return;

  const p = bizState.profile;
  setInputValue("profileBizName", p.name);
  setInputValue("profileBizCategory", p.category);
  setInputValue("profileOwnerName", p.owner);
  setInputValue("profileBizEmail", p.email);
  setInputValue("profileBizPhone", p.phone);
  setInputValue("profileBizAddress", p.address);
  setInputValue("profileOperatingHours", p.operatingHours);
  setInputValue("profilePickupInstructions", p.pickupInstructions);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    p.name = document.getElementById("profileBizName").value;
    p.category = document.getElementById("profileBizCategory").value;
    p.owner = document.getElementById("profileOwnerName").value;
    p.email = document.getElementById("profileBizEmail").value;
    p.phone = document.getElementById("profileBizPhone").value;
    p.address = document.getElementById("profileBizAddress").value;
    p.operatingHours = document.getElementById("profileOperatingHours").value;
    p.pickupInstructions = document.getElementById("profilePickupInstructions").value;

    showBizToast("✓ Storefront profile updated successfully.");
  });
}

// ==================== HELPERS ====================
function showBizToast(msg) {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="background:var(--dash-primary); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:800;">PLENTI</span> <span>${msg}</span>`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function initBusinessSidebarToggle() {
  const toggleBtn = document.getElementById("bizMenuToggle");
  const sidebar = document.querySelector(".dash-sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    });
  }
}

function closeMobileSidebar() {
  const sidebar = document.querySelector(".dash-sidebar");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
}
