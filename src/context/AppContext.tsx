import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Address, 
  AdminDepartment, 
  CartItem, 
  CouponCode, 
  CustomDesignSpec, 
  DatabaseSchema, 
  GoogleSheetsConfig, 
  MarketplaceEvent, 
  Order, 
  OrderStatus, 
  Product, 
  Shop, 
  User, 
  UserRole, 
  WithdrawalRequest,
  PortalMode,
  VendorPermission,
  VendorEmployee
} from '../types/index.ts';

interface AppContextType {
  currentUser: User | null;
  currentShop: Shop | null;
  activeRole: UserRole;
  users: User[];
  shops: Shop[];
  products: Product[];
  orders: Order[];
  coupons: CouponCode[];
  events: MarketplaceEvent[];
  withdrawals: WithdrawalRequest[];
  sheetsConfig: GoogleSheetsConfig;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
  isLoading: boolean;
  selectedCategory: string;
  searchQuery: string;
  activeView: 
    | 'home' 
    | 'marketplace' 
    | 'pdp' 
    | 'stores' 
    | 'cart' 
    | 'checkout' 
    | 'track-order' 
    | 'customer-profile' 
    | 'digital-vault' 
    | 'custom-studio' 
    | 'seller-dashboard' 
    | 'admin-center';
  selectedProduct: Product | null;
  activeTrackingId: string | null;

  // Actions
  switchRole: (role: UserRole) => void;
  setActiveView: (view: AppContextType['activeView']) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  viewProductDetails: (product: Product) => void;
  viewOrderTracking: (orderId: string) => void;
  addToCart: (product: Product, quantity?: number, variant?: string, customDesign?: CustomDesignSpec) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  placeOrder: (shippingAddress: Address, paymentMethod: any) => Promise<Order>;
  updateSubOrderStatus: (orderId: string, subOrderId: string, status: OrderStatus, note?: string, carrier?: string, trackingCode?: string, location?: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createCoupon: (couponData: Partial<CouponCode>) => Promise<CouponCode>;
  deleteCoupon: (id: string) => Promise<void>;
  createEvent: (eventData: Partial<MarketplaceEvent>) => Promise<MarketplaceEvent>;
  createEmployee: (employeeData: Partial<User>) => Promise<User>;
  updateEmployee: (id: string, employeeData: Partial<User>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateShop: (id: string, shopData: Partial<Shop>) => Promise<void>;
  requestWithdrawal: (amount: number, method: string, accountDetails: string) => Promise<void>;
  processWithdrawal: (id: string, status: 'Approved' | 'Rejected', adminNote?: string) => Promise<void>;
  submitReview: (productId: string, rating: number, comment: string) => Promise<void>;
  updateSheetsConfig: (webhookUrl: string, autoSync: boolean) => Promise<void>;
  triggerSheetsSyncNow: () => Promise<{ success: boolean; message: string }>;
  downloadDigitalProduct: (productId: string, fileName?: string) => void;
  hasDepartmentPermission: (dept: AdminDepartment) => boolean;
  refreshData: () => Promise<void>;

  // Portals & Vendor Staff RBAC
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  vendorEmployees: VendorEmployee[];
  activeVendorEmployee: VendorEmployee | null;
  setActiveVendorEmployee: (emp: VendorEmployee | null) => void;
  hasVendorPermission: (perm: VendorPermission) => boolean;
  createVendorEmployee: (emp: Partial<VendorEmployee>) => Promise<VendorEmployee>;
  updateVendorEmployee: (id: string, emp: Partial<VendorEmployee>) => Promise<void>;
  deleteVendorEmployee: (id: string) => Promise<void>;

  // Virtual Try-On
  isVtoOpen: boolean;
  vtoProduct: Product | null;
  openVto: (product?: Product | null) => void;
  closeVto: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbData, setDbData] = useState<DatabaseSchema | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopnonstop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<AppContextType['activeView']>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  // Portal Mode & Vendor Staff RBAC & VTO state
  const [portalMode, setPortalModeState] = useState<PortalMode>('customer');
  const [activeVendorEmployee, setActiveVendorEmployee] = useState<VendorEmployee | null>(null);
  const [isVtoOpen, setIsVtoOpen] = useState(false);
  const [vtoProduct, setVtoProduct] = useState<Product | null>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopnonstop_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('shopnonstop_wishlist', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('shopnonstop_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Fetch initial database state
  const refreshData = async () => {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data: DatabaseSchema = await res.json();
        setDbData(data);
        syncUserSession(activeRole, data);
      }
    } catch (error) {
      console.error('Failed to load database from /api/db:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const syncUserSession = (role: UserRole, data: DatabaseSchema) => {
    if (role === 'customer') {
      const user = data.users.find((u) => u.role === 'customer') || data.users[0];
      setCurrentUser(user || null);
      setCurrentShop(null);
    } else if (role === 'seller') {
      const user = data.users.find((u) => u.role === 'seller') || data.users[1];
      setCurrentUser(user || null);
      const shop = data.shops.find((s) => s.ownerId === user?.id || s.id === user?.shopId) || data.shops[0];
      setCurrentShop(shop || null);
    } else if (role === 'employee_admin') {
      const user = data.users.find((u) => u.role === 'employee_admin') || data.users[4];
      setCurrentUser(user || null);
      setCurrentShop(null);
    } else if (role === 'admin') {
      const user = data.users.find((u) => u.role === 'admin') || data.users[3];
      setCurrentUser(user || null);
      setCurrentShop(null);
    }
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (dbData) {
      syncUserSession(role, dbData);
    }
    if (role === 'seller') {
      setActiveView('seller-dashboard');
    } else if (role === 'admin' || role === 'employee_admin') {
      setActiveView('admin-center');
    } else {
      setActiveView('home');
    }
  };

  const hasDepartmentPermission = (dept: AdminDepartment): boolean => {
    if (activeRole === 'admin') return true; // Super Admin has all permissions
    if (activeRole === 'employee_admin' && currentUser?.assignedDepartments) {
      return currentUser.assignedDepartments.includes(dept);
    }
    return false;
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewOrderTracking = (orderId: string) => {
    setActiveTrackingId(orderId);
    setActiveView('track-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations with custom design specs support
  const addToCart = (product: Product, quantity = 1, variant?: string, customDesign?: CustomDesignSpec) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedVariant === variant && !customDesign
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedVariant === variant
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity, selectedVariant: variant, customDesign }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid coupon' };
      }
      setAppliedCoupon({ code: data.coupon.code, discountAmount: data.discountAmount });
      return { success: true, message: `Applied coupon ${data.coupon.code} (-$${data.discountAmount.toFixed(2)})` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cart.reduce((acc, curr) => {
    const price = curr.product.discountPrice || curr.product.price;
    return acc + price * curr.quantity;
  }, 0);
  const cartDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Order Placement
  const placeOrder = async (shippingAddress: Address, paymentMethod: any): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id || 'usr_customer_1',
        customerName: shippingAddress.name,
        customerEmail: currentUser?.email || 'customer@example.com',
        customerPhone: shippingAddress.phone,
        shippingAddress,
        paymentMethod,
        items: cart,
        couponCode: appliedCoupon?.code,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }

    const order: Order = await res.json();
    clearCart();
    await refreshData();
    return order;
  };

  // Sub-order status update (Seller fulfillment)
  const updateSubOrderStatus = async (
    orderId: string,
    subOrderId: string,
    status: OrderStatus,
    note?: string,
    carrier?: string,
    trackingCode?: string,
    location?: string
  ) => {
    const res = await fetch(`/api/orders/${orderId}/suborders/${subOrderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, carrier, trackingCode, location }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    await refreshData();
  };

  // Product CRUD
  const createProduct = async (productData: Partial<Product>): Promise<Product> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    const newProduct = await res.json();
    await refreshData();
    return newProduct;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to update product');
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    await refreshData();
  };

  // Coupon CRUD
  const createCoupon = async (couponData: Partial<CouponCode>): Promise<CouponCode> => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    if (!res.ok) throw new Error('Failed to create coupon code');
    const newCoupon = await res.json();
    await refreshData();
    return newCoupon;
  };

  const deleteCoupon = async (id: string) => {
    const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete coupon');
    await refreshData();
  };

  // Event CRUD
  const createEvent = async (eventData: Partial<MarketplaceEvent>): Promise<MarketplaceEvent> => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to launch event');
    const newEvent = await res.json();
    await refreshData();
    return newEvent;
  };

  // Employee Admin CRUD
  const createEmployee = async (employeeData: Partial<User>): Promise<User> => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create employee admin');
    }
    const newEmp = await res.json();
    await refreshData();
    return newEmp;
  };

  const updateEmployee = async (id: string, employeeData: Partial<User>) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!res.ok) throw new Error('Failed to update employee admin');
    await refreshData();
  };

  const deleteEmployee = async (id: string) => {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove employee');
    await refreshData();
  };

  // Shop update
  const updateShop = async (id: string, shopData: Partial<Shop>) => {
    const res = await fetch(`/api/shops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData),
    });
    if (!res.ok) throw new Error('Failed to update shop');
    await refreshData();
  };

  // Withdrawals
  const requestWithdrawal = async (amount: number, method: string, accountDetails: string) => {
    if (!currentShop) throw new Error('Active shop required to withdraw');
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId: currentShop.id,
        amount,
        method,
        accountDetails,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit withdrawal');
    }
    await refreshData();
  };

  const processWithdrawal = async (id: string, status: 'Approved' | 'Rejected', adminNote?: string) => {
    const res = await fetch(`/api/withdrawals/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status, 
        adminNote,
        approvedBy: currentUser?.email || 'Admin',
      }),
    });
    if (!res.ok) throw new Error('Failed to process withdrawal');
    await refreshData();
  };

  // Review
  const submitReview = async (productId: string, rating: number, comment: string) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        userId: currentUser?.id,
        userName: currentUser?.name,
        rating,
        comment,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    await refreshData();
  };

  // Google Sheets Sync Hub
  const updateSheetsConfig = async (webhookUrl: string, autoSync: boolean) => {
    const res = await fetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl, autoSync }),
    });
    if (!res.ok) throw new Error('Failed to update Google Sheets settings');
    await refreshData();
  };

  const triggerSheetsSyncNow = async () => {
    const res = await fetch('/api/sheets/sync', { method: 'POST' });
    const data = await res.json();
    await refreshData();
    return data;
  };

  const downloadDigitalProduct = (productId: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = `/api/downloads/${productId}`;
    link.download = fileName || 'digital_product_download.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
    if (mode === 'customer') {
      setActiveRole('customer');
      if (dbData) syncUserSession('customer', dbData);
      setActiveView('home');
    } else if (mode === 'vendor') {
      setActiveRole('seller');
      if (dbData) syncUserSession('seller', dbData);
      setActiveView('seller-dashboard');
    } else if (mode === 'admin') {
      setActiveRole('admin');
      if (dbData) syncUserSession('admin', dbData);
      setActiveView('admin-center');
    }
  };

  const hasVendorPermission = (perm: VendorPermission): boolean => {
    if (activeRole !== 'seller') return false;
    // If no vendor employee is selected, session is Store Owner (full access)
    if (!activeVendorEmployee) return true;
    return activeVendorEmployee.permissions.includes(perm);
  };

  const openVto = (product?: Product | null) => {
    if (product) setVtoProduct(product);
    setIsVtoOpen(true);
  };

  const closeVto = () => {
    setIsVtoOpen(false);
  };

  const createVendorEmployee = async (empData: Partial<VendorEmployee>): Promise<VendorEmployee> => {
    const res = await fetch('/api/vendor-employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData),
    });
    if (!res.ok) throw new Error('Failed to create vendor employee');
    const created: VendorEmployee = await res.json();
    await refreshData();
    return created;
  };

  const updateVendorEmployee = async (id: string, empData: Partial<VendorEmployee>) => {
    const res = await fetch(`/api/vendor-employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData),
    });
    if (!res.ok) throw new Error('Failed to update vendor employee');
    await refreshData();
  };

  const deleteVendorEmployee = async (id: string) => {
    const res = await fetch(`/api/vendor-employees/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete vendor employee');
    if (activeVendorEmployee?.id === id) {
      setActiveVendorEmployee(null);
    }
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentShop,
        activeRole,
        users: dbData?.users || [],
        shops: dbData?.shops || [],
        products: dbData?.products || [],
        orders: dbData?.orders || [],
        coupons: dbData?.coupons || [],
        events: dbData?.events || [],
        withdrawals: dbData?.withdrawals || [],
        sheetsConfig: dbData?.sheetsConfig || {
          webhookUrl: '',
          autoSync: true,
          lastSyncedAt: null,
          syncCount: 0,
          syncLogs: [],
        },
        cart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        appliedCoupon,
        isLoading,
        selectedCategory,
        searchQuery,
        activeView,
        selectedProduct,
        activeTrackingId,
        switchRole,
        setActiveView,
        setSelectedCategory,
        setSearchQuery,
        viewProductDetails,
        viewOrderTracking,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateSubOrderStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        createCoupon,
        deleteCoupon,
        createEvent,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        updateShop,
        requestWithdrawal,
        processWithdrawal,
        submitReview,
        updateSheetsConfig,
        triggerSheetsSyncNow,
        downloadDigitalProduct,
        hasDepartmentPermission,
        refreshData,
        portalMode,
        setPortalMode,
        vendorEmployees: dbData?.vendorEmployees || [],
        activeVendorEmployee,
        setActiveVendorEmployee,
        hasVendorPermission,
        createVendorEmployee,
        updateVendorEmployee,
        deleteVendorEmployee,
        isVtoOpen,
        vtoProduct,
        openVto,
        closeVto,
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
