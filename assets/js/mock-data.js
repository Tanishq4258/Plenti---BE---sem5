/**
 * PLENTI — SURPLUS FOOD MARKETPLACE
 * Unified Mock Data Store for Admin & Food Business Dashboards
 */

const PLENTI_MOCK = {
  // Platform Administrator Metrics & Collections
  admin: {
    stats: {
      totalCustomers: 1842,
      totalBusinesses: 64,
      activeListings: 148,
      totalOrders: 4328,
      totalRevenue: 648500, // in INR
      platformCommission: 64850, // 10%
      foodRescuedKg: 8240,
      pendingVerifications: 3,
      co2SavedKg: 19776
    },

    revenueTrends: {
      weekly: [
        { label: "Mon", revenue: 14200, orders: 84 },
        { label: "Tue", revenue: 18500, orders: 110 },
        { label: "Wed", revenue: 16800, orders: 98 },
        { label: "Thu", revenue: 21400, orders: 132 },
        { label: "Fri", revenue: 26500, orders: 165 },
        { label: "Sat", revenue: 32000, orders: 204 },
        { label: "Sun", revenue: 29800, orders: 188 }
      ],
      monthly: [
        { label: "Jun", revenue: 64000, orders: 420 },
        { label: "Jul", revenue: 82000, orders: 540 },
        { label: "Aug", revenue: 98000, orders: 650 },
        { label: "Sep", revenue: 115000, orders: 780 },
        { label: "Oct", revenue: 138000, orders: 920 },
        { label: "Nov", revenue: 151500, orders: 1018 }
      ]
    },

    businesses: [
      {
        id: "biz-1",
        name: "The Morning Oven Bakery",
        owner: "Priya Sharma",
        email: "contact@morningoven.in",
        phone: "+91 98765 43210",
        category: "Bakery",
        address: "SCO 42, Sector 17-C, Chandigarh",
        regDate: "2026-08-14",
        status: "verified", // verified | pending | suspended
        activeListingsCount: 5,
        totalOrdersCount: 342,
        totalEarnings: 58420,
        rating: 4.9
      },
      {
        id: "biz-2",
        name: "Sweet Crumb Patisserie",
        owner: "Karan Oberoi",
        email: "karan@sweetcrumb.com",
        phone: "+91 98140 12345",
        category: "Desserts",
        address: "Booth 18, Sector 35-B, Chandigarh",
        regDate: "2026-09-02",
        status: "verified",
        activeListingsCount: 4,
        totalOrdersCount: 289,
        totalEarnings: 44200,
        rating: 4.8
      },
      {
        id: "biz-3",
        name: "Green Bowl Kitchen",
        owner: "Sneha Reddy",
        email: "sneha@greenbowl.in",
        phone: "+91 98722 99881",
        category: "Healthy Bowls",
        address: "SCO 88, Sector 8-C, Chandigarh",
        regDate: "2026-09-20",
        status: "verified",
        activeListingsCount: 6,
        totalOrdersCount: 410,
        totalEarnings: 62300,
        rating: 4.7
      },
      {
        id: "biz-4",
        name: "Brew & Bean Specialty Cafe",
        owner: "Vikram Malhotra",
        email: "vikram@brewandbean.com",
        phone: "+91 94170 55443",
        category: "Cafe & Beverages",
        address: "SCF 12, Sector 22-D, Chandigarh",
        regDate: "2026-10-05",
        status: "verified",
        activeListingsCount: 3,
        totalOrdersCount: 195,
        totalEarnings: 29800,
        rating: 4.9
      },
      {
        id: "biz-5",
        name: "Punjab Heritage Kitchen",
        owner: "Gurpreet Singh",
        email: "gurpreet@punjabheritage.in",
        phone: "+91 98888 77665",
        category: "North Indian",
        address: "SCO 112, Sector 34, Chandigarh",
        regDate: "2026-10-18",
        status: "verified",
        activeListingsCount: 4,
        totalOrdersCount: 520,
        totalEarnings: 82100,
        rating: 4.9
      },
      {
        id: "biz-6",
        name: "Artisan Bagel & Bakehouse",
        owner: "Rhea Chawla",
        email: "rhea@artisanbagel.co",
        phone: "+91 98155 33221",
        category: "Bakery",
        address: "Phase 7, Industrial Area, Mohali",
        regDate: "2026-11-18",
        status: "pending", // Waiting for admin verification
        activeListingsCount: 0,
        totalOrdersCount: 0,
        totalEarnings: 0,
        rating: 0
      },
      {
        id: "biz-7",
        name: "Urban Mezze & Falafel Bar",
        owner: "Tariq Ali",
        email: "tariq@urbanmezze.in",
        phone: "+91 98760 11223",
        category: "Mediterranean",
        address: "Sector 9, Panchkula",
        regDate: "2026-11-20",
        status: "pending",
        activeListingsCount: 0,
        totalOrdersCount: 0,
        totalEarnings: 0,
        rating: 0
      },
      {
        id: "biz-8",
        name: "Midnight Canteen",
        owner: "Sanjay Joshi",
        email: "sanjay@midnightcanteen.com",
        phone: "+91 99144 00998",
        category: "Fast Food",
        address: "Phase 3B2, Mohali",
        regDate: "2026-07-10",
        status: "suspended", // Admin suspended due to quality complaints
        activeListingsCount: 0,
        totalOrdersCount: 114,
        totalEarnings: 15400,
        rating: 3.2
      }
    ],

    customers: [
      {
        id: "cust-1",
        name: "Aarav Rawat",
        email: "aarav.rawat@gmail.com",
        phone: "+91 98144 11223",
        location: "Sector 17, Chandigarh",
        joinDate: "2026-08-16",
        ordersCount: 18,
        totalSpent: 2680,
        status: "active"
      },
      {
        id: "cust-2",
        name: "Mehak Kapoor",
        email: "mehak.k@pu.ac.in",
        phone: "+91 98720 44556",
        location: "Panjab University, Chandigarh",
        joinDate: "2026-08-22",
        ordersCount: 24,
        totalSpent: 3420,
        status: "active"
      },
      {
        id: "cust-3",
        name: "Rohan Verma",
        email: "rohan.verma@outlook.com",
        phone: "+91 94172 33445",
        location: "Sector 35, Chandigarh",
        joinDate: "2026-09-05",
        ordersCount: 12,
        totalSpent: 1890,
        status: "active"
      },
      {
        id: "cust-4",
        name: "Ananya Deshmukh",
        email: "ananya.d@gmail.com",
        phone: "+91 98881 66778",
        location: "Phase 5, Mohali",
        joinDate: "2026-09-19",
        ordersCount: 9,
        totalSpent: 1350,
        status: "active"
      },
      {
        id: "cust-5",
        name: "Divyansh Mehra",
        email: "divyansh.mehra@yahoo.com",
        phone: "+91 98765 99001",
        location: "Sector 20, Panchkula",
        joinDate: "2026-10-02",
        ordersCount: 15,
        totalSpent: 2280,
        status: "active"
      },
      {
        id: "cust-6",
        name: "Simran Kaur",
        email: "simran.kaur99@gmail.com",
        phone: "+91 94630 11992",
        location: "Sector 11, Chandigarh",
        joinDate: "2026-10-14",
        ordersCount: 31,
        totalSpent: 4890,
        status: "active"
      },
      {
        id: "cust-7",
        name: "Kabir Mathur",
        email: "kabir.m@gmail.com",
        phone: "+91 98150 77889",
        location: "Sector 22, Chandigarh",
        joinDate: "2026-11-01",
        ordersCount: 2,
        totalSpent: 298,
        status: "active"
      },
      {
        id: "cust-8",
        name: "Manish Batra (Flagged)",
        email: "batra.spam@tempmail.com",
        phone: "+91 91234 56789",
        location: "Sector 45, Chandigarh",
        joinDate: "2026-11-10",
        ordersCount: 1,
        totalSpent: 149,
        status: "suspended" // Policy violation
      }
    ],

    recentOrders: [
      {
        id: "PLNT-9421",
        customer: "Simran Kaur",
        business: "The Morning Oven Bakery",
        item: "Artisan Bakery Box",
        quantity: 2,
        amount: 298,
        time: "10 mins ago",
        date: "2026-11-23",
        payment: "Razorpay (Online)",
        status: "ready" // pending | confirmed | ready | completed | cancelled
      },
      {
        id: "PLNT-9420",
        customer: "Mehak Kapoor",
        business: "Sweet Crumb Patisserie",
        item: "Dessert Surprise Box",
        quantity: 1,
        amount: 139,
        time: "24 mins ago",
        date: "2026-11-23",
        payment: "Razorpay (Online)",
        status: "confirmed"
      },
      {
        id: "PLNT-9419",
        customer: "Aarav Rawat",
        business: "Green Bowl Kitchen",
        item: "Fresh Harvest Salad Box",
        quantity: 1,
        amount: 119,
        time: "48 mins ago",
        date: "2026-11-23",
        payment: "Cash on Pickup",
        status: "pending"
      },
      {
        id: "PLNT-9418",
        customer: "Rohan Verma",
        business: "Punjab Heritage Kitchen",
        item: "Royal Thali Mystery Box",
        quantity: 2,
        amount: 318,
        time: "2 hours ago",
        date: "2026-11-23",
        payment: "Razorpay (Online)",
        status: "completed"
      },
      {
        id: "PLNT-9417",
        customer: "Ananya Deshmukh",
        business: "Brew & Bean Specialty Cafe",
        item: "Artisan Cold Brew & Muffin Pack",
        quantity: 1,
        amount: 99,
        time: "3 hours ago",
        date: "2026-11-23",
        payment: "Razorpay (Online)",
        status: "completed"
      },
      {
        id: "PLNT-9416",
        customer: "Divyansh Mehra",
        business: "The Morning Oven Bakery",
        item: "Artisan Bakery Box",
        quantity: 1,
        amount: 149,
        time: "Yesterday",
        date: "2026-11-22",
        payment: "Cash on Pickup",
        status: "cancelled"
      }
    ]
  },

  // Food Business Portal Data (The Morning Oven Bakery)
  business: {
    profile: {
      id: "biz-1",
      name: "The Morning Oven Bakery",
      owner: "Priya Sharma",
      category: "Bakery & Patisserie",
      email: "contact@morningoven.in",
      phone: "+91 98765 43210",
      address: "SCO 42, Sector 17-C, Chandigarh",
      operatingHours: "8:00 AM – 10:00 PM",
      pickupWindowDefault: "7:30 PM – 9:00 PM",
      pickupInstructions: "Please visit the designated pickup counter at the front. Show your Plenti order code upon arrival.",
      verificationStatus: "Verified Food Partner ✓",
      rating: 4.9,
      reviewsCount: 142,
      bannerImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
      logoImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80"
    },

    stats: {
      activeListings: 5,
      totalOrdersReceived: 342,
      pendingOrders: 3,
      readyOrders: 4,
      completedOrders: 328,
      totalEarnings: 58420, // in INR
      foodRescuedKg: 412,
      averageRating: 4.9,
      monthGrowth: "+18.4%"
    },

    salesTrends: {
      weekly: [
        { label: "Mon", sales: 1840, orders: 12 },
        { label: "Tue", sales: 2450, orders: 16 },
        { label: "Wed", sales: 2190, orders: 14 },
        { label: "Thu", sales: 2980, orders: 20 },
        { label: "Fri", sales: 3840, orders: 26 },
        { label: "Sat", sales: 4950, orders: 34 },
        { label: "Sun", sales: 4420, orders: 30 }
      ],
      monthly: [
        { label: "Jun", sales: 8400, orders: 58 },
        { label: "Jul", sales: 10200, orders: 72 },
        { label: "Aug", sales: 12400, orders: 86 },
        { label: "Sep", sales: 13900, orders: 94 },
        { label: "Oct", sales: 15600, orders: 108 },
        { label: "Nov", sales: 17920, orders: 124 }
      ]
    },

    listings: [
      {
        id: "list-101",
        name: "Artisan Bakery Surprise Box",
        description: "Freshly baked butter croissants, pain au chocolat, sourdough slices, and artisanal rolls baked today.",
        category: "Bakery",
        originalPrice: 420,
        discountedPrice: 149,
        discountPercent: 65,
        availableQty: 3,
        initialQty: 8,
        pickupStart: "19:30",
        pickupEnd: "21:00",
        expiryDate: "2026-11-23T21:30",
        status: "active", // active | sold_out | expired | draft
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
        specialInstructions: "Items are packed in eco-friendly paper boxes. Keep in a dry place."
      },
      {
        id: "list-102",
        name: "Assorted French Croissant Duo",
        description: "Two flaky almond and dark chocolate filled golden French croissants.",
        category: "Bakery",
        originalPrice: 280,
        discountedPrice: 99,
        discountPercent: 65,
        availableQty: 4,
        initialQty: 6,
        pickupStart: "19:00",
        pickupEnd: "20:30",
        expiryDate: "2026-11-23T21:00",
        status: "active",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80",
        specialInstructions: "Best warmed in the oven for 3 minutes before eating."
      },
      {
        id: "list-103",
        name: "Country Sourdough Loaf & Buns",
        description: "One rustic sourdough loaf with naturally fermented crust plus 4 multigrain brioche slider buns.",
        category: "Bakery",
        originalPrice: 320,
        discountedPrice: 119,
        discountPercent: 63,
        availableQty: 2,
        initialQty: 5,
        pickupStart: "19:30",
        pickupEnd: "21:30",
        expiryDate: "2026-11-23T22:00",
        status: "active",
        image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
        specialInstructions: "Can be refrigerated or frozen for up to 5 days."
      },
      {
        id: "list-104",
        name: "Sweet Danish Pastry Quartet",
        description: "Four assorted fruit Danishes topped with vanilla custard, glazed berries, and apricot jam.",
        category: "Desserts",
        originalPrice: 360,
        discountedPrice: 129,
        discountPercent: 64,
        availableQty: 0,
        initialQty: 4,
        pickupStart: "18:30",
        pickupEnd: "20:00",
        expiryDate: "2026-11-23T20:30",
        status: "sold_out",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
        specialInstructions: "Contains dairy and gluten."
      },
      {
        id: "list-105",
        name: "Evening Veggie Puff & Savory Pack",
        description: "Four spiced potato-pea flaky puffs and cheese-stuffed rolls.",
        category: "Snacks",
        originalPrice: 220,
        discountedPrice: 89,
        discountPercent: 60,
        availableQty: 5,
        initialQty: 8,
        pickupStart: "18:00",
        pickupEnd: "19:30",
        expiryDate: "2026-11-23T20:00",
        status: "active",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
        specialInstructions: "Includes homemade mint chutney dip."
      },
      {
        id: "list-106",
        name: "Yesterday's Sourdough Crisp Pack",
        description: "Cinnamon-sugar and herbed garlic baked sourdough crisps.",
        category: "Snacks",
        originalPrice: 180,
        discountedPrice: 69,
        discountPercent: 62,
        availableQty: 0,
        initialQty: 6,
        pickupStart: "17:00",
        pickupEnd: "19:00",
        expiryDate: "2026-11-22T20:00",
        status: "expired",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80",
        specialInstructions: "Packaged dry snack."
      }
    ],

    orders: [
      {
        id: "PLNT-9421",
        customerName: "Simran Kaur",
        customerPhone: "+91 94630 11992",
        items: [{ name: "Artisan Bakery Surprise Box", qty: 2, price: 149 }],
        totalAmount: 298,
        paymentMethod: "Razorpay (Online)",
        paymentStatus: "Paid",
        orderTime: "10 mins ago (7:14 PM)",
        pickupWindow: "7:30 PM – 9:00 PM",
        status: "ready" // pending | confirmed | ready | completed | cancelled
      },
      {
        id: "PLNT-9419",
        customerName: "Aarav Rawat",
        customerPhone: "+91 98144 11223",
        items: [{ name: "Assorted French Croissant Duo", qty: 1, price: 99 }],
        totalAmount: 99,
        paymentMethod: "Cash on Pickup",
        paymentStatus: "Pending Cash",
        orderTime: "25 mins ago (6:58 PM)",
        pickupWindow: "7:00 PM – 8:30 PM",
        status: "pending"
      },
      {
        id: "PLNT-9415",
        customerName: "Mehak Kapoor",
        customerPhone: "+91 98720 44556",
        items: [{ name: "Country Sourdough Loaf & Buns", qty: 1, price: 119 }],
        totalAmount: 119,
        paymentMethod: "Razorpay (Online)",
        paymentStatus: "Paid",
        orderTime: "45 mins ago (6:38 PM)",
        pickupWindow: "7:30 PM – 9:30 PM",
        status: "confirmed"
      },
      {
        id: "PLNT-9411",
        customerName: "Rohan Verma",
        customerPhone: "+91 94172 33445",
        items: [{ name: "Evening Veggie Puff & Savory Pack", qty: 2, price: 89 }],
        totalAmount: 178,
        paymentMethod: "Razorpay (Online)",
        paymentStatus: "Paid",
        orderTime: "2 hours ago (5:15 PM)",
        pickupWindow: "6:00 PM – 7:30 PM",
        status: "completed"
      },
      {
        id: "PLNT-9408",
        customerName: "Sneha Goyal",
        customerPhone: "+91 98765 00112",
        items: [{ name: "Artisan Bakery Surprise Box", qty: 1, price: 149 }],
        totalAmount: 149,
        paymentMethod: "Cash on Pickup",
        paymentStatus: "Paid Cash",
        orderTime: "Yesterday",
        pickupWindow: "7:30 PM – 9:00 PM",
        status: "completed"
      },
      {
        id: "PLNT-9402",
        customerName: "Divyansh Mehra",
        customerPhone: "+91 98765 99001",
        items: [{ name: "Artisan Bakery Surprise Box", qty: 1, price: 149 }],
        totalAmount: 149,
        paymentMethod: "Cash on Pickup",
        paymentStatus: "Unpaid",
        orderTime: "Yesterday",
        pickupWindow: "7:30 PM – 9:00 PM",
        status: "cancelled"
      }
    ],

    inventory: [
      {
        id: "inv-1",
        name: "Artisan Butter Croissants",
        category: "Pastry",
        stockQty: 8,
        threshold: 3,
        status: "in_stock", // in_stock | low_stock | out_of_stock
        unit: "pieces",
        lastUpdated: "Today, 6:00 PM"
      },
      {
        id: "inv-2",
        name: "Pain au Chocolat",
        category: "Pastry",
        stockQty: 2,
        threshold: 3,
        status: "low_stock",
        unit: "pieces",
        lastUpdated: "Today, 6:00 PM"
      },
      {
        id: "inv-3",
        name: "Country Sourdough Loaves",
        category: "Breads",
        stockQty: 4,
        threshold: 2,
        status: "in_stock",
        unit: "loaves",
        lastUpdated: "Today, 5:30 PM"
      },
      {
        id: "inv-4",
        name: "Multigrain Brioche Buns",
        category: "Breads",
        stockQty: 10,
        threshold: 4,
        status: "in_stock",
        unit: "buns",
        lastUpdated: "Today, 4:00 PM"
      },
      {
        id: "inv-5",
        name: "Berry Custard Danishes",
        category: "Desserts",
        stockQty: 0,
        threshold: 3,
        status: "out_of_stock",
        unit: "pieces",
        lastUpdated: "Today, 7:10 PM"
      },
      {
        id: "inv-6",
        name: "Spiced Veggie Puffs",
        category: "Savory",
        stockQty: 5,
        threshold: 3,
        status: "in_stock",
        unit: "pieces",
        lastUpdated: "Today, 6:15 PM"
      }
    ]
  }
};

window.PLENTI_MOCK = PLENTI_MOCK;
