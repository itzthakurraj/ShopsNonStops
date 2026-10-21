import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Package, MapPin, Truck, ExternalLink, User as UserIcon, Calendar, CheckCircle2 } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { currentUser, orders, viewOrderTracking } = useApp();

  const customerOrders = orders.filter((o) => o.userId === currentUser?.id || o.customerEmail === currentUser?.email);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                Verified Shopper
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email} · {currentUser?.phoneNumber}</p>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Customer since {currentUser ? new Date(currentUser.createdAt).toLocaleDateString() : '2026'}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="text-slate-400 block text-[11px]">Primary Saved Address</span>
          <span className="font-semibold text-slate-800">
            {currentUser?.addresses[0]?.street || '742 Evergreen Terrace'}, {currentUser?.addresses[0]?.city || 'Portland'}, {currentUser?.addresses[0]?.state || 'OR'}
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>My Order History ({customerOrders.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Includes per-vendor split tracking</span>
        </div>

        {customerOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No orders found yet. Browse the marketplace to place your first order!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {customerOrders.map((order) => (
              <div key={order.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-700">Payment: {order.paymentMethod}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-900 tabular-nums">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => viewOrderTracking(order.id)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Tracker</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sub-orders from vendors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.subOrders.map((so) => (
                    <div key={so.subOrderId} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{so.shopName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          so.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : so.status === 'Shipped' || so.status === 'Out for Delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {so.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {so.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                            <img src={it.image} alt="" className="w-6 h-6 rounded object-cover border border-slate-200" />
                            <span className="truncate flex-1">{it.title}</span>
                            <span className="tabular-nums font-semibold">{it.quantity}× ${it.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Carrier: {so.trackingCarrier || 'Assigned'}</span>
                        <span className="font-mono">{so.trackingCode || 'Tracking # Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
