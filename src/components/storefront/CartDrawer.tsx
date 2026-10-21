import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  Tag, 
  Palette, 
  Key,
  Check
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQty, 
    cartCount, 
    cartSubtotal, 
    cartDiscount, 
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setActiveView 
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isOpen) return null;

  // Group items by vendor shopId
  const itemsByVendor: Record<string, { shopName: string; items: typeof cart }> = {};
  cart.forEach((item) => {
    const sId = item.product.shopId;
    if (!itemsByVendor[sId]) {
      itemsByVendor[sId] = {
        shopName: item.product.shopName,
        items: [],
      };
    }
    itemsByVendor[sId].items.push(item);
  });

  const handleCouponApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponMessage(null);
    const res = await applyCoupon(couponInput.trim());
    setApplying(false);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 relative animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Your Shopping Bag</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold tabular-nums">
              {cartCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cart List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Explore verified vendor stores, custom apparel, and digital downloads.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setActiveView('marketplace');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            Object.entries(itemsByVendor).map(([shopId, group]) => {
              const vendorSubtotal = group.items.reduce((sum, item) => {
                const price = item.product.discountPrice || item.product.price;
                return sum + price * item.quantity;
              }, 0);

              return (
                <div key={shopId} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  {/* Vendor Store Tag */}
                  <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>{group.shopName}</span>
                    </div>
                    <span className="text-slate-500 font-medium tabular-nums">
                      Subtotal: ${vendorSubtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Vendor Items */}
                  <div className="divide-y divide-slate-100 p-2">
                    {group.items.map((item) => {
                      const itemPrice = item.product.discountPrice || item.product.price;
                      return (
                        <div key={item.product.id} className="py-2.5 px-2 flex items-start gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 truncate">
                              {item.product.title}
                            </h4>

                            {/* Custom Merchandise Specs */}
                            {item.customDesign && (
                              <div className="mt-1 p-1 px-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-900 space-y-0.5">
                                <div className="flex items-center gap-1 font-bold">
                                  <Palette className="w-3 h-3 text-blue-600" />
                                  <span>Custom {item.customDesign.apparelSize} • {item.customDesign.baseColor}</span>
                                </div>
                                <div className="truncate">Text: "{item.customDesign.customText}"</div>
                              </div>
                            )}

                            {/* Digital asset badge */}
                            {item.product.productType === 'digital' && (
                              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded">
                                <Key className="w-2.5 h-2.5" />
                                <span>Instant Digital Delivery</span>
                              </div>
                            )}

                            <div className="text-xs font-bold text-slate-900 mt-1 tabular-nums">
                              ${itemPrice.toFixed(2)}
                            </div>
                            
                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-2 mt-2">
                              {item.product.productType !== 'digital' && (
                                <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                                  <button
                                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                    className="p-1 text-slate-500 hover:text-slate-800"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 text-xs font-bold text-slate-800 tabular-nums">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.product.stock}
                                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Promo Voucher Form */}
        {cart.length > 0 && (
          <div className="px-4 py-3 bg-slate-100/70 border-t border-slate-200 text-xs">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coupon <b>{appliedCoupon.code}</b> Applied (-${appliedCoupon.discountAmount.toFixed(2)})</span>
                </div>
                <button onClick={removeCoupon} className="text-red-600 hover:underline text-[11px] font-bold">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponApply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. SHOP10, APEX20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-mono font-bold uppercase placeholder:font-normal placeholder:normal-case"
                />
                <button
                  type="submit"
                  disabled={applying || !couponInput.trim()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors disabled:opacity-40"
                >
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}

            {couponMessage && (
              <div className={`mt-1.5 text-[11px] font-medium ${couponMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                {couponMessage.text}
              </div>
            )}
          </div>
        )}

        {/* Footer Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800 tabular-nums">${cartSubtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-emerald-600">Free Delivery</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="tabular-nums text-base text-blue-600">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Multi-vendor orders are split cleanly into independent tracking packages.</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 bg-[#3957db] hover:bg-[#1e3bb3] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Multi-Vendor Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
