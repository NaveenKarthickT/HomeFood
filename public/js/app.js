// HomeFood Frontend Application Logic
// Bilingual (Tamil & English), Theme Management, Cart, Live Tracker, Audio Assistant

let currentLang = localStorage.getItem('homefood_lang') || 'ta';
let currentTheme = localStorage.getItem('homefood_theme') || 'light';
let foodsData = [];
let cart = JSON.parse(localStorage.getItem('homefood_cart')) || [];
let activeCategory = 'all';

// DOM Elements
const langToggleBtn = document.getElementById('langToggleBtn');
const currentLangLabel = document.getElementById('currentLangLabel');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const foodGrid = document.getElementById('foodGrid');
const foodSearchInput = document.getElementById('foodSearchInput');
const vegFilterCheckbox = document.getElementById('vegFilterCheckbox');
const categoryTabs = document.getElementById('categoryTabs');
const openCartBtn = document.getElementById('openCartBtn');
const cartModalOverlay = document.getElementById('cartModalOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartCountBadge = document.getElementById('cartCountBadge');
const billSubtotal = document.getElementById('billSubtotal');
const billDelivery = document.getElementById('billDelivery');
const billTotal = document.getElementById('billTotal');
const submitOrderBtn = document.getElementById('submitOrderBtn');
const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');
const custAreaType = document.getElementById('custAreaType');
const userNavSection = document.getElementById('userNavSection');

// Order Tracker Elements
const trackInput = document.getElementById('trackInput');
const trackBtn = document.getElementById('trackBtn');
const trackResultWrap = document.getElementById('trackResultWrap');
const trackOrderNum = document.getElementById('trackOrderNum');
const trackCustomerName = document.getElementById('trackCustomerName');
const trackStatusBadge = document.getElementById('trackStatusBadge');
const trackProgressBar = document.getElementById('trackProgressBar');
const trackOrderDetails = document.getElementById('trackOrderDetails');

// ----------------- INITIALIZATION ----------------- //
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  applyLanguage(currentLang);
  checkAuthStatus();
  fetchFoods();
  updateCartBadge();
  setupEventListeners();
});

// ----------------- THEME MANAGEMENT ----------------- //
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('homefood_theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(nextTheme === 'dark' ? 'இரவு பயன்முறை (Dark Mode)' : 'பகல் பயன்முறை (Light Mode)');
}

// ----------------- LANGUAGE MANAGEMENT ----------------- //
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('homefood_lang', lang);
  currentLangLabel.textContent = lang === 'ta' ? 'English' : 'தமிழ்';

  // Translate all tagged text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Re-render food items with updated language
  renderFoods();
  renderCart();
}

function toggleLanguage() {
  const nextLang = currentLang === 'ta' ? 'en' : 'ta';
  applyLanguage(nextLang);
  showToast(nextLang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது' : 'English Selected');
}

// ----------------- AUTHENTICATION STATUS ----------------- //
function checkAuthStatus() {
  const token = localStorage.getItem('homefood_token');
  const user = JSON.parse(localStorage.getItem('homefood_user'));

  if (token && user) {
    userNavSection.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.9rem; font-weight:700; color:var(--primary);">
          👋 ${user.name.split(' ')[0]}
        </span>
        ${user.role === 'admin' ? '<a href="/admin.html" class="btn-account" style="background:var(--accent); color:white; border:none;">🛠️ Admin</a>' : ''}
        <button id="logoutBtn" class="btn-account" style="cursor:pointer;" title="Logout">
          🚪 <span data-i18n="nav_logout">${currentLang === 'ta' ? 'வெளியேறு' : 'Logout'}</span>
        </button>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('homefood_token');
      localStorage.removeItem('homefood_user');
      showToast(currentLang === 'ta' ? 'வெளியேறிவிட்டீர்கள்' : 'Logged out successfully');
      setTimeout(() => window.location.reload(), 500);
    });

    // Auto-fill checkout fields if user exists
    const custName = document.getElementById('custName');
    const custPhone = document.getElementById('custPhone');
    const custAddress = document.getElementById('custAddress');
    if (custName) custName.value = user.name || '';
    if (custPhone) custPhone.value = user.phone || '';
    if (custAddress) custAddress.value = user.address || '';
    if (custAreaType && user.villageOrCity) custAreaType.value = user.villageOrCity;
  }
}

// ----------------- FOOD ITEMS FETCHING & RENDERING ----------------- //
async function fetchFoods() {
  try {
    const response = await fetch('/api/foods');
    const data = await response.json();
    if (data.success) {
      foodsData = data.foods;
      renderFoods();
    }
  } catch (err) {
    console.error('Fetch foods error:', err);
    foodGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--nonveg-red);">
        <p>உணவு பட்டியலை ஏற்றுவதில் சிக்கல். சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.</p>
        <button onclick="fetchFoods()" class="btn-primary-action" style="margin-top:10px;">மீண்டும் முயற்சிக்க (Retry)</button>
      </div>
    `;
  }
}

function renderFoods() {
  if (!foodsData.length) return;

  const searchTerm = (foodSearchInput.value || '').trim().toLowerCase();
  const vegOnly = vegFilterCheckbox.checked;

  const filtered = foodsData.filter(item => {
    // Category check
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    // Veg check
    if (vegOnly && !item.isVeg) {
      return false;
    }
    // Search check
    if (searchTerm) {
      const matchEn = (item.nameEn + ' ' + item.descEn).toLowerCase().includes(searchTerm);
      const matchTa = (item.nameTa + ' ' + item.descTa).toLowerCase().includes(searchTerm);
      if (!matchEn && !matchTa) return false;
    }
    return true;
  });

  if (!filtered.length) {
    foodGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
        <div style="font-size:3rem; margin-bottom:10px;">🍽️</div>
        <h3>${currentLang === 'ta' ? 'உணவுகள் எதுவும் கிடைக்கவில்லை' : 'No Food Items Found'}</h3>
        <p>${currentLang === 'ta' ? 'வேறு தேடல் அல்லது பிரிவை தேர்வு செய்யவும்.' : 'Try adjusting your search or category filters.'}</p>
      </div>
    `;
    return;
  }

  foodGrid.innerHTML = filtered.map(item => {
    const cartItem = cart.find(ci => ci.id === item._id);
    const qty = cartItem ? cartItem.quantity : 0;
    const title = currentLang === 'ta' ? item.nameTa : item.nameEn;
    const subtitle = currentLang === 'ta' ? item.nameEn : item.nameTa;
    const desc = currentLang === 'ta' ? item.descTa : item.descEn;
    const badge = currentLang === 'ta' ? (item.badgeTa || item.badgeEn) : (item.badgeEn || item.badgeTa);
    const serving = currentLang === 'ta' ? item.servingTa : item.servingEn;

    // Quick WhatsApp message for this item
    const waText = encodeURIComponent(`வணக்கம் HomeFood! எனக்கு "${item.nameTa} (${item.nameEn})" ₹${item.price} வேண்டும்.`);
    const waUrl = `https://wa.me/917200676767?text=${waText}`;

    return `
      <div class="food-card" data-id="${item._id}">
        <div class="food-card-img-wrap">
          <img src="${item.image}" alt="${title}" class="food-card-img" loading="lazy">
          <div class="food-veg-symbol ${item.isVeg ? 'veg' : 'nonveg'}" title="${item.isVeg ? 'Veg' : 'Non-Veg'}"></div>
          ${badge ? `<div class="food-badge-tag">${badge}</div>` : ''}
        </div>

        <div class="food-card-content">
          <div class="food-card-title-row">
            <div>
              <div class="food-title-ta">${title}</div>
              <div class="food-title-en">${subtitle}</div>
            </div>
          </div>

          <p class="food-card-desc">${desc}</p>

          <div class="food-meta-row">
            <span class="food-meta-item">⏱️ ${item.prepTime}</span>
            <span class="food-meta-item">👥 ${serving}</span>
            <span class="food-meta-item">🌶️ ${item.spiceLevel}</span>
          </div>

          <div class="food-card-bottom-bar">
            <div class="food-price">₹${item.price}</div>

            <div class="food-actions-group">
              <!-- Voice Read Aloud Button -->
              <button class="btn-speak" onclick="speakDishName('${encodeURIComponent(title)}', '₹${item.price}')" title="${currentLang === 'ta' ? 'உணவு பெயர் & விலை கேட்க' : 'Listen to dish name and price'}">
                🔊
              </button>

              <!-- Quick Single Item WhatsApp Order -->
              <a href="${waUrl}" target="_blank" class="card-whatsapp-quick" title="${currentLang === 'ta' ? 'வாட்ஸ்அப்பில் உடனடியாக ஆர்டர் செய்ய' : 'Instant Order via WhatsApp'}">
                💬
              </a>

              <!-- Cart Add / Stepper -->
              ${qty === 0 ? `
                <button class="btn-add-cart" onclick="addToCart('${item._id}')">
                  ${currentLang === 'ta' ? 'சேர்க்க +' : 'Add +'}
                </button>
              ` : `
                <div class="qty-control-wrap">
                  <button class="btn-qty-step" onclick="updateItemQty('${item._id}', -1)">−</button>
                  <span class="qty-display">${qty}</span>
                  <button class="btn-qty-step" onclick="updateItemQty('${item._id}', 1)">+</button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------- VOICE AUDIO ASSISTANT (TTS) ----------------- //
function speakDishName(encodedTitle, priceStr) {
  const text = decodeURIComponent(encodedTitle) + ' ' + (currentLang === 'ta' ? `${priceStr} ரூபாய்` : `${priceStr} Rupees`);
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop prior audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    showToast(`🔊 ${text}`);
  } else {
    showToast(`🔊 ${text}`);
  }
}

// ----------------- CART MANAGEMENT ----------------- //
function addToCart(foodId) {
  const food = foodsData.find(f => f._id === foodId);
  if (!food) return;

  const existing = cart.find(item => item.id === foodId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: food._id,
      nameEn: food.nameEn,
      nameTa: food.nameTa,
      price: food.price,
      image: food.image,
      quantity: 1
    });
  }

  saveCart();
  renderFoods();
  showToast(`✅ ${currentLang === 'ta' ? food.nameTa : food.nameEn} ${currentLang === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது' : 'added to basket'}`);
}

function updateItemQty(foodId, change) {
  const index = cart.findIndex(item => item.id === foodId);
  if (index === -1) return;

  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderFoods();
  renderCart();
}

function saveCart() {
  localStorage.setItem('homefood_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.textContent = count;
  cartCountBadge.style.display = count > 0 ? 'inline-block' : 'none';
}

function renderCart() {
  if (!cart.length) {
    cartItemsList.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 8px;">🛒</div>
        <p>${currentLang === 'ta' ? 'உங்கள் கூடை காலியாக உள்ளது!' : 'Your food basket is empty!'}</p>
        <p style="font-size: 0.85rem; margin-top: 4px;">${currentLang === 'ta' ? 'சுவையான வீட்டு உணவுகளை தேர்வு செய்யுங்கள்.' : 'Add delicious home food items to get started.'}</p>
      </div>
    `;
    billSubtotal.textContent = '₹0';
    billDelivery.textContent = '₹0';
    billTotal.textContent = '₹0';
    return;
  }

  cartItemsList.innerHTML = cart.map(item => {
    const title = currentLang === 'ta' ? item.nameTa : item.nameEn;
    const itemTotal = item.price * item.quantity;

    return `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${title}</div>
          <div class="cart-item-price">₹${item.price} x ${item.quantity} = ₹${itemTotal}</div>
        </div>
        <div class="qty-control-wrap">
          <button class="btn-qty-step" onclick="updateItemQty('${item.id}', -1)">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="btn-qty-step" onclick="updateItemQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  calculateTotals();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isCity = custAreaType ? custAreaType.value === 'city' : false;
  // Free delivery for village / nearby, ₹20 nominal delivery for city
  const delivery = isCity ? 20 : 0;
  const total = subtotal + delivery;

  billSubtotal.textContent = `₹${subtotal}`;
  billDelivery.textContent = delivery === 0 
    ? (currentLang === 'ta' ? 'இலவசம் (Free)' : 'FREE') 
    : `₹${delivery}`;
  billTotal.textContent = `₹${total}`;
}

// ----------------- CHECKOUT / ORDER SUBMISSION ----------------- //
async function handleOrderSubmit() {
  if (!cart.length) {
    showToast(currentLang === 'ta' ? 'தயவுசெய்து முதலில் உணவுகளை தேர்வு செய்யுங்கள்' : 'Your cart is empty');
    return;
  }

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const landmark = document.getElementById('custLandmark').value.trim();
  const areaType = custAreaType.value;
  const payment = document.getElementById('custPayment').value;
  const instructions = document.getElementById('custInstructions').value.trim();

  if (!name || !phone || !address) {
    showToast(currentLang === 'ta' ? 'தயவுசெய்து பெயர், போன் எண் மற்றும் முகவரியை உள்ளிடவும்' : 'Please fill Name, Phone, and Address');
    return;
  }

  if (phone.replace(/\D/g, '').length < 10) {
    showToast(currentLang === 'ta' ? 'சரியான 10-இலக்க செல்போன் எண் தேவை' : 'Please enter a valid 10-digit mobile number');
    return;
  }

  submitOrderBtn.disabled = true;
  submitOrderBtn.textContent = currentLang === 'ta' ? 'ஆர்டர் செய்யப்படுகிறது...' : 'Placing Order...';

  try {
    const user = JSON.parse(localStorage.getItem('homefood_user'));
    const orderData = {
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      landmark: landmark,
      villageOrCity: areaType,
      paymentMethod: payment,
      specialInstructions: instructions,
      userId: user ? user.id : null,
      items: cart.map(i => ({
        foodItemId: i.id,
        nameEn: i.nameEn,
        nameTa: i.nameTa,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      }))
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await res.json();
    if (result.success) {
      // Clear cart
      cart = [];
      saveCart();
      cartModalOverlay.classList.remove('open');
      renderFoods();

      showToast(`🎉 ${currentLang === 'ta' ? 'ஆர்டர் உறுதி செய்யப்பட்டது!' : 'Order Placed!'} #${result.order.orderNumber}`);

      // Scroll to tracker and prefill order number
      trackInput.value = result.order.orderNumber;
      executeTracking(result.order.orderNumber);
      document.getElementById('trackSection').scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(result.message || 'Order failed');
    }
  } catch (err) {
    console.error('Order error:', err);
    showToast('ஆர்டர் செய்வதில் சிக்கல். தொலைபேசி: 7200676767-ல் தொடர்பு கொள்ளவும்.');
  } finally {
    submitOrderBtn.disabled = false;
    submitOrderBtn.innerHTML = `✅ <span data-i18n="btn_confirm_order">${currentLang === 'ta' ? 'ஆர்டரை உறுதி செய்க' : 'Confirm & Place Order'}</span>`;
  }
}

// Instant WhatsApp Checkout Builder
function handleWhatsAppOrder() {
  if (!cart.length) {
    showToast(currentLang === 'ta' ? 'கூடையில் உணவுகளை சேர்க்கவும்' : 'Add items to basket');
    return;
  }

  const name = document.getElementById('custName').value.trim() || 'வாடிக்கையாளர் (Customer)';
  const phone = document.getElementById('custPhone').value.trim() || '';
  const address = document.getElementById('custAddress').value.trim() || 'Address to be shared';
  const areaType = custAreaType.value === 'village' ? 'கிராமம் (Village)' : 'நகரம் (City)';
  const payment = document.getElementById('custPayment').value === 'upi_qr' ? 'UPI QR' : 'Cash on Delivery';

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = custAreaType.value === 'city' ? 20 : 0;
  const total = subtotal + delivery;

  let msg = `🍛 *வணக்கம் HomeFood! புதிய உணவு ஆர்டர்:*\n`;
  msg += `👤 பெயர்: ${name}\n`;
  if (phone) msg += `📞 போன்: ${phone}\n`;
  msg += `📍 பகுதி: ${areaType}\n`;
  msg += `🏠 முகவரி: ${address}\n\n`;
  msg += `📋 *உணவு விவரம்:*\n`;

  cart.forEach(item => {
    msg += `• ${item.quantity} x ${item.nameTa} (${item.nameEn}) - ₹${item.price * item.quantity}\n`;
  });

  if (delivery > 0) msg += `🛵 டெலிவரி கட்டணம்: ₹${delivery}\n`;
  msg += `\n💰 *மொத்த தொகை: ₹${total}*\n`;
  msg += `💳 கட்டணம்: ${payment}\n`;
  msg += `\nவாழை இலையில் சுடச்சுட அனுப்பவும்! நன்றி! 🙏`;

  const waUrl = `https://wa.me/917200676767?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

// ----------------- LIVE ORDER TRACKER ----------------- //
async function executeTracking(searchQuery) {
  const query = (searchQuery || trackInput.value).trim();
  if (!query) {
    showToast(currentLang === 'ta' ? 'தயவுசெய்து ஆர்டர் எண் அல்லது போன் எண் உள்ளிடவும்' : 'Enter order number or phone');
    return;
  }

  trackBtn.disabled = true;
  trackBtn.textContent = '...';

  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success && data.orders.length) {
      const order = data.orders[0]; // Most recent order
      renderTrackingStatus(order);
    } else {
      showToast(currentLang === 'ta' ? 'இந்த எண்ணில் ஆர்டர் எதுவும் இல்லை' : 'No order found');
      trackResultWrap.style.display = 'none';
    }
  } catch (err) {
    showToast('Tracking error');
  } finally {
    trackBtn.disabled = false;
    trackBtn.textContent = currentLang === 'ta' ? 'சரிபார்க்க' : 'Track Now';
  }
}

function renderTrackingStatus(order) {
  trackResultWrap.style.display = 'block';
  trackOrderNum.textContent = `#${order.orderNumber}`;
  trackCustomerName.textContent = `${order.customerName} (${order.customerPhone})`;

  // Status mapping and progress bar
  const statusMap = {
    'Received': { pct: '20%', labelTa: 'ஆர்டர் பெறப்பட்டது', labelEn: 'Order Received', color: '#3b82f6', step: 1 },
    'Preparing': { pct: '50%', labelTa: 'சமையலறையில் தயாராகிறது 🍳', labelEn: 'Cooking in Kitchen', color: '#f59e0b', step: 2 },
    'OutForDelivery': { pct: '80%', labelTa: 'டெலிவரிக்கு புறப்பட்டது 🛵', labelEn: 'Out for Delivery', color: '#8b5cf6', step: 3 },
    'Delivered': { pct: '100%', labelTa: 'வந்து சேர்ந்தது! வாழை இலையில் சுவைக்கவும் 🏡', labelEn: 'Delivered', color: '#10b981', step: 4 },
    'Cancelled': { pct: '100%', labelTa: 'ரத்து செய்யப்பட்டது', labelEn: 'Cancelled', color: '#ef4444', step: 0 }
  };

  const currentStatusInfo = statusMap[order.status] || statusMap['Received'];
  trackStatusBadge.style.background = currentStatusInfo.color;
  trackStatusBadge.textContent = currentLang === 'ta' ? currentStatusInfo.labelTa : currentStatusInfo.labelEn;
  trackProgressBar.style.width = currentStatusInfo.pct;

  // Timeline node highlights
  const steps = ['stepReceived', 'stepPreparing', 'stepOutForDelivery', 'stepDelivered'];
  steps.forEach((stepId, index) => {
    const node = document.getElementById(stepId);
    if (!node) return;
    node.classList.remove('active', 'completed');
    if (index + 1 < currentStatusInfo.step) {
      node.classList.add('completed');
    } else if (index + 1 === currentStatusInfo.step) {
      node.classList.add('active');
    }
  });

  // Items breakdown
  const itemsText = order.items.map(i => `• ${i.quantity} x ${currentLang === 'ta' ? i.nameTa : i.nameEn} (₹${i.price * i.quantity})`).join('<br>');

  trackOrderDetails.innerHTML = `
    <div style="margin-bottom:8px;"><strong>${currentLang === 'ta' ? 'உணவு விவரம்:' : 'Items:'}</strong><br>${itemsText}</div>
    <div style="margin-bottom:6px;"><strong>${currentLang === 'ta' ? 'மொத்த தொகை:' : 'Total Amount:'}</strong> ₹${order.totalAmount} (${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'UPI QR'})</div>
    <div><strong>${currentLang === 'ta' ? 'டெலிவரி முகவரி:' : 'Delivery Address:'}</strong> ${order.deliveryAddress} ${order.landmark ? `(${order.landmark})` : ''}</div>
  `;
}

// ----------------- TOAST NOTIFICATIONS ----------------- //
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ----------------- EVENT LISTENERS ----------------- //
function setupEventListeners() {
  langToggleBtn.addEventListener('click', toggleLanguage);
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Search and Veg filters
  foodSearchInput.addEventListener('input', renderFoods);
  vegFilterCheckbox.addEventListener('change', renderFoods);

  // Category Tabs
  categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-tab-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.getAttribute('data-cat');
    renderFoods();
  });

  // Cart Modal Toggle
  openCartBtn.addEventListener('click', () => {
    renderCart();
    cartModalOverlay.classList.add('open');
  });

  closeCartBtn.addEventListener('click', () => {
    cartModalOverlay.classList.remove('open');
  });

  cartModalOverlay.addEventListener('click', (e) => {
    if (e.target === cartModalOverlay) {
      cartModalOverlay.classList.remove('open');
    }
  });

  if (custAreaType) {
    custAreaType.addEventListener('change', calculateTotals);
  }

  // Order submission
  submitOrderBtn.addEventListener('click', handleOrderSubmit);
  whatsappCheckoutBtn.addEventListener('click', handleWhatsAppOrder);

  // Order Tracking
  trackBtn.addEventListener('click', () => executeTracking());
  trackInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeTracking();
  });
}
