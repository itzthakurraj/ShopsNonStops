import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialDatabase } from './src/data/initialData.ts';
import { 
  AdminDepartment,
  CouponCode, 
  DatabaseSchema, 
  MarketplaceEvent, 
  Order, 
  Product, 
  Shop, 
  SubOrder, 
  SyncLog, 
  User, 
  WithdrawalRequest 
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'marketplace_db.json');

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure database directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure new properties exist
      if (!parsed.coupons) parsed.coupons = initialDatabase.coupons;
      if (!parsed.events) parsed.events = initialDatabase.events;
      if (!parsed.vendorEmployees) parsed.vendorEmployees = initialDatabase.vendorEmployees;
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read db file, loading initial data:', err);
  }
  saveDatabase(initialDatabase);
  return JSON.parse(JSON.stringify(initialDatabase));
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to db file:', err);
  }
}

db = loadDatabase();

// Helper to trigger Google Sheets Webhook if configured
async function triggerSheetsSync(type: string, payload: any) {
  if (!db.sheetsConfig.autoSync || !db.sheetsConfig.webhookUrl) {
    return;
  }
  try {
    const res = await fetch(db.sheetsConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: type,
        timestamp: new Date().toISOString(),
        site: db.platformConfig.siteName,
        data: payload,
      }),
    });
    const log: SyncLog = {
      timestamp: new Date().toISOString(),
      type: `AUTO_SYNC_${type}`,
      status: res.ok ? 'success' : 'failed',
      message: `Sync ${type} to Google Sheet Webhook (${res.status} ${res.statusText})`,
    };
    db.sheetsConfig.syncLogs.unshift(log);
    if (db.sheetsConfig.syncLogs.length > 50) db.sheetsConfig.syncLogs.pop();
    db.sheetsConfig.lastSyncedAt = new Date().toISOString();
    db.sheetsConfig.syncCount += 1;
    saveDatabase(db);
  } catch (error: any) {
    const log: SyncLog = {
      timestamp: new Date().toISOString(),
      type: `AUTO_SYNC_${type}`,
      status: 'failed',
      message: `Failed to post to Webhook: ${error.message || 'Network error'}`,
    };
    db.sheetsConfig.syncLogs.unshift(log);
    saveDatabase(db);
  }
}

// ======================== API ROUTES ========================

// Health & Full DB dump
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), store: 'ShopNonstop MultiVendor Platform' });
});

app.get('/api/db', (_req: Request, res: Response) => {
  res.json(db);
});

// Authentication & Users
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'User not found with this email' });
  }
  const shop = user.shopId ? db.shops.find((s) => s.id === user.shopId) : null;
  res.json({ user, shop });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, shopName, shopDescription, departmentTitle, assignedDepartments } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = `usr_${Date.now()}`;
  let shopId: string | undefined = undefined;

  if (role === 'seller') {
    shopId = `shop_${Date.now()}`;
    const newShop: Shop = {
      id: shopId,
      ownerId: userId,
      name: shopName || `${name}'s Store`,
      slug: (shopName || name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: shopDescription || 'Independent marketplace seller providing quality items.',
      avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviewCount: 0,
      balance: 0,
      pendingBalance: 0,
      status: 'active',
      commissionRate: db.platformConfig.defaultCommissionRate || 10,
      phoneNumber: req.body.phone || '+1 (555) 000-0000',
      address: req.body.address || 'Vendor Headquarters',
      bankInfo: {
        bankName: req.body.bankName || 'Merchant Bank',
        accountNumber: '**** **** ' + Math.floor(1000 + Math.random() * 9000),
        holderName: shopName || name,
        routingOrUpi: req.body.upiOrRouting || 'merchant@upi',
      },
      createdAt: new Date().toISOString(),
    };
    db.shops.unshift(newShop);
  }

  const newUser: User = {
    id: userId,
    name,
    email,
    role: role || 'customer',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    phoneNumber: req.body.phone,
    addresses: [],
    shopId,
    departmentTitle: role === 'employee_admin' ? (departmentTitle || 'Staff Member') : undefined,
    assignedDepartments: role === 'employee_admin' ? (assignedDepartments || ['orders']) : undefined,
    createdAt: new Date().toISOString(),
  };

  db.users.unshift(newUser);
  saveDatabase(db);

  triggerSheetsSync('NEW_USER_REGISTERED', {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    departments: newUser.assignedDepartments?.join(', ') || '',
    shopName: shopName || '',
    registeredAt: newUser.createdAt,
  });

  const shop = shopId ? db.shops.find((s) => s.id === shopId) : null;
  res.json({ user: newUser, shop });
});

// Employee Admin Management (Super Admin only)
app.get('/api/employees', (_req: Request, res: Response) => {
  const employees = db.users.filter((u) => u.role === 'employee_admin');
  res.json(employees);
});

app.post('/api/employees', (req: Request, res: Response) => {
  const { name, email, departmentTitle, assignedDepartments, phoneNumber } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newEmployee: User = {
    id: `emp_${Date.now()}`,
    name,
    email,
    role: 'employee_admin',
    departmentTitle: departmentTitle || 'Operations Specialist',
    assignedDepartments: assignedDepartments && assignedDepartments.length ? assignedDepartments : ['orders'],
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    phoneNumber: phoneNumber || '+1 (555) 000-0000',
    addresses: [],
    createdAt: new Date().toISOString(),
  };

  db.users.unshift(newEmployee);
  saveDatabase(db);

  triggerSheetsSync('EMPLOYEE_ADMIN_ADDED', {
    id: newEmployee.id,
    name: newEmployee.name,
    email: newEmployee.email,
    departmentTitle: newEmployee.departmentTitle,
    departments: newEmployee.assignedDepartments?.join(', '),
    createdAt: newEmployee.createdAt,
  });

  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', (req: Request, res: Response) => {
  const index = db.users.findIndex((u) => u.id === req.params.id && u.role === 'employee_admin');
  if (index === -1) return res.status(404).json({ error: 'Employee not found' });

  db.users[index] = {
    ...db.users[index],
    ...req.body,
  };
  saveDatabase(db);
  res.json(db.users[index]);
});

app.delete('/api/employees/:id', (req: Request, res: Response) => {
  db.users = db.users.filter((u) => u.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true, message: 'Employee removed' });
});

// Vendor Employees (Store-level RBAC)
app.get('/api/vendor-employees', (req: Request, res: Response) => {
  const { shopId } = req.query;
  if (!db.vendorEmployees) {
    db.vendorEmployees = [...(initialDatabase.vendorEmployees || [])];
    saveDatabase(db);
  }
  let list = db.vendorEmployees;
  if (shopId) {
    list = list.filter((ve) => ve.shopId === String(shopId));
  }
  res.json(list);
});

app.post('/api/vendor-employees', (req: Request, res: Response) => {
  const { shopId, name, email, roleTitle, permissions } = req.body;
  if (!shopId || !name || !email) {
    return res.status(400).json({ error: 'Shop ID, Name, and Email are required' });
  }

  if (!db.vendorEmployees) db.vendorEmployees = [];

  const newEmp = {
    id: `vemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    shopId,
    name,
    email,
    roleTitle: roleTitle || 'Store Staff',
    permissions: Array.isArray(permissions) ? permissions : ['orders'],
    createdAt: new Date().toISOString(),
  };

  db.vendorEmployees.push(newEmp);
  saveDatabase(db);
  res.status(201).json(newEmp);
});

app.put('/api/vendor-employees/:id', (req: Request, res: Response) => {
  if (!db.vendorEmployees) db.vendorEmployees = [];
  const index = db.vendorEmployees.findIndex((ve) => ve.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vendor employee not found' });
  }

  db.vendorEmployees[index] = {
    ...db.vendorEmployees[index],
    ...req.body,
  };
  saveDatabase(db);
  res.json(db.vendorEmployees[index]);
});

app.delete('/api/vendor-employees/:id', (req: Request, res: Response) => {
  if (!db.vendorEmployees) db.vendorEmployees = [];
  db.vendorEmployees = db.vendorEmployees.filter((ve) => ve.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true, message: 'Vendor employee deleted' });
});

// Products
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, shopId, featured, productType } = req.query;
  let results = [...db.products];

  if (category && category !== 'All') {
    results = results.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (shopId) {
    results = results.filter((p) => p.shopId === String(shopId));
  }
  if (featured === 'true') {
    results = results.filter((p) => p.featured);
  }
  if (productType) {
    results = results.filter((p) => p.productType === String(productType));
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.shopName.toLowerCase().includes(q)
    );
  }
  res.json(results);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', (req: Request, res: Response) => {
  const { 
    shopId, 
    title, 
    description, 
    category, 
    price, 
    discountPrice, 
    stock, 
    tags, 
    images, 
    attributes, 
    featured, 
    productType, 
    digitalAsset 
  } = req.body;

  if (!shopId || !title || !price) {
    return res.status(400).json({ error: 'Shop ID, title, and price are required' });
  }

  const shop = db.shops.find((s) => s.id === shopId);
  if (!shop) return res.status(404).json({ error: 'Vendor store not found' });

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    shopId,
    shopName: shop.name,
    shopAvatar: shop.avatar,
    title,
    description: description || '',
    category: category || 'General',
    productType: productType || (category === 'Digital Goods' ? 'digital' : category === 'Custom Studio' ? 'customizable' : 'physical'),
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    stock: productType === 'digital' ? 9999 : (Number(stock) || 10),
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    rating: 5.0,
    numReviews: 0,
    salesCount: 0,
    featured: Boolean(featured),
    attributes: attributes || [],
    digitalAsset: digitalAsset || (productType === 'digital' ? {
      fileUrl: '/downloads/digital_product_package.pdf',
      fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Licensed.pdf`,
      fileSize: '15.4 MB',
      fileType: 'pdf',
    } : undefined),
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  saveDatabase(db);

  triggerSheetsSync('PRODUCT_ADDED', {
    id: newProduct.id,
    title: newProduct.title,
    vendor: newProduct.shopName,
    type: newProduct.productType,
    price: newProduct.price,
    stock: newProduct.stock,
    category: newProduct.category,
    createdAt: newProduct.createdAt,
  });

  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : db.products[index].price,
    discountPrice: req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : db.products[index].discountPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : db.products[index].stock,
  };

  saveDatabase(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  db.products = db.products.filter((p) => p.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true, message: 'Product removed' });
});

// Coupon Codes
app.get('/api/coupons', (req: Request, res: Response) => {
  const { shopId } = req.query;
  let list = db.coupons;
  if (shopId) {
    list = list.filter((c) => !c.shopId || c.shopId === String(shopId));
  }
  res.json(list);
});

app.post('/api/coupons', (req: Request, res: Response) => {
  const { code, discountPercentage, minAmount, shopId, expiryDate } = req.body;
  if (!code || !discountPercentage) {
    return res.status(400).json({ error: 'Code and discount percentage are required' });
  }

  const shop = shopId ? db.shops.find((s) => s.id === shopId) : undefined;
  const newCoupon: CouponCode = {
    id: `cpn_${Date.now()}`,
    code: code.trim().toUpperCase(),
    discountPercentage: Number(discountPercentage),
    minAmount: Number(minAmount) || 0,
    shopId,
    shopName: shop?.name,
    expiryDate: expiryDate || '2026-12-31T23:59:59Z',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.coupons.unshift(newCoupon);
  saveDatabase(db);

  triggerSheetsSync('COUPON_CREATED', {
    code: newCoupon.code,
    discount: `${newCoupon.discountPercentage}%`,
    vendor: newCoupon.shopName || 'Global Platform Coupon',
    minAmount: newCoupon.minAmount,
  });

  res.status(201).json(newCoupon);
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal, shopId } = req.body;
  if (!code) return res.status(400).json({ error: 'Please enter a coupon code' });

  const coupon = db.coupons.find((c) => c.code === code.trim().toUpperCase() && c.isActive);
  if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' });

  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return res.status(400).json({ error: `Coupon requires minimum order of $${coupon.minAmount}` });
  }

  if (coupon.shopId && shopId && coupon.shopId !== shopId) {
    return res.status(400).json({ error: `Coupon is valid only for ${coupon.shopName}` });
  }

  const discountAmount = Math.round((subtotal * coupon.discountPercentage) / 100 * 100) / 100;
  res.json({ coupon, discountAmount });
});

app.delete('/api/coupons/:id', (req: Request, res: Response) => {
  db.coupons = db.coupons.filter((c) => c.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true, message: 'Coupon removed' });
});

// Flash Events & Deals
app.get('/api/events', (_req: Request, res: Response) => {
  res.json(db.events);
});

app.post('/api/events', (req: Request, res: Response) => {
  const { title, description, bannerUrl, discountTag, startDate, endDate, shopId } = req.body;
  const shop = shopId ? db.shops.find((s) => s.id === shopId) : undefined;
  
  const newEvent: MarketplaceEvent = {
    id: `evt_${Date.now()}`,
    title,
    description: description || '',
    bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    discountTag: discountTag || 'Special Event',
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date(Date.now() + 86400000 * 14).toISOString(),
    shopId,
    shopName: shop?.name,
    featuredProductIds: [],
    status: 'Running',
  };

  db.events.unshift(newEvent);
  saveDatabase(db);
  res.status(201).json(newEvent);
});

// Shops & Vendors
app.get('/api/shops', (_req: Request, res: Response) => {
  res.json(db.shops);
});

app.get('/api/shops/:id', (req: Request, res: Response) => {
  const shop = db.shops.find((s) => s.id === req.params.id || s.slug === req.params.id);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  const products = db.products.filter((p) => p.shopId === shop.id);
  res.json({ shop, products });
});

app.put('/api/shops/:id', (req: Request, res: Response) => {
  const index = db.shops.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Shop not found' });

  db.shops[index] = {
    ...db.shops[index],
    ...req.body,
  };
  saveDatabase(db);
  res.json(db.shops[index]);
});

// Orders
app.get('/api/orders', (req: Request, res: Response) => {
  const { userId, shopId } = req.query;
  let results = [...db.orders];

  if (userId) {
    results = results.filter((o) => o.userId === String(userId));
  }

  if (shopId) {
    results = results
      .filter((o) => o.subOrders.some((so) => so.shopId === String(shopId)))
      .map((o) => ({
        ...o,
        subOrders: o.subOrders.filter((so) => so.shopId === String(shopId)),
      }));
  }

  res.json(results);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Place new multi-vendor split order with Digital Delivery & Custom Merchandise support
app.post('/api/orders', (req: Request, res: Response) => {
  const { 
    userId, 
    customerName, 
    customerEmail, 
    customerPhone, 
    shippingAddress, 
    paymentMethod, 
    items, 
    couponCode 
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  // Group items by vendor shopId
  const itemsByVendor: Record<string, any[]> = {};
  items.forEach((item: any) => {
    const sId = item.product.shopId;
    if (!itemsByVendor[sId]) itemsByVendor[sId] = [];
    itemsByVendor[sId].push(item);
  });

  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const subOrders: SubOrder[] = [];
  let grandTotal = 0;
  let hasAnyDigital = false;

  Object.entries(itemsByVendor).forEach(([vendorShopId, vendorItems], index) => {
    const shop = db.shops.find((s) => s.id === vendorShopId);
    const shopName = shop ? shop.name : 'Independent Seller';
    const commRate = shop ? shop.commissionRate : (db.platformConfig.defaultCommissionRate || 10);

    const subtotal = vendorItems.reduce((acc, curr) => {
      const price = curr.product.discountPrice || curr.product.price;
      return acc + price * curr.quantity;
    }, 0);

    const commissionAmount = Math.round((subtotal * commRate) / 100 * 100) / 100;
    const vendorEarnings = Math.round((subtotal - commissionAmount) * 100) / 100;

    grandTotal += subtotal;

    // Check if suborder is digital
    const isDigitalSubOrder = vendorItems.every((vi) => vi.product.productType === 'digital');
    if (isDigitalSubOrder) hasAnyDigital = true;

    // Prepare items with digital license keys and custom merchandise specs
    const subOrderItems = vendorItems.map((vi) => {
      const isDigi = vi.product.productType === 'digital';
      const licenseKey = isDigi ? `LIC-SN-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined;

      // Update product stock if physical
      const prod = db.products.find((p) => p.id === vi.product.id);
      if (prod) {
        if (!isDigi) prod.stock = Math.max(0, prod.stock - vi.quantity);
        prod.salesCount = (prod.salesCount || 0) + vi.quantity;
      }

      return {
        productId: vi.product.id,
        title: vi.product.title,
        image: vi.product.images[0],
        price: vi.product.discountPrice || vi.product.price,
        quantity: vi.quantity,
        productType: vi.product.productType || 'physical',
        digitalAsset: vi.product.digitalAsset,
        licenseKey,
        customDesign: vi.customDesign,
      };
    });

    // Credit vendor balance: If digital, instant delivery and available balance! If physical, pending.
    if (shop) {
      if (isDigitalSubOrder) {
        shop.balance = Math.round(((shop.balance || 0) + vendorEarnings) * 100) / 100;
      } else {
        shop.pendingBalance = Math.round(((shop.pendingBalance || 0) + vendorEarnings) * 100) / 100;
      }
    }

    subOrders.push({
      subOrderId: `${orderId}-V${index + 1}`,
      shopId: vendorShopId,
      shopName,
      items: subOrderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      commissionRate: commRate,
      commissionAmount,
      vendorEarnings,
      status: isDigitalSubOrder ? 'Delivered' : 'Processing',
      trackingCarrier: isDigitalSubOrder ? 'Instant Digital Vault' : undefined,
      trackingCode: isDigitalSubOrder ? 'INSTANT-DOWNLOAD-UNLOCKED' : undefined,
      timeline: [
        {
          status: isDigitalSubOrder ? 'Delivered' : 'Order Placed',
          date: new Date().toISOString(),
          note: isDigitalSubOrder
            ? 'Digital download vault and cryptographic license key generated.'
            : `Payment authorized via ${paymentMethod || 'Card'}. Package assigned to ${shopName}.`,
        },
      ],
    });
  });

  // Calculate discount if coupon applied
  let finalTotal = grandTotal;
  let couponData: any = undefined;
  if (couponCode) {
    const coupon = db.coupons.find((c) => c.code === couponCode.trim().toUpperCase() && c.isActive);
    if (coupon && (!coupon.minAmount || grandTotal >= coupon.minAmount)) {
      const discount = Math.round((grandTotal * coupon.discountPercentage) / 100 * 100) / 100;
      finalTotal = Math.max(0, grandTotal - discount);
      couponData = { code: coupon.code, discountAmount: discount };
    }
  }

  const newOrder: Order = {
    id: orderId,
    userId: userId || 'usr_customer_1',
    customerName: customerName || shippingAddress?.name || 'Valued Customer',
    customerEmail: customerEmail || 'customer@example.com',
    customerPhone: customerPhone || shippingAddress?.phone || '+1 (555) 000-0000',
    shippingAddress: shippingAddress || {
      id: 'addr_default',
      name: customerName || 'Alex Morgan',
      street: 'Digital Delivery / Direct Address',
      city: 'Online',
      state: 'NA',
      zipCode: '00000',
      country: 'Global',
      phone: customerPhone || '+1 (555) 000-0000',
    },
    paymentMethod: paymentMethod || 'Credit/Debit Card',
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
    totalAmount: Math.round(finalTotal * 100) / 100,
    subOrders,
    couponApplied: couponData,
    hasDigitalItems: hasAnyDigital,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  // Trigger Google Sheets live sync
  subOrders.forEach((so) => {
    triggerSheetsSync('NEW_ORDER', {
      orderId: newOrder.id,
      subOrderId: so.subOrderId,
      vendor: so.shopName,
      customer: newOrder.customerName,
      amount: so.subtotal,
      commission: so.commissionAmount,
      vendorPayout: so.vendorEarnings,
      status: so.status,
      date: newOrder.createdAt,
    });
  });

  res.status(201).json(newOrder);
});

// Update sub-order fulfillment status
app.put('/api/orders/:orderId/suborders/:subOrderId/status', (req: Request, res: Response) => {
  const { orderId, subOrderId } = req.params;
  const { status, note, carrier, trackingCode, location } = req.body;

  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const subOrder = order.subOrders.find((so) => so.subOrderId === subOrderId);
  if (!subOrder) return res.status(404).json({ error: 'Sub-order not found' });

  const previousStatus = subOrder.status;
  subOrder.status = status;
  if (carrier) subOrder.trackingCarrier = carrier;
  if (trackingCode) subOrder.trackingCode = trackingCode;

  subOrder.timeline.unshift({
    status,
    date: new Date().toISOString(),
    note: note || `Status updated to ${status}.`,
    location,
  });

  order.updatedAt = new Date().toISOString();

  // If status moved to Delivered, release pending balance to vendor available balance
  if (status === 'Delivered' && previousStatus !== 'Delivered') {
    const shop = db.shops.find((s) => s.id === subOrder.shopId);
    if (shop) {
      shop.pendingBalance = Math.max(0, Math.round(((shop.pendingBalance || 0) - subOrder.vendorEarnings) * 100) / 100);
      shop.balance = Math.round(((shop.balance || 0) + subOrder.vendorEarnings) * 100) / 100;
    }
  }

  saveDatabase(db);

  triggerSheetsSync('ORDER_STATUS_UPDATE', {
    orderId,
    subOrderId,
    vendor: subOrder.shopName,
    status,
    trackingCode: subOrder.trackingCode || '',
    updatedAt: order.updatedAt,
  });

  res.json({ order, subOrder });
});

// Digital File Download Handler
app.get('/api/downloads/:productId', (req: Request, res: Response) => {
  const product = db.products.find((p) => p.id === req.params.productId);
  if (!product || product.productType !== 'digital') {
    return res.status(404).send('Digital product not found or not downloadable');
  }

  const asset = product.digitalAsset || {
    fileName: `${product.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    fileType: 'pdf',
  };

  const sampleContent = `%PDF-1.4
% ShopNonstop Digital Vault - Verified Download
Title: ${product.title}
Vendor: ${product.shopName}
Issued To: Customer
License: Commercial & Personal Use
Generated At: ${new Date().toISOString()}

Thank you for purchasing on ShopNonstop Multi-Vendor Marketplace.
This document confirms your authorized digital license access.`;

  res.setHeader('Content-Type', asset.fileType === 'pdf' ? 'application/pdf' : 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${asset.fileName || 'download.pdf'}"`);
  res.send(Buffer.from(sampleContent, 'utf-8'));
});

// Withdrawals
app.get('/api/withdrawals', (req: Request, res: Response) => {
  const { shopId } = req.query;
  let results = [...db.withdrawals];
  if (shopId) {
    results = results.filter((w) => w.shopId === String(shopId));
  }
  res.json(results);
});

app.post('/api/withdrawals', (req: Request, res: Response) => {
  const { shopId, amount, method, accountDetails } = req.body;
  if (!shopId || !amount) {
    return res.status(400).json({ error: 'Shop ID and amount are required' });
  }

  const shop = db.shops.find((s) => s.id === shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const numAmount = Number(amount);
  if (numAmount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });
  if (numAmount > shop.balance) {
    return res.status(400).json({ error: `Insufficient available balance ($${shop.balance.toFixed(2)})` });
  }

  shop.balance = Math.round((shop.balance - numAmount) * 100) / 100;

  const newWithdrawal: WithdrawalRequest = {
    id: `wdr_${Date.now()}`,
    shopId,
    shopName: shop.name,
    amount: numAmount,
    method: method || 'Bank Transfer',
    accountDetails: accountDetails || shop.bankInfo.bankName + ' (' + shop.bankInfo.accountNumber + ')',
    status: 'Pending',
    requestedAt: new Date().toISOString(),
  };

  db.withdrawals.unshift(newWithdrawal);
  saveDatabase(db);

  triggerSheetsSync('WITHDRAWAL_REQUEST', {
    id: newWithdrawal.id,
    vendor: shop.name,
    amount: newWithdrawal.amount,
    method: newWithdrawal.method,
    status: newWithdrawal.status,
    requestedAt: newWithdrawal.requestedAt,
  });

  res.status(201).json(newWithdrawal);
});

app.put('/api/withdrawals/:id/status', (req: Request, res: Response) => {
  const { status, adminNote, approvedBy } = req.body;
  const withdrawal = db.withdrawals.find((w) => w.id === req.params.id);
  if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });

  const prevStatus = withdrawal.status;
  withdrawal.status = status;
  withdrawal.adminNote = adminNote || `Processed on ${new Date().toLocaleDateString()}`;
  withdrawal.approvedBy = approvedBy || 'Admin';
  withdrawal.processedAt = new Date().toISOString();

  if (status === 'Rejected' && prevStatus !== 'Rejected') {
    const shop = db.shops.find((s) => s.id === withdrawal.shopId);
    if (shop) {
      shop.balance = Math.round((shop.balance + withdrawal.amount) * 100) / 100;
    }
  }

  saveDatabase(db);
  res.json(withdrawal);
});

// Admin Configuration
app.put('/api/admin/config', (req: Request, res: Response) => {
  db.platformConfig = {
    ...db.platformConfig,
    ...req.body,
  };
  saveDatabase(db);
  res.json(db.platformConfig);
});

// Google Sheets Sync Hub
app.get('/api/sheets/config', (_req: Request, res: Response) => {
  res.json(db.sheetsConfig);
});

app.post('/api/sheets/config', (req: Request, res: Response) => {
  const { webhookUrl, autoSync } = req.body;
  db.sheetsConfig.webhookUrl = webhookUrl !== undefined ? webhookUrl : db.sheetsConfig.webhookUrl;
  db.sheetsConfig.autoSync = autoSync !== undefined ? Boolean(autoSync) : db.sheetsConfig.autoSync;
  saveDatabase(db);
  res.json(db.sheetsConfig);
});

app.post('/api/sheets/sync', async (_req: Request, res: Response) => {
  const syncTime = new Date().toISOString();
  db.sheetsConfig.lastSyncedAt = syncTime;
  db.sheetsConfig.syncCount += 1;

  const ordersSummary = db.orders.flatMap((o) =>
    o.subOrders.map((so) => ({
      Order_ID: o.id,
      SubOrder_ID: so.subOrderId,
      Customer: o.customerName,
      Customer_Email: o.customerEmail,
      Vendor_Store: so.shopName,
      Items_Count: so.items.reduce((s, i) => s + i.quantity, 0),
      Gross_Total: so.subtotal,
      Commission_Rate: `${so.commissionRate}%`,
      Platform_Commission: so.commissionAmount,
      Vendor_Net_Payout: so.vendorEarnings,
      Fulfillment_Status: so.status,
      Tracking_Carrier: so.trackingCarrier || 'N/A',
      Tracking_Code: so.trackingCode || 'N/A',
      Order_Date: o.createdAt,
    }))
  );

  let success = true;
  let statusMsg = `Successfully synchronized ${ordersSummary.length} vendor suborders, ${db.shops.length} vendor profiles, and ${db.coupons.length} coupons.`;

  if (db.sheetsConfig.webhookUrl) {
    try {
      const resp = await fetch(db.sheetsConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FULL_SYNC',
          timestamp: syncTime,
          orders: ordersSummary,
          vendors: db.shops.map((s) => ({
            Shop_ID: s.id,
            Name: s.name,
            Status: s.status,
            Available_Balance: s.balance,
            Pending_Balance: s.pendingBalance,
            Commission_Rate: `${s.commissionRate}%`,
          })),
        }),
      });
      statusMsg += ` Sent to Webhook (${resp.status} ${resp.statusText}).`;
    } catch (err: any) {
      success = false;
      statusMsg = `Failed to send to Webhook: ${err.message}`;
    }
  }

  const log: SyncLog = {
    timestamp: syncTime,
    type: 'MANUAL_FULL_SYNC',
    status: success ? 'success' : 'failed',
    message: statusMsg,
  };
  db.sheetsConfig.syncLogs.unshift(log);
  saveDatabase(db);

  res.json({ success, message: statusMsg, sheetsConfig: db.sheetsConfig });
});

// CSV Exporter for Google Sheets
app.get('/api/sheets/export/:type', (req: Request, res: Response) => {
  const type = req.params.type;
  let csvContent = '';
  let filename = `shopnonstop-${type}-${new Date().toISOString().split('T')[0]}.csv`;

  if (type === 'orders') {
    csvContent = 'Order ID,SubOrder ID,Date,Customer Name,Customer Email,Customer Phone,Vendor Name,Fulfillment Status,Gross Subtotal,Commission Rate,Platform Commission,Vendor Payout,Payment Method,Payment Status,Tracking Carrier,Tracking Number\n';
    db.orders.forEach((o) => {
      o.subOrders.forEach((so) => {
        csvContent += `"${o.id}","${so.subOrderId}","${o.createdAt}","${o.customerName}","${o.customerEmail}","${o.customerPhone}","${so.shopName}","${so.status}",${so.subtotal},"${so.commissionRate}%",${so.commissionAmount},${so.vendorEarnings},"${o.paymentMethod}","${o.paymentStatus}","${so.trackingCarrier || ''}","${so.trackingCode || ''}"\n`;
      });
    });
  } else if (type === 'vendors') {
    csvContent = 'Shop ID,Shop Name,Slug,Status,Available Balance,Pending Balance,Commission Rate,Rating,Review Count,Owner Phone,Address,Bank Account\n';
    db.shops.forEach((s) => {
      csvContent += `"${s.id}","${s.name}","${s.slug}","${s.status}",${s.balance},${s.pendingBalance},"${s.commissionRate}%",${s.rating},${s.reviewCount},"${s.phoneNumber}","${s.address}","${s.bankInfo.bankName} - ${s.bankInfo.accountNumber}"\n`;
    });
  } else if (type === 'products') {
    csvContent = 'Product ID,Vendor,Title,Type,Category,Price,Discount Price,Stock,Rating,Reviews,Sales Count,Created At\n';
    db.products.forEach((p) => {
      csvContent += `"${p.id}","${p.shopName}","${p.title.replace(/"/g, '""')}","${p.productType || 'physical'}","${p.category}",${p.price},${p.discountPrice || ''},${p.stock},${p.rating},${p.numReviews},${p.salesCount || 0},"${p.createdAt}"\n`;
    });
  } else if (type === 'withdrawals') {
    csvContent = 'Request ID,Shop Name,Amount,Method,Account Details,Status,Requested At,Processed At,Admin Note,Approved By\n';
    db.withdrawals.forEach((w) => {
      csvContent += `"${w.id}","${w.shopName}",${w.amount},"${w.method}","${w.accountDetails}","${w.status}","${w.requestedAt}","${w.processedAt || ''}","${w.adminNote || ''}","${w.approvedBy || ''}"\n`;
    });
  } else if (type === 'coupons') {
    csvContent = 'Coupon ID,Code,Discount %,Min Amount,Store,Expiry,Status,Created At\n';
    db.coupons.forEach((c) => {
      csvContent += `"${c.id}","${c.code}",${c.discountPercentage},${c.minAmount},"${c.shopName || 'Global'}","${c.expiryDate}","${c.isActive ? 'Active' : 'Expired'}","${c.createdAt}"\n`;
    });
  } else {
    return res.status(400).send('Invalid export type');
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// Reviews
app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, userId, userName, rating, comment } = req.body;
  const prod = db.products.find((p) => p.id === productId);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const newReview = {
    id: `rev_${Date.now()}`,
    productId,
    productTitle: prod.title,
    shopId: prod.shopId,
    userId: userId || 'usr_customer_1',
    userName: userName || 'Customer',
    rating: Number(rating) || 5,
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);
  const prodReviews = db.reviews.filter((r) => r.productId === productId);
  prod.numReviews = prodReviews.length;
  prod.rating = Math.round((prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length) * 10) / 10;

  saveDatabase(db);
  res.status(201).json(newReview);
});

// ======================== VITE MIDDLEWARE SETUP ========================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ShopNonstop Multi-Vendor Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
