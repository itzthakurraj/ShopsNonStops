import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Store, ShieldCheck, Star, MapPin, ArrowRight, Package } from 'lucide-react';

export const StoresDirectory: React.FC = () => {
  const { shops, products, setSelectedCategory, setActiveView, switchRole } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Verified Independent Sellers
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Explore Vendor Workshops & Boutiques
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect directly with verified independent creators and specialized hardware brands.
          </p>
        </div>

        <button
          onClick={() => switchRole('seller')}
          className="px-4 py-2 bg-[#3957db] hover:bg-[#1e3bb3] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Become a Seller</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shops.map((shop) => {
          const shopProducts = products.filter((p) => p.shopId === shop.id);

          return (
            <div
              key={shop.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Banner with Avatar Overlay */}
              <div>
                <div className="h-32 w-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={shop.banner}
                    alt={shop.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="px-5 pt-0 pb-4 relative -mt-8">
                  <div className="flex items-end justify-between mb-3">
                    <img
                      src={shop.avatar}
                      alt={shop.name}
                      className="w-16 h-16 rounded-xl object-cover border-3 border-white shadow-md bg-white shrink-0"
                    />

                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-xs border border-slate-200 text-xs font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>{shop.rating}</span>
                      <span className="text-slate-400 font-normal">({shop.reviewCount})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900">{shop.name}</h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {shop.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[220px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span>{shopProducts.length} Items</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Preview Strip & Visit Button */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {shopProducts.slice(0, 3).map((sp) => (
                    <img
                      key={sp.id}
                      src={sp.images[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                      title={sp.title}
                    />
                  ))}
                  {shopProducts.length > 3 && (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center border border-slate-200">
                      +{shopProducts.length - 3}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setActiveView('marketplace');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Browse Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
