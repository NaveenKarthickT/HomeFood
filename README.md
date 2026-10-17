# 🍛 HomeFood - Hunger, Handled (ஹோம் புட்)
**From Our Family Table To Yours**

A full-stack authentic South Indian homemade food ordering platform built with **Node.js, Express, MongoDB, and Vanilla CSS/JS**. Designed specifically to be simple, visual, and intuitive for **both village people and city people**, featuring complete **bilingual support (Tamil & English)**, **Light & Dark mode**, **photos for visual cues**, and **two distinct portals (User & Admin)**.

---

## 🌟 Key Features

### 1. 🌾 Simple for Both Village & City People
- **Visual-First Layout**: Large, appetizing photos of authentic South Indian dishes on green banana leaves and clay pots.
- **Village-Friendly Visual Elements**:
  - Direct 1-tap **WhatsApp Order Button** (pre-formats the order message to `7200676767`).
  - Direct **Call to Order Button** (`tel:7200676767`).
  - **Voice Read-Aloud Assistant (🔊)**: Uses speech synthesis to pronounce the dish name and price in Tamil or English for elders and village customers.
  - Flexible Landmark Delivery: Supports rural addresses like *"Near Pillayar Kovil / Bus Stop"* with Free delivery for village areas.
- **City-Friendly Amenities**:
  - Filter by meal time (Breakfast, Meals, Dinner, Snacks, Filter Coffee).
  - Bilingual instant search bar.
  - Interactive shopping cart with quantity counter and instant bill breakdown.
  - **Live Order Tracking**: 4-step progress timeline (*Received* -> *In Kitchen* -> *Out for Delivery* -> *Delivered*).

### 2. 🌐 Complete Bilingual Support (Tamil & English)
- Instant 1-click toggle between **தமிழ்** and **English**.
- Seamlessly translates:
  - Dish names (e.g. `மல்லிப்பூ இட்லி & மெது வடை காம்போ` / `Mallipoo Idli & Crispy Vada Combo`)
  - Descriptions and ingredients
  - Order status and cooking updates
  - Buttons, forms, cart, and the Admin portal.

### 3. ☀️🌙 Normal & Dark Mode
- **Normal (Light) Mode**: Warm organic banana-leaf green (`#1e5c2b`), turmeric gold (`#d97706`), and soft cream.
- **Dark Mode**: Sleek emerald slate (`#0d1510`), high-contrast mint green (`#34d399`), and warm amber for comfortable night ordering.
- Theme preference is remembered across visits using `localStorage`.

### 4. 📸 Photos for Information
- Real, mouth-watering food photos for every menu item:
  - Mallipoo Idli & Crispy Vada Combo
  - Golden Ghee Cone Roast Dosa
  - Village Banana Leaf Full Meals
  - Chettinad Country Chicken Biryani in Clay Pot
  - Flaky Malabar Parotta with Village Salna
  - Kumbakonam Degree Filter Coffee in Brass Dabarah
  - 🥭 **Homemade Pickles**: Traditional Village Mango Pickle, Country Lemon Sun-Dried Pickle
  - 🥥 **Fresh Farm Coconuts**: Pollachi Fresh Big Coconuts, Sweet Tender Coconut Elaneer
  - 🫒 **Cold-Pressed Oils**: Vaagai Wood Sesame Gingelly Oil, Groundnut Oil, Pure Coconut Oil
- 3-step pictorial guide: `1. Pick Dish` -> `2. Tell Address / Village` -> `3. Hot Banana Leaf Delivery`.
- Visual badges for Veg (🍃) / Non-Veg (🍗), spice meter, and cooking time.
- Quality guarantee: *100% Wood Cold-Pressed Oil, Zero Ajinomoto, FSSAI Certified: 22426425000201*.

### 5. 👥 Two Distinct Portals (User & Admin)
- **User Portal (`/` & `/login.html`)**:
  - Browse menu, search, filter.
  - Add to basket, specify landmark, choose Cash on Delivery or UPI QR.
  - Track orders live by Order # or Mobile Number.
  - 1-click demo login: `9876543210` / `user123`.
- **Kitchen Admin Portal (`/admin.html`)**:
  - Direct login for kitchen manager: `7200676767` / `admin123`.
  - **KPI Dashboard**: Today's Orders, Cooking in Kitchen, Completed Deliveries, Total Revenue (₹).
  - **Live Kitchen Orders**:
    - Filter by Status or Village/City.
    - 1-click **WhatsApp Customer** or **Call Customer** button on each order card.
    - Real-time status updater dropdown (*Received* -> *Preparing* -> *OutForDelivery* -> *Delivered*).
  - **Menu & Stock Manager**:
    - 1-click toggle between **"In Stock / கிடைக்கிறது"** and **"Out of Stock / தீர்ந்துவிட்டது"**.
    - Add new dish modal form with photo, bilingual names, and pricing.
    - Delete dishes.

---

## 🚀 How to Run Locally

### 1. Requirements
- **Node.js**: v18+ (verified on v24)
- **MongoDB**: Running locally on port `27017` (Default Windows Service)

### 2. Start Database & Seed Initial Menu
```bash
# Seed initial admin, user, authentic dishes, and sample orders
npm run seed
```

### 3. Start the Server
```bash
npm start
```
The application will be live at:
- 🌐 **User Website**: [http://localhost:3000](http://localhost:3000)
- 🔐 **Login Page (Dual User / Admin)**: [http://localhost:3000/login.html](http://localhost:3000/login.html)
- 🛠️ **Admin Kitchen Portal**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🔑 Demo Credentials

| Role | Username / Mobile | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Kitchen Admin** | `7200676767` (or `admin`) | `admin123` | Has 1-click Demo Admin button on login page |
| **Village User** | `9876543210` | `user123` | Has 1-click Demo User button on login page |

---

## 📁 Project Structure

```
HomrFood/
├── models/
│   ├── User.js          # User & Admin credentials, address, preferences
│   ├── FoodItem.js      # Bilingual dish items, pricing, availability
│   └── Order.js         # Orders with workflow statuses, village/city flag
├── public/
│   ├── assets/
│   │   ├── logo.png     # Official HomeFood banner logo (FSSAI & Hotline)
│   │   └── food/        # High-res South Indian food dish photos
│   ├── css/
│   │   ├── style.css    # Responsive design system, CSS variables for Light & Dark mode
│   │   └── admin.css    # Admin KPI cards, status badges, stock toggles
│   ├── js/
│   │   ├── translations.js # Complete Tamil & English dictionary
│   │   ├── app.js       # Cart, search, speech assistant, live tracker
│   │   ├── auth.js      # User/Admin tabs, demo 1-click login
│   │   └── admin.js     # Live order management, stock status controller
│   ├── index.html       # Customer storefront & visual order system
│   ├── login.html       # Dual login portal (User vs Admin)
│   └── admin.html       # Kitchen control dashboard
├── package.json
├── seed.js              # Initial database population script
└── server.js            # Express REST API & MongoDB connection
```
