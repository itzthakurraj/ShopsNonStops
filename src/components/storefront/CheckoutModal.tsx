import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Address, Order } from '../../types/index.ts';
import { 
  X, 
  Check, 
  CreditCard, 
  Truck, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Smartphone,
  Lock
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, cartSubtotal, currentUser, placeOrder } = useApp();

  const [address, setAddress] = useState<Address>(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      return currentUser.addresses[0];
    }
    return {
      id: 'addr_new',
      name: currentUser?.name || 'Alex Morgan',
      street: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States',
      phone: '+1 (555) 234-5678',
      isDefault: true,
    };
  });

  const [paymentMethod, setPaymentMethod] = useState<'Credit/Debit Card' | 'Cash on Delivery' | 'UPI / NetBanking'>('Credit/Debit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Group items by vendor
  const vendorSummary = Object.values(
    cart.reduce((acc, curr) => {
      const sId = curr.product.shopId;
      if (!acc[sId]) {
        acc[sId] = {
          shopName: curr.product.shopName,
          itemsCount: 0,
          subtotal: 0,
        };
      }
      const price = curr.product.discountPrice || curr.product.price;
      acc[sId].itemsCount += curr.quantity;
      acc[sId].subtotal += price * curr.quantity;
      return acc;
    }, {} as Record<string, { shopName: string; itemsCount: number; subtotal: number }>)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.street || !address.city || !address.phone) {
      setError('Please fill out all required shipping fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const order = await placeOrder(address, paymentMethod);
      onOrderSuccess(order);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Multi-Vendor Secure Checkout</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Split fulfillment across {vendorSummary.length} independent verified seller stores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Multi-Vendor Fulfillment Split Preview */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>Vendor Sub-Order Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {vendorSummary.map((v, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{v.shopName}</div>
                    <div className="text-[11px] text-slate-500">{v.itemsCount} items · Direct Seller Fulfillment</div>
                  </div>
                  <span className="font-bold text-slate-900 tabular-nums">${v.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Shipping Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Street Address *</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Street, apartment or suite number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ZIP / Postal</label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit/Debit Card')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'Credit/Debit Card'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  {paymentMethod === 'Credit/Debit Card' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="font-bold text-slate-900">Card Payment</div>
                <div className="text-[11px] text-slate-500">Instant 256-bit encryption</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI / NetBanking')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'UPI / NetBanking'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  {paymentMethod === 'UPI / NetBanking' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="font-bold text-slate-900">UPI / NetBanking</div>
                <div className="text-[11px] text-slate-500">Google Pay, PhonePe, QR</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-4 h-4 text-slate-700" />
                  {paymentMethod === 'Cash on Delivery' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="font-bold text-slate-900">Cash on Delivery</div>
                <div className="text-[11px] text-slate-500">Pay courier on arrival</div>
              </button>
            </div>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Total Charged Amount</div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                ${cartSubtotal.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back to Bag
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Processing Order...' : 'Confirm & Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
