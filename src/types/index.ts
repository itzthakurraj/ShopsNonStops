export type UserRole = 'customer' | 'seller' | 'admin' | 'employee_admin';

export type PortalMode = 'customer' | 'vendor' | 'admin';

export type AdminDepartment = 'orders' | 'catalog' | 'support' | 'finance';

export type VendorPermission = 'orders' | 'catalog' | 'coupons' | 'finance' | 'settings';

export interface VendorEmployee {
  id: string;
  shopId: string;
  name: string;
  email: string;
  roleTitle: string;
  permissions: VendorPermission[];
  createdAt: string;
}

export interface VirtualTryOnItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: 'shirt' | 'tshirt' | 'jacket' | 'dress' | 'hoodie';
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phoneNumber?: string;
  addresses: Address[];
  shopId?: string; // If role is 'seller'
  assignedDepartments?: AdminDepartment[]; // If role is 'employee_admin'
  departmentTitle?: string;
  createdAt: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  holderName: string;
  routingOrUpi: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  avatar: string;
  banner: string;
  rating: number;
  reviewCount: number;
  balance: number;
  pendingBalance: number;
  status: 'active' | 'pending' | 'suspended';
  commissionRate: number; // e.g., 10%
  phoneNumber: string;
  address: string;
  bankInfo: BankInfo;
  createdAt: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface DigitalAssetInfo {
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'ebook' | 'zip' | 'license_key';
  samplePreviewUrl?: string;
}

export interface CustomDesignSpec {
  baseColor: string;
  customText: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  graphicUrl?: string;
  printPosition: 'front' | 'back' | 'both';
  apparelSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
}

export type ProductType = 'physical' | 'digital' | 'customizable';

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  shopAvatar?: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  tags: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  rating: number;
  numReviews: number;
  featured?: boolean;
  salesCount?: number;
  attributes?: ProductAttribute[];
  productType?: ProductType;
  digitalAsset?: DigitalAssetInfo;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  customDesign?: CustomDesignSpec;
}

export type OrderStatus =
  | 'Processing'
  | 'Confirmed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refund Requested'
  | 'Refunded';

export interface TrackingStep {
  status: OrderStatus | string;
  date: string;
  note: string;
  location?: string;
}

export interface SubOrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  productType?: ProductType;
  digitalAsset?: DigitalAssetInfo;
  licenseKey?: string;
  customDesign?: CustomDesignSpec;
}

export interface SubOrder {
  subOrderId: string;
  shopId: string;
  shopName: string;
  items: SubOrderItem[];
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  vendorEarnings: number;
  status: OrderStatus;
  trackingCarrier?: string;
  trackingCode?: string;
  timeline: TrackingStep[];
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  paymentMethod: 'Credit/Debit Card' | 'Cash on Delivery' | 'UPI / NetBanking' | 'Wallet';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  totalAmount: number;
  subOrders: SubOrder[];
  couponApplied?: {
    code: string;
    discountAmount: number;
  };
  hasDigitalItems?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCode {
  id: string;
  shopId?: string; // If vendor-specific, or undefined for global
  shopName?: string;
  code: string;
  discountPercentage: number;
  minAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface MarketplaceEvent {
  id: string;
  shopId?: string;
  shopName?: string;
  title: string;
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  discountTag: string;
  featuredProductIds: string[];
  status: 'Running' | 'Upcoming' | 'Ended';
}

export interface WithdrawalRequest {
  id: string;
  shopId: string;
  shopName: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  approvedBy?: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  shopId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SyncLog {
  timestamp: string;
  type: string;
  status: 'success' | 'failed' | 'info';
  message: string;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
  syncCount: number;
  syncLogs: SyncLog[];
}

export interface PlatformConfig {
  defaultCommissionRate: number; // e.g. 10%
  allowDirectVendorRegistration: boolean;
  freeShippingThreshold: number;
  siteName: string;
  currency: string;
  currencySymbol: string;
}

export interface DatabaseSchema {
  users: User[];
  shops: Shop[];
  products: Product[];
  orders: Order[];
  coupons: CouponCode[];
  events: MarketplaceEvent[];
  withdrawals: WithdrawalRequest[];
  reviews: Review[];
  vendorEmployees: VendorEmployee[];
  sheetsConfig: GoogleSheetsConfig;
  platformConfig: PlatformConfig;
}
