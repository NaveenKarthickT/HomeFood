// HomeFood Admin Portal Logic
// Orders Management, Stock Toggling, Dish Creation, Analytics

let currentLang = localStorage.getItem('homefood_lang') || 'ta';
let currentTheme = localStorage.getItem('homefood_theme') || 'light';
let activeAdminTab = 'orders';
let activeOrderStatus = 'all';
let adminToken = localStorage.getItem('homefood_token');
let adminOrders = [];
let adminFoods = [];

document.addEventListener('DOMContentLoaded', () => {
  verifyAdminAuth();
  applyTheme(currentTheme);
  applyLang(currentLang);
  setupAdminListeners();

  loadDashboardStats();
  loadAdminOrders();
  loadAdminMenu();

  // Auto-refresh orders every 25 seconds for live kitchen feel
  setInterval(() => {
    if (activeAdminTab === 'orders') {
      loadDashboardStats();
      loadAdminOrders(true); // silent refresh
    }
  }, 25000);
});

// ----------------- AUTHENTICATION CHECK ----------------- //
function verifyAdminAuth() {
  const user = JSON.parse(localStorage.getItem('homefood_user'));
  if (!adminToken || !user || user.role !== 'admin') {
    alert(currentLang === 'ta' ? 'நிர்வாகி அணுகல் தேவை. தயவுசெய்து உள்நுழையவும்.' : 'Admin access required. Please login.');
    window.location.href = '/login.html';
  }
}

// ----------------- THEME & LANGUAGE ----------------- //
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('homefood_theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('homefood_lang', lang);
  const label = document.getElementById('currentLangLabel');
  if (label) label.textContent = lang === 'ta' ? 'English' : 'தமிழ்';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  renderAdminOrders();
  renderAdminMenu();
}

// ----------------- TAB SWITCHING ----------------- //
function switchAdminTab(tab) {
  activeAdminTab = tab;
  const btnOrders = document.getElementById('tabBtnOrders');
  const btnMenu = document.getElementById('tabBtnMenu');
  const sectionOrders = document.getElementById('adminOrdersSection');
  const sectionMenu = document.getElementById('adminMenuSection');

  if (tab === 'orders') {
    btnOrders.classList.add('active');
    btnMenu.classList.remove('active');
    sectionOrders.style.display = 'block';
    sectionMenu.style.display = 'none';
    loadAdminOrders();
  } else {
    btnMenu.classList.add('active');
    btnOrders.classList.remove('active');
    sectionMenu.style.display = 'block';
    sectionOrders.style.display = 'none';
    loadAdminMenu();
  }
}

// ----------------- DASHBOARD ANALYTICS ----------------- //
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('kpiTotalOrders').textContent = data.stats.totalOrders;
      document.getElementById('kpiActiveOrders').textContent = data.stats.activeOrders;
      document.getElementById('kpiDeliveredOrders').textContent = data.stats.deliveredOrders;
      document.getElementById('kpiTotalRevenue').textContent = `₹${data.stats.totalRevenue}`;
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ----------------- ORDERS MANAGEMENT ----------------- //
async function loadAdminOrders(silent = false) {
  const grid = document.getElementById('adminOrdersGrid');
  if (!silent) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px;">ஆர்டர்கள் ஏற்றப்படுகின்றன...</div>';
  }

  const area = document.getElementById('adminAreaFilter').value;

  try {
    const res = await fetch(`/api/orders/all?status=${activeOrderStatus}&villageOrCity=${area}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      adminOrders = data.orders;
      renderAdminOrders();
    }
  } catch (err) {
    grid.innerHTML = '<div style="grid-column:1/-1; color:red; text-align:center;">ஆர்டர்களை ஏற்றுவதில் பிழை</div>';
  }
}

function renderAdminOrders() {
  const grid = document.getElementById('adminOrdersGrid');
  if (!adminOrders.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:8px;">📦</div>
        <h3>${currentLang === 'ta' ? 'இந்த பிரிவில் ஆர்டர்கள் இல்லை' : 'No Orders in this filter'}</h3>
      </div>
    `;
    return;
  }

  const isTa = currentLang === 'ta';

  grid.innerHTML = adminOrders.map(order => {
    const areaBadge = order.villageOrCity === 'village' ? '🌾 கிராமம் (Village)' : '🏙️ நகரம் (City)';
    const cleanPhone = order.customerPhone.replace(/\D/g, '');

    // Pre-composed WhatsApp message for Admin to inform customer
    const waText = encodeURIComponent(`வணக்கம் ${order.customerName}, உங்கள் HomeFood ஆர்டர் #${order.orderNumber} நிலவரம்: "${order.status}". சுடச்சுட தயாரித்து அனுப்பி வைக்கிறோம்! பசி தீர்க்கும் ஹோம் புட். 7200676767.`);
    const waUrl = `https://wa.me/91${cleanPhone}?text=${waText}`;

    const itemsSummary = order.items.map(i => `
      <div class="order-item-line">
        <span>${i.quantity} x ${isTa ? i.nameTa : i.nameEn}</span>
        <strong>₹${i.price * i.quantity}</strong>
      </div>
    `).join('');

    return `
      <div class="order-admin-card status-${order.status}">
        <div class="order-top-row">
          <span class="order-num">#${order.orderNumber}</span>
          <span class="order-badge-pill" style="background:var(--primary-light); color:var(--primary);">
            ${areaBadge}
          </span>
        </div>

        <div class="customer-info-box">
          <div class="customer-name">
            <span>👤 ${order.customerName}</span>
            <div class="customer-contact-btns">
              <a href="${waUrl}" target="_blank" class="btn-contact-mini btn-wa-mini" title="Send WhatsApp Update">💬</a>
              <a href="tel:${cleanPhone}" class="btn-contact-mini btn-call-mini" title="Call Customer">📞</a>
            </div>
          </div>
          <div style="font-size:0.85rem; font-weight:700; color:var(--primary); margin-top:2px;">
            📞 ${order.customerPhone}
          </div>
          <div class="customer-address">
            📍 ${order.deliveryAddress} ${order.landmark ? `(${order.landmark})` : ''}
          </div>
          ${order.specialInstructions ? `
            <div style="font-size:0.8rem; color:#b45309; margin-top:4px; font-weight:600;">
              ⚠️ குறிப்பு: ${order.specialInstructions}
            </div>
          ` : ''}
        </div>

        <div class="order-items-scroll">
          ${itemsSummary}
        </div>

        <div class="order-total-bar">
          <span style="font-size:0.9rem; color:var(--text-muted);">${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'UPI QR'}</span>
          <span>₹${order.totalAmount}</span>
        </div>

        <div>
          <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">
            ${isTa ? 'ஆர்டர் நிலையை மாற்றுக:' : 'Change Order Status:'}
          </label>
          <select class="status-change-select" onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="Received" ${order.status === 'Received' ? 'selected' : ''}>📝 Received (ஆர்டர் பெறப்பட்டது)</option>
            <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>🍳 In Kitchen / Cooking (தயாராகிறது)</option>
            <option value="OutForDelivery" ${order.status === 'OutForDelivery' ? 'selected' : ''}>🛵 Out for Delivery (புறப்பட்டது)</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>✅ Delivered (சேர்ந்தது)</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled (ரத்து)</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✅ ${data.message}`);
      loadDashboardStats();
      loadAdminOrders(true);
    } else {
      showToast(data.message);
    }
  } catch (err) {
    showToast('நிலை மாற்றுவதில் பிழை');
  }
}

// ----------------- MENU & STOCK MANAGEMENT ----------------- //
async function loadAdminMenu() {
  const grid = document.getElementById('adminMenuGrid');
  try {
    const res = await fetch('/api/foods/all', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      adminFoods = data.foods;
      renderAdminMenu();
    }
  } catch (err) {
    grid.innerHTML = '<div style="grid-column:1/-1; color:red; text-align:center;">மெனு ஏற்றுவதில் பிழை</div>';
  }
}

function renderAdminMenu() {
  const grid = document.getElementById('adminMenuGrid');
  if (!adminFoods.length) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px;">மெனு காலியாக உள்ளது</div>';
    return;
  }

  const isTa = currentLang === 'ta';

  grid.innerHTML = adminFoods.map(item => {
    const title = isTa ? item.nameTa : item.nameEn;
    const subtitle = isTa ? item.nameEn : item.nameTa;
    const inStock = item.isAvailable;

    return `
      <div class="menu-admin-card">
        <img src="${item.image}" alt="${title}" class="menu-admin-img">
        <div class="menu-admin-body">
          <div class="menu-admin-title">${title}</div>
          <div class="menu-admin-subtitle">${subtitle} • ₹${item.price}</div>

          <!-- Quick Stock Toggle Box -->
          <div class="stock-toggle-box">
            <span class="stock-status-pill ${inStock ? 'instock' : 'outofstock'}">
              ${inStock ? (isTa ? '✅ இருப்பு உள்ளது (In Stock)' : '✅ In Stock') : (isTa ? '❌ தீர்ந்துவிட்டது (Sold Out)' : '❌ Sold Out')}
            </span>
            <button class="btn-toggle-stock" onclick="toggleFoodStock('${item._id}')">
              ${inStock ? (isTa ? 'தீர்ந்துவிட்டது என மாற்று' : 'Mark Sold Out') : (isTa ? 'கிடைக்கும் என மாற்று' : 'Mark Available')}
            </button>
          </div>

          <div class="menu-admin-actions">
            <button class="btn-admin-delete" onclick="deleteFoodDish('${item._id}')" title="Delete Food">
              🗑️ நீக்க (Delete)
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleFoodStock(foodId) {
  try {
    const res = await fetch(`/api/foods/${foodId}/toggle-availability`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`⚡ ${data.message}`);
      loadAdminMenu();
    }
  } catch (err) {
    showToast('இருப்பு நிலையை மாற்றுவதில் பிழை');
  }
}

async function deleteFoodDish(foodId) {
  if (!confirm(currentLang === 'ta' ? 'இந்த உணவை நிச்சயம் நீக்க வேண்டுமா?' : 'Are you sure you want to delete this food item?')) {
    return;
  }

  try {
    const res = await fetch(`/api/foods/${foodId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ உணவு நீக்கப்பட்டது');
      loadAdminMenu();
      loadDashboardStats();
    }
  } catch (err) {
    showToast('உணவை நீக்குவதில் பிழை');
  }
}

// ----------------- ADD NEW FOOD DISH MODAL ----------------- //
function openAddDishModal() {
  document.getElementById('addDishModal').classList.add('open');
}

function closeAddDishModal() {
  document.getElementById('addDishModal').classList.remove('open');
}

async function handleSaveDish(e) {
  e.preventDefault();
  const nameTa = document.getElementById('dishNameTa').value.trim();
  const nameEn = document.getElementById('dishNameEn').value.trim();
  const category = document.getElementById('dishCategory').value;
  const price = document.getElementById('dishPrice').value;
  const isVeg = document.getElementById('dishIsVeg').value === 'true';
  const image = document.getElementById('dishImage').value;
  const descTa = document.getElementById('dishDescTa').value.trim();
  const descEn = document.getElementById('dishDescEn').value.trim();

  try {
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        nameTa, nameEn, category, price, isVeg, image, descTa, descEn
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast('🎉 புதிய உணவு வெற்றிகரமாக சேர்க்கப்பட்டது!');
      closeAddDishModal();
      document.getElementById('addDishForm').reset();
      loadAdminMenu();
      loadDashboardStats();
    } else {
      showToast(data.message);
    }
  } catch (err) {
    showToast('உணவை சேமிப்பதில் பிழை');
  }
}

// ----------------- LISTENERS ----------------- //
function setupAdminListeners() {
  document.getElementById('langToggleBtn')?.addEventListener('click', () => {
    const nextLang = currentLang === 'ta' ? 'en' : 'ta';
    applyLang(nextLang);
  });

  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('homefood_token');
    localStorage.removeItem('homefood_user');
    window.location.href = '/login.html';
  });

  // Filter Pills
  document.getElementById('orderStatusFilters')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-filter');
    if (!pill) return;
    document.querySelectorAll('.pill-filter').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeOrderStatus = pill.getAttribute('data-status');
    loadAdminOrders();
  });

  document.getElementById('adminAreaFilter')?.addEventListener('change', () => {
    loadAdminOrders();
  });
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
