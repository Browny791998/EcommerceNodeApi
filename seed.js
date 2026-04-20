/**
 * Seed script — populates all collections with sample data.
 * Run: node seed.js
 * Run (fresh): node seed.js --fresh   (drops all data first)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User        = require('./models/userModel');
const PCategory   = require('./models/prodcategoryModel');
const BCategory   = require('./models/blogCatModel');
const Brand       = require('./models/brandModel');
const Color       = require('./models/colorModel');
const Product     = require('./models/productModel');
const Blog        = require('./models/blogModel');
const Coupon      = require('./models/couponModel');
const Enquiry     = require('./models/enqModel');

const FRESH = process.argv.includes('--fresh');

// ─── helpers ────────────────────────────────────────────────────────────────
const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── seed data ───────────────────────────────────────────────────────────────

const productCategoryData = [
  { title: 'Furniture' },
  { title: 'Electronics' },
  { title: 'Clothing' },
  { title: 'Appliances' },
  { title: 'Accessories' },
  { title: 'Books' },
];

const blogCategoryData = [
  { title: 'Design Tips' },
  { title: 'Tech News' },
  { title: 'Lifestyle' },
  { title: 'Home Decor' },
];

const brandData = [
  { title: 'Apple' },
  { title: 'Samsung' },
  { title: 'Sony' },
  { title: 'IKEA' },
  { title: 'Nike' },
  { title: 'Adidas' },
];

const colorData = [
  { title: 'Black' },
  { title: 'White' },
  { title: 'Silver' },
  { title: 'Blue' },
  { title: 'Red' },
  { title: 'Green' },
  { title: 'Brown' },
  { title: 'Gold' },
];

const couponData = [
  {
    name: 'WELCOME10',
    discountType: 'percentage',
    discount: 10,
    maxDiscount: 20,
    minOrderAmount: 30,
    expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    usageLimit: 1000,
    perUserLimit: 1,
    isActive: true,
  },
  {
    name: 'SAVE20',
    discountType: 'flat',
    discount: 20,
    minOrderAmount: 100,
    expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    perUserLimit: 1,
    isActive: true,
  },
  {
    name: 'SUMMER25',
    discountType: 'percentage',
    discount: 25,
    maxDiscount: 50,
    minOrderAmount: 80,
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: 200,
    perUserLimit: 2,
    isActive: true,
  },
];

const enquiryData = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    mobile: '+12025550101',
    comment: 'Do you offer bulk discounts for orders over 50 units?',
    status: 'Submitted',
  },
  {
    name: 'Emma Johnson',
    email: 'emma.j@example.com',
    mobile: '+12025550102',
    comment: 'I received a damaged item in my last order #ORD-001. Please help.',
    status: 'Contacted',
  },
  {
    name: 'Michael Lee',
    email: 'michael.lee@example.com',
    mobile: '+12025550103',
    comment: 'When will the new iPhone cases be back in stock?',
    status: 'Resolved',
  },
];

// ─── main ────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✔ Connected to MongoDB');

    if (FRESH) {
      await Promise.all([
        User.deleteMany({}),
        PCategory.deleteMany({}),
        BCategory.deleteMany({}),
        Brand.deleteMany({}),
        Color.deleteMany({}),
        Product.deleteMany({}),
        Blog.deleteMany({}),
        Coupon.deleteMany({}),
        Enquiry.deleteMany({}),
      ]);
      console.log('✔ Cleared all collections (--fresh)');
    }

    // ── Users ─────────────────────────────────────────────────────────────
    const adminExists = await User.findOne({ email: 'admin@shopzone.com' });
    let admin;
    if (!adminExists) {
      admin = await User.create({
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@shopzone.com',
        mobile: '+10000000001',
        password: 'Admin@123',   // hashed by pre-save hook
        role: 'admin',
      });
      console.log('✔ Admin user created  → email: admin@shopzone.com  password: Admin@123');
    } else {
      admin = adminExists;
      console.log('– Admin user already exists, skipping');
    }

    const customerExists = await User.findOne({ email: 'customer@shopzone.com' });
    let customer;
    if (!customerExists) {
      customer = await User.create({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'customer@shopzone.com',
        mobile: '+10000000002',
        password: 'Customer@123',
        role: 'user',
      });
      console.log('✔ Customer user created  → email: customer@shopzone.com  password: Customer@123');
    } else {
      customer = customerExists;
      console.log('– Customer user already exists, skipping');
    }

    // ── Product Categories ────────────────────────────────────────────────
    const pCatDocs = [];
    for (const cat of productCategoryData) {
      const existing = await PCategory.findOne({ title: cat.title });
      if (!existing) {
        pCatDocs.push(await PCategory.create(cat));
      } else {
        pCatDocs.push(existing);
      }
    }
    console.log(`✔ Product categories: ${pCatDocs.map((c) => c.title).join(', ')}`);

    // ── Blog Categories ───────────────────────────────────────────────────
    const bCatDocs = [];
    for (const cat of blogCategoryData) {
      const existing = await BCategory.findOne({ title: cat.title });
      if (!existing) {
        bCatDocs.push(await BCategory.create(cat));
      } else {
        bCatDocs.push(existing);
      }
    }
    console.log(`✔ Blog categories: ${bCatDocs.map((c) => c.title).join(', ')}`);

    // ── Brands ────────────────────────────────────────────────────────────
    const brandDocs = [];
    for (const b of brandData) {
      const existing = await Brand.findOne({ title: b.title });
      if (!existing) {
        brandDocs.push(await Brand.create(b));
      } else {
        brandDocs.push(existing);
      }
    }
    console.log(`✔ Brands: ${brandDocs.map((b) => b.title).join(', ')}`);

    // ── Colors ────────────────────────────────────────────────────────────
    const colorDocs = [];
    for (const c of colorData) {
      const existing = await Color.findOne({ title: c.title });
      if (!existing) {
        colorDocs.push(await Color.create(c));
      } else {
        colorDocs.push(existing);
      }
    }
    console.log(`✔ Colors: ${colorDocs.map((c) => c.title).join(', ')}`);

    // ── Products ──────────────────────────────────────────────────────────
    // Map helpers
    const cat  = (name) => pCatDocs.find((c) => c.title === name)?._id;
    const br   = (name) => brandDocs.find((b) => b.title === name)?._id;
    const col  = (...names) => names.map((n) => colorDocs.find((c) => c.title === n)?._id).filter(Boolean);

    const productsData = [
      {
        title: 'Apple MacBook Pro 14"',
        description: 'Apple M3 Pro chip, 18GB RAM, 512GB SSD. The ultimate professional laptop for creative and demanding workflows.',
        price: 1999,
        discountPrice: 1799,
        sku: 'APPLE-MBP-14-M3',
        category: cat('Electronics'),
        brand: br('Apple'),
        quantity: 25,
        color: col('Silver', 'Black'),
        tags: ['laptop', 'apple', 'macbook', 'pro'],
        images: [
          { public_id: 'sample_macbook_1', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80' },
          { public_id: 'sample_macbook_2', url: 'https://images.unsplash.com/photo-1611186871525-29f4e597286f?w=600&q=80' },
          { public_id: 'sample_macbook_3', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80' },
          { public_id: 'sample_macbook_4', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80' },
        ],
      },
      {
        title: 'iPhone 15 Pro',
        description: 'A17 Pro chip, 48MP camera system, titanium design. The most capable iPhone ever made.',
        price: 1099,
        discountPrice: null,
        sku: 'APPLE-IP15-PRO',
        category: cat('Electronics'),
        brand: br('Apple'),
        quantity: 50,
        color: col('Black', 'White', 'Gold'),
        tags: ['phone', 'apple', 'iphone', 'smartphone'],
        images: [
          { public_id: 'sample_iphone_1', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80' },
          { public_id: 'sample_iphone_2', url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80' },
          { public_id: 'sample_iphone_3', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80' },
        ],
      },
      {
        title: 'Samsung 65" QLED 4K TV',
        description: 'Quantum HDR 32x, 120Hz refresh rate, AI Upscaling. Immersive entertainment for your living room.',
        price: 1299,
        discountPrice: 999,
        sku: 'SAMSUNG-TV-65-QLED',
        category: cat('Electronics'),
        brand: br('Samsung'),
        quantity: 15,
        color: col('Black'),
        tags: ['tv', 'samsung', '4k', 'qled'],
        images: [
          { public_id: 'sample_tv_1', url: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600&q=80' },
          { public_id: 'sample_tv_2', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80' },
          { public_id: 'sample_tv_3', url: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&q=80' },
        ],
      },
      {
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation with exceptional sound quality. 30-hour battery life.',
        price: 399,
        discountPrice: 349,
        sku: 'SONY-WH1000XM5',
        category: cat('Electronics'),
        brand: br('Sony'),
        quantity: 40,
        color: col('Black', 'Silver'),
        tags: ['headphones', 'sony', 'wireless', 'noise-cancelling'],
        images: [
          { public_id: 'sample_headphones_1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
          { public_id: 'sample_headphones_2', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80' },
          { public_id: 'sample_headphones_3', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80' },
          { public_id: 'sample_headphones_4', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80' },
        ],
      },
      {
        title: 'IKEA MALM Bed Frame Queen',
        description: 'Clean-lined design with adjustable bed rail. Compatible with LURÖY slatted bed base. Solid pine frame.',
        price: 299,
        discountPrice: null,
        sku: 'IKEA-MALM-BF-Q',
        category: cat('Furniture'),
        brand: br('IKEA'),
        quantity: 20,
        color: col('White', 'Brown', 'Black'),
        tags: ['bed', 'ikea', 'furniture', 'bedroom'],
        images: [
          { public_id: 'sample_bed_1', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
          { public_id: 'sample_bed_2', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80' },
          { public_id: 'sample_bed_3', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
        ],
      },
      {
        title: 'IKEA KALLAX Shelf Unit',
        description: 'Versatile shelving unit that doubles as a room divider. 4x4 cubes with optional inserts.',
        price: 149,
        discountPrice: 129,
        sku: 'IKEA-KALLAX-44',
        category: cat('Furniture'),
        brand: br('IKEA'),
        quantity: 35,
        color: col('White', 'Brown', 'Black'),
        tags: ['shelf', 'ikea', 'storage', 'furniture'],
        images: [
          { public_id: 'sample_shelf_1', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80' },
          { public_id: 'sample_shelf_2', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80' },
          { public_id: 'sample_shelf_3', url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80' },
        ],
      },
      {
        title: 'Nike Air Max 270',
        description: 'Max Air unit in the heel delivers unrivaled, all-day comfort. Breathable mesh upper.',
        price: 150,
        discountPrice: 119,
        sku: 'NIKE-AM270-BLK-10',
        category: cat('Clothing'),
        brand: br('Nike'),
        quantity: 60,
        color: col('Black', 'White', 'Red'),
        tags: ['shoes', 'nike', 'sneakers', 'running'],
        images: [
          { public_id: 'sample_nike_1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
          { public_id: 'sample_nike_2', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' },
          { public_id: 'sample_nike_3', url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80' },
          { public_id: 'sample_nike_4', url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80' },
        ],
      },
      {
        title: 'Adidas Ultraboost 23',
        description: 'Responsive BOOST midsole and Primeknit upper for an incredible run feeling.',
        price: 180,
        discountPrice: 159,
        sku: 'ADIDAS-UB23-WHT-10',
        category: cat('Clothing'),
        brand: br('Adidas'),
        quantity: 45,
        color: col('White', 'Black', 'Blue'),
        tags: ['shoes', 'adidas', 'running', 'boost'],
        images: [
          { public_id: 'sample_adidas_1', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80' },
          { public_id: 'sample_adidas_2', url: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=600&q=80' },
          { public_id: 'sample_adidas_3', url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80' },
        ],
      },
      {
        title: 'Samsung Galaxy Watch 6',
        description: 'Advanced health monitoring, sleep tracking, and fitness coaching on your wrist.',
        price: 299,
        discountPrice: 249,
        sku: 'SAMSUNG-GW6-44',
        category: cat('Accessories'),
        brand: br('Samsung'),
        quantity: 30,
        color: col('Black', 'Silver', 'Gold'),
        tags: ['watch', 'samsung', 'smartwatch', 'fitness'],
        images: [
          { public_id: 'sample_watch_1', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
          { public_id: 'sample_watch_2', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80' },
          { public_id: 'sample_watch_3', url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80' },
          { public_id: 'sample_watch_4', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80' },
        ],
      },
      {
        title: 'Sony PlayStation 5',
        description: 'Experience lightning-fast loading, deeper immersion with haptic feedback and 3D Audio.',
        price: 499,
        discountPrice: null,
        sku: 'SONY-PS5-DISC',
        category: cat('Electronics'),
        brand: br('Sony'),
        quantity: 10,
        color: col('White'),
        tags: ['gaming', 'sony', 'playstation', 'console'],
        images: [
          { public_id: 'sample_ps5_1', url: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80' },
          { public_id: 'sample_ps5_2', url: 'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=600&q=80' },
          { public_id: 'sample_ps5_3', url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80' },
        ],
      },
      {
        title: 'Clean Code: A Handbook',
        description: 'A handbook of agile software craftsmanship by Robert C. Martin. Essential reading for every developer.',
        price: 45,
        discountPrice: 35,
        sku: 'BOOK-CLEAN-CODE',
        category: cat('Books'),
        brand: br('Sony'),
        quantity: 100,
        color: col(),
        tags: ['book', 'programming', 'software', 'development'],
        images: [
          { public_id: 'sample_book_1', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
          { public_id: 'sample_book_2', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
          { public_id: 'sample_book_3', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80' },
        ],
      },
      {
        title: 'IKEA POÄNG Armchair',
        description: 'Layer-glued bent birch frame gives this armchair a comfortable resilience. Comes with cushion.',
        price: 179,
        discountPrice: 149,
        sku: 'IKEA-POANG-ARM',
        category: cat('Furniture'),
        brand: br('IKEA'),
        quantity: 18,
        color: col('Brown', 'Black'),
        tags: ['chair', 'ikea', 'armchair', 'furniture'],
        images: [
          { public_id: 'sample_chair_1', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80' },
          { public_id: 'sample_chair_2', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
          { public_id: 'sample_chair_3', url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80' },
          { public_id: 'sample_chair_4', url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80' },
        ],
      },
    ];

    let productsCreated = 0;
    const productDocs = [];
    for (const p of productsData) {
      const existing = await Product.findOne({ sku: p.sku });
      if (!existing) {
        const slug = slugify(p.title);
        const doc = await Product.create({ ...p, slug });
        productDocs.push(doc);
        productsCreated++;
      } else {
        productDocs.push(existing);
      }
    }
    console.log(`✔ Products: ${productsCreated} created, ${productDocs.length - productsCreated} already existed`);

    // ── Blogs ─────────────────────────────────────────────────────────────
    const blogsData = [
      {
        title: 'Top 10 Home Office Setup Tips for 2025',
        description: `<p>Working from home has become the norm for millions of people worldwide. But a great home office isn't just about having a desk — it's about creating a space that boosts productivity, comfort, and creativity.</p>
<h2>1. Invest in a Quality Chair</h2>
<p>Your back will thank you. Look for lumbar support, adjustable height, and armrests. The IKEA MARKUS or Herman Miller Aeron are excellent choices.</p>
<h2>2. Dual Monitor Setup</h2>
<p>Productivity studies consistently show that dual monitors can increase output by up to 42%. Use one for reference, one for work.</p>
<h2>3. Control Your Lighting</h2>
<p>Natural light is best. Position your desk near a window, but use a bias light behind your monitor to reduce eye strain during evening work.</p>
<p>A well-designed home office is an investment in your productivity and mental health. Start with the essentials and build from there.</p>`,
        category: bCatDocs.find((c) => c.title === 'Home Decor')?._id,
        author: admin._id,
        images: [{ public_id: 'blog_home_office', url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80' }],
        numViews: 142,
      },
      {
        title: 'The Best Wireless Headphones of 2025: Tested and Ranked',
        description: `<p>We tested over 20 pairs of wireless headphones this year so you don't have to. Here's our definitive ranking.</p>
<h2>1. Sony WH-1000XM5 — Best Overall</h2>
<p>Still the king of noise cancellation. The XM5 improves on its predecessor with a sleeker design, lighter weight, and the same class-leading ANC.</p>
<h2>2. Apple AirPods Max — Best for Apple Users</h2>
<p>If you're deep in the Apple ecosystem, the AirPods Max offer seamless switching, excellent ANC, and spatial audio that's genuinely impressive.</p>
<h2>3. Samsung Galaxy Buds2 Pro — Best Value Premium</h2>
<p>Compact, comfortable, with intelligent ANC that adapts to your environment. A strong contender at a lower price point.</p>`,
        category: bCatDocs.find((c) => c.title === 'Tech News')?._id,
        author: admin._id,
        images: [{ public_id: 'blog_headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }],
        numViews: 287,
      },
      {
        title: 'Minimalist Interior Design: Less is More',
        description: `<p>Minimalism isn't about having nothing — it's about making room for what matters. Here's how to apply minimalist principles to your home.</p>
<h2>Start with a Neutral Palette</h2>
<p>Whites, creams, and light greys create a sense of space and calm. Use a single accent color sparingly — a deep navy or forest green works beautifully.</p>
<h2>Choose Furniture Wisely</h2>
<p>Every piece should serve a purpose. Multi-functional furniture — like ottomans with storage or beds with drawers — is a minimalist's best friend.</p>
<h2>Declutter Ruthlessly</h2>
<p>The Marie Kondo method works: if it doesn't spark joy and serve a purpose, let it go. Surfaces should be as clear as possible.</p>`,
        category: bCatDocs.find((c) => c.title === 'Design Tips')?._id,
        author: admin._id,
        images: [{ public_id: 'blog_interior', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' }],
        numViews: 198,
      },
      {
        title: 'Running in 2025: The Best Shoes for Every Budget',
        description: `<p>Whether you're a casual jogger or a marathon runner, the right shoe makes all the difference. We break down the top picks across three price tiers.</p>
<h2>Budget: Under $100</h2>
<p>Adidas Runfalcon 3.0 and Nike Revolution 7 offer surprising performance for their price. Great for beginners building their mileage.</p>
<h2>Mid-Range: $100–$180</h2>
<p>The Nike Air Max 270 and Adidas Ultraboost 23 sit in this sweet spot — daily trainers with premium comfort that won't break the bank.</p>
<h2>Premium: $180+</h2>
<p>Nike Vaporfly and Adidas Adizero Adios Pro are race-day weapons. The carbon-fibre plates and ultra-light foam make a genuine difference in race times.</p>`,
        category: bCatDocs.find((c) => c.title === 'Lifestyle')?._id,
        author: admin._id,
        images: [{ public_id: 'blog_running', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' }],
        numViews: 163,
      },
    ];

    let blogsCreated = 0;
    for (const b of blogsData) {
      const existing = await Blog.findOne({ title: b.title });
      if (!existing) {
        await Blog.create(b);
        blogsCreated++;
      }
    }
    console.log(`✔ Blogs: ${blogsCreated} created`);

    // ── Coupons ───────────────────────────────────────────────────────────
    let couponsCreated = 0;
    for (const c of couponData) {
      const existing = await Coupon.findOne({ name: c.name });
      if (!existing) {
        await Coupon.create(c);
        couponsCreated++;
      }
    }
    console.log(`✔ Coupons: ${couponsCreated} created → WELCOME10, SAVE20, SUMMER25`);

    // ── Enquiries ─────────────────────────────────────────────────────────
    let enqCreated = 0;
    for (const e of enquiryData) {
      const existing = await Enquiry.findOne({ email: e.email });
      if (!existing) {
        await Enquiry.create(e);
        enqCreated++;
      }
    }
    console.log(`✔ Enquiries: ${enqCreated} created`);

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════');
    console.log('  Seed complete!');
    console.log('══════════════════════════════════════════════');
    console.log('  Admin login:');
    console.log('    Email:    admin@shopzone.com');
    console.log('    Password: Admin@123');
    console.log('  Customer login:');
    console.log('    Email:    customer@shopzone.com');
    console.log('    Password: Customer@123');
    console.log('  Coupons:  WELCOME10 | SAVE20 | SUMMER25');
    console.log('══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('✖ Seed failed:', err.message);
    if (err.errors) {
      Object.values(err.errors).forEach((e) => console.error(' -', e.message));
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
