require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const FoodItem = require('./models/FoodItem');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'homefood_super_secret_key_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homefood';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection with caching for serverless functions (Vercel)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState >= 1) {
    return cachedDb;
  }
  try {
    cachedDb = await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
    console.log('Connected to MongoDB');
    return cachedDb;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Initial connection for persistent servers
connectToDatabase().catch(err => console.error('Initial DB connect failed:', err.message));

// Middleware to ensure DB is connected on each incoming serverless request
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState < 1) {
    try {
      await connectToDatabase();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Database connection error' });
    }
  }
  next();
});

// Helper: Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session' });
    }
    req.user = decodedUser;
    next();
  });
}

// Helper: Admin Check Middleware
function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required' });
    }
  });
}

// ----------------- AUTHENTICATION ROUTES ----------------- //

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, address, villageOrCity, preferredLang } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone, and password are required' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      phone: cleanPhone,
      password: hashedPassword,
      role: 'user',
      address: address ? address.trim() : '',
      villageOrCity: villageOrCity || 'village',
      preferredLang: preferredLang || 'ta'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        address: user.address,
        villageOrCity: user.villageOrCity,
        preferredLang: user.preferredLang
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login (User or Admin)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password, loginType } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone/Username and password are required' });
    }

    const cleanPhone = phone.trim();
    // Allow admin to login via phone '7200676767' or 'admin'
    let user;
    if (cleanPhone.toLowerCase() === 'admin') {
      user = await User.findOne({ role: 'admin' });
    } else {
      user = await User.findOne({ phone: cleanPhone });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found with this mobile number' });
    }

    if (loginType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'This account does not have Admin privileges' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        address: user.address,
        villageOrCity: user.villageOrCity,
        preferredLang: user.preferredLang
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Quick demo login (One-click login for village users or testing)
app.post('/api/auth/quick-demo', async (req, res) => {
  try {
    const { role } = req.body;
    const targetPhone = role === 'admin' ? '7200676767' : '9876543210';
    const user = await User.findOne({ phone: targetPhone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo account not initialized. Please run seed.' });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        address: user.address,
        villageOrCity: user.villageOrCity,
        preferredLang: user.preferredLang
      }
    });
  } catch (err) {
    console.error('Quick demo login error:', err);
    res.status(500).json({ success: false, message: 'Quick login failed' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----------------- FOOD ITEMS ROUTES ----------------- //

// Get public food items (available for ordering)
app.get('/api/foods', async (req, res) => {
  try {
    const { category, search, vegOnly } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (vegOnly === 'true') {
      filter.isVeg = true;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { nameEn: regex },
        { nameTa: regex },
        { descEn: regex },
        { descTa: regex }
      ];
    }

    const foods = await FoodItem.find(filter).sort({ category: 1, price: 1 });
    res.json({ success: true, count: foods.length, foods });
  } catch (err) {
    console.error('Get foods error:', err);
    res.status(500).json({ success: false, message: 'Failed to load foods' });
  }
});

// Admin: Get all foods including stock status
app.get('/api/foods/all', requireAdmin, async (req, res) => {
  try {
    const foods = await FoodItem.find().sort({ createdAt: -1 });
    res.json({ success: true, foods });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load foods' });
  }
});

// Admin: Add new food item
app.post('/api/foods', requireAdmin, async (req, res) => {
  try {
    const {
      nameEn, nameTa, descEn, descTa, category, price, isVeg,
      image, badgeEn, badgeTa, spiceLevel, prepTime, servingEn, servingTa
    } = req.body;

    if (!nameEn || !nameTa || !category || !price) {
      return res.status(400).json({ success: false, message: 'Names, category, and price are required' });
    }

    const newFood = new FoodItem({
      nameEn: nameEn.trim(),
      nameTa: nameTa.trim(),
      descEn: descEn || '',
      descTa: descTa || '',
      category,
      price: Number(price),
      isVeg: Boolean(isVeg),
      image: image || '/assets/food/idli_vada.jpg',
      badgeEn: badgeEn || '',
      badgeTa: badgeTa || '',
      spiceLevel: spiceLevel || 'medium',
      prepTime: prepTime || '15 min',
      servingEn: servingEn || 'Serves 1',
      servingTa: servingTa || '1 நபர்',
      isAvailable: true
    });

    await newFood.save();
    res.json({ success: true, message: 'Food item added successfully', food: newFood });
  } catch (err) {
    console.error('Add food error:', err);
    res.status(500).json({ success: false, message: 'Failed to add food item' });
  }
});

// Admin: Update food item
app.put('/api/foods/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Food item updated', food: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update item' });
  }
});

// Admin: Quick toggle availability (In stock / Out of stock)
app.patch('/api/foods/:id/toggle-availability', requireAdmin, async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Item not found' });

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.json({
      success: true,
      message: `Item status updated to ${food.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      isAvailable: food.isAvailable
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Admin: Delete food item
app.delete('/api/foods/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await FoodItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

// ----------------- ORDERS ROUTES ----------------- //

// Create New Order (Village & City Friendly)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      landmark,
      villageOrCity,
      items,
      paymentMethod,
      specialInstructions,
      userId
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone, address and food items' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Village friendly policy: Free delivery for orders or standard nominal ₹15 for city
    const deliveryFee = villageOrCity === 'city' ? 20 : 0;
    const totalAmount = subtotal + deliveryFee;

    // Generate readable order number: HF-YYMMDD-XXXX
    const count = await Order.countDocuments();
    const orderNumber = `HF-${1000 + count + 1}`;

    const order = new Order({
      orderNumber,
      userId: userId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim().replace(/\D/g, ''),
      deliveryAddress: deliveryAddress.trim(),
      landmark: landmark ? landmark.trim() : '',
      villageOrCity: villageOrCity || 'village',
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      status: 'Received',
      specialInstructions: specialInstructions || ''
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order placed successfully! We have started preparing your meal.',
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Could not place order. Please try again or call 7200676767.' });
  }
});

// Track Order by Order Number or Phone Number
app.get('/api/orders/track/:query', async (req, res) => {
  try {
    const query = req.params.query.trim();
    // Search by exact orderNumber or phone
    const cleanPhone = query.replace(/\D/g, '');
    const orders = await Order.find({
      $or: [
        { orderNumber: new RegExp('^' + query + '$', 'i') },
        { customerPhone: cleanPhone }
      ]
    }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'No orders found for this number' });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Tracking lookup failed' });
  }
});

// Get User's Orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { userId: req.user.id },
        { customerPhone: req.user.phone }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
  }
});

// Admin: Get all orders
app.get('/api/orders/all', requireAdmin, async (req, res) => {
  try {
    const { status, villageOrCity } = req.query;
    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (villageOrCity && villageOrCity !== 'all') {
      filter.villageOrCity = villageOrCity;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

// Admin: Update Order Status
app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Received', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({
      success: true,
      message: `Order #${order.orderNumber} status changed to ${status}`,
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Admin: Dashboard Analytics
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $in: ['Received', 'Preparing', 'OutForDelivery'] } });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;

    const totalFoods = await FoodItem.countDocuments();

    res.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        totalRevenue,
        totalFoods
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
});

// Serve frontend for clean client routing
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start Server if run directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🍛 HomeFood Server is running at http://localhost:${PORT}`);
    console.log(`🌿 User Website: http://localhost:${PORT}/`);
    console.log(`🔐 Login Portal: http://localhost:${PORT}/login.html`);
    console.log(`🛠️ Admin Portal: http://localhost:${PORT}/admin.html`);
    console.log(`=================================================`);
  });
}

// Export for Vercel Serverless
module.exports = app;
