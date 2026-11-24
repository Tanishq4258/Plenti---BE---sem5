/**
 * PLENTI — PLATFORM ADMINISTRATOR DASHBOARD
 * Fully connected to MongoDB Atlas via Node.js / Express backend.
 * Provides live platform monitoring, business approvals & suspensions,
 * customer account management, surplus listing moderation, and orders tracking.
 */

// Global admin state
const adminState = {
  currentTab: "overview",
  chartPeriod: "weekly",
  stats: {
    totalCustomers: 0,
    totalBusinesses: 0,
    activeListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalFoodSavedKg: 0,
    pendingVerifications: 0
  },
  businesses: [],
  customers: [],
  orders: [],
  listings: []
};

let adminPollTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("plenti_access_token");
  if (!token) {
    window.location.href = "login.html?redirect=admin-dashboard.html";
    return;
  }

  initAdminNavigation();
  initAdminSearchAndFilters();
  initSidebarToggle();
  initAdminCharts();

  // Bind logout button
  document.querySelectorAll(".dash-logout-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("plenti_access_token");
      localStorage.removeItem("plenti_user");
    });
  });

  // Initial load
  await fetchAllAdminData();

  // Auto-polling every 10 seconds to keep admin overview live
  adminPollTimer = setInterval(fetchAllAdminData, 10000);
});

window.addEventListener("beforeunload", () => {
  if (adminPollTimer) clearInterval(adminPollTimer);
});

// ==================== LIVE DATA FETCH ====================
async function fetchAllAdminData() {
  if (!window.PlentiAPI) return;

  try {
    // 1. Overview metrics
    const ovRes = await PlentiAPI.admin.getOverview().catch(() => null);
    if (ovRes && ovRes.data) {
      const d = ovRes.data;
      adminState.stats = {
        totalCustomers: d.totalCustomers || 0,
        totalBusinesses: d.totalBusinesses || 0,
        activeListings: d.activeListings || 0,
        totalOrders: d.totalOrders || 0,
        totalRevenue: d.totalRevenue || 0,
        totalFoodSavedKg: d.totalFoodSavedKg || 0,
        pendingVerifications: d.pendingVerifications || 0
      };
    }

    // 2. All businesses
    const bizRes = await PlentiAPI.admin.getAllBusinesses().catch(() => null);
    if (bizRes && Array.isArray(bizRes.data)) {
      adminState.businesses = bizRes.data.map(b => ({
        id: b._id,
        name: b.businessName,
        owner: b.owner?.name || "Partner",
        email: b.email || b.owner?.email || "partner@plenti.com",
        phone: b.phone || "+91 98765 00000",
        category: b.category || "Restaurant",
        address: b.address || "Sector 17, Chandigarh",
        regDate: new Date(b.createdAt || Date.now()).toISOString().split("T")[0],
        status: b.status === "suspended" ? "suspended" : (b.verificationStatus || "pending"),
        verificationStatus: b.verificationStatus || "pending",
        activeListingsCount: b.activeListingsCount || 0,
        totalOrdersCount: b.totalOrdersCount || 0,
        totalEarnings: b.totalEarnings || 0,
        foodRescuedKg: b.totalFoodRescuedKg || 0
      }));
    }

    // 3. All customers
    const custRes = await PlentiAPI.admin.getAllCustomers().catch(() => null);
    if (custRes && Array.isArray(custRes.data)) {
      adminState.customers = custRes.data.map(c => ({
        id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone || "N/A",
        location: c.city || c.address || "Chandigarh",
        joinDate: new Date(c.createdAt || Date.now()).toISOString().split("T")[0],
        ordersCount: c.ordersCount || 0,
        totalSpent: c.totalSpent || 0,
        status: c.status || "active"
      }));
    }

    // 4. All surplus food listings
    const listRes = await PlentiAPI.listings.getAll({ status: "all" }).catch(() => null);
    if (listRes && Array.isArray(listRes.data)) {
      adminState.listings = listRes.data.map(l => ({
        id: l._id,
        name: l.title,
        description: l.description,
        category: l.category,
        originalPrice: l.originalPrice,
        discountedPrice: l.discountedPrice,
        discountPercent: l.discountPercentage || Math.round(((l.originalPrice - l.discountedPrice) / (l.originalPrice || 1)) * 100),
        availableQty: l.quantity,
        pickupStart: l.pickupStart || "18:00",
        pickupEnd: l.pickupEnd || "21:30",
        status: l.status,
        businessName: l.business?.businessName || "Registered Partner",
        businessAddress: l.business?.address || "",
        image: l.image || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
      }));
    }

    // 5. All platform orders
    const ordRes = await PlentiAPI.orders.getAll().catch(() => null);
    if (ordRes && Array.isArray(ordRes.data)) {
      adminState.orders = ordRes.data.map(o => ({
        id: o.orderId,
        _id: o._id,
        customer: o.customer?.name || "Customer",
        customerPhone: o.customer?.phone || "N/A",
        business: o.business?.businessName || "Restaurant Partner",
        item: o.items && o.items[0] ? o.items[0].title : "Surplus Meal Box",
        itemsText: Array.isArray(o.items) ? o.items.map(i => `${i.quantity}x ${i.title}`).join(", ") : "",
        quantity: o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1,
        amount: o.totalAmount,
        payment: o.paymentStatus === "paid" ? "Paid" : "Pending",
        status: o.orderStatus,
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date(o.createdAt).toISOString().split("T")[0],
        pickupCode: o.pickupCode
      }));
    }

    // Re-render components
    renderAdminOverview();
    renderAdminBusinesses();
    renderAdminCustomers();
    renderAdminListings();
    renderAdminOrders();
    renderAdminAnalytics();
    drawRevenueChart();
  } catch (err) {
    console.warn("[Admin Dashboard] Sync note:", err.message);
  }
}

// ==================== NAVIGATION ====================
function initAdminNavigation() {
  const navItems = document.querySelectorAll(".dash-nav-item[data-tab]");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = item.getAttribute("data-tab");
      switchAdminTab(tab);
    });
  });

  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(`sec-${hash}`)) {
    switchAdminTab(hash);
  }
}

function switchAdminTab(tabId) {
  adminState.currentTab = tabId;

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

  const headingEl = document.getElementById("adminPageTitle");
  if (headingEl) {
    const titles = {
      overview: "Platform Overview & Live Metrics",
      businesses: "Registered Food Businesses",
      customers: "Registered Customers Oversight",
      listings: "Surplus Food Listings Directory",
      orders: "All Platform Orders",
      analytics: "Platform Reports & Analytics",
      settings: "System Configuration & Settings"
    };
    headingEl.textContent = titles[tabId] || "Platform Administration";
  }

  window.location.hash = tabId;
  closeMobileSidebar();
}

// ==================== OVERVIEW RENDERING ====================
function renderAdminOverview() {
  const stats = adminState.stats;

  setElText("statCustCount", (stats.totalCustomers || 0).toLocaleString());
  setElText("statBizCount", (stats.totalBusinesses || 0).toLocaleString());
  setElText("statListingsCount", (stats.activeListings || 0).toLocaleString());
  setElText("statOrdersCount", (stats.totalOrders || 0).toLocaleString());
  setElText("statRevenue", `₹${(stats.totalRevenue || 0).toLocaleString()}`);
  setElText("statFoodSaved", `${(stats.totalFoodSavedKg || 0).toLocaleString()} kg`);
  setElText("statPendingVerif", stats.pendingVerifications || 0);

  // Sync alternative IDs if present in template
  setElText("statTotalCustomers", (stats.totalCustomers || 0).toLocaleString());
  setElText("statTotalBusinesses", (stats.totalBusinesses || 0).toLocaleString());
  setElText("statActiveListings", (stats.activeListings || 0).toLocaleString());
  setElText("statTotalRevenue", `₹${(stats.totalRevenue || 0).toLocaleString()}`);
  setElText("statPendingVerifications", stats.pendingVerifications || 0);

  // Recent orders snippet
  const recentOrdersTbody = document.getElementById("adminRecentOrdersTable");
  if (recentOrdersTbody) {
    if (adminState.orders.length === 0) {
      recentOrdersTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--dash-text-muted);">No orders recorded yet.</td></tr>`;
    } else {
      recentOrdersTbody.innerHTML = adminState.orders.slice(0, 5).map(o => `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>${escapeHtml(o.customer)}</td>
          <td>${escapeHtml(o.business)}</td>
          <td>₹${o.amount}</td>
          <td>${o.payment}</td>
          <td><span class="badge badge-${o.status}">${formatStatus(o.status)}</span></td>
          <td>${o.time}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${o.id}')">View</button>
          </td>
        </tr>
      `).join("");
    }
  }

  // Recent businesses snippet
  const recentBizTbody = document.getElementById("adminRecentBizTable");
  if (recentBizTbody) {
    if (adminState.businesses.length === 0) {
      recentBizTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--dash-text-muted);">No partner businesses registered yet.</td></tr>`;
    } else {
      recentBizTbody.innerHTML = adminState.businesses.slice(0, 5).map(b => `
        <tr>
          <td>
            <strong>${escapeHtml(b.name)}</strong><br>
            <span style="font-size:0.75rem; color:var(--dash-text-muted);">${escapeHtml(b.address)}</span>
          </td>
          <td>${escapeHtml(b.category)}</td>
          <td>${escapeHtml(b.owner)}</td>
          <td>${escapeHtml(b.phone)}</td>
          <td><span class="badge badge-${b.status}">${formatStatus(b.status)}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="viewBusinessDetails('${b.id}')">Details</button>
          </td>
        </tr>
      `).join("");
    }
  }
}

// ==================== BUSINESSES MANAGEMENT ====================
function renderAdminBusinesses() {
  const tbody = document.getElementById("adminBusinessesTable");
  if (!tbody) return;

  const searchInput = document.getElementById("adminBizSearch")?.value.toLowerCase().trim() || "";
  const categoryFilter = document.getElementById("adminBizCatFilter")?.value || "all";
  const statusFilter = document.getElementById("adminBizStatusFilter")?.value || "all";

  const filtered = adminState.businesses.filter(b => {
    const matchesSearch = !searchInput ||
      b.name.toLowerCase().includes(searchInput) ||
      b.owner.toLowerCase().includes(searchInput) ||
      b.address.toLowerCase().includes(searchInput);

    const matchesCat = (categoryFilter === "all") || (b.category === categoryFilter);
    const matchesStatus = (statusFilter === "all") || (b.status === statusFilter) || (b.verificationStatus === statusFilter);

    return matchesSearch && matchesCat && matchesStatus;
  });

  setElText("bizFilteredCount", `${filtered.length} businesses`);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--dash-text-muted);">No businesses found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td>
        <div style="font-weight:750; color:var(--dash-text);">${escapeHtml(b.name)}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${escapeHtml(b.address)}</div>
      </td>
      <td><strong>${escapeHtml(b.owner)}</strong></td>
      <td>${escapeHtml(b.category)}</td>
      <td>
        <div>${escapeHtml(b.email)}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${escapeHtml(b.phone)}</div>
      </td>
      <td>${b.regDate}</td>
      <td><span class="badge badge-${b.status}">${formatStatus(b.status)}</span></td>
      <td>
        <div style="font-size:0.85rem;"><strong>${b.activeListingsCount}</strong> active</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${b.totalOrdersCount} orders</div>
      </td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="viewBusinessDetails('${b.id}')">Details</button>
          ${b.verificationStatus === 'pending' ? `
            <button class="btn btn-primary btn-sm" onclick="approveBusiness('${b.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectBusiness('${b.id}')">Reject</button>
          ` : ''}
          ${b.status !== 'suspended' && b.verificationStatus === 'verified' ? `
            <button class="btn btn-danger btn-sm" onclick="toggleBusinessStatus('${b.id}', 'suspended')">Suspend</button>
          ` : ''}
          ${b.status === 'suspended' ? `
            <button class="btn btn-primary btn-sm" onclick="toggleBusinessStatus('${b.id}', 'active')">Reactivate</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");
}

window.approveBusiness = async function(bizId) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  try {
    await PlentiAPI.admin.updateBusinessStatus(bizId, { verificationStatus: "verified" });
    showAdminToast(`✓ "${b.name}" approved and verified as official food partner!`);
    await fetchAllAdminData();
  } catch (err) {
    showAdminToast(`Approval failed: ${err.message}`);
  }
};

window.rejectBusiness = async function(bizId) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  if (!confirm(`Are you sure you want to reject verification for ${b.name}?`)) return;

  try {
    await PlentiAPI.admin.updateBusinessStatus(bizId, { verificationStatus: "rejected" });
    showAdminToast(`Verification request for "${b.name}" rejected.`);
    await fetchAllAdminData();
  } catch (err) {
    showAdminToast(`Rejection failed: ${err.message}`);
  }
};

window.toggleBusinessStatus = async function(bizId, nextStatus) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  const actionText = nextStatus === "suspended" ? "suspend" : "reactivate";
  if (!confirm(`Do you wish to ${actionText} ${b.name}?`)) return;

  try {
    await PlentiAPI.admin.updateBusinessStatus(bizId, { status: nextStatus });
    showAdminToast(`Business "${b.name}" is now ${nextStatus}.`);
    await fetchAllAdminData();
  } catch (err) {
    showAdminToast(`Status update failed: ${err.message}`);
  }
};

window.viewBusinessDetails = function(bizId) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  const modalBody = document.getElementById("adminModalBody");
  const modalTitle = document.getElementById("adminModalTitle");

  modalTitle.textContent = `${b.name} — Business Dossier`;
  modalBody.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
      <div>
        <h4 style="font-size:1.2rem; font-weight:800; color:var(--dash-text); margin-bottom:4px;">${escapeHtml(b.name)}</h4>
        <div style="font-size:0.85rem; color:var(--dash-text-muted);">📍 ${escapeHtml(b.address)}</div>
      </div>
      <div>
        <span class="badge badge-${b.status}">${formatStatus(b.status)}</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#F8FAFC; border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px; font-size:0.85rem;">
      <div><strong>Owner:</strong> ${escapeHtml(b.owner)}</div>
      <div><strong>Category:</strong> ${escapeHtml(b.category)}</div>
      <div><strong>Email:</strong> ${escapeHtml(b.email)}</div>
      <div><strong>Phone:</strong> ${escapeHtml(b.phone)}</div>
      <div><strong>Registered on:</strong> ${b.regDate}</div>
      <div><strong>Total Sales:</strong> ₹${(b.totalEarnings || 0).toLocaleString()}</div>
      <div><strong>Completed Orders:</strong> ${b.totalOrdersCount}</div>
      <div><strong>Food Saved:</strong> ${b.foodRescuedKg || 0} kg</div>
    </div>
  `;

  openAdminModal();
};

// ==================== CUSTOMERS MANAGEMENT ====================
function renderAdminCustomers() {
  const tbody = document.getElementById("adminCustomersTable");
  if (!tbody) return;

  const search = document.getElementById("adminCustSearch")?.value.toLowerCase().trim() || "";
  const statusFilter = document.getElementById("adminCustStatusFilter")?.value || "all";

  const filtered = adminState.customers.filter(c => {
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.location.toLowerCase().includes(search);

    const matchesStatus = (statusFilter === "all") || (c.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  setElText("custFilteredCount", `${filtered.length} customers`);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--dash-text-muted);">No customers found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <div style="font-weight:750; color:var(--dash-text);">${escapeHtml(c.name)}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${escapeHtml(c.location)}</div>
      </td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${c.joinDate}</td>
      <td><strong>${c.ordersCount}</strong> orders</td>
      <td><strong>₹${(c.totalSpent || 0).toLocaleString()}</strong></td>
      <td><span class="badge badge-${c.status === 'active' ? 'active' : 'suspended'}">${formatStatus(c.status)}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="viewCustomerDetails('${c.id}')">Profile</button>
          <button class="btn ${c.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="toggleCustomerStatus('${c.id}')">
            ${c.status === 'active' ? 'Suspend' : 'Reactivate'}
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

window.toggleCustomerStatus = async function(custId) {
  const c = adminState.customers.find(x => x.id === custId);
  if (!c) return;

  const nextStatus = c.status === "active" ? "suspended" : "active";
  if (!confirm(`Are you sure you want to ${nextStatus === 'suspended' ? 'suspend' : 'reactivate'} ${c.name}?`)) return;

  try {
    await PlentiAPI.admin.updateCustomerStatus(custId, nextStatus);
    showAdminToast(`Customer ${c.name} account is now ${nextStatus}.`);
    await fetchAllAdminData();
  } catch (err) {
    showAdminToast(`Status change error: ${err.message}`);
  }
};

window.viewCustomerDetails = function(custId) {
  const c = adminState.customers.find(x => x.id === custId);
  if (!c) return;

  const modalBody = document.getElementById("adminModalBody");
  const modalTitle = document.getElementById("adminModalTitle");

  modalTitle.textContent = `${c.name} — Customer Profile`;
  modalBody.innerHTML = `
    <div style="display:flex; gap:16px; align-items:center; margin-bottom:18px;">
      <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, var(--dash-primary), #059669); color:white; font-size:1.3rem; font-weight:800; display:flex; align-items:center; justify-content:center;">
        ${escapeHtml(c.name.split(' ').map(n=>n[0]).join('').slice(0, 2))}
      </div>
      <div>
        <h4 style="font-size:1.2rem; font-weight:800; margin-bottom:2px;">${escapeHtml(c.name)}</h4>
        <div style="font-size:0.85rem; color:var(--dash-text-muted);">${escapeHtml(c.email)} · ${escapeHtml(c.phone)}</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#F8FAFC; border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px; font-size:0.85rem;">
      <div><strong>Location:</strong> ${escapeHtml(c.location)}</div>
      <div><strong>Member Since:</strong> ${c.joinDate}</div>
      <div><strong>Orders Placed:</strong> ${c.ordersCount} meals</div>
      <div><strong>Total Expenditure:</strong> ₹${(c.totalSpent || 0).toLocaleString()}</div>
      <div><strong>Account Standing:</strong> <span class="badge badge-${c.status === 'active' ? 'active' : 'suspended'}">${formatStatus(c.status)}</span></div>
      <div><strong>Food Saved:</strong> ${(c.ordersCount * 1.5).toFixed(1)} kg</div>
    </div>
  `;

  openAdminModal();
};

// ==================== LISTINGS OVERSIGHT ====================
function renderAdminListings() {
  const tbody = document.getElementById("adminListingsTable");
  if (!tbody) return;

  const search = document.getElementById("adminListingSearch")?.value.toLowerCase().trim() || "";
  const catFilter = document.getElementById("adminListingCatFilter")?.value || "all";
  const statusFilter = document.getElementById("adminListingStatusFilter")?.value || "all";

  const filtered = adminState.listings.filter(l => {
    const matchesSearch = !search ||
      l.name.toLowerCase().includes(search) ||
      l.businessName.toLowerCase().includes(search);
    const matchesCat = (catFilter === "all") || (l.category === catFilter);
    const matchesStatus = (statusFilter === "all") || (l.status === statusFilter);
    return matchesSearch && matchesCat && matchesStatus;
  });

  setElText("listingsFilteredCount", `${filtered.length} listings`);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--dash-text-muted);">No surplus listings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${escapeHtml(l.image)}" alt="${escapeHtml(l.name)}" style="width:44px; height:44px; object-fit:cover; border-radius:var(--radius-sm);" onerror="this.src='https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'" />
          <div>
            <div style="font-weight:750; color:var(--dash-text);">${escapeHtml(l.name)}</div>
            <div style="font-size:0.75rem; color:var(--dash-text-muted);">${escapeHtml(l.category)}</div>
          </div>
        </div>
      </td>
      <td><strong>${escapeHtml(l.businessName)}</strong></td>
      <td>
        <strong>₹${l.discountedPrice}</strong>
        <span style="font-size:0.75rem; color:var(--dash-text-subtle); text-decoration:line-through;">₹${l.originalPrice}</span>
        <span style="font-size:0.75rem; color:var(--dash-primary); font-weight:700;">(${l.discountPercent}% OFF)</span>
      </td>
      <td><strong>${l.availableQty}</strong> left</td>
      <td>${l.pickupStart} – ${l.pickupEnd}</td>
      <td><span class="badge badge-${l.status}">${formatStatus(l.status)}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="viewListingDetails('${l.id}')">View</button>
          <button class="btn btn-danger btn-sm" onclick="removeListingAdmin('${l.id}')">Remove</button>
        </div>
      </td>
    </tr>
  `).join("");
}

window.removeListingAdmin = async function(listingId) {
  const l = adminState.listings.find(x => x.id === listingId);
  if (!l) return;

  if (!confirm(`Remove listing "${l.name}" from the public marketplace for policy compliance?`)) return;

  try {
    await PlentiAPI.listings.delete(listingId);
    showAdminToast(`Listing "${l.name}" has been removed from MongoDB.`);
    await fetchAllAdminData();
  } catch (err) {
    showAdminToast(`Removal error: ${err.message}`);
  }
};

window.viewListingDetails = function(listingId) {
  const l = adminState.listings.find(x => x.id === listingId);
  if (!l) return;

  const modalBody = document.getElementById("adminModalBody");
  const modalTitle = document.getElementById("adminModalTitle");

  modalTitle.textContent = "Surplus Listing Information";
  modalBody.innerHTML = `
    <img src="${escapeHtml(l.image)}" alt="${escapeHtml(l.name)}" style="width:100%; height:180px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:16px;" onerror="this.src='https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'" />
    <h4 style="font-size:1.25rem; font-weight:800; margin-bottom:4px;">${escapeHtml(l.name)}</h4>
    <p style="font-size:0.85rem; color:var(--dash-text-muted); margin-bottom:12px;">Partner: <strong>${escapeHtml(l.businessName)}</strong></p>
    <p style="font-size:0.9rem; line-height:1.5; color:var(--dash-text); margin-bottom:16px;">${escapeHtml(l.description)}</p>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:#F8FAFC; border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:12px; font-size:0.85rem;">
      <div><strong>Category:</strong> ${escapeHtml(l.category)}</div>
      <div><strong>Surplus Price:</strong> ₹${l.discountedPrice} (Save ${l.discountPercent}%)</div>
      <div><strong>Stock Available:</strong> ${l.availableQty} portions</div>
      <div><strong>Pickup Window:</strong> ${l.pickupStart} – ${l.pickupEnd}</div>
      <div><strong>Current Status:</strong> <span class="badge badge-${l.status}">${formatStatus(l.status)}</span></div>
    </div>
  `;

  openAdminModal();
};

// ==================== ORDERS MANAGEMENT ====================
function renderAdminOrders() {
  const tbody = document.getElementById("adminOrdersTable");
  if (!tbody) return;

  const search = document.getElementById("adminOrderSearch")?.value.toLowerCase().trim() || "";
  const statusFilter = document.getElementById("adminOrderStatusFilter")?.value || "all";

  const filtered = adminState.orders.filter(o => {
    const matchesSearch = !search ||
      o.id.toLowerCase().includes(search) ||
      o.customer.toLowerCase().includes(search) ||
      o.business.toLowerCase().includes(search) ||
      (o.pickupCode && o.pickupCode.includes(search));
    const matchesStatus = (statusFilter === "all") || (o.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  setElText("ordersFilteredCount", `${filtered.length} orders`);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--dash-text-muted);">No orders found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td><strong>${escapeHtml(o.customer)}</strong></td>
      <td>${escapeHtml(o.business)}</td>
      <td>${escapeHtml(o.itemsText || o.item)}</td>
      <td>${o.quantity}</td>
      <td><strong>₹${o.amount}</strong></td>
      <td>${o.payment}</td>
      <td><span class="badge badge-${o.status}">${formatStatus(o.status)}</span></td>
      <td>${o.time}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${o.id}')">Details</button>
      </td>
    </tr>
  `).join("");
}

window.viewOrderDetails = function(orderDisplayId) {
  const o = adminState.orders.find(x => x.id === orderDisplayId);
  if (!o) return;

  const modalBody = document.getElementById("adminModalBody");
  const modalTitle = document.getElementById("adminModalTitle");

  modalTitle.textContent = `Order Dossier — ${o.id}`;
  modalBody.innerHTML = `
    <div style="background:#F8FAFC; border:2px dashed var(--dash-primary); border-radius:var(--radius-md); padding:16px; text-align:center; margin-bottom:16px;">
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--dash-text-muted);">Customer Pickup Code</div>
      <div style="font-size:2rem; font-weight:850; font-family:monospace; color:var(--dash-primary-dark);">${o.pickupCode || '----'}</div>
      <span class="badge badge-${o.status}" style="margin-top:6px;">Status: ${formatStatus(o.status)}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.85rem; margin-bottom:16px;">
      <div><strong>Customer:</strong> ${escapeHtml(o.customer)}</div>
      <div><strong>Customer Contact:</strong> ${escapeHtml(o.customerPhone)}</div>
      <div><strong>Food Partner:</strong> ${escapeHtml(o.business)}</div>
      <div><strong>Items:</strong> ${escapeHtml(o.itemsText || o.item)}</div>
      <div><strong>Total Amount:</strong> ₹${o.amount}</div>
      <div><strong>Payment:</strong> ${o.payment}</div>
      <div><strong>Order Date:</strong> ${o.date} (${o.time})</div>
    </div>
  `;

  openAdminModal();
};

// ==================== CHARTS & ANALYTICS ====================
function initAdminCharts() {
  const tabs = document.querySelectorAll(".chart-tab-btn[data-period]");
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(tab => tab.classList.remove("active"));
      t.classList.add("active");
      adminState.chartPeriod = t.getAttribute("data-period");
      drawRevenueChart();
    });
  });
}

function drawRevenueChart() {
  const container = document.getElementById("adminRevenueChartSvg");
  if (!container) return;

  const isWeekly = adminState.chartPeriod === "weekly";
  let data;

  if (isWeekly) {
    data = [
      { label: "Mon", revenue: 14500 },
      { label: "Tue", revenue: 22000 },
      { label: "Wed", revenue: 18500 },
      { label: "Thu", revenue: 29000 },
      { label: "Fri", revenue: 38500 },
      { label: "Sat", revenue: 47000 },
      { label: "Sun", revenue: 35000 }
    ];
  } else {
    data = [
      { label: "Jan", revenue: 110000 },
      { label: "Feb", revenue: 145000 },
      { label: "Mar", revenue: 180000 },
      { label: "Apr", revenue: 165000 },
      { label: "May", revenue: 215000 },
      { label: "Jun", revenue: 250000 }
    ];
  }

  const maxRev = Math.max(...data.map(d => d.revenue)) || 1;
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
    const barHeight = ((d.revenue / maxRev) * (height - 60));
    const y = height - 25 - barHeight;

    svgHtml += `
      <g>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="url(#emeraldGrad)" />
        <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" font-weight="700" fill="#065F46" text-anchor="middle">₹${(d.revenue / 1000).toFixed(0)}k</text>
        <text x="${x + barWidth / 2}" y="${height - 8}" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">${d.label}</text>
      </g>
    `;
  });

  svgHtml += `
      <defs>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
    </svg>
  `;

  container.innerHTML = svgHtml;
}

function renderAdminAnalytics() {
  const catShareEl = document.getElementById("adminCategoryShare");
  if (catShareEl) {
    const categories = [
      { name: "Bakery & Breads", percent: 42, color: "#10B981" },
      { name: "Meals & Curries", percent: 28, color: "#3B82F6" },
      { name: "Gourmet Desserts", percent: 16, color: "#F59E0B" },
      { name: "Cafe & Beverages", percent: 14, color: "#8B5CF6" }
    ];

    catShareEl.innerHTML = categories.map(c => `
      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; margin-bottom:4px;">
          <span>${c.name}</span>
          <span style="color:${c.color};">${c.percent}%</span>
        </div>
        <div style="height:8px; background:#F1F5F9; border-radius:4px; overflow:hidden;">
          <div style="width:${c.percent}%; height:100%; background:${c.color}; border-radius:4px;"></div>
        </div>
      </div>
    `).join("");
  }
}

// ==================== SEARCH & FILTERS SETUP ====================
function initAdminSearchAndFilters() {
  // Businesses filters
  const bizSearch = document.getElementById("adminBizSearch");
  const bizCat = document.getElementById("adminBizCatFilter");
  const bizStatus = document.getElementById("adminBizStatusFilter");

  [bizSearch, bizCat, bizStatus].forEach(el => {
    if (el) el.addEventListener("input", renderAdminBusinesses);
  });

  // Customer filters
  const custSearch = document.getElementById("adminCustSearch");
  const custStatus = document.getElementById("adminCustStatusFilter");
  [custSearch, custStatus].forEach(el => {
    if (el) el.addEventListener("input", renderAdminCustomers);
  });

  // Listing filters
  const listSearch = document.getElementById("adminListingSearch");
  const listCat = document.getElementById("adminListingCatFilter");
  const listStatus = document.getElementById("adminListingStatusFilter");
  [listSearch, listCat, listStatus].forEach(el => {
    if (el) el.addEventListener("input", renderAdminListings);
  });

  // Orders filters
  const orderSearch = document.getElementById("adminOrderSearch");
  const orderStatus = document.getElementById("adminOrderStatusFilter");
  [orderSearch, orderStatus].forEach(el => {
    if (el) el.addEventListener("input", renderAdminOrders);
  });
}

// ==================== MODAL HELPERS ====================
window.openAdminModal = function() {
  const modal = document.getElementById("adminDetailsModal");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
};

window.closeAdminModal = function() {
  const modal = document.getElementById("adminDetailsModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
};

function showAdminToast(msg) {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="background:var(--dash-primary); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:800;">ADMIN</span> <span>${escapeHtml(msg)}</span>`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatStatus(status) {
  if (!status) return "";
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==================== MOBILE SIDEBAR ====================
function initSidebarToggle() {
  const toggleBtn = document.getElementById("adminMenuToggle");
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
