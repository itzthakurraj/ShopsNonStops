import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  Store, 
  Package, 
  DollarSign, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Truck, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  Star,
  Settings,
  X,
  Check,
  Tag,
  Flame,
  FileCode,
  Palette,
  ExternalLink,
  Users,
  ShieldCheck,
  Lock,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { OrderStatus, Product, ProductType, VendorPermission, VendorEmployee } from '../../types/index.ts';

export const SellerDashboard: React.FC = () => {
  const { 
    currentShop, 
    products, 
    orders, 
    coupons,
    events,
    withdrawals, 
    updateSubOrderStatus, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    createCoupon,
    deleteCoupon,
    createEvent,
    updateShop, 
    requestWithdrawal,
    vendorEmployees,
    activeVendorEmployee,
    setActiveVendorEmployee,
    hasVendorPermission,
    createVendorEmployee,
    updateVendorEmployee,
    deleteVendorEmployee,
    shops
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons' | 'events' | 'earnings' | 'staff' | 'settings'>('orders');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState<{
    name: string;
    email: string;
    roleTitle: string;
    permissions: VendorPermission[];
  }>({
    name: '',
    email: '',
    roleTitle: 'Fulfillment & Logistics Specialist',
    permissions: ['orders'],
  });
  
  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [updatingSubOrder, setUpdatingSubOrder] = useState<{ orderId: string; subOrderId: string; currentStatus: OrderStatus } | null>(null);

  // New product form state
  const [prodForm, setProdForm] = useState({
    title: '',
    category: 'Electronics',
    productType: 'physical' as ProductType,
    price: '',
    discountPrice: '',
    stock: '15',
    description: '',
    tags: 'Verified, Premium, Fast Shipping',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    digitalFileName: '',
    digitalFileType: 'pdf' as 'pdf' | 'ebook' | 'zip' | 'license_key',
  });

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercentage: '15',
    minAmount: '50',
    expiryDate: '2026-12-31T23:59:59Z',
  });

  // Payout form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('Bank Wire Transfer');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Status update modal state
  const [statusInput, setStatusInput] = useState<OrderStatus>('Confirmed');
  const [carrierInput, setCarrierInput] = useState('FedEx Express');
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [locationInput, setLocationInput] = useState('Regional Hub');

  if (!currentShop) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200 mt-10">
        <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Active Seller Store Found</h2>
        <p className="text-xs text-slate-500 mt-1">Please switch to a seller profile or register a new store.</p>
      </div>
    );
  }

  const vendorProducts = products.filter((p) => p.shopId === currentShop.id);
  const vendorCoupons = coupons.filter((c) => !c.shopId || c.shopId === currentShop.id);
  
  const vendorSubOrders = orders.flatMap((o) =>
    o.subOrders
      .filter((so) => so.shopId === currentShop.id)
      .map((so) => ({
        parentOrderId: o.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        shippingAddress: o.shippingAddress,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        subOrder: so,
      }))
  );

  const vendorWithdrawals = withdrawals.filter((w) => w.shopId === currentShop.id);
  const currentShopEmployees = vendorEmployees.filter((e) => e.shopId === currentShop.id);

  const handleCreateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.name || !newEmpForm.email) return;
    await createVendorEmployee({
      shopId: currentShop.id,
      name: newEmpForm.name,
      email: newEmpForm.email,
      roleTitle: newEmpForm.roleTitle,
      permissions: newEmpForm.permissions,
    });
    setNewEmpForm({
      name: '',
      email: '',
      roleTitle: 'Fulfillment & Logistics Specialist',
      permissions: ['orders'],
    });
    setShowAddEmployeeModal(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.title || !prodForm.price) return;

    const digitalAsset = prodForm.productType === 'digital' ? {
      fileUrl: `/downloads/${prodForm.digitalFileName || 'digital_asset.pdf'}`,
      fileName: prodForm.digitalFileName || `${prodForm.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      fileSize: '18.5 MB',
      fileType: prodForm.digitalFileType,
    } : undefined;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        title: prodForm.title,
        category: prodForm.category,
        productType: prodForm.productType,
        price: Number(prodForm.price),
        discountPrice: prodForm.discountPrice ? Number(prodForm.discountPrice) : undefined,
        stock: prodForm.productType === 'digital' ? 9999 : Number(prodForm.stock),
        description: prodForm.description,
        tags: prodForm.tags.split(',').map((t) => t.trim()),
        images: [prodForm.imageUrl],
        digitalAsset,
      });
      setEditingProduct(null);
    } else {
      await createProduct({
        shopId: currentShop.id,
        title: prodForm.title,
        category: prodForm.category,
        productType: prodForm.productType,
        price: Number(prodForm.price),
        discountPrice: prodForm.discountPrice ? Number(prodForm.discountPrice) : undefined,
        stock: prodForm.productType === 'digital' ? 9999 : Number(prodForm.stock),
        description: prodForm.description,
        tags: prodForm.tags.split(',').map((t) => t.trim()),
        images: [prodForm.imageUrl],
        digitalAsset,
      });
      setShowAddProductModal(false);
    }

    setProdForm({
      title: '',
      category: 'Electronics',
      productType: 'physical',
      price: '',
      discountPrice: '',
      stock: '15',
      description: '',
      tags: '',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      digitalFileName: '',
      digitalFileType: 'pdf',
    });
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountPercentage) return;
    await createCoupon({
      code: couponForm.code,
      discountPercentage: Number(couponForm.discountPercentage),
      minAmount: Number(couponForm.minAmount) || 0,
      shopId: currentShop.id,
      expiryDate: couponForm.expiryDate,
    });
    setCouponForm({
      code: '',
      discountPercentage: '15',
      minAmount: '50',
      expiryDate: '2026-12-31T23:59:59Z',
    });
    setShowCouponModal(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingSubOrder) return;
    await updateSubOrderStatus(
      updatingSubOrder.orderId,
      updatingSubOrder.subOrderId,
      statusInput,
      `Package status updated to ${statusInput} by seller.`,
      carrierInput,
      trackingCodeInput,
      locationInput
    );
    setUpdatingSubOrder(null);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawError('Enter a valid withdrawal amount.');
      return;
    }
    if (amount > currentShop.balance) {
      setWithdrawError(`Amount exceeds available balance ($${currentShop.balance.toFixed(2)})`);
      return;
    }

    try {
      await requestWithdrawal(amount, withdrawMethod, withdrawAccount || currentShop.bankInfo.routingOrUpi);
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 1800);
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentShop.avatar}
            alt={currentShop.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentShop.name}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Verified Seller Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl line-clamp-1">
              {currentShop.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{currentShop.rating} Rating</span>
              </span>
              <span>·</span>
              <span>Platform Commission: {currentShop.commissionRate}%</span>
              <span>·</span>
              <span>Store ID: {currentShop.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasVendorPermission('finance') && (
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Payout</span>
            </button>
          )}
          {hasVendorPermission('coupons') && (
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>New Coupon</span>
            </button>
          )}
          {hasVendorPermission('catalog') && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddProductModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* VENDOR STAFF ACTIVE PERSONA STRIP */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {activeVendorEmployee ? activeVendorEmployee.name : `${currentShop.name} (Store Owner)`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeVendorEmployee ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {activeVendorEmployee ? activeVendorEmployee.roleTitle : 'Store Owner / Full Access'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400">Authorized Departments:</span>
              {(activeVendorEmployee ? activeVendorEmployee.permissions : (['orders', 'catalog', 'coupons', 'finance', 'settings'] as VendorPermission[])).map((p) => (
                <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px] font-semibold uppercase">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Staff Switcher Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 text-[11px]">Staff Session:</span>
          <select
            value={activeVendorEmployee?.id || 'owner'}
            onChange={(e) => {
              if (e.target.value === 'owner') {
                setActiveVendorEmployee(null);
              } else {
                const found = currentShopEmployees.find((emp) => emp.id === e.target.value);
                if (found) setActiveVendorEmployee(found);
              }
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="owner">👑 Store Owner (Full Access)</option>
            {currentShopEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                👤 {emp.name} ({emp.roleTitle})
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveTab('staff')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Team</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Inventory KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Available for Payout</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            ${currentShop.balance.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for withdrawal to bank</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Pending Clearance</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            ${currentShop.pendingBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Released upon package delivery</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Assigned Sub-Orders</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {vendorSubOrders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {vendorSubOrders.filter((v) => v.subOrder.status === 'Processing').length} awaiting fulfillment
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Products</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {vendorProducts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {vendorProducts.filter(p => p.productType === 'digital').length} digital · {vendorProducts.filter(p => p.productType === 'customizable').length} custom
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {!hasVendorPermission('orders') && <Lock className="w-3 h-3 text-slate-400" />}
          <span>Orders Fulfillment ({vendorSubOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {!hasVendorPermission('catalog') && <Lock className="w-3 h-3 text-slate-400" />}
          <span>Products & Catalog ({vendorProducts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'coupons' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {!hasVendorPermission('coupons') && <Lock className="w-3 h-3 text-slate-400" />}
          <span>Discount Coupons ({vendorCoupons.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'earnings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {!hasVendorPermission('finance') && <Lock className="w-3 h-3 text-slate-400" />}
          <span>Payouts Ledger ({vendorWithdrawals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Team & Staff ({currentShopEmployees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {!hasVendorPermission('settings') && <Lock className="w-3 h-3 text-slate-400" />}
          <span>Store Settings</span>
        </button>
      </div>

      {/* TAB 1: FULFILLMENT ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Assigned Vendor Sub-Orders</h3>
            <span className="text-xs text-slate-500">Update status to advance tracking for customers</span>
          </div>

          {vendorSubOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No orders received yet for this store. Test placing an order from the customer storefront!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vendorSubOrders.map(({ parentOrderId, customerName, customerPhone, shippingAddress, subOrder, createdAt }) => (
                <div key={subOrder.subOrderId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{subOrder.subOrderId}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-mono">Parent: {parentOrderId}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        subOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : subOrder.status === 'Shipped' || subOrder.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {subOrder.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      Customer: <span className="font-semibold text-slate-900">{customerName}</span> ({customerPhone}) · {shippingAddress.city}, {shippingAddress.state}
                    </div>

                    {/* Items & Custom Design Specs */}
                    <div className="space-y-1.5 pt-1">
                      {subOrder.items.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{item.quantity}× {item.title}</span>
                            {item.productType === 'digital' && (
                              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                                Digital Download
                              </span>
                            )}
                            {item.customDesign && (
                              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded flex items-center gap-1">
                                <Palette className="w-2.5 h-2.5" />
                                <span>Custom Merch ({item.customDesign.apparelSize} / {item.customDesign.baseColor})</span>
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 tabular-nums">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Ordered {new Date(createdAt).toLocaleDateString()} · Carrier: {subOrder.trackingCarrier || 'None'} ({subOrder.trackingCode || 'No code'})
                    </div>
                  </div>

                  {/* Financials & Action */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Vendor Net Earnings</div>
                      <div className="text-sm font-bold text-emerald-700 tabular-nums">
                        ${subOrder.vendorEarnings.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Gross: ${subOrder.subtotal.toFixed(2)} (-{subOrder.commissionRate}% fee)
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUpdatingSubOrder({
                          orderId: parentOrderId,
                          subOrderId: subOrder.subOrderId,
                          currentStatus: subOrder.status,
                        });
                        setStatusInput(subOrder.status);
                        setCarrierInput(subOrder.trackingCarrier || 'FedEx Express');
                        setTrackingCodeInput(subOrder.trackingCode || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Your Product Inventory</h3>
            <span className="text-xs text-slate-500">{vendorProducts.length} listings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Sales</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.productType === 'digital'
                          ? 'bg-indigo-100 text-indigo-700'
                          : p.productType === 'customizable'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.productType || 'physical'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{p.category}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      ${p.discountPrice ? p.discountPrice.toFixed(2) : p.price.toFixed(2)}
                      {p.discountPrice && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold tabular-nums">
                        {p.productType === 'digital' ? '∞' : p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 tabular-nums">
                      {p.salesCount || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm({
                              title: p.title,
                              category: p.category,
                              productType: p.productType || 'physical',
                              price: String(p.price),
                              discountPrice: p.discountPrice ? String(p.discountPrice) : '',
                              stock: String(p.stock),
                              description: p.description,
                              tags: p.tags.join(', '),
                              imageUrl: p.images[0] || '',
                              digitalFileName: p.digitalAsset?.fileName || '',
                              digitalFileType: p.digitalAsset?.fileType || 'pdf',
                            });
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove product "${p.title}"?`)) deleteProduct(p.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOUNT COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Store Promotional Vouchers & Coupons</h3>
              <p className="text-xs text-slate-500">Provide promo codes for customer discounts.</p>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {vendorCoupons.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.code}
                    </span>
                    <span className="font-bold text-slate-800">{c.discountPercentage}% OFF</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
                      {c.isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Min Spend: ${c.minAmount} · Valid until {new Date(c.expiryDate).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EARNINGS & PAYOUTS */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Vendor Banking & Payout Ledger</h3>
            <p className="text-xs text-slate-500 mb-4">
              Earnings accumulate automatically upon customer order placement and become withdrawable when items are marked delivered.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-800">Current Payout Account</span>
                <div className="text-slate-600 font-medium">
                  {currentShop.bankInfo.bankName} · {currentShop.bankInfo.accountNumber} ({currentShop.bankInfo.holderName})
                </div>
                <div className="text-[11px] text-slate-400">Routing / UPI ID: {currentShop.bankInfo.routingOrUpi}</div>
              </div>

              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={currentShop.balance <= 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
              >
                Withdraw ${currentShop.balance.toFixed(2)}
              </button>
            </div>
          </div>

          {/* Historical Withdrawals Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">Payout Requests History</h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {vendorWithdrawals.map((w) => (
                <div key={w.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">${w.amount.toFixed(2)} ({w.method})</div>
                    <div className="text-[11px] text-slate-500">{w.accountDetails}</div>
                    <div className="text-[11px] text-slate-400">
                      Requested {new Date(w.requestedAt).toLocaleDateString()} {w.adminNote ? `· Note: ${w.adminNote}` : ''}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    w.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : w.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Shop Profile & Contact Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Store Name</label>
              <input
                type="text"
                value={currentShop.name}
                onChange={(e) => updateShop(currentShop.id, { name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Support Phone</label>
              <input
                type="text"
                value={currentShop.phoneNumber}
                onChange={(e) => updateShop(currentShop.id, { phoneNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Store Description</label>
              <textarea
                rows={3}
                value={currentShop.description}
                onChange={(e) => updateShop(currentShop.id, { description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Warehouse Dispatch Address</label>
              <input
                type="text"
                value={currentShop.address}
                onChange={(e) => updateShop(currentShop.id, { address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STORE TEAM & STAFF RBAC */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Store Team & Department RBAC</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Delegate store duties by assigning custom department permissions to each employee.
              </p>
            </div>

            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-sm shadow-blue-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Store Employee</span>
            </button>
          </div>

          {/* Active Staff List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Authorized Store Staff ({currentShopEmployees.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Checkboxes live-update employee department permissions
              </span>
            </div>

            {currentShopEmployees.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No store employees added yet. Click &quot;Add Store Employee&quot; to recruit team members.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {currentShopEmployees.map((emp) => {
                  const isCurrentSession = activeVendorEmployee?.id === emp.id;
                  const allPerms: { key: VendorPermission; label: string; desc: string }[] = [
                    { key: 'orders', label: 'Orders', desc: 'Fulfillment & carrier tracking' },
                    { key: 'catalog', label: 'Catalog', desc: 'Add/edit products & pricing' },
                    { key: 'coupons', label: 'Coupons', desc: 'Promo codes & discounts' },
                    { key: 'finance', label: 'Finance', desc: 'View earnings & request payout' },
                    { key: 'settings', label: 'Settings', desc: 'Store profile & warehouse' },
                  ];

                  return (
                    <div key={emp.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{emp.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {emp.roleTitle}
                          </span>
                          {isCurrentSession && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Active Session
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{emp.email}</div>
                        <div className="text-[11px] text-slate-400">
                          Added {new Date(emp.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Permissions Checklist Toggles */}
                      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {allPerms.map((perm) => {
                          const has = emp.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                has
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={has}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...emp.permissions, perm.key]
                                    : emp.permissions.filter((p) => p !== perm.key);
                                  updateVendorEmployee(emp.id, { permissions: updated });
                                }}
                                className="hidden"
                              />
                              {has ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3 text-slate-300" />}
                              <span>{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (isCurrentSession) {
                              setActiveVendorEmployee(null); // revert to owner
                            } else {
                              setActiveVendorEmployee(emp);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isCurrentSession
                              ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          {isCurrentSession ? 'Revert to Owner' : 'Test as this Staff'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove staff account for ${emp.name}?`)) {
                              deleteVendorEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD VENDOR EMPLOYEE */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Add Store Employee (Vendor RBAC)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a staff account for {currentShop.name} with custom department permissions.
            </p>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newEmpForm.name}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Email *</label>
                <input
                  type="email"
                  value={newEmpForm.email}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                  placeholder="jordan@apextech.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role Title</label>
                <input
                  type="text"
                  value={newEmpForm.roleTitle}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, roleTitle: e.target.value })}
                  placeholder="e.g. Fulfillment Specialist, Catalog Designer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">Department Permissions Checklist</label>
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {[
                    { key: 'orders' as VendorPermission, label: 'Orders & Fulfillment', desc: 'Process customer sub-orders, carrier codes, and shipping milestones' },
                    { key: 'catalog' as VendorPermission, label: 'Products & Inventory', desc: 'Create, update, and remove physical, digital, and custom products' },
                    { key: 'coupons' as VendorPermission, label: 'Promotions & Coupons', desc: 'Issue discount codes and promo campaigns' },
                    { key: 'finance' as VendorPermission, label: 'Financials & Payouts', desc: 'Inspect vendor earnings ledger and request balance withdrawals' },
                    { key: 'settings' as VendorPermission, label: 'Store Settings', desc: 'Update store branding, description, and dispatch address' },
                  ].map((p) => {
                    const checked = newEmpForm.permissions.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...newEmpForm.permissions, p.key]
                              : newEmpForm.permissions.filter((x) => x !== p.key);
                            setNewEmpForm({ ...newEmpForm, permissions: updated });
                          }}
                          className="mt-0.5 accent-blue-600 rounded"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{p.label}</div>
                          <div className="text-[11px] text-slate-500">{p.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  Add Store Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(showAddProductModal || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddProductModal(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingProduct ? 'Edit Product Listing' : 'List New Product on ShopNonstop'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProdForm({ ...prodForm, productType: 'physical', category: 'Electronics' })}
                    className={`py-2 px-3 rounded-lg border font-bold text-center ${
                      prodForm.productType === 'physical' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50'
                    }`}
                  >
                    📦 Physical Good
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdForm({ ...prodForm, productType: 'digital', category: 'Digital Goods' })}
                    className={`py-2 px-3 rounded-lg border font-bold text-center ${
                      prodForm.productType === 'digital' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50'
                    }`}
                  >
                    📥 Digital Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdForm({ ...prodForm, productType: 'customizable', category: 'Custom Studio' })}
                    className={`py-2 px-3 rounded-lg border font-bold text-center ${
                      prodForm.productType === 'customizable' ? 'bg-amber-50 border-amber-600 text-amber-700' : 'bg-slate-50'
                    }`}
                  >
                    🎨 Custom Merchandise
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  value={prodForm.title}
                  onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                  placeholder="e.g. Studio Monitor Speakers, Architecture PDF..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Digital Goods">Digital Goods</option>
                    <option value="Custom Studio">Custom Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {prodForm.productType === 'digital' ? 'Stock (Unlimited for Digital)' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    disabled={prodForm.productType === 'digital'}
                    value={prodForm.productType === 'digital' ? '9999' : prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {prodForm.productType === 'digital' && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2">
                  <span className="font-bold text-indigo-900 block">Digital Asset Deliverable</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">File Name (Download Target)</label>
                      <input
                        type="text"
                        value={prodForm.digitalFileName}
                        onChange={(e) => setProdForm({ ...prodForm, digitalFileName: e.target.value })}
                        placeholder="eBook_Masterclass.pdf"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Format</label>
                      <select
                        value={prodForm.digitalFileType}
                        onChange={(e) => setProdForm({ ...prodForm, digitalFileType: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="ebook">eBook / EPUB</option>
                        <option value="zip">ZIP Archive</option>
                        <option value="license_key">Software License Key</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Standard Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.discountPrice}
                    onChange={(e) => setProdForm({ ...prodForm, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={prodForm.imageUrl}
                  onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COUPON */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Create Store Coupon Code</h3>
            <p className="text-xs text-slate-500 mb-4">
              Voucher code valid exclusively on items from {currentShop.name}.
            </p>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. APEX25, LUXE15"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount % *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={couponForm.discountPercentage}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    value={couponForm.minAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE FULFILLMENT STATUS */}
      {updatingSubOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              onClick={() => setUpdatingSubOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Fulfill Package {updatingSubOrder.subOrderId}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Advance courier tracking so the customer receives shipment updates.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Update Status *</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-800"
                >
                  <option value="Processing">Processing / Queued</option>
                  <option value="Confirmed">Confirmed & Packed</option>
                  <option value="Shipped">Shipped / In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered (Releases Payout Balance)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shipping Carrier</label>
                <input
                  type="text"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  placeholder="e.g. FedEx Express, DHL, USPS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tracking Code #</label>
                <input
                  type="text"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="e.g. FDX-99210492"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hub Location (Optional)</label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdatingSubOrder(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW PAYOUT */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Request Vendor Payout</h3>
            <p className="text-xs text-slate-500 mb-4">
              Available balance: <span className="font-bold text-emerald-700 tabular-nums">${currentShop.balance.toFixed(2)}</span>
            </p>

            {withdrawError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs mb-3 font-medium">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-900">Payout Request Submitted</div>
                <p className="text-xs text-slate-500">Sent to admin approval queue. Recorded in financial ledger.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Withdrawal Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    max={currentShop.balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max $${currentShop.balance.toFixed(2)}`}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payout Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                    <option value="UPI / Instant Bank Transfer">UPI / Instant Bank Transfer</option>
                    <option value="PayPal / Stripe Direct">PayPal / Stripe Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Disbursement Account Details</label>
                  <input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder={`${currentShop.bankInfo.bankName} - ${currentShop.bankInfo.accountNumber}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
