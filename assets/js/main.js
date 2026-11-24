/**
 * PLENTI — SURPLUS FOOD MARKETPLACE
 * Interactive Frontend Client Script
 */

// Dynamic Surplus Inventory loaded live from MongoDB
let SURPLUS_INVENTORY = [];
let isLoadingInventory = true;

// App State
let currentCategory = "all";
let currentSearch = "";
let currentSort = "newest";
let activeModalItem = null;
let modalQuantity = 1;

// Document Ready
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initAuthNavbarState();
  initMarketplace();
  initModal();
  initStatsObserver();
  initLocationPicker();
});

// ==================== NAVBAR & MOBILE NAV ====================
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isOpen);
    });

    // Close mobile nav when clicking any nav link
    const mobileLinks = mobileNav.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", false);
      });
    });
  }
}

// ==================== AUTH NAVBAR STATE ====================
function initAuthNavbarState() {
  const userStr = localStorage.getItem('plenti_user');
  if (!userStr) return;

  try {
    const user = JSON.parse(userStr);
    const navActions = document.getElementById('navActions');
    const mobileNavActions = document.getElementById('mobileNavActions');
    const displayName = user.name || user.first_name || 'Food Hero';

    if (navActions) {
      navActions.innerHTML = `
        <span style="font-size:0.9rem; font-weight:700; color:var(--color-primary-dark); display:inline-flex; align-items:center; gap:6px;">
          👋 Hi, <strong>${displayName}</strong>
        </span>
        <button class="btn btn-outline btn-sm" onclick="handleLogout()">Log Out</button>
      `;
    }

    if (mobileNavActions) {
      mobileNavActions.innerHTML = `
        <div style="font-weight:700; font-size:1rem; color:var(--color-primary-dark); margin-bottom:8px;">
          👋 Signed in as <strong>${displayName}</strong>
        </div>
        <button class="btn btn-outline" style="width:100%;" onclick="handleLogout()">Log Out</button>
      `;
    }
  } catch (err) {
    console.warn('Failed to parse user session', err);
  }
}

window.handleLogout = function() {
  localStorage.removeItem('plenti_user');
  localStorage.removeItem('plenti_access_token');
  localStorage.removeItem('plenti_refresh_token');
  showToast('Logged out successfully.');
  setTimeout(() => location.reload(), 600);
};

// ==================== MARKETPLACE LOGIC ====================
function initMarketplace() {
  const categoryBar = document.getElementById("categoryFilterBar");
  const searchInput = document.getElementById("locationSearch");
  const searchBtn = document.getElementById("locationSearchBtn");
  const sortSelect = document.getElementById("priceSortSelect");

  // Category Pills
  if (categoryBar) {
    categoryBar.addEventListener("click", (e) => {
      const targetPill = e.target.closest(".cat-pill");
      if (!targetPill) return;

      categoryBar.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      targetPill.classList.add("active");

      currentCategory = targetPill.dataset.category || "all";
      renderFoodGrid();
    });
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderFoodGrid();
    });

    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        searchInput.focus();
        renderFoodGrid();
      });
    }
  }

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderFoodGrid();
    });
  }

  // Initial load from live MongoDB backend
  fetchLiveSurplusInventory();
  // Auto-refresh listings every 10 seconds so new food appears live
  setInterval(fetchLiveSurplusInventory, 10000);
}

function fetchLiveSurplusInventory() {
  const grid = document.getElementById("marketplaceFoodGrid");
  if (grid && SURPLUS_INVENTORY.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center;">
        <div class="empty-state-icon" style="font-size: 2.2rem; margin-bottom: 12px;">⏳</div>
        <div class="empty-state-title" style="font-size: 1.2rem; font-weight: 700; margin-bottom: 6px;">Loading Surplus Food...</div>
        <div class="empty-state-text" style="color: var(--color-text-muted); font-size: 0.9rem;">Connecting to Plenti live database.</div>
      </div>
    `;
  }

  if (window.PlentiAPI) {
    PlentiAPI.listings.getAll().then(res => {
      isLoadingInventory = false;
      if (res && res.data && res.data.length > 0) {
        SURPLUS_INVENTORY = res.data.map(item => ({
          id: item._id,
          title: item.title,
          store: item.business?.businessName || 'Plenti Merchant',
          address: item.business?.address || 'Chandigarh',
          distance: 'Nearby',
          category: (item.category || 'meals').toLowerCase(),
          rating: '4.8',
          reviewsCount: 42,
          originalPrice: item.originalPrice,
          discountedPrice: item.discountedPrice,
          discountPercent: item.discountPercentage || Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100),
          remainingQty: item.quantity,
          pickupWindow: `${item.pickupStart || '18:00'} – ${item.pickupEnd || '21:30'}`,
          description: item.description,
          badge: item.quantity <= 2 ? '🔥 Selling Fast' : '🌱 Rescued Today',
          image: item.image
        }));
      } else {
        SURPLUS_INVENTORY = [];
      }
      renderFoodGrid();
    }).catch(err => {
      isLoadingInventory = false;
      console.warn('[Plenti] MongoDB fetch notice:', err.message);
      renderFoodGrid();
    });
  } else {
    isLoadingInventory = false;
    renderFoodGrid();
  }
}

function renderFoodGrid() {
  const grid = document.getElementById("marketplaceFoodGrid");
  if (!grid) return;

  // Filter
  let filtered = SURPLUS_INVENTORY.filter(item => {
    const matchesCat = (currentCategory === "all") || (item.category === currentCategory);
    const matchesSearch = !currentSearch ||
      item.title.toLowerCase().includes(currentSearch) ||
      item.store.toLowerCase().includes(currentSearch) ||
      item.address.toLowerCase().includes(currentSearch) ||
      item.description.toLowerCase().includes(currentSearch);
    return matchesCat && matchesSearch;
  });

  // Sort
  if (currentSort === "price_low") {
    filtered.sort((a, b) => a.discountedPrice - b.discountedPrice);
  } else if (currentSort === "price_high") {
    filtered.sort((a, b) => b.discountedPrice - a.discountedPrice);
  } else if (currentSort === "discount") {
    filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  }

  // Render cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 50px 20px; text-align: center; background: #FFFFFF; border-radius: 16px; border: 1px dashed var(--color-border);">
        <div class="empty-state-icon" style="font-size: 2.5rem; margin-bottom: 12px;">🧺</div>
        <div class="empty-state-title" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 6px;">No surplus food items found</div>
        <div class="empty-state-text" style="color: var(--color-text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto; line-height: 1.5;">
          ${currentSearch || currentCategory !== 'all' 
            ? 'No surplus meals match your current filter. Try selecting another category or clearing search.' 
            : 'No surplus food published right now. Make sure your backend server is running with <code>npm run dev</code> to serve MongoDB listings!'}
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <article class="food-card" data-id="${item.id}">
      <div class="food-card-img-wrap">
        <img
          class="food-card-img"
          src="${item.image}"
          alt="${item.title}"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';"
        />
        <span class="food-card-badge">${item.badge}</span>
        <span class="food-card-discount">${item.discountPercent}% OFF</span>
      </div>

      <div class="food-card-content">
        <div class="food-card-store">
          <span class="store-name">📍 ${item.store}</span>
          <span class="store-rating">★ ${item.rating}</span>
        </div>

        <h3 class="food-card-title">${item.title}</h3>
        <p class="food-card-desc">${item.description}</p>

        <div class="food-card-meta">
          <div class="meta-row">
            <span>⏰ Pickup:</span>
            <strong>${item.pickupWindow}</strong>
          </div>
          <div class="meta-row">
            <span>📦 Remaining:</span>
            <strong style="color:var(--color-primary);">${item.remainingQty} left</strong>
          </div>
        </div>

        <div class="food-card-footer">
          <div class="price-wrap">
            <span class="price-now">₹${item.discountedPrice}</span>
            <span class="price-orig">₹${item.originalPrice}</span>
          </div>
          <button class="btn btn-primary reserve-btn" onclick="openFoodModal('${item.id}')">
            Reserve Now →
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

// ==================== RESERVATION MODAL ====================
function initModal() {
  const modal = document.getElementById("foodReservationModal");
  const qtyMinus = document.getElementById("qtyMinusBtn");
  const qtyPlus = document.getElementById("qtyPlusBtn");
  const confirmBtn = document.getElementById("confirmReservationBtn");

  // Quantity Stepper
  if (qtyMinus && qtyPlus) {
    qtyMinus.addEventListener("click", () => {
      if (modalQuantity > 1) {
        modalQuantity--;
        updateModalTotals();
      }
    });

    qtyPlus.addEventListener("click", () => {
      if (activeModalItem && modalQuantity < activeModalItem.remainingQty) {
        modalQuantity++;
        updateModalTotals();
      } else {
        showToast("Maximum available stock reached!");
      }
    });
  }

  // Payment method radio pill styling
  const payLabels = document.querySelectorAll('input[name="payMethod"]');
  payLabels.forEach(radio => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll('#payRazorpayLabel, #payCashLabel').forEach(l => l.classList.remove('active'));
      e.target.closest('label').classList.add('active');
    });
  });

  // Confirm Reservation
  if (confirmBtn) {
    confirmBtn.addEventListener("click", handleReservationSubmit);
  }

  // Close on backdrop click or ESC key
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeFoodModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeFoodModal();
      }
    });
  }
}

window.openFoodModal = function(itemId) {
  const item = SURPLUS_INVENTORY.find(i => i.id === itemId);
  if (!item) return;

  activeModalItem = item;
  modalQuantity = 1;

  const modal = document.getElementById("foodReservationModal");
  const modalImg = document.getElementById("resModalImage");
  const modalName = document.getElementById("resModalFoodName");
  const modalStore = document.getElementById("resModalRestaurant");
  const modalAddr = document.getElementById("resModalAddress");
  const modalPrice = document.getElementById("resModalPrice");
  const modalOrig = document.getElementById("resModalOrigPrice");
  const modalDesc = document.getElementById("resModalDesc");
  const modalPickup = document.getElementById("resModalPickup");
  const modalStock = document.getElementById("resModalRemaining");

  modalImg.src = item.image;
  modalImg.alt = item.title;
  modalName.textContent = item.title;
  modalStore.textContent = item.store;
  modalAddr.textContent = item.address;
  modalPrice.textContent = `₹${item.discountedPrice}`;
  modalOrig.textContent = `₹${item.originalPrice}`;
  modalDesc.textContent = item.description;
  modalPickup.textContent = item.pickupWindow;
  modalStock.textContent = `${item.remainingQty} available`;

  updateModalTotals();

  // Reset any error/success notices
  const notice = document.getElementById("bookingErrorNotice");
  if (notice) notice.style.display = "none";

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
};

window.closeFoodModal = function() {
  const modal = document.getElementById("foodReservationModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
};

function updateModalTotals() {
  const qtyVal = document.getElementById("resModalQtyVal");
  const totalVal = document.getElementById("resModalTotal");

  if (qtyVal) qtyVal.textContent = modalQuantity;
  if (totalVal && activeModalItem) {
    const total = activeModalItem.discountedPrice * modalQuantity;
    totalVal.textContent = `₹${total}.00`;
  }
}

async function handleReservationSubmit() {
  if (!activeModalItem) return;

  const token = localStorage.getItem("plenti_access_token");
  if (!token) {
    alert("Please sign in or create an account to reserve surplus food.");
    window.location.href = "login.html?redirect=index.html";
    return;
  }

  const confirmBtn = document.getElementById("confirmReservationBtn");
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Reserving meal with MongoDB...";
  }

  const payMethodInput = document.querySelector('input[name="payMethod"]:checked');
  const payMethod = payMethodInput ? payMethodInput.value : 'RAZORPAY';

  try {
    const res = await PlentiAPI.orders.create({
      listingId: activeModalItem.id,
      quantity: modalQuantity,
      notes: `Payment method: ${payMethod}`
    });

    const orderData = res.data;
    const orderCode = orderData.pickupCode || `PLNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderTotal = orderData.totalAmount || (activeModalItem.discountedPrice * modalQuantity);

    // Refresh inventory from MongoDB
    fetchLiveSurplusInventory();

    // Present real success receipt inside modal
    const modalBody = document.getElementById("resModalBody");
    const modalFooter = document.getElementById("resModalFooter");

    modalBody.innerHTML = `
      <div style="text-align:center; padding:20px 10px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">🎉</div>
        <h3 style="font-size:1.4rem; font-weight:800; color:var(--color-primary); margin-bottom:8px;">
          Surplus Rescued Successfully!
        </h3>
        <p style="font-size:0.95rem; color:var(--color-text-muted); margin-bottom:20px;">
          Your order <strong>${orderData.orderId}</strong> for <strong>${activeModalItem.title}</strong> is locked in.
        </p>

        <div style="background:#F8FAFC; border:2px dashed var(--color-primary); border-radius:var(--radius-md); padding:16px; margin-bottom:20px;">
          <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--color-text-muted); margin-bottom:4px;">4-Digit Pickup Verification Code</div>
          <div style="font-size:2.2rem; font-weight:850; letter-spacing:3px; color:var(--color-primary-dark); font-family:monospace;">
            ${orderCode}
          </div>
          <div style="font-size:0.8rem; color:var(--color-text-muted); margin-top:4px;">
            Show this 4-digit code at <strong>${activeModalItem.store}</strong>
          </div>
        </div>

        <div style="text-align:left; font-size:0.88rem; background:#F1F5F9; border-radius:var(--radius-sm); padding:12px 16px; display:flex; flex-direction:column; gap:6px;">
          <div>⏰ <strong>Pickup Window:</strong> ${orderData.pickupWindow || activeModalItem.pickupWindow}</div>
          <div>📍 <strong>Address:</strong> ${activeModalItem.address}</div>
          <div>💳 <strong>Total Paid:</strong> ₹${orderTotal}</div>
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button type="button" class="btn btn-primary" style="width:100%;" onclick="closeFoodModal();">
        Done &amp; Return to Marketplace ✓
      </button>
    `;

    showToast(`✅ Reserved! Order ${orderData.orderId}`);
  } catch (err) {
    alert(`Reservation failed: ${err.message}`);
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm Reservation & Pay";
    }
  }
}

// ==================== STATS COUNTER ANIMATION ====================
function initStatsObserver() {
  const statElements = document.querySelectorAll(".stat-value");
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statElements.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.getAttribute("data-count")) || 0;
  const prefix = el.getAttribute("data-prefix") || "";
  const suffix = el.getAttribute("data-suffix") || "";
  const isDecimal = target % 1 !== 0;
  const duration = 2000;
  const steps = 60;
  const stepTime = duration / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const progress = step / steps;
    current = target * easeOutQuad(progress);

    if (step >= steps) {
      current = target;
      clearInterval(timer);
    }

    if (isDecimal) {
      el.textContent = `${prefix}${current.toFixed(1)}${suffix}`;
    } else {
      el.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
    }
  }, stepTime);
}

function easeOutQuad(t) {
  return t * (2 - t);
}

// ==================== LOCATION PICKER SIMULATOR ====================
function initLocationPicker() {
  const pin = document.querySelector(".location-pin");
  if (!pin) return;

  pin.addEventListener("click", () => {
    const cities = ["Chandigarh", "Mohali", "Panchkula", "Delhi NCR", "Bangalore"];
    const currentCity = pin.textContent.trim();
    const nextCity = cities[(cities.indexOf(currentCity) + 1) % cities.length];
    pin.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:18px; height:18px;">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      ${nextCity}
    `;
    showToast(`📍 Switched location to ${nextCity}`);
  });
}

// ==================== TOAST NOTIFICATION HELPER ====================
function showToast(message) {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-badge">Plenti</span> <span>${message}</span>`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}
