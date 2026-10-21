import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Store, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, activeTrackingId, viewOrderTracking, switchRole } = useApp();
  const [searchInput, setSearchInput] = useState<string>(activeTrackingId || '');

  // Select active order or first order by default
  const currentOrder = orders.find((o) => o.id === (activeTrackingId || searchInput)) || orders[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      viewOrderTracking(searchInput.trim().toUpperCase());
    }
  };

  const getStepProgress = (status: string): number => {
    switch (status) {
      case 'Processing':
        return 1;
      case 'Confirmed':
        return 2;
      case 'Shipped':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Top Banner & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Truck className="w-4 h-4" />
              <span>Multi-Vendor Live Tracking Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Track Packages & Delivery Timelines
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Each vendor ships their sub-order independently with individual courier tracking codes.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-10492)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              Track
            </button>
          </form>
        </div>

        {/* Quick order picker from available history */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-500">
          <span className="shrink-0 font-medium">Recent Sample Orders:</span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setSearchInput(o.id);
                viewOrderTracking(o.id);
              }}
              className={`px-2.5 py-1 rounded font-mono text-[11px] border transition-colors shrink-0 ${
                currentOrder?.id === o.id
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {o.id} (${o.totalAmount.toFixed(2)})
            </button>
          ))}
        </div>
      </div>

      {!currentOrder ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Order Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Please check the Order ID and try again, or check your profile history.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Header Meta */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-slate-400">Order Identifier</div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {currentOrder.id}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })} · Payment: <span className="font-semibold text-slate-700">{currentOrder.paymentMethod}</span> ({currentOrder.paymentStatus})
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <span className="text-xs text-slate-400">Total Invoice</span>
              <span className="text-xl font-extrabold text-blue-600 tabular-nums">
                ${currentOrder.totalAmount.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400">
                Split across {currentOrder.subOrders.length} vendor packages
              </span>
            </div>
          </div>

          {/* Sub-Orders Grid (One per Vendor) */}
          <div className="space-y-6">
            {currentOrder.subOrders.map((subOrder, sIdx) => {
              const currentStep = getStepProgress(subOrder.status);
              const steps = [
                { label: 'Order Placed', step: 1 },
                { label: 'Confirmed', step: 2 },
                { label: 'Shipped', step: 3 },
                { label: 'Out for Delivery', step: 4 },
                { label: 'Delivered', step: 5 },
              ];

              return (
                <div key={subOrder.subOrderId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Vendor SubOrder Header */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-200 shrink-0">
                        P{sIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">{subOrder.subOrderId}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-blue-600" />
                            {subOrder.shopName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Carrier: <span className="font-semibold text-slate-700">{subOrder.trackingCarrier || 'Pending Assignment'}</span>
                          {subOrder.trackingCode && (
                            <> · Tracking #: <span className="font-mono text-blue-600 font-semibold">{subOrder.trackingCode}</span></>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        subOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : subOrder.status === 'Shipped' || subOrder.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {subOrder.status}
                      </span>

                      {/* Demo helper: Switch to seller portal to update fulfillment */}
                      <button
                        onClick={() => switchRole('seller')}
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                        title="Switch to seller view to update this package status"
                      >
                        Fulfill as Seller
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Visual Stepper */}
                    <div className="py-2">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0" />
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
                          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {/* Step Nodes */}
                        {steps.map((s) => {
                          const isDone = currentStep >= s.step;
                          const isCurrent = currentStep === s.step;
                          return (
                            <div key={s.step} className="relative z-10 flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white border-2 border-slate-200 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                              </div>
                              <span className={`text-[11px] mt-2 whitespace-nowrap font-medium ${
                                isCurrent ? 'text-blue-600 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items inside this package */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Items in this package ({subOrder.items.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                              <div className="text-[11px] text-slate-500 tabular-nums">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900 tabular-nums">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Activity Log */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Fulfillment Activity Log
                      </h4>
                      <div className="space-y-3">
                        {subOrder.timeline.map((event, eIdx) => (
                          <div key={eIdx} className="flex items-start gap-3 text-xs">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{event.status}</span>
                                <span className="text-[11px] text-slate-400 tabular-nums">
                                  {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-0.5">{event.note}</p>
                              {event.location && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{event.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping Address & Verification Badge */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Delivery Address for {currentOrder.shippingAddress.name}</span>
              </span>
              <p className="text-slate-600">
                {currentOrder.shippingAddress.street}, {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}, {currentOrder.shippingAddress.country}
              </p>
              <p className="text-slate-500">Phone: {currentOrder.shippingAddress.phone}</p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ShopNonstop Buyer Protection Guaranteed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
