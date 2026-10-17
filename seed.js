const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const FoodItem = require('./models/FoodItem');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homefood';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully!');

    // 1. Create or update Default Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.findOneAndUpdate(
      { phone: '7200676767' },
      {
        name: 'HomeFood Admin (மேலாளர்)',
        phone: '7200676767',
        password: adminPassword,
        role: 'admin',
        address: 'HomeFood Central Kitchen, Main Road',
        villageOrCity: 'city',
        preferredLang: 'ta'
      },
      { upsert: true, new: true }
    );
    console.log('Admin user ready:', adminUser.phone, '(Password: admin123)');

    // 2. Create or update Sample Village User
    const userPassword = await bcrypt.hash('user123', 10);
    const sampleUser = await User.findOneAndUpdate(
      { phone: '9876543210' },
      {
        name: 'Muthu Vel (முத்துவேல்)',
        phone: '9876543210',
        password: userPassword,
        role: 'user',
        address: 'Near Pillayar Kovil, Alanganallur Village',
        villageOrCity: 'village',
        preferredLang: 'ta'
      },
      { upsert: true, new: true }
    );
    console.log('Sample user ready:', sampleUser.phone, '(Password: user123)');

    // 3. Seed Food Items
    const foodItems = [
      {
        nameEn: 'Mallipoo Idli & Crispy Vada Combo',
        nameTa: 'மல்லிப்பூ இட்லி & மெது வடை காம்போ',
        descEn: '3 soft steamed jasmine idlis with 1 golden crispy medu vada, served on fresh banana leaf with drumstick sambar & 2 fresh chutneys.',
        descTa: 'தலைவாழை இலையில் 3 பஞ்சு போன்ற மல்லிப்பூ இட்லி, மொறுமொறு மெது வடை, நாட்டு முருங்கைக்காய் சாம்பார், தேங்காய் & கார சட்னி.',
        category: 'breakfast',
        price: 60,
        isVeg: true,
        image: '/assets/food/idli_vada.jpg',
        badgeEn: 'Village Favourite',
        badgeTa: 'கிராமத்து ஸ்பெஷல்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: '10-15 min',
        servingEn: 'Serves 1',
        servingTa: '1 நபர்'
      },
      {
        nameEn: 'Golden Ghee Roast Dosa',
        nameTa: 'தங்க நிற நெய் ரோஸ்ட் தோசை',
        descEn: 'Pure cow ghee roasted crispy golden cone dosa with spiced potato masala, coconut chutney, tomato chutney & piping hot sambar.',
        descTa: 'சுத்தமான நாட்டுப் பசு நெய்யில் சுட்ட மொறுமொறு கோன் ரோஸ்ட் தோசை, உருளைக்கிழங்கு மசாலா, 2 வகை சட்னி மற்றும் சுடச்சுட சாம்பார்.',
        category: 'breakfast',
        price: 75,
        isVeg: true,
        image: '/assets/food/dosa.jpg',
        badgeEn: 'Crispy & Hot',
        badgeTa: 'மொறுமொறு சுவை',
        isAvailable: true,
        spiceLevel: 'medium',
        prepTime: '10-12 min',
        servingEn: 'Serves 1',
        servingTa: '1 நபர்'
      },
      {
        nameEn: 'Village Banana Leaf Full Meals',
        nameTa: 'கிராமத்து தலைவாழை இலை சாப்பாடு',
        descEn: 'Steaming Ponni rice, pure ghee, paruppu, aromatic drumstick sambar, pepper rasam, kootu, poriyal, potato fry, appalam, thick homemade curd, payasam & pickle.',
        descTa: 'சுடச்சுட பொன்னி சாதம், நெய், பருப்பு, மணமணக்கும் சாம்பார், மிளகு ரசம், கூட்டு, பொரியல், உருளை வறுவல், மொறுமொறு அப்பளம், கெட்டித் தயிர், பாயாசம், ஊறுகாய்.',
        category: 'meals',
        price: 120,
        isVeg: true,
        image: '/assets/food/meals.jpg',
        badgeEn: 'Pure Home Cooked',
        badgeTa: 'கைமணக்கும் சமையல்',
        isAvailable: true,
        spiceLevel: 'medium',
        prepTime: '15-20 min',
        servingEn: 'Unlimited Meal / 1 நபர்',
        servingTa: 'வயிற்றுக்கு நிறைவான உணவு'
      },
      {
        nameEn: 'Chettinad Country Chicken Biryani',
        nameTa: 'செட்டிநாடு நாட்டுக்கோழி பிரியாணி',
        descEn: 'Aromatic Seeraga Samba rice cooked in clay pot with tender country chicken, hand-ground spices, served with boiled egg, onion raita & rich salna.',
        descTa: 'பாரம்பரிய சீரக சம்பா அரிசி, சுவையான நாட்டுக்கோழி, அம்மியில் அரைத்த செட்டிநாட்டு மசாலாவுடன் மண்பானை பிரியாணி. முட்டை, தயிர் பச்சடி, சால்னா உடன்.',
        category: 'meals',
        price: 190,
        isVeg: false,
        image: '/assets/food/biryani.jpg',
        badgeEn: 'Clay Pot Special',
        badgeTa: 'மண்பானை ஸ்பெஷல்',
        isAvailable: true,
        spiceLevel: 'spicy',
        prepTime: '15-20 min',
        servingEn: 'Serves 1-2',
        servingTa: '1-2 நபர்'
      },
      {
        nameEn: 'Fluffy Parotta with Village Salna',
        nameTa: 'மொறுமொறு பரோட்டா & நாட்டு சால்னா (2 pcs)',
        descEn: '2 golden flaky layered parottas served with rich spicy country vegetable salna, sliced onions and fresh green chillies.',
        descTa: 'வீட்டில் தயார் செய்த மொறுமொறு லேயர் பரோட்டா (2 எண்ணிக்கை), மணமணக்கும் சுவையான நாட்டுக் காய் சால்னா, வெங்காயம் உடன்.',
        category: 'dinner',
        price: 70,
        isVeg: true,
        image: '/assets/food/parotta.jpg',
        badgeEn: 'Dinner Favorite',
        badgeTa: 'இரவு உணவு சிறப்பு',
        isAvailable: true,
        spiceLevel: 'medium',
        prepTime: '10-15 min',
        servingEn: 'Serves 1',
        servingTa: '1 நபர்'
      },
      {
        nameEn: 'Kumbakonam Degree Filter Coffee',
        nameTa: 'கும்பகோணம் டிகிரி பில்டர் காபி',
        descEn: 'Authentic strong decoction brewed with fresh rich cow milk, served piping hot in traditional brass dabarah and tumbler with thick froth.',
        descTa: 'சுத்தமான பசும்பால், கெட்டியான டிகாஷன் கொண்டு பாரம்பரிய பித்தளை டம்ளர் செட்டில் நுரை பொங்க பரிமாறப்படும் மணமான பில்டர் காபி.',
        category: 'drinks',
        price: 30,
        isVeg: true,
        image: '/assets/food/coffee.jpg',
        badgeEn: 'Pure Cow Milk',
        badgeTa: 'சுத்த பசும்பால்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: '5 min',
        servingEn: '1 Dabarah Set',
        servingTa: '1 டம்ளர்'
      },
      {
        nameEn: 'Mallipoo Idli Plate (4 Pcs) with Podi',
        nameTa: 'மல்லிப்பூ இட்லி தட்டு (4 Pcs) & பொடி',
        descEn: '4 fluffy steamed idlis with traditional gun powder mixed with cold-pressed sesame oil, plus sambar and fresh coconut chutney.',
        descTa: '4 சுடச்சுட பஞ்சு இட்லிகள், மரச்செக்கு நல்லெண்ணெய் கலந்த இட்லி பொடி, நாட்டு சாம்பார் மற்றும் தேங்காய் சட்னி.',
        category: 'dinner',
        price: 55,
        isVeg: true,
        image: '/assets/food/idli_vada.jpg',
        badgeEn: 'Light & Healthy',
        badgeTa: 'எளிய ஜீரணம்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: '10 min',
        servingEn: 'Serves 1',
        servingTa: '1 நபர்'
      },
      {
        nameEn: 'Crispy Medu Vada (2 Pcs)',
        nameTa: 'மொறுமொறு மெது வடை (2 எண்ணிக்கை)',
        descEn: 'Golden crispy urad dal vadas prepared with pepper, ginger, and curry leaves, served hot with coconut chutney and sambar.',
        descTa: 'மிளகு, இஞ்சி, கருவேப்பிலை சேர்த்து மொறுமொறுவென சுடச்சுட சுட்ட உளுந்து வடை 2 எண்ணிக்கை, தேங்காய் சட்னி, சாம்பார் உடன்.',
        category: 'snacks',
        price: 40,
        isVeg: true,
        image: '/assets/food/idli_vada.jpg',
        badgeEn: 'Hot Snack',
        badgeTa: 'சுடச்சுட ஸ்நாக்ஸ்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: '5-10 min',
        servingEn: '2 Pieces',
        servingTa: '2 எண்ணிக்கை'
      },
      // 🥭 Homemade Pickles
      {
        nameEn: 'Traditional Village Mango Pickle (250g Jar)',
        nameTa: 'பாரம்பரிய கைமுறை மாங்காய் ஊறுகாய் (250g)',
        descEn: 'Raw sour village mango pieces sun-cured with stone-ground red chilies, roasted fenugreek, and cold-pressed sesame gingelly oil. Pure grandma recipe!',
        descTa: 'தோட்டத்து புளிப்பு மாங்காய், அம்மியில் அரைத்த மிளகாய் தூள், வெந்தயப் பொடி, தூய மரச்செக்கு நல்லெண்ணெய் ஊற்றி பாரம்பரிய முறையில் தயாரித்த சுவையான ஊறுகாய்.',
        category: 'pickles',
        price: 85,
        isVeg: true,
        image: '/assets/food/pickle.jpg',
        badgeEn: 'Grandma Recipe',
        badgeTa: 'கைமணக்கும் ஊறுகாய்',
        isAvailable: true,
        spiceLevel: 'spicy',
        prepTime: 'Ready Stock',
        servingEn: '250 Grams Jar',
        servingTa: '250 கிராம் பாட்டில்'
      },
      {
        nameEn: 'Country Lemon Sun-Dried Pickle (250g Jar)',
        nameTa: 'நாட்டு எலுமிச்சை ஊறுகாய் (250g)',
        descEn: 'Sun-ripened yellow farm lemons cured with rock salt, mustard seeds, asafoetida, and wood-pressed gingelly oil. Soft on digestion.',
        descTa: 'செடியில் பழுத்த நாட்டு எலுமிச்சம்பழம், கல் உப்பு, பெருங்காயம், கடுகு மற்றும் மரச்செக்கு நல்லெண்ணெயில் வெயிலில் பதப்படுத்திய பாரம்பரிய எலுமிச்சை ஊறுகாய்.',
        category: 'pickles',
        price: 80,
        isVeg: true,
        image: '/assets/food/pickle.jpg',
        badgeEn: 'Sun-Cured',
        badgeTa: 'வெயிலில் பதப்படுத்தியது',
        isAvailable: true,
        spiceLevel: 'medium',
        prepTime: 'Ready Stock',
        servingEn: '250 Grams Jar',
        servingTa: '250 கிராம் பாட்டில்'
      },
      // 🥥 Fresh Farm Coconuts
      {
        nameEn: 'Pollachi Fresh Farm Big Coconut (1 Pc)',
        nameTa: 'பொள்ளாச்சி நாட்டு பெருந்தேங்காய் (1 எண்ணிக்கை)',
        descEn: 'Directly harvested from organic groves. Thick, sweet white kernel with plenty of sweet coconut water. Heavy and fresh.',
        descTa: 'பொள்ளாச்சி தென்னந்தோப்பிலிருந்து நேரடியாக பறிக்கப்பட்ட சுவையான கெட்டி சதைப்பற்று மற்றும் அதிக இனிப்பு நீர் கொண்ட நாட்டுத் தேங்காய்.',
        category: 'coconuts',
        price: 35,
        isVeg: true,
        image: '/assets/food/coconut.jpg',
        badgeEn: 'Farm Fresh',
        badgeTa: 'தோட்டத்து விளைச்சல்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: 'Fresh Plucked',
        servingEn: '1 Large Coconut',
        servingTa: '1 பெருந்தேங்காய்'
      },
      {
        nameEn: 'Fresh Sweet Tender Coconut (Elaneer - 1 Pc)',
        nameTa: 'தோட்டத்து இயற்கை இளநீர் (1 எண்ணிக்கை)',
        descEn: 'Natural electrolyte-rich sweet coconut water, freshly cut and delivered cool. Pure energy drink straight from nature.',
        descTa: 'அதிக குளுமை மற்றும் தாகம் தீர்க்கும் இயற்கை சுவை கொண்ட இனிப்பான இளநீர். உடலுக்கு உடனடி தெம்பு மற்றும் ஆரோக்கியம்.',
        category: 'coconuts',
        price: 45,
        isVeg: true,
        image: '/assets/food/coconut.jpg',
        badgeEn: '100% Natural',
        badgeTa: 'இயற்கை குளிர்ச்சி',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: 'Fresh Cut',
        servingEn: '1 Tender Coconut',
        servingTa: '1 முழு இளநீர்'
      },
      // 🫒 Wood Cold-Pressed Oils
      {
        nameEn: 'Cold-Pressed Sesame Gingelly Oil (500ml)',
        nameTa: 'மரச்செக்கு சுத்த நல்லெண்ணெய் (500ml)',
        descEn: 'Extracted in traditional Vaagai wood press with black sesame and palm jaggery. Unrefined, unbleached, with pure authentic aroma.',
        descTa: 'வாகை மரச்செக்கில் கருப்பு எள்ளும் பனை வெல்லமும் சேர்த்து ஆட்டிய 100% கலப்படமில்லாத சுத்தமான பாரம்பரிய நல்லெண்ணெய். சமையலுக்கும் தோசைக்கும் அற்புதம்.',
        category: 'oils',
        price: 210,
        isVeg: true,
        image: '/assets/food/oil.jpg',
        badgeEn: 'Wood Pressed',
        badgeTa: 'மரச்செக்கு நலம்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: 'Ready Stock',
        servingEn: '500 ml Bottle',
        servingTa: '500 மி.லி பாட்டில்'
      },
      {
        nameEn: 'Cold-Pressed Groundnut Oil (1 Litre)',
        nameTa: 'மரச்செக்கு சுத்த கடலை எண்ணெய் (1 லிட்டர்)',
        descEn: 'Traditional wood-pressed native peanut oil. Rich in natural antioxidants, zero chemicals, ideal for deep frying and village cooking.',
        descTa: 'நாட்டு நிலக்கடலையை மரச்செக்கில் பதமாக ஆட்டி எடுத்த தூய கடலை எண்ணெய். சுவை, மணம் மற்றும் ஆரோக்கியம் நிறைந்த பாரம்பரிய தயாரிப்பு.',
        category: 'oils',
        price: 230,
        isVeg: true,
        image: '/assets/food/oil.jpg',
        badgeEn: 'Zero Chemical',
        badgeTa: 'தூய கடலை எண்ணெய்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: 'Ready Stock',
        servingEn: '1 Litre Bottle',
        servingTa: '1 லிட்டர் பாட்டில்'
      },
      {
        nameEn: 'Pure Wood-Pressed Coconut Oil (500ml)',
        nameTa: 'தூய மரச்செக்கு தேங்காய் எண்ணெய் (500ml)',
        descEn: 'Pure unrefined edible coconut oil extracted from naturally sun-dried copra in wooden mills. Pristine aroma for cooking and natural care.',
        descTa: 'இயற்கையாக வெயிலில் காயவைத்த கொப்பரைத் தேங்காயை மரச்செக்கில் ஆட்டிய தூய நறுமண தேங்காய் எண்ணெய். சமையல் மற்றும் தலைமுடிக்கான நலம்.',
        category: 'oils',
        price: 180,
        isVeg: true,
        image: '/assets/food/oil.jpg',
        badgeEn: 'Pure Copra',
        badgeTa: 'கொப்பரை எண்ணெய்',
        isAvailable: true,
        spiceLevel: 'mild',
        prepTime: 'Ready Stock',
        servingEn: '500 ml Bottle',
        servingTa: '500 மி.லி பாட்டில்'
      }
    ];

    await FoodItem.deleteMany({});
    const insertedItems = await FoodItem.insertMany(foodItems);
    console.log(`Seeded ${insertedItems.length} food items successfully!`);

    // 4. Create sample initial demo orders
    await Order.deleteMany({});
    const sampleOrder1 = new Order({
      orderNumber: 'HF-1001',
      userId: sampleUser._id,
      customerName: 'Muthu Vel (முத்துவேல்)',
      customerPhone: '9876543210',
      deliveryAddress: 'Near Pillayar Kovil, South Street, Alanganallur',
      landmark: 'Pillayar Kovil backside',
      villageOrCity: 'village',
      items: [
        {
          foodItemId: insertedItems[0]._id,
          nameEn: insertedItems[0].nameEn,
          nameTa: insertedItems[0].nameTa,
          price: insertedItems[0].price,
          quantity: 2,
          image: insertedItems[0].image
        },
        {
          foodItemId: insertedItems[5]._id,
          nameEn: insertedItems[5].nameEn,
          nameTa: insertedItems[5].nameTa,
          price: insertedItems[5].price,
          quantity: 2,
          image: insertedItems[5].image
        }
      ],
      subtotal: 180,
      deliveryFee: 0,
      totalAmount: 180,
      paymentMethod: 'cash_on_delivery',
      status: 'Preparing',
      specialInstructions: 'சாம்பார் அதிகமாக வைக்கவும் (Keep extra sambar)'
    });
    await sampleOrder1.save();

    const sampleOrder2 = new Order({
      orderNumber: 'HF-1002',
      customerName: 'Selvamani (செல்வமணி)',
      customerPhone: '9443322110',
      deliveryAddress: 'Plot 42, Anna Nagar 3rd Cross, Madurai',
      landmark: 'Opposite Water Tank',
      villageOrCity: 'city',
      items: [
        {
          foodItemId: insertedItems[2]._id,
          nameEn: insertedItems[2].nameEn,
          nameTa: insertedItems[2].nameTa,
          price: insertedItems[2].price,
          quantity: 2,
          image: insertedItems[2].image
        }
      ],
      subtotal: 240,
      deliveryFee: 20,
      totalAmount: 260,
      paymentMethod: 'upi_qr',
      status: 'OutForDelivery',
      specialInstructions: 'வாழை இலை சரியாக பேக் செய்யவும்'
    });
    await sampleOrder2.save();

    console.log('Sample orders seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
