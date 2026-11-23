/**
 * PLENTI — PLATFORM ADMINISTRATOR DASHBOARD
 * Handles client-side admin analytics, business verifications, customer oversight,
 * listing moderation, and orders management.
 */

document.addEventListener("DOMContentLoaded", () => {
  initAdminNavigation();
  initAdminCharts();
  renderAdminOverview();
  renderAdminBusinesses();
  renderAdminCustomers();
  renderAdminListings();
  renderAdminOrders();
  renderAdminAnalytics();
  initAdminSearchAndFilters();
  initSidebarToggle();
  syncAdminWithMongoDB();
});

async function syncAdminWithMongoDB() {
  if (!window.PlentiAPI) return;
  try {
    const isOnline = await PlentiAPI.checkHealth();
    if (!isOnline) return;

    // Fetch live overview metrics from MongoDB
    const ovRes = await PlentiAPI.admin.getOverview();
    if (ovRes && ovRes.data) {
      const d = ovRes.data;
      if (document.getElementById('statTotalCustomers')) document.getElementById('statTotalCustomers').textContent = d.totalCustomers?.toLocaleString();
      if (document.getElementById('statTotalBusinesses')) document.getElementById('statTotalBusinesses').textContent = d.totalBusinesses?.toLocaleString();
      if (document.getElementById('statActiveListings')) document.getElementById('statActiveListings').textContent = d.activeListings?.toLocaleString();
      if (document.getElementById('statTotalRevenue')) document.getElementById('statTotalRevenue').textContent = '₹' + d.totalRevenue?.toLocaleString();
      if (document.getElementById('statFoodSaved')) document.getElementById('statFoodSaved').textContent = d.totalFoodSavedKg?.toLocaleString() + ' kg';
      if (document.getElementById('statPendingVerifications')) document.getElementById('statPendingVerifications').textContent = d.pendingVerifications;
    }

    // Fetch registered businesses from MongoDB
    const bRes = await PlentiAPI.admin.getAllBusinesses();
    if (bRes && bRes.data && bRes.data.length > 0) {
      adminState.businesses = bRes.data.map(b => ({
        id: b._id,
        name: b.businessName,
        owner: b.owner?.name || 'Partner',
        email: b.email,
        phone: b.phone || '+91 98765 00000',
        category: b.category,
        address: b.address,
        regDate: new Date(b.createdAt).toISOString().split('T')[0],
        status: b.verificationStatus === 'verified' ? 'Verified' : (b.status === 'suspended' ? 'Suspended' : 'Pending'),
        listingsCount: 4,
        foodRescuedKg: b.totalFoodRescuedKg || 120
      }));
      renderAdminBusinesses();
    }

    // Fetch customers from MongoDB
    const cRes = await PlentiAPI.admin.getAllCustomers();
    if (cRes && cRes.data && cRes.data.length > 0) {
      adminState.customers = cRes.data.map(c => ({
        id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone || '+91 99887 00000',
        city: c.city || 'Chandigarh',
        joinDate: new Date(c.createdAt).toISOString().split('T')[0],
        totalOrders: 6,
        savedKg: c.foodRescuedKg || 18,
        status: c.status === 'suspended' ? 'Suspended' : 'Active'
      }));
      renderAdminCustomers();
    }
  } catch (err) {
    console.log('[Plenti] Admin MongoDB sync note:', err.message);
  }
}

// Current local state initialized from PLENTI_MOCK
const adminState = {
  currentTab: "overview",
  chartPeriod: "weekly",
  businesses: [...PLENTI_MOCK.admin.businesses],
  customers: [...PLENTI_MOCK.admin.customers],
  orders: [...PLENTI_MOCK.admin.recentOrders],
  listings: [
    ...PLENTI_MOCK.business.listings.map(l => ({ ...l, businessName: "The Morning Oven Bakery" })),
    {
      id: "list-201",
      name: "Belgian Chocolate Pastry Sampler",
      description: "Rich dark chocolate mousse and tarts.",
      category: "Desserts",
      originalPrice: 380,
      discountedPrice: 139,
      discountPercent: 63,
      availableQty: 2,
      pickupStart: "20:00",
      pickupEnd: "21:30",
      status: "active",
      businessName: "Sweet Crumb Patisserie",
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "list-301",
      name: "Harvest Salad & Wrap Combo",
      description: "Grilled paneer quinoa bowl with herb wrap.",
      category: "Healthy Bowls",
      originalPrice: 320,
      discountedPrice: 119,
      discountPercent: 62,
      availableQty: 5,
      pickupStart: "19:30",
      pickupEnd: "21:00",
      status: "active",
      businessName: "Green Bowl Kitchen",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "list-501",
      name: "Royal Dal Makhani & Roti Thali",
      description: "Authentic slow-cooked Dal Makhani with 4 butter rotis.",
      category: "North Indian",
      originalPrice: 390,
      discountedPrice: 159,
      discountPercent: 59,
      availableQty: 4,
      pickupStart: "20:30",
      pickupEnd: "22:00",
      status: "active",
      businessName: "Punjab Heritage Kitchen",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80"
    }
  ]
};

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

  // Handle URL hash on load
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(`sec-${hash}`)) {
    switchAdminTab(hash);
  }
}

function switchAdminTab(tabId) {
  adminState.currentTab = tabId;

  // Update nav active states
  document.querySelectorAll(".dash-nav-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update view sections
  document.querySelectorAll(".dash-section").forEach(sec => {
    sec.classList.remove("active");
  });

  const activeSection = document.getElementById(`sec-${tabId}`);
  if (activeSection) {
    activeSection.classList.add("active");
  }

  // Update topbar heading
  const headingEl = document.getElementById("adminPageTitle");
  if (headingEl) {
    const titles = {
      overview: "Platform System Overview",
      businesses: "Food Business Management",
      customers: "Customer Directory & Accounts",
      listings: "Surplus Food Listings Oversight",
      orders: "Platform Order Management",
      analytics: "Reports & Environmental Analytics",
      settings: "Platform Settings & Administration"
    };
    headingEl.textContent = titles[tabId] || "Admin Dashboard";
  }

  window.location.hash = tabId;
  closeMobileSidebar();
}

// ==================== RENDER OVERVIEW ====================
function renderAdminOverview() {
  const stats = PLENTI_MOCK.admin.stats;

  setElText("statCustCount", stats.totalCustomers.toLocaleString());
  setElText("statBizCount", stats.totalBusinesses.toLocaleString());
  setElText("statListingsCount", stats.activeListings.toLocaleString());
  setElText("statOrdersCount", stats.totalOrders.toLocaleString());
  setElText("statRevenue", `₹${stats.totalRevenue.toLocaleString()}`);
  setElText("statFoodSaved", `${stats.foodRescuedKg.toLocaleString()} kg`);
  setElText("statPendingVerif", stats.pendingVerifications);

  // Render recent orders table snippet
  const recentOrdersTbody = document.getElementById("adminRecentOrdersTable");
  if (recentOrdersTbody) {
    recentOrdersTbody.innerHTML = adminState.orders.slice(0, 5).map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customer}</td>
        <td>${o.business}</td>
        <td>₹${o.amount}</td>
        <td>${o.payment}</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td>${o.time}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${o.id}')">View</button>
        </td>
      </tr>
    `).join("");
  }

  // Render recent businesses snippet
  const recentBizTbody = document.getElementById("adminRecentBizTable");
  if (recentBizTbody) {
    recentBizTbody.innerHTML = adminState.businesses.slice(0, 5).map(b => `
      <tr>
        <td>
          <strong>${b.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--dash-text-muted);">${b.address}</span>
        </td>
        <td>${b.category}</td>
        <td>${b.owner}</td>
        <td>${b.phone}</td>
        <td><span class="badge badge-${b.status}">${b.status}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="viewBusinessDetails('${b.id}')">Details</button>
        </td>
      </tr>
    `).join("");
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
    const matchesStatus = (statusFilter === "all") || (b.status === statusFilter);

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
        <div style="font-weight:750; color:var(--dash-text);">${b.name}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${b.address}</div>
      </td>
      <td><strong>${b.owner}</strong></td>
      <td>${b.category}</td>
      <td>
        <div>${b.email}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${b.phone}</div>
      </td>
      <td>${b.regDate}</td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      <td>
        <div style="font-size:0.85rem;"><strong>${b.activeListingsCount}</strong> active</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${b.totalOrdersCount} orders</div>
      </td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="viewBusinessDetails('${b.id}')">Details</button>
          ${b.status === 'pending' ? `
            <button class="btn btn-primary btn-sm" onclick="approveBusiness('${b.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectBusiness('${b.id}')">Reject</button>
          ` : ''}
          ${b.status === 'verified' ? `
            <button class="btn btn-danger btn-sm" onclick="toggleBusinessStatus('${b.id}')">Suspend</button>
          ` : ''}
          ${b.status === 'suspended' ? `
            <button class="btn btn-primary btn-sm" onclick="toggleBusinessStatus('${b.id}')">Reactivate</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");
}

window.approveBusiness = function(bizId) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  b.status = "verified";
  showAdminToast(`✓ "${b.name}" approved and verified as official food partner!`);
  renderAdminBusinesses();
  renderAdminOverview();
};

window.rejectBusiness = function(bizId) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  if (confirm(`Are you sure you want to reject verification for ${b.name}?`)) {
    adminState.businesses = adminState.businesses.filter(x => x.id !== bizId);
    showAdminToast(`Verification request for "${b.name}" was rejected.`);
    renderAdminBusinesses();
    renderAdminOverview();
  }
};

window.toggleBusinessStatus = function(bizId) {
  const b = adminState.businesses.find(x => x.id === bizId);
  if (!b) return;

  const nextStatus = b.status === "verified" ? "suspended" : "verified";
  const actionText = nextStatus === "suspended" ? "suspend" : "reactivate";

  if (confirm(`Do you wish to ${actionText} ${b.name}?`)) {
    b.status = nextStatus;
    showAdminToast(`Business "${b.name}" is now ${nextStatus}.`);
    renderAdminBusinesses();
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
        <h4 style="font-size:1.2rem; font-weight:800; color:var(--dash-text); margin-bottom:4px;">${b.name}</h4>
        <div style="font-size:0.85rem; color:var(--dash-text-muted);">📍 ${b.address}</div>
      </div>
      <div>
        <span class="badge badge-${b.status}">${b.status}</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#F8FAFC; border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px; font-size:0.85rem;">
      <div><strong>Owner:</strong> ${b.owner}</div>
      <div><strong>Category:</strong> ${b.category}</div>
      <div><strong>Email:</strong> ${b.email}</div>
      <div><strong>Phone:</strong> ${b.phone}</div>
      <div><strong>Registered on:</strong> ${b.regDate}</div>
      <div><strong>Customer Rating:</strong> ★ ${b.rating || 'N/A'}</div>
      <div><strong>Total Sales:</strong> ₹${b.totalEarnings.toLocaleString()}</div>
      <div><strong>Completed Orders:</strong> ${b.totalOrdersCount}</div>
    </div>

    <h5 style="font-weight:750; font-size:0.95rem; margin-bottom:8px;">Recent Listings from this Business:</h5>
    <ul style="font-size:0.85rem; color:var(--dash-text-muted); padding-left:18px; margin-bottom:16px;">
      <li>Evening Bakery Surprise Box (3 units available · ₹149)</li>
      <li>Assorted French Croissant Duo (4 units available · ₹99)</li>
      <li>Country Sourdough Loaf (2 units available · ₹119)</li>
    </ul>
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

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <div style="font-weight:750; color:var(--dash-text);">${c.name}</div>
        <div style="font-size:0.75rem; color:var(--dash-text-muted);">${c.location}</div>
      </td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.joinDate}</td>
      <td><strong>${c.ordersCount}</strong> orders</td>
      <td><strong>₹${c.totalSpent.toLocaleString()}</strong></td>
      <td><span class="badge badge-${c.status === 'active' ? 'active' : 'suspended'}">${c.status}</span></td>
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

window.toggleCustomerStatus = function(custId) {
  const c = adminState.customers.find(x => x.id === custId);
  if (!c) return;

  const nextStatus = c.status === "active" ? "suspended" : "active";
  if (confirm(`Are you sure you want to ${nextStatus === 'suspended' ? 'suspend' : 'reactivate'} ${c.name}?`)) {
    c.status = nextStatus;
    showAdminToast(`Customer ${c.name} status updated to ${nextStatus}.`);
    renderAdminCustomers();
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
        ${c.name.split(' ').map(n=>n[0]).join('')}
      </div>
      <div>
        <h4 style="font-size:1.2rem; font-weight:800; margin-bottom:2px;">${c.name}</h4>
        <div style="font-size:0.85rem; color:var(--dash-text-muted);">${c.email} · ${c.phone}</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#F8FAFC; border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px; font-size:0.85rem;">
      <div><strong>Primary Area:</strong> ${c.location}</div>
      <div><strong>Member Since:</strong> ${c.joinDate}</div>
      <div><strong>Orders Rescued:</strong> ${c.ordersCount} meals</div>
      <div><strong>Total Expenditure:</strong> ₹${c.totalSpent.toLocaleString()}</div>
      <div><strong>Account Standing:</strong> <span class="badge badge-${c.status === 'active' ? 'active' : 'suspended'}">${c.status}</span></div>
      <div><strong>Estimated Food Waste Saved:</strong> ${(c.ordersCount * 1.8).toFixed(1)} kg</div>
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

  tbody.innerHTML = filtered.map(l => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${l.image}" alt="${l.name}" style="width:44px; height:44px; object-fit:cover; border-radius:var(--radius-sm);" />
          <div>
            <div style="font-weight:750; color:var(--dash-text);">${l.name}</div>
            <div style="font-size:0.75rem; color:var(--dash-text-muted);">${l.category}</div>
          </div>
        </div>
      </td>
      <td><strong>${l.businessName}</strong></td>
      <td>
        <strong>₹${l.discountedPrice}</strong>
        <span style="font-size:0.75rem; color:var(--dash-text-subtle); text-decoration:line-through;">₹${l.originalPrice}</span>
        <span style="font-size:0.75rem; color:var(--dash-primary); font-weight:700;">(${l.discountPercent}% OFF)</span>
      </td>
      <td><strong>${l.availableQty}</strong> left</td>
      <td>${l.pickupStart} – ${l.pickupEnd}</td>
      <td><span class="badge badge-${l.status}">${l.status}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="viewListingDetails('${l.id}')">View</button>
          <button class="btn btn-danger btn-sm" onclick="removeListingAdmin('${l.id}')">Remove</button>
        </div>
      </td>
    </tr>
  `).join("");
}

window.removeListingAdmin = function(listingId) {
  const l = adminState.listings.find(x => x.id === listingId);
  if (!l) return;

  if (confirm(`Remove listing "${l.name}" from the public marketplace for policy compliance?`)) {
    adminState.listings = adminState.listings.filter(x => x.id !== listingId);
    showAdminToast(`Listing "${l.name}" has been removed.`);
    renderAdminListings();
  }
};

window.viewListingDetails = function(listingId) {
  const l = adminState.listings.find(x => x.id === listingId);
  if (!l) return;

  const modalBody = document.getElementById("adminModalBody");
  const modalTitle = document.getElementById("adminModalTitle");

  modalTitle.textContent = "Surplus Listing Information";
  modalBody.innerHTML = `
    <img src="${l.image}" alt="${l.name}" style="width:100%; height:180px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:16px;" />
    <h4 style="font-size:1.25rem; font-weight:800; margin-bottom:4px;">${l.name}</h4>
    <p style="font-size:0.85rem; color:var(--dash-text-muted); margin-bottom:12px;">Provided by <strong>${l.businessName}</strong></p>
    <p style="font-size:0.9rem; line-height:1.5; color:var(--dash-text); margin-bottom:16px;">${l.description}</p>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:#F8FAFC; border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:12px; font-size:0.85rem;">
      <div><strong>Category:</strong> ${l.category}</div>
      <div><strong>Surplus Price:</strong> ₹${l.discountedPrice} (Save ${l.discountPercent}%)</div>
      <div><strong>Available Stock:</strong> ${l.availableQty} packages</div>
      <div><strong>Pickup Window:</strong> ${l.pickupStart} – ${l.pickupEnd}</div>
      <div><strong>Current Status:</strong> <span class="badge badge-${l.status}">${l.status}</span></div>
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
      o.business.toLowerCase().includes(search);
    const matchesStatus = (statusFilter === "all") || (o.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  setElText("ordersFilteredCount", `${filtered.length} orders`);

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td><strong>${o.customer}</strong></td>
      <td>${o.business}</td>
      <td>${o.item}</td>
      <td>${o.quantity}</td>
      <td><strong>₹${o.amount}</strong></td>
      <td>${o.payment}</td>
      <td><span class="badge badge-${o.status}">${o.status}</span></td>
      <td>${o.time}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${o.id}')">Details</button>
      </td>
    </tr>
  `).join("");
}

window.viewOrderDetails = function(orderId) {
  const o = adminState.orders.find(x => x.id === orderId);
  if (!o) return;

  const modalBody = document.getElementById("adminModalBody");
  const modalTitle = document.getElementById("adminModalTitle");

  modalTitle.textContent = `Order Dossier — ${o.id}`;
  modalBody.innerHTML = `
    <div style="background:#F8FAFC; border:2px dashed var(--dash-primary); border-radius:var(--radius-md); padding:16px; text-align:center; margin-bottom:16px;">
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--dash-text-muted);">Pickup Code</div>
      <div style="font-size:1.8rem; font-weight:850; font-family:monospace; color:var(--dash-text);">${o.id}</div>
      <span class="badge badge-${o.status}" style="margin-top:6px;">Status: ${o.status}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.85rem; margin-bottom:16px;">
      <div><strong>Customer:</strong> ${o.customer}</div>
      <div><strong>Food Partner:</strong> ${o.business}</div>
      <div><strong>Item Ordered:</strong> ${o.item}</div>
      <div><strong>Quantity:</strong> ${o.quantity}</div>
      <div><strong>Total Amount:</strong> ₹${o.amount}</div>
      <div><strong>Payment:</strong> ${o.payment}</div>
      <div><strong>Order Timestamp:</strong> ${o.date} (${o.time})</div>
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

  drawRevenueChart();
}

function drawRevenueChart() {
  const container = document.getElementById("adminRevenueChartSvg");
  if (!container) return;

  const isWeekly = adminState.chartPeriod === "weekly";
  const data = isWeekly ? PLENTI_MOCK.admin.revenueTrends.weekly : PLENTI_MOCK.admin.revenueTrends.monthly;
  const maxRev = Math.max(...data.map(d => d.revenue));

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
  toast.innerHTML = `<span style="background:var(--dash-primary); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:800;">ADMIN</span> <span>${msg}</span>`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
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
